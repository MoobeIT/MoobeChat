import { NextRequest, NextResponse } from 'next/server'
import { platformOperations, conversationOperations, messageOperations } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    console.log('🔔 Webhook UazAPI recebido:', JSON.stringify(payload, null, 2))
    
    // Salvar no debug também
    try {
      await fetch(`${process.env.WEBHOOK_URL || 'http://localhost:3000'}/api/debug-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (debugError) {
      console.warn('⚠️ Erro ao salvar debug:', debugError)
    }

    // Diferentes formatos de payload da UazAPI
    const { event, instance, data, instanceName, messageData } = payload

    // Verificar se é um evento válido
    if (!event && !messageData) {
      console.log('❌ Payload inválido - evento não identificado:', payload)
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // Determinar o nome da instância
    const instanceId = instance || instanceName || payload.instanceId
    
    if (!instanceId) {
      console.log('❌ Nome da instância não encontrado no payload')
      return NextResponse.json({ error: 'Nome da instância não encontrado' }, { status: 400 })
    }

    // Buscar plataforma pela instância
    console.log(`🔍 Buscando plataforma para instância: ${instanceId}`)
    
    const platforms = await platformOperations.findMany({
      type: 'WHATSAPP'
    })
    
    const platform = platforms.find(p => {
      const config = p.config as any
      return config?.instanceName === instanceId || 
             config?.instanceId === instanceId || 
             config?.instanceToken?.includes(instanceId)
    })

    if (!platform) {
      console.log(`❌ Plataforma não encontrada para instância: ${instanceId}`)
      
      // Listar plataformas existentes para debug
      const allPlatforms = await platformOperations.findMany({
        type: 'WHATSAPP'
      })
      
      console.log('🔍 Plataformas WhatsApp existentes:')
      allPlatforms.forEach(p => {
        const config = p.config as any
        console.log(`  - ${p.name}: instanceName=${config.instanceName}, instanceId=${config.instanceId}`)
      })
      
      return NextResponse.json({ received: true, message: `Plataforma não encontrada para ${instanceId}` })
    }

    console.log(`✅ Plataforma encontrada: ${platform.name} (${platform.id})`)

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'messages.upsert':
      case 'message':
        await handleMessageEvent(platform, data || messageData)
        break
        
      case 'connection.update':
      case 'connection':
        await handleConnectionEvent(platform, data)
        break
        
      case 'qr':
        await handleQREvent(platform, data)
        break
        
      case 'status':
        await handleStatusEvent(platform, data)
        break
        
      default:
        console.log(`⚠️  Evento não tratado: ${event}`)
        console.log('Payload completo:', payload)
    }

    return NextResponse.json({ received: true, status: 'processed' })
    
  } catch (error) {
    console.error('❌ Erro no webhook UazAPI:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

async function handleMessageEvent(platform: any, messageData: any) {
  try {
    console.log('📨 Processando mensagem:', JSON.stringify(messageData, null, 2))
    
    // Diferentes formatos de dados de mensagem
    const message = messageData.messages?.[0] || messageData.message || messageData
    
    if (!message) {
      console.log('❌ Dados da mensagem não encontrados')
      console.log('❌ Estrutura recebida:', {
        hasMessages: !!messageData.messages,
        hasMessage: !!messageData.message,
        keys: Object.keys(messageData)
      })
      return
    }
    
    console.log('✅ Mensagem extraída:', JSON.stringify(message, null, 2))

    const {
      key,
      message: msgContent,
      messageTimestamp,
      pushName,
      fromMe
    } = message

    // Extrair informações da mensagem
    const messageId = key?.id || message.id
    const from = key?.remoteJid || message.from || message.chatId
    const timestamp = messageTimestamp || message.timestamp || Date.now()
    const senderName = pushName || message.pushName || message.senderName || 'Desconhecido'
    const isFromMe = fromMe !== undefined ? fromMe : message.fromMe || false

    // Ignorar mensagens enviadas por nós
    if (isFromMe) {
      console.log('⏭️  Ignorando mensagem enviada por nós')
      return
    }

    // Extrair conteúdo da mensagem
    let content = ''
    let messageType = 'TEXT'
    let mediaUrl = null

    if (msgContent?.conversation) {
      content = msgContent.conversation
      messageType = 'TEXT'
    } else if (msgContent?.extendedTextMessage?.text) {
      content = msgContent.extendedTextMessage.text
      messageType = 'TEXT'
    } else if (msgContent?.imageMessage) {
      content = msgContent.imageMessage.caption || '[Imagem]'
      messageType = 'IMAGE'
      mediaUrl = msgContent.imageMessage.url
    } else if (msgContent?.videoMessage) {
      content = msgContent.videoMessage.caption || '[Vídeo]'
      messageType = 'VIDEO'
      mediaUrl = msgContent.videoMessage.url
    } else if (msgContent?.audioMessage) {
      content = '[Áudio]'
      messageType = 'AUDIO'
      mediaUrl = msgContent.audioMessage.url
    } else if (msgContent?.documentMessage) {
      content = msgContent.documentMessage.title || '[Documento]'
      messageType = 'DOCUMENT'
      mediaUrl = msgContent.documentMessage.url
    } else if (msgContent?.stickerMessage) {
      content = '[Sticker]'
      messageType = 'STICKER'
      mediaUrl = msgContent.stickerMessage.url
    } else if (msgContent?.locationMessage) {
      content = `[Localização] ${msgContent.locationMessage.degreesLatitude}, ${msgContent.locationMessage.degreesLongitude}`
      messageType = 'LOCATION'
    } else {
      // Fallback para outros tipos
      content = message.body || message.content || '[Mensagem não suportada]'
      console.log('⚠️  Tipo de mensagem não identificado:', msgContent)
    }

    // Formatear número de telefone
    const phoneNumber = from.replace('@s.whatsapp.net', '').replace('@g.us', '')
    
    console.log(`📱 Mensagem de ${phoneNumber} (${senderName}): ${content}`)

    // Buscar ou criar conversa
    console.log(`🔍 Buscando conversa para ${phoneNumber} na plataforma ${platform.id}`)
    
    let conversation = await conversationOperations.findFirst({
      platform_id: platform.id,
      external_id: phoneNumber
    })

    if (!conversation) {
      console.log('🆕 Criando nova conversa')
      conversation = await conversationOperations.create({
        workspace_id: platform.workspace_id,
        platform_id: platform.id,
        external_id: phoneNumber,
        customer_phone: phoneNumber,
        customer_name: senderName,
        status: 'OPEN',
        priority: 'MEDIUM',
        last_message_at: new Date(timestamp).toISOString()
      })
      console.log('✅ Nova conversa criada:', conversation.id)
    } else {
      console.log('📱 Conversa existente encontrada:', conversation.id)
      // Atualizar nome do cliente se mudou
      if (conversation.customer_name !== senderName && senderName !== 'Desconhecido') {
        await conversationOperations.update(
          { id: conversation.id },
          { 
            customer_name: senderName,
            last_message_at: new Date(timestamp).toISOString()
          }
        )
        console.log('📝 Nome do cliente atualizado')
      }
    }

    // Verificar se a mensagem já existe
    const existingMessage = await messageOperations.findFirst({
      external_id: messageId,
      conversation_id: conversation.id
    })

    if (existingMessage) {
      console.log('⏭️  Mensagem já existe, ignorando')
      return
    }

    // Salvar mensagem
    console.log('💾 Salvando mensagem no banco:', {
      conversationId: conversation.id,
      externalId: messageId,
      content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      messageType,
      direction: 'INCOMING',
      senderName,
      phoneNumber
    })
    
    const savedMessage = await messageOperations.create({
      conversation_id: conversation.id,
      external_id: messageId,
      content,
      message_type: messageType as any,
      direction: 'INCOMING',
      sender_name: senderName,
      metadata: {
        uazApiData: messageData,
        mediaUrl,
        timestamp,
        phoneNumber,
        platform: 'whatsapp'
      }
    })

    console.log('✅ Mensagem salva com sucesso:', savedMessage.id)
    
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error)
  }
}

async function handleConnectionEvent(platform: any, data: any) {
  try {
    console.log('🔗 Processando evento de conexão:', data)
    
    const { connection, lastDisconnect, qr } = data
    let status = 'disconnected'
    
    if (connection === 'open') {
      status = 'connected'
    } else if (connection === 'connecting') {
      status = 'connecting'
    } else if (connection === 'close') {
      status = 'disconnected'
    }

    // Atualizar status da plataforma
    await platformOperations.update(
      { id: platform.id },
      {
        config: {
          ...(platform.config as object),
          status: status,
          lastConnectionAt: new Date().toISOString(),
          lastDisconnect: lastDisconnect ? JSON.stringify(lastDisconnect) : null
        },
        is_active: status === 'connected'
      }
    )

    console.log(`✅ Status de conexão atualizado para: ${status}`)
    
  } catch (error) {
    console.error('❌ Erro ao processar evento de conexão:', error)
  }
}

async function handleQREvent(platform: any, data: any) {
  try {
    console.log('📱 Processando QR Code:', data)
    
    const qrCode = data.qr || data
    
    // Atualizar QR Code na plataforma
    await platformOperations.update(
      { id: platform.id },
      {
        config: {
          ...(platform.config as object),
          qrCode: qrCode,
          status: 'connecting',
          lastQRAt: new Date().toISOString()
        }
      }
    )

    console.log('✅ QR Code atualizado')
    
  } catch (error) {
    console.error('❌ Erro ao processar QR Code:', error)
  }
}

async function handleStatusEvent(platform: any, data: any) {
  try {
    console.log('📊 Processando status:', data)
    
    const { messageId, status, participant } = data

    // Atualizar status da mensagem se existir
    if (messageId) {
      const conversations = await conversationOperations.findMany({
        platform_id: platform.id
      })
      
      let message = null
      for (const conv of conversations) {
        const msg = await messageOperations.findFirst({
          external_id: messageId,
          conversation_id: conv.id
        })
        if (msg) {
          message = msg
          break
        }
      }

      if (message) {
        await messageOperations.update(
          { id: message.id },
          {
            metadata: {
              ...(message.metadata as object),
              deliveryStatus: status,
              participant: participant || null,
              statusUpdatedAt: new Date().toISOString()
            }
          }
        )
        
        console.log(`✅ Status da mensagem ${messageId} atualizado para: ${status}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar status da mensagem:', error)
  }
}

// Endpoint para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook UazAPI funcionando',
    timestamp: new Date().toISOString()
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    console.log('🔔 Webhook UazAPI recebido:', JSON.stringify(payload, null, 2))

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
    const platform = await prisma.platform.findFirst({
      where: {
        OR: [
          {
            config: {
              path: ['instanceName'],
              equals: instanceId
            }
          },
          {
            config: {
              path: ['instanceId'],
              equals: instanceId
            }
          }
        ],
        type: 'WHATSAPP'
      },
      include: {
        workspace: true
      }
    })

    if (!platform) {
      console.log(`❌ Plataforma não encontrada para instância: ${instanceId}`)
      return NextResponse.json({ received: true, message: 'Plataforma não encontrada' })
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
    console.log('📨 Processando mensagem:', messageData)
    
    // Diferentes formatos de dados de mensagem
    const message = messageData.messages?.[0] || messageData.message || messageData
    
    if (!message) {
      console.log('❌ Dados da mensagem não encontrados')
      return
    }

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
    let conversation = await prisma.conversation.findFirst({
      where: {
        platformId: platform.id,
        externalId: phoneNumber
      }
    })

    if (!conversation) {
      console.log('🆕 Criando nova conversa')
      conversation = await prisma.conversation.create({
        data: {
          workspaceId: platform.workspaceId,
          platformId: platform.id,
          externalId: phoneNumber,
          customerPhone: phoneNumber,
          customerName: senderName,
          status: 'OPEN',
          priority: 'MEDIUM',
          lastMessageAt: new Date(timestamp)
        }
      })
    } else {
      // Atualizar nome do cliente se mudou
      if (conversation.customerName !== senderName && senderName !== 'Desconhecido') {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { 
            customerName: senderName,
            lastMessageAt: new Date(timestamp)
          }
        })
      }
    }

    // Verificar se a mensagem já existe
    const existingMessage = await prisma.message.findFirst({
      where: {
        externalId: messageId,
        conversationId: conversation.id
      }
    })

    if (existingMessage) {
      console.log('⏭️  Mensagem já existe, ignorando')
      return
    }

    // Salvar mensagem
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalId: messageId,
        content,
        messageType: messageType as any,
        direction: 'INCOMING',
        senderName,
        metadata: {
          uazApiData: messageData,
          mediaUrl,
          timestamp,
          phoneNumber,
          platform: 'whatsapp'
        }
      }
    })

    console.log('✅ Mensagem salva com sucesso')
    
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
    await prisma.platform.update({
      where: { id: platform.id },
      data: {
        config: {
          ...(platform.config as object),
          status: status,
          lastConnectionAt: new Date().toISOString(),
          lastDisconnect: lastDisconnect ? JSON.stringify(lastDisconnect) : null
        },
        isActive: status === 'connected'
      }
    })

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
    await prisma.platform.update({
      where: { id: platform.id },
      data: {
        config: {
          ...(platform.config as object),
          qrCode: qrCode,
          status: 'connecting',
          lastQRAt: new Date().toISOString()
        }
      }
    })

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
      const message = await prisma.message.findFirst({
        where: {
          externalId: messageId,
          conversation: {
            platformId: platform.id
          }
        }
      })

      if (message) {
        await prisma.message.update({
          where: { id: message.id },
          data: {
            metadata: {
              ...(message.metadata as object),
              deliveryStatus: status,
              participant: participant || null,
              statusUpdatedAt: new Date().toISOString()
            }
          }
        })
        
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
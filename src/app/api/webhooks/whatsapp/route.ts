import { NextRequest, NextResponse } from 'next/server'
import { conversationOperations, messageOperations, platformOperations, createKanbanCardForConversation } from '@/lib/database'
import { uazApiClient } from '@/lib/uazapi'

// Interface para webhook (formato WhatsApp)
interface WebhookMessage {
  instanceName: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    message: any
    messageTimestamp: number
    pushName?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookMessage = await request.json()
    
    console.log('Webhook recebido:', JSON.stringify(body, null, 2))

    // Verificar se é uma mensagem
    if (body.data && body.data.message) {
      await processMessage(body)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

async function processMessage(webhookData: WebhookMessage) {
  const { instanceName, data } = webhookData
  const { key, message, messageTimestamp, pushName } = data

  // Validações básicas
  if (!instanceName || !key?.remoteJid || !key?.id) {
    console.log('⚠️ Dados do webhook inválidos, ignorando')
    return
  }

  // Extrair número do contato (remover @s.whatsapp.net)
  const phoneNumber = key.remoteJid.split('@')[0]
  
  // Ignorar mensagens de grupos por enquanto
  if (key.remoteJid.includes('@g.us')) {
    console.log('⏭️ Mensagem de grupo ignorada')
    return
  }
  
  // Verificar se é mensagem de saída (enviada por nós)
  const isOutgoing = key.fromMe
  
  // Extrair conteúdo da mensagem
  let messageContent = ''
  let messageType = 'TEXT'
  
  if (message.conversation) {
    messageContent = message.conversation
  } else if (message.extendedTextMessage) {
    messageContent = message.extendedTextMessage.text
  } else if (message.imageMessage) {
    messageContent = message.imageMessage.caption || '[Imagem]'
    messageType = 'IMAGE'
  } else if (message.videoMessage) {
    messageContent = message.videoMessage.caption || '[Vídeo]'
    messageType = 'VIDEO'
  } else if (message.audioMessage) {
    messageContent = '[Áudio]'
    messageType = 'AUDIO'
  } else if (message.documentMessage) {
    messageContent = `[Documento: ${message.documentMessage.fileName || 'Arquivo'}]`
    messageType = 'DOCUMENT'
  } else {
    messageContent = '[Mensagem não suportada]'
  }

  try {
    // Buscar plataforma por instanceName
    let platform = await platformOperations.findFirst({
      type: 'WHATSAPP',
      'config->instanceName': instanceName
    })

    if (!platform) {
      console.log(`⚠️ Plataforma não encontrada para instância: ${instanceName}`)
      return // Não processar se não há plataforma configurada
    }

    // Buscar conversa existente
    let conversation = await conversationOperations.findFirst({
      platform_id: platform.id,
      external_id: phoneNumber
    })

    if (!conversation) {
      console.log(`🆕 Criando nova conversa para ${phoneNumber}`)
      conversation = await conversationOperations.create({
        workspace_id: platform.workspace_id,
        platform_id: platform.id,
        external_id: phoneNumber,
        customer_name: pushName || phoneNumber,
        customer_phone: phoneNumber,
        status: 'OPEN',
        priority: 'MEDIUM',
        last_message_at: new Date(messageTimestamp * 1000).toISOString()
      })

      // Criar card no Kanban automaticamente para nova conversa
      try {
        await createKanbanCardForConversation(conversation.id, platform.workspace_id)
        console.log(`✅ Card do Kanban criado para nova conversa ${conversation.id} via webhook`)
      } catch (error) {
        console.error('❌ Erro ao criar card no Kanban via webhook:', error)
        // Não falhar o processamento da mensagem se o card falhar
      }
    } else {
      console.log(`📱 Conversa existente encontrada: ${conversation.id}`)
      // Atualizar nome do cliente se mudou
      if (conversation.customer_name !== pushName && pushName && pushName !== 'Desconhecido') {
        await conversationOperations.update(
          { id: conversation.id },
          { 
            customer_name: pushName,
            last_message_at: new Date(messageTimestamp * 1000).toISOString()
          }
        )
        console.log('📝 Nome do cliente atualizado')
      }
    }

    // Verificar se a mensagem já existe
    const existingMessage = await messageOperations.findFirst({
      external_id: key.id,
      conversation_id: conversation.id
    })

    if (existingMessage) {
      console.log(`⏭️ Mensagem já existe, ignorando: ${key.id}`)
      return
    }

    // Criar mensagem
    await messageOperations.create({
      conversation_id: conversation.id,
      external_id: key.id,
      content: messageContent,
      message_type: messageType as any,
      direction: isOutgoing ? 'OUTGOING' : 'INCOMING',
      sender_name: isOutgoing ? 'Você' : (pushName || phoneNumber),
      metadata: {
        timestamp: messageTimestamp,
        rawMessage: message,
        phoneNumber,
        platform: 'whatsapp'
      }
    })

    // Atualizar última mensagem da conversa apenas se não foi atualizada acima
    if (conversation && !isOutgoing) {
      await conversationOperations.update(
        { id: conversation.id },
        {
          last_message_at: new Date(messageTimestamp * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      )
    }

    console.log(`✅ Mensagem processada: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`)
    console.log(`📊 Conversa: ${conversation.id} | Direção: ${isOutgoing ? 'SAÍDA' : 'ENTRADA'} | Tipo: ${messageType}`)
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error)
    throw error
  }
}
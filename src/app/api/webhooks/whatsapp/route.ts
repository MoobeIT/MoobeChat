import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

  // Extrair número do contato (remover @s.whatsapp.net)
  const phoneNumber = key.remoteJid.split('@')[0]
  
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
    // Buscar ou criar plataforma
    let platform = await prisma.platform.findFirst({
      where: {
        type: 'WHATSAPP',
        name: instanceName
      }
    })

    if (!platform) {
      // Criar workspace padrão se não existir
      let workspace = await prisma.workspace.findFirst()
      
      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: 'Workspace Padrão',
            description: 'Workspace criado automaticamente'
          }
        })
      }

      // Criar plataforma
      platform = await prisma.platform.create({
        data: {
          workspaceId: workspace.id,
          type: 'WHATSAPP',
          name: instanceName,
          config: { instanceName }
        }
      })
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findUnique({
      where: {
        platformId_externalId: {
          platformId: platform.id,
          externalId: phoneNumber
        }
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          workspaceId: platform.workspaceId,
          platformId: platform.id,
          externalId: phoneNumber,
          customerName: pushName || phoneNumber,
          customerPhone: phoneNumber,
          status: 'OPEN',
          priority: 'MEDIUM'
        }
      })

      // Criar card no Kanban (coluna "Novas")
      const kanbanBoard = await prisma.kanbanBoard.findFirst({
        where: { workspaceId: platform.workspaceId },
        include: { columns: true }
      })

      if (kanbanBoard) {
        const newColumn = kanbanBoard.columns.find(col => 
          col.name.toLowerCase().includes('nova') || 
          col.name.toLowerCase().includes('new')
        ) || kanbanBoard.columns[0]

        if (newColumn) {
          const cardsCount = await prisma.kanbanCard.count({
            where: { columnId: newColumn.id }
          })

          await prisma.kanbanCard.create({
            data: {
              columnId: newColumn.id,
              conversationId: conversation.id,
              position: cardsCount
            }
          })
        }
      }
    }

    // Criar mensagem
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalId: key.id,
        content: messageContent,
        messageType: messageType as any,
        direction: isOutgoing ? 'OUTGOING' : 'INCOMING',
        senderName: isOutgoing ? 'Você' : (pushName || phoneNumber),
        metadata: {
          timestamp: messageTimestamp,
          rawMessage: message
        }
      }
    })

    // Atualizar última mensagem da conversa
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { 
        lastMessageAt: new Date(messageTimestamp * 1000),
        updatedAt: new Date()
      }
    })

    console.log(`Mensagem processada: ${messageContent}`)
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error)
    throw error
  }
} 
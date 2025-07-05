import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    console.log('Webhook UazAPI recebido:', payload)

    const { event, instance, data } = payload

    if (!event || !instance || !data) {
      console.log('Payload inválido:', payload)
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // Buscar plataforma pela instância
    const platform = await prisma.platform.findFirst({
      where: {
        config: {
          path: ['instanceName'],
          equals: instance
        },
        type: 'WHATSAPP'
      },
      include: {
        workspace: true
      }
    })

    if (!platform) {
      console.log('Plataforma não encontrada para instância:', instance)
      return NextResponse.json({ received: true })
    }

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'message':
        await handleMessageEvent(platform, data)
        break
        
      case 'connection':
        await handleConnectionEvent(platform, data)
        break
        
      case 'status':
        await handleStatusEvent(platform, data)
        break
        
      default:
        console.log('Evento não tratado:', event)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Erro no webhook UazAPI:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

async function handleMessageEvent(platform: any, data: any) {
  try {
    const { messageId, from, fromMe, timestamp, type, content } = data

    // Ignorar mensagens enviadas por nós
    if (fromMe) {
      return
    }

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        platformId: platform.id,
        externalId: from
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          workspaceId: platform.workspaceId,
          platformId: platform.id,
          externalId: from,
          customerPhone: from,
          customerName: data.pushName || from,
          status: 'OPEN',
          priority: 'MEDIUM'
        }
      })
    }

    // Salvar mensagem
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalId: messageId,
        content: content.text || content.caption || `[${type?.toUpperCase()}]`,
        messageType: getMessageType(type),
        direction: 'INCOMING',
        senderName: data.pushName || from,
        metadata: {
          uazApiData: data,
          mediaUrl: content.url,
          timestamp
        }
      }
    })

    // Atualizar última mensagem da conversa
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date(timestamp * 1000) }
    })

    console.log('Mensagem salva:', messageId)
    
  } catch (error) {
    console.error('Erro ao processar mensagem:', error)
  }
}

async function handleConnectionEvent(platform: any, data: any) {
  try {
    const { status } = data

    // Atualizar status da plataforma
    await prisma.platform.update({
      where: { id: platform.id },
      data: {
        config: {
          ...(platform.config as object),
          status: status,
          lastConnectionAt: new Date().toISOString()
        },
        isActive: status === 'connected'
      }
    })

    console.log('Status de conexão atualizado:', status)
    
  } catch (error) {
    console.error('Erro ao processar evento de conexão:', error)
  }
}

async function handleStatusEvent(platform: any, data: any) {
  try {
    const { messageId, status } = data

    // Atualizar status da mensagem se existir
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
            deliveryStatus: status
          }
        }
      })
    }

    console.log('Status da mensagem atualizado:', messageId, status)
    
  } catch (error) {
    console.error('Erro ao processar status da mensagem:', error)
  }
}

function getMessageType(type: string): any {
  switch (type?.toLowerCase()) {
    case 'image':
      return 'IMAGE'
    case 'video':
      return 'VIDEO'
    case 'audio':
      return 'AUDIO'
    case 'document':
      return 'DOCUMENT'
    case 'sticker':
      return 'STICKER'
    case 'location':
      return 'LOCATION'
    default:
      return 'TEXT'
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook UazAPI ativo',
    timestamp: new Date().toISOString()
  })
} 
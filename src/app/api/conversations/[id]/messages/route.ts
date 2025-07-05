import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uazApiClient } from '@/lib/uazapi'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const conversationId = params.id

    // Verificar se a conversa pertence ao workspace do usuário
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        platform: true
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Buscar mensagens
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages, conversation })
    
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const conversationId = params.id
    const { content, messageType = 'TEXT' } = await request.json()

    // Verificar se a conversa pertence ao workspace do usuário
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        platform: true
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Enviar mensagem via UazAPI
    try {
      if (conversation.platform.type === 'WHATSAPP') {
        const config = conversation.platform.config as any
        const token = config?.instanceToken
        if (token) {
          await uazApiClient.sendTextMessage(token, {
            phone: conversation.customerPhone!,
            message: content
          })
        }
      }
    } catch (uazError) {
      console.error('Erro ao enviar via UazAPI:', uazError)
      // Continuar mesmo se der erro na UazAPI
    }

    // Salvar mensagem no banco
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        content: content,
        messageType: messageType,
        direction: 'OUTGOING',
        senderName: session.user.name || session.user.email || 'Você'
      }
    })

    // Atualizar última mensagem da conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message })
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 
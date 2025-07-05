import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { status, priority } = await request.json()
    const conversationId = params.id

    // Verificar se a conversa pertence ao usuário
    const userWorkspaces = await prisma.workspaceUser.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    })

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId: {
          in: userWorkspaces.map(w => w.workspaceId)
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Atualizar a conversa
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        updatedAt: new Date()
      },
      include: {
        platform: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    // Formatar resposta
    const formattedConversation = {
      id: updatedConversation.id,
      customerName: updatedConversation.customerName,
      customerPhone: updatedConversation.customerPhone,
      platform: {
        type: updatedConversation.platform.type,
        name: updatedConversation.platform.name
      },
      status: updatedConversation.status,
      priority: updatedConversation.priority,
      messageCount: updatedConversation._count.messages,
      lastMessage: updatedConversation.messages[0] ? {
        content: updatedConversation.messages[0].content,
        createdAt: updatedConversation.messages[0].createdAt.toISOString()
      } : null,
      createdAt: updatedConversation.createdAt.toISOString(),
      updatedAt: updatedConversation.updatedAt.toISOString()
    }

    return NextResponse.json({ conversation: formattedConversation })
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 
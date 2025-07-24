import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { conversationOperations, workspaceOperationsExtended, messageOperations, kanbanOperations } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { status, priority } = await request.json()
    const conversationId = (await params).id

    // Verificar se a conversa pertence ao usuário
    const userWorkspaces = await workspaceOperationsExtended.findUserWorkspaces(session.user.id)

    const conversation = await conversationOperations.findById(conversationId)

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Atualizar a conversa
    const updateData = {
      ...(status && { status }),
      ...(priority && { priority })
      // Remover updatedAt manual - será atualizado automaticamente pelo trigger
    }
    
    const updatedConversation = await conversationOperations.update(conversationId, updateData)

    // Formatar resposta
    const formattedConversation = {
      id: updatedConversation.id,
      customerName: updatedConversation.customer_name,
      customerPhone: updatedConversation.customer_phone,
      platform: updatedConversation.platform ? {
        type: updatedConversation.platform.type,
        name: updatedConversation.platform.name
      } : {
        type: 'UNKNOWN',
        name: 'Plataforma não encontrada'
      },
      status: updatedConversation.status,
      priority: updatedConversation.priority,
      messageCount: updatedConversation._count?.messages || 0,
      lastMessage: updatedConversation.messages?.[0] ? {
        content: updatedConversation.messages[0].content,
        createdAt: updatedConversation.messages[0].created_at
      } : null,
      createdAt: updatedConversation.created_at,
      updatedAt: updatedConversation.updated_at
    }

    return NextResponse.json({ conversation: formattedConversation })
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const conversationId = (await params).id

    // Verificar se a conversa pertence ao usuário
    const userWorkspaces = await workspaceOperationsExtended.findUserWorkspaces(session.user.id)
    
    if (!userWorkspaces || userWorkspaces.length === 0) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const conversation = await conversationOperations.findById(conversationId)

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Verificar se a conversa pertence ao workspace do usuário
    const workspaceId = userWorkspaces[0].workspace?.id || userWorkspaces[0].workspace_id
    if (conversation.workspace_id !== workspaceId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Remover mensagens da conversa
    const messages = await messageOperations.findMany({ conversation_id: conversationId })
    for (const message of messages) {
      await messageOperations.delete(message.id)
    }

    // Remover cards do kanban relacionados (se existirem)
    try {
      const kanbanCards = await kanbanOperations.card.findMany({ conversation_id: conversationId })
      for (const card of kanbanCards) {
        await kanbanOperations.card.delete({ id: card.id })
      }
    } catch (error) {
      console.warn('Erro ao remover cards do kanban (pode não existir):', error)
    }

    // Remover a conversa
    await conversationOperations.delete(conversationId)

    return NextResponse.json({ success: true, message: 'Conversa excluída com sucesso' })
    
  } catch (error) {
    console.error('Erro ao deletar conversa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
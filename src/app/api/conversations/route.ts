import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { conversationOperations, platformOperations, messageOperations, createKanbanCardForConversation } from '@/lib/database'
import { ensureUserWorkspace } from '@/lib/workspace'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id,
      session.user.email || undefined,
      session.user.name || undefined
    )

    // Construir filtros para a busca
    const filters: any = {
      workspace_id: workspace.id
    }

    if (status) {
      filters.status = status
    }

    if (search) {
      // Implementar busca por nome ou telefone do cliente
      filters.OR = [
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_phone: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const conversations = await conversationOperations.findMany(filters)

    // Mapear as conversas para garantir que os dados estão no formato correto
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      // Buscar a plataforma relacionada
      const platform = await platformOperations.findFirst({
        id: conv.platform_id
      })
      
      // Buscar a última mensagem
      const messages = await messageOperations.findMany(
        { conversation_id: conv.id },
        { orderBy: { created_at: 'desc' }, take: 1 }
      )
      
      // Contar mensagens não lidas (assumindo que todas são não lidas por enquanto)
      const allMessages = await messageOperations.findMany({
        conversation_id: conv.id
      })
      
      return {
        id: conv.id,
        customerName: conv.customer_name || 'Cliente não identificado',
        customerPhone: conv.customer_phone || 'Telefone não disponível',
        platform: platform ? {
          type: platform.type,
          name: platform.name
        } : {
          type: 'UNKNOWN',
          name: 'Plataforma não encontrada'
        },
        lastMessage: messages.length > 0 ? {
          content: messages[0].content,
          createdAt: messages[0].created_at
        } : null,
        status: conv.status,
        unreadCount: allMessages.length
      }
    }))

    return NextResponse.json({ conversations: formattedConversations })
    
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { platformId, customerName, customerPhone, customerEmail } = await request.json()

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id,
      session.user.email || undefined,
      session.user.name || undefined
    )

    // Verificar se a plataforma pertence ao workspace do usuário
    const platform = await platformOperations.findFirst({
      id: platformId,
      workspace_id: workspace.id
    })

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    // Criar conversa
    const conversation = await conversationOperations.create({
      workspace_id: platform.workspace_id,
      platform_id: platform.id,
      external_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      status: 'OPEN',
      priority: 'MEDIUM'
    })

    // Criar card no Kanban automaticamente
    try {
      await createKanbanCardForConversation(conversation.id, platform.workspace_id)
      console.log(`Card do Kanban criado para conversa ${conversation.id}`)
    } catch (error) {
      console.error('Erro ao criar card no Kanban:', error)
      // Não falhar a criação da conversa se o card falhar
    }

    return NextResponse.json({ conversation })
    
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { messageOperations, conversationOperations } from '@/lib/database'
import { uazApiClient } from '@/lib/uazapi'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const conversationId = (await params).id

    // Verificar se a conversa pertence ao workspace do usuário
    const conversation = await conversationOperations.findById(conversationId)

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    console.log('🔍 Debug - Conversa encontrada:', {
      id: conversation.id,
      customer_phone: conversation.customer_phone,
      customer_name: conversation.customer_name,
      platform: conversation.platform
    })

    // Buscar mensagens
    const messages = await messageOperations.findMany({
      conversation_id: conversationId
    })

    // Formatar mensagens para o frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      direction: msg.direction,
      messageType: msg.message_type,
      createdAt: msg.created_at,
      senderName: msg.sender_name
    }))

    return NextResponse.json({ messages: formattedMessages, conversation })
    
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const conversationId = (await params).id
    const { content, messageType = 'TEXT' } = await request.json()

    // Verificar se a conversa pertence ao workspace do usuário
    const conversation = await conversationOperations.findById(conversationId)

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    // Enviar mensagem via UazAPI
    try {
      if (conversation.platform && conversation.platform.type === 'WHATSAPP') {
        console.log('🔍 Debug - Dados da conversa para envio:', {
          id: conversation.id,
          customerPhone: conversation.customer_phone,
          customerName: conversation.customer_name,
          platformType: conversation.platform.type
        })
        
        const config = conversation.platform.config as any
        const token = config?.instanceToken
        
        if (!conversation.customer_phone) {
          throw new Error('Número de telefone do cliente não encontrado na conversa')
        }
        
        if (token) {
          await uazApiClient.sendTextMessage(token, {
            phone: conversation.customer_phone,
            message: content
          })
        }
      }
    } catch (uazError) {
      console.error('Erro ao enviar via UazAPI:', uazError)
      // Continuar mesmo se der erro na UazAPI
    }

    // Salvar mensagem no banco
    const message = await messageOperations.create({
      conversation_id: conversationId,
      content: content,
      message_type: messageType,
      direction: 'OUTGOING',
      sender_name: session.user.name || session.user.email || 'Você'
    })

    // Atualizar última mensagem da conversa
    await conversationOperations.update(
      { id: conversationId },
      {
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    )

    // Formatar mensagem para o frontend
    const formattedMessage = {
      id: message.id,
      content: message.content,
      direction: message.direction,
      messageType: message.message_type,
      createdAt: message.created_at,
      senderName: message.sender_name
    }

    return NextResponse.json({ message: formattedMessage })
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
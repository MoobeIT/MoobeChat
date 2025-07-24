import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { conversationOperations, messageOperations, platformOperations, createKanbanCardForConversation } from '@/lib/database'
import { uazApiClient } from '@/lib/uazapi'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { platformId, phone, message, media } = await request.json()

    console.log('📤 Solicitação de envio de mensagem:', {
      platformId,
      phone,
      message: message ? `${message.substring(0, 50)}...` : null,
      media: media ? `${media.type} - ${media.url}` : null
    })

    // Validações
    if (!platformId || !phone) {
      return NextResponse.json({ 
        error: 'ID da plataforma e telefone são obrigatórios' 
      }, { status: 400 })
    }

    if (!message && !media) {
      return NextResponse.json({ 
        error: 'Mensagem ou mídia são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se a plataforma pertence ao usuário
    const platform = await platformOperations.findById(platformId)

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    // Obter token da instância
    const config = platform.config as any
    const instanceToken = config?.instanceToken

    if (!instanceToken) {
      return NextResponse.json({ 
        error: 'Token da instância não encontrado. Conecte o WhatsApp primeiro.' 
      }, { status: 400 })
    }

    console.log('🔍 Verificando conexão da instância...')
    console.log(`🔑 Token obtido do config: ${instanceToken}`)
    console.log(`📋 Config completo:`, config)

    // Verificar se a instância está conectada
    const isConnected = await uazApiClient.isInstanceConnected(instanceToken)
    
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'WhatsApp não está conectado. Conecte primeiro.' 
      }, { status: 400 })
    }

    console.log('✅ Instância conectada, enviando mensagem...')

    try {
      let result: any
      let messageContent = message || ''

      if (media) {
        // Validar mídia
        if (!media.type || !media.url) {
          return NextResponse.json({ 
            error: 'Tipo e URL da mídia são obrigatórios' 
          }, { status: 400 })
        }

        // Enviar mídia
        result = await uazApiClient.sendMediaMessage(instanceToken, {
          phone,
          media: {
            type: media.type,
            url: media.url,
            caption: message || media.caption
          }
        })
        
        messageContent = `[${media.type.toUpperCase()}] ${message || media.caption || ''}`
      } else {
        // Enviar mensagem de texto
        result = await uazApiClient.sendTextMessage(instanceToken, {
          phone,
          message
        })
      }

      console.log('📨 Mensagem enviada via UazAPI:', result)

      // Salvar mensagem no banco de dados
      try {
        // Buscar ou criar conversa
        let conversation = await conversationOperations.findByExternalId(phone.replace(/\D/g, ''), platform.id)

        if (!conversation) {
          console.log('🆕 Criando nova conversa para envio')
          conversation = await conversationOperations.create({
            workspace_id: platform.workspace_id,
            platform_id: platform.id,
            external_id: phone.replace(/\D/g, ''),
            customer_name: phone,
            customer_phone: phone,
            status: 'OPEN',
            priority: 'MEDIUM',
            last_message_at: new Date().toISOString()
          })

          // Criar card no Kanban automaticamente
          try {
            await createKanbanCardForConversation(conversation.id, platform.workspace_id)
            console.log(`Card do Kanban criado para conversa ${conversation.id} via envio`)
          } catch (error) {
            console.error('Erro ao criar card no Kanban via envio:', error)
            // Não falhar o envio se o card falhar
          }
        } else {
          // Atualizar última mensagem
          await conversationOperations.update(conversation.id, {
            last_message_at: new Date().toISOString()
          })
        }

        // Salvar mensagem
        const savedMessage = await messageOperations.create({
          conversation_id: conversation.id,
          external_id: result.messageId || result.id || `out_${Date.now()}`,
          content: messageContent,
          message_type: media ? media.type.toUpperCase() : 'TEXT',
          direction: 'OUTGOING',
          sender_name: session.user.name || 'Sistema',
          metadata: {
            uazApiResult: result,
            media: media || null,
            sentBy: session.user.id,
            sentAt: new Date().toISOString()
          }
        })

        console.log('✅ Mensagem salva no banco:', savedMessage.id)
        
      } catch (dbError) {
        console.error('❌ Erro ao salvar mensagem no banco:', dbError)
        // Não falhar o envio por erro no banco
      }

      return NextResponse.json({ 
        success: true,
        messageId: result.messageId || result.id,
        result,
        message: 'Mensagem enviada com sucesso'
      })

    } catch (uazError: any) {
      console.error('❌ Erro na UazAPI ao enviar mensagem:', uazError)
      
      // Tratar diferentes tipos de erro da UazAPI
      let errorMessage = 'Erro ao enviar mensagem via WhatsApp'
      
      if (uazError.response?.status === 401) {
        errorMessage = 'Token da instância inválido ou expirado'
      } else if (uazError.response?.status === 404) {
        errorMessage = 'Instância não encontrada'
      } else if (uazError.response?.status === 400) {
        errorMessage = uazError.response.data?.message || 'Dados inválidos para envio'
      } else if (uazError.message?.includes('timeout')) {
        errorMessage = 'Timeout ao enviar mensagem. Tente novamente.'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: uazError.response?.data || uazError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erro geral ao enviar mensagem WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// GET - Testar envio de mensagem
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get('platformId')
    const phone = searchParams.get('phone')

    if (!platformId || !phone) {
      return NextResponse.json({ 
        error: 'platformId e phone são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se a plataforma pertence ao usuário
    const platform = await platformOperations.findById(platformId)

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    // Obter token da instância
    const config = platform.config as any
    const instanceToken = config?.instanceToken

    if (!instanceToken) {
      return NextResponse.json({ 
        error: 'Token da instância não encontrado' 
      }, { status: 400 })
    }

    // Verificar se o número existe no WhatsApp
    const numberExists = await uazApiClient.checkNumber(instanceToken, phone)
    
    return NextResponse.json({ 
      success: true,
      numberExists,
      platform: platform.name,
      phone: phone
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar número:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uazApiClient } from '@/lib/uazapi'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
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
    const platform = await prisma.platform.findFirst({
      where: {
        id: platformId,
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

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
        let conversation = await prisma.conversation.findFirst({
          where: {
            platformId: platform.id,
            externalId: phone.replace(/\D/g, '')
          }
        })

        if (!conversation) {
          console.log('🆕 Criando nova conversa para envio')
          conversation = await prisma.conversation.create({
            data: {
              workspaceId: platform.workspaceId,
              platformId: platform.id,
              externalId: phone.replace(/\D/g, ''),
              customerPhone: phone,
              status: 'OPEN',
              priority: 'MEDIUM',
              lastMessageAt: new Date()
            }
          })
        } else {
          // Atualizar última mensagem
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
          })
        }

        // Salvar mensagem
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            externalId: result.messageId || result.id || `out_${Date.now()}`,
            content: messageContent,
            messageType: media ? media.type.toUpperCase() as any : 'TEXT',
            direction: 'OUTGOING',
            senderName: session.user.name || 'Sistema',
            metadata: {
              uazApiResult: result,
              media: media || null,
              sentBy: session.user.id,
              sentAt: new Date().toISOString()
            }
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
    const session = await getServerSession(authOptions)
    
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
    const platform = await prisma.platform.findFirst({
      where: {
        id: platformId,
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

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
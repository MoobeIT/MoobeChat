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

    // Verificar se a instância está conectada
    const isConnected = await uazApiClient.isInstanceConnected(instanceToken)
    
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'WhatsApp não está conectado. Conecte primeiro.' 
      }, { status: 400 })
    }

    try {
      let result: any

      if (media) {
        // Enviar mídia
        result = await uazApiClient.sendMediaMessage(instanceToken, {
          phone,
          media: {
            type: media.type,
            url: media.url,
            caption: message || media.caption
          }
        })
      } else {
        // Enviar mensagem de texto
        result = await uazApiClient.sendTextMessage(instanceToken, {
          phone,
          message
        })
      }

      // Salvar mensagem no banco de dados
      try {
        // Buscar ou criar conversa
        let conversation = await prisma.conversation.findFirst({
          where: {
            platformId: platform.id,
            externalId: phone
          }
        })

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              workspaceId: platform.workspaceId,
              platformId: platform.id,
              externalId: phone,
              customerPhone: phone,
              status: 'OPEN',
              priority: 'MEDIUM'
            }
          })
        }

        // Salvar mensagem
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            externalId: result.messageId || result.id,
            content: message || `[${media?.type?.toUpperCase()}] ${media?.caption || ''}`,
            messageType: media ? media.type.toUpperCase() as any : 'TEXT',
            direction: 'OUTGOING',
            senderName: 'Sistema',
            metadata: {
              uazApiResult: result,
              media: media || null
            }
          }
        })
      } catch (dbError) {
        console.error('Erro ao salvar mensagem no banco:', dbError)
        // Não falhar o envio por erro no banco
      }

      return NextResponse.json({ 
        success: true,
        messageId: result.messageId || result.id,
        result,
        message: 'Mensagem enviada com sucesso'
      })

    } catch (uazError: any) {
      console.error('Erro na UazAPI ao enviar mensagem:', uazError)
      
      return NextResponse.json({ 
        error: 'Erro ao enviar mensagem via WhatsApp',
        details: uazError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 
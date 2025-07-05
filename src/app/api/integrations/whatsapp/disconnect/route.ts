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

    const { platformId } = await request.json()

    if (!platformId) {
      return NextResponse.json({ error: 'ID da plataforma é obrigatório' }, { status: 400 })
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
      return NextResponse.json({ error: 'Token da instância não encontrado' }, { status: 400 })
    }

    try {
      // Desconectar instância na UazAPI
      await uazApiClient.disconnectInstance(instanceToken)
      
      // Atualizar configuração da plataforma
      await prisma.platform.update({
        where: { id: platformId },
        data: {
          config: {
            ...(platform.config as object),
            status: 'disconnected'
          },
          isActive: false
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      })

    } catch (uazError: any) {
      console.error('Erro na UazAPI:', uazError)
      
      // Atualizar status para erro
      await prisma.platform.update({
        where: { id: platformId },
        data: {
          config: {
            ...(platform.config as object),
            status: 'error',
            error: uazError.message
          },
          isActive: false
        }
      })

      return NextResponse.json({ 
        error: 'Erro ao desconectar WhatsApp',
        details: uazError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Erro ao desconectar WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 
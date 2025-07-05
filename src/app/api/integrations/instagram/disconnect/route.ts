import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { platformId } = await request.json()

    if (!platformId) {
      return NextResponse.json({ 
        error: 'ID da plataforma é obrigatório' 
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

    try {
      // Revogar token do Instagram (simulação)
      // Em produção, aqui faria a revogação real com a Meta Graph API
      console.log('Revogando token do Instagram...')

      // Atualizar configuração da plataforma
      await prisma.platform.update({
        where: {
          id: platformId
        },
        data: {
          config: {
            accessToken: null,
            pageId: null,
            pageInfo: null,
            status: 'disconnected',
            disconnectedAt: new Date().toISOString()
          },
          isActive: false
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Instagram desconectado com sucesso.'
      })

    } catch (instagramError: any) {
      console.error('Erro no Instagram API:', instagramError)
      
      // Mesmo com erro, atualizar status local
      await prisma.platform.update({
        where: {
          id: platformId
        },
        data: {
          config: {
            accessToken: null,
            pageId: null,
            pageInfo: null,
            status: 'disconnected',
            error: instagramError.message
          },
          isActive: false
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Instagram desconectado localmente.',
        warning: instagramError.message
      })
    }
    
  } catch (error) {
    console.error('Erro ao desconectar Instagram:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 
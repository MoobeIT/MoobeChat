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

    const { platformId, accessToken, pageId } = await request.json()

    if (!platformId || !accessToken || !pageId) {
      return NextResponse.json({ 
        error: 'ID da plataforma, token de acesso e ID da página são obrigatórios' 
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
      // Validar token do Instagram (simulação)
      // Em produção, aqui faria a validação real com a Meta Graph API
      const mockValidation = {
        valid: true,
        pageInfo: {
          id: pageId,
          name: 'Página Instagram',
          username: '@exemplo'
        }
      }

      if (!mockValidation.valid) {
        throw new Error('Token de acesso inválido')
      }

      // Atualizar configuração da plataforma
      await prisma.platform.update({
        where: {
          id: platformId
        },
        data: {
          config: {
            accessToken,
            pageId,
            pageInfo: mockValidation.pageInfo,
            status: 'connected',
            connectedAt: new Date().toISOString()
          },
          isActive: true
        }
      })

      return NextResponse.json({ 
        success: true,
        pageInfo: mockValidation.pageInfo,
        message: 'Instagram conectado com sucesso.'
      })

    } catch (instagramError: any) {
      console.error('Erro no Instagram API:', instagramError)
      
      // Atualizar status para erro
      await prisma.platform.update({
        where: {
          id: platformId
        },
        data: {
          config: {
            accessToken: null,
            pageId: null,
            status: 'error',
            error: instagramError.message
          },
          isActive: false
        }
      })

      return NextResponse.json({ 
        error: 'Erro ao conectar com Instagram',
        details: instagramError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Erro ao conectar Instagram:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { platformOperations } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
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
    const platform = await platformOperations.findFirst({
      id: platformId,
      workspace: {
        users: {
          some: {
            userId: session.user.id
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
      await platformOperations.update(platformId, {
        config: {
          accessToken,
          pageId,
          pageInfo: mockValidation.pageInfo,
          status: 'connected',
          connectedAt: new Date().toISOString()
        },
        is_active: true
      })

      return NextResponse.json({ 
        success: true,
        pageInfo: mockValidation.pageInfo,
        message: 'Instagram conectado com sucesso.'
      })

    } catch (instagramError: any) {
      console.error('Erro no Instagram API:', instagramError)
      
      // Atualizar status para erro
      await platformOperations.update(platformId, {
        config: {
          accessToken: null,
          pageId: null,
          status: 'error',
          error: instagramError.message
        },
        is_active: false
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
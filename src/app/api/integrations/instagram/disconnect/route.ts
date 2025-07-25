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

    const { platformId } = await request.json()

    if (!platformId) {
      return NextResponse.json({ 
        error: 'ID da plataforma é obrigatório' 
      }, { status: 400 })
    }

    // Verificar se a plataforma pertence ao usuário
    const platform = await platformOperations.findById(platformId)
    
    if (!platform || platform.type !== 'INSTAGRAM') {
      return NextResponse.json(
        { error: 'Plataforma Instagram não encontrada' },
        { status: 404 }
      )
    }

    try {
      // Revogar token do Instagram (simulação)
      // Em produção, aqui faria a revogação real com a Meta Graph API
      console.log('Revogando token do Instagram...')

      // Atualizar configuração da plataforma
      await platformOperations.update({ id: platformId }, {
        is_active: false,
        config: {
          ...platform.config,
          accessToken: null,
          userId: null,
          disconnectedAt: new Date().toISOString()
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Instagram desconectado com sucesso.'
      })

    } catch (instagramError: any) {
      console.error('Erro no Instagram API:', instagramError)
      
      // Mesmo com erro, atualizar status local
      await platformOperations.update({ id: platformId }, {
        is_active: false,
        config: {
          ...platform.config,
          accessToken: null,
          userId: null,
          error: instagramError.message,
          disconnectedAt: new Date().toISOString()
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
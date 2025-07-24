import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { platformOperations } from '@/lib/database'
import { uazApiClient } from '@/lib/uazapi'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { platformId } = await request.json()

    if (!platformId) {
      return NextResponse.json({ error: 'ID da plataforma é obrigatório' }, { status: 400 })
    }

    // Verificar se a plataforma pertence ao usuário
    const platform = await platformOperations.findById(platformId)
    
    if (!platform || platform.type !== 'WHATSAPP') {
      return NextResponse.json(
        { error: 'Plataforma WhatsApp não encontrada' },
        { status: 404 }
      )
    }

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
      await platformOperations.update(platformId, {
        config: {
          ...(platform.config as object),
          status: 'disconnected'
        },
        is_active: false
      })

      return NextResponse.json({ 
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      })

    } catch (uazError: any) {
      console.error('Erro na UazAPI:', uazError)
      
      // Atualizar status para erro
      await platformOperations.update(platformId, {
        config: {
          ...(platform.config as object),
          status: 'error',
          error: uazError.message
        },
        is_active: false
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
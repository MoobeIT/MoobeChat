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

    // Buscar plataforma
    const platform = await platformOperations.findById(platformId)

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    const config = platform.config as any
    const instanceToken = config?.instanceToken

    if (!instanceToken) {
      return NextResponse.json({ error: 'Token da instância não encontrado' }, { status: 400 })
    }

    // Verificar status e configurações da instância
    console.log(`🔍 Verificando configurações da instância ${config.instanceName}`)
    
    const instanceStatus = await uazApiClient.getInstanceStatus(instanceToken)
    
    return NextResponse.json({
      success: true,
      instanceName: config.instanceName,
      status: instanceStatus.status,
      instanceToken: instanceToken ? `${instanceToken.slice(0, 10)}...` : null,
      webhookUrl: `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`,
      instanceData: instanceStatus
    })

  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para verificar configurações de webhook',
    usage: 'POST com { platformId: "id-da-plataforma" }'
  })
}
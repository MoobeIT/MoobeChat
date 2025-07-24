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

    const { platformId, customWebhookUrl } = await request.json()

    if (!platformId) {
      return NextResponse.json({ error: 'ID da plataforma é obrigatório' }, { status: 400 })
    }

    // Buscar plataforma
    const platform = await platformOperations.findFirst({
      id: platformId,
      workspace_id: session.user.workspaceId
    })

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    const config = platform.config as any
    const instanceToken = config?.instanceToken

    if (!instanceToken) {
      return NextResponse.json({ error: 'Token da instância não encontrado' }, { status: 400 })
    }

    // Verificar se a instância está conectada
    const instanceStatus = await uazApiClient.getInstanceStatus(instanceToken)
    
    if (instanceStatus.status !== 'connected') {
      return NextResponse.json({ 
        error: 'Instância não está conectada. Conecte a instância primeiro.' 
      }, { status: 400 })
    }

    // Configurar webhook
    const webhookUrl = customWebhookUrl || `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`
    
    console.log(`🔗 Configurando webhook para instância ${config.instanceName}`)
    console.log(`📡 URL do webhook: ${webhookUrl}`)
    
    if (customWebhookUrl) {
      console.log(`🎯 MODO CAPTURA: Usando URL personalizada para análise`)
    }
    
    await uazApiClient.setWebhook(instanceToken, webhookUrl)

    // Atualizar configuração da plataforma
    await platformOperations.update(platform.id, {
      config: {
        ...config,
        webhookUrl,
        webhookConfigured: true,
        webhookConfiguredAt: new Date().toISOString()
      }
    })

    console.log('✅ Webhook configurado com sucesso')

    return NextResponse.json({
      success: true,
      message: customWebhookUrl 
        ? 'Webhook configurado para CAPTURA! Use apenas para análise.' 
        : 'Webhook configurado com sucesso!',
      webhookUrl,
      instanceName: config.instanceName,
      status: instanceStatus.status,
      captureMode: !!customWebhookUrl
    })

  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
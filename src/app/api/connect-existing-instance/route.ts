import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { platformOperations } from '@/lib/database'
import { uazApiClient } from '@/lib/uazapi'
import { ensureUserWorkspace } from '@/lib/workspace'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { instanceToken, instanceName } = await request.json()

    if (!instanceToken) {
      return NextResponse.json({ 
        error: 'Token da instância é obrigatório' 
      }, { status: 400 })
    }

    console.log(`🔗 Conectando a instância existente: ${instanceToken}`)

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id, 
      session.user.email || undefined, 
      session.user.name || undefined
    )

    // Verificar se a instância existe no UazAPI
    try {
      const instanceStatus = await uazApiClient.getInstanceStatus(instanceToken)
      console.log(`✅ Instância encontrada no UazAPI:`, instanceStatus)

      // Criar plataforma no banco de dados
      const platform = await platformOperations.create({
        id: randomUUID(),
        name: instanceName || instanceStatus.instanceId || `Instância ${instanceToken.slice(0, 8)}`,
        type: 'WHATSAPP',
        workspace_id: workspace.id,
        config: {
          instanceToken: instanceToken,
          instanceName: instanceStatus.instanceId,
          status: instanceStatus.status,
          uazApiInitialized: true,
          connectedAt: new Date().toISOString(),
          importedFromExisting: true,
          webhookUrl: `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`
        },
        is_active: instanceStatus.status === 'connected'
      })

      // Configurar webhook se a instância estiver conectada
      if (instanceStatus.status === 'connected') {
        try {
          const webhookUrl = `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`
          await uazApiClient.setWebhook(instanceToken, webhookUrl)
          console.log(`🔗 Webhook configurado: ${webhookUrl}`)
          
          // Atualizar configuração com webhook
          await platformOperations.update(
            { id: platform.id },
            {
              config: {
                ...(platform.config as any),
                webhookConfigured: true
              }
            }
          )
        } catch (webhookError) {
          console.warn('⚠️ Erro ao configurar webhook:', webhookError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Instância conectada com sucesso!',
        platform: {
          id: platform.id,
          name: platform.name,
          status: instanceStatus.status,
          instanceName: instanceStatus.instanceId,
          token: instanceToken
        }
      })

    } catch (uazError) {
      console.error('❌ Erro ao verificar instância no UazAPI:', uazError)
      return NextResponse.json({
        success: false,
        error: 'Instância não encontrada no UazAPI ou token inválido',
        details: uazError instanceof Error ? uazError.message : 'Erro desconhecido'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erro ao conectar instância existente:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
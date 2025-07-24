import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ensureUserWorkspace } from '@/lib/workspace'
import { platformOperations } from '@/lib/database'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { instanceName, instanceToken, webhookUrl } = await request.json()

    if (!instanceName || !instanceToken) {
      return NextResponse.json({ 
        error: 'Nome da instância e token são obrigatórios' 
      }, { status: 400 })
    }

    console.log(`🔗 Conectando plataforma simples: ${instanceName}`)

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id,
      session.user.email || undefined,
      session.user.name || undefined
    )

    // Verificar se já existe uma plataforma com esse nome
    const existingPlatform = await platformOperations.findFirst({
      workspace_id: workspace.id,
      name: instanceName
    })

    if (existingPlatform) {
      return NextResponse.json({ 
        error: 'Já existe uma plataforma com este nome' 
      }, { status: 409 })
    }

    // Criar plataforma no banco de dados
    const platformData = {
      id: randomUUID(),
      name: instanceName,
      type: 'WHATSAPP' as const,
      workspace_id: workspace.id,
      config: {
        instanceToken: instanceToken,
        instanceName: instanceName,
        webhookUrl: webhookUrl || `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`,
        connectedAt: new Date().toISOString(),
        status: 'connected'
      },
      is_active: false
    }
    
    console.log('🔍 Dados da plataforma a serem criados:', platformData)
    const platform = await platformOperations.create(platformData)

    console.log('✅ Plataforma criada:', platform.id)

    return NextResponse.json({
      success: true,
      message: 'Plataforma conectada com sucesso!',
      platform: {
        id: platform.id,
        name: platform.name,
        type: platform.type,
        isActive: true,
        instanceName: instanceName,
        instanceToken: instanceToken
      }
    })

  } catch (error) {
    console.error('❌ Erro ao conectar plataforma simples:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
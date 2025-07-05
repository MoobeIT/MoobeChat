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

    // Buscar plataforma
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

    const config = platform.config as any
    const instanceToken = config?.instanceToken

    if (!instanceToken) {
      return NextResponse.json({ error: 'Token da instância não encontrado' }, { status: 400 })
    }

    // Configurar webhook
    const webhookUrl = `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`
    
    console.log(`🔗 Configurando webhook para instância ${config.instanceName}`)
    console.log(`📡 URL do webhook: ${webhookUrl}`)
    
    await uazApiClient.setWebhook(instanceToken, webhookUrl)

    return NextResponse.json({
      success: true,
      message: 'Webhook configurado com sucesso',
      webhookUrl,
      instanceName: config.instanceName
    })

  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para configurar webhook da UazAPI',
    usage: 'POST com { platformId: "id-da-plataforma" }'
  })
} 
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

    if (!platformId) {
      return NextResponse.json({ error: 'ID da plataforma é obrigatório' }, { status: 400 })
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

    let result: any = {}
    
    // Verificar se já existe token da instância no config
    const config = platform.config as any
    const existingToken = config?.instanceToken

    if (existingToken) {
      // Se já tem token, apenas tentar conectar
      try {
        const connectResult = await uazApiClient.connectInstance(existingToken)
        result = {
          qrcode: connectResult.qrcode,
          status: connectResult.status || 'connecting',
          instanceToken: existingToken
        }
      } catch (error) {
        // Se falhou, criar nova instância
        const instanceName = `moobi_${platform.id.slice(0, 8)}`
        const initResult = await uazApiClient.initInstance(instanceName)
        
        if (initResult.token) {
          // Salvar o token da instância
          await prisma.platform.update({
            where: { id: platformId },
            data: {
              config: {
                ...(platform.config as object),
                instanceToken: initResult.token,
                instanceName
              }
            }
          })
          
          // Tentar conectar com o novo token
          const connectResult = await uazApiClient.connectInstance(initResult.token)
          result = {
            qrcode: connectResult.qrcode,
            status: connectResult.status || 'connecting',
            instanceToken: initResult.token
          }
        }
      }
    } else {
      // Primeira vez - inicializar instância
      const instanceName = `moobi_${platform.id.slice(0, 8)}_${Date.now()}`
      const webhookUrl = `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`
      
      // Inicializar instância
      const initResult = await uazApiClient.initInstance(instanceName, webhookUrl)
      
      if (!initResult.token) {
        return NextResponse.json({ error: 'Falha ao obter token da instância' }, { status: 500 })
      }

      // Salvar o token da instância
      await prisma.platform.update({
        where: { id: platformId },
        data: {
          config: {
            ...(platform.config as object),
            instanceToken: initResult.token,
            instanceName,
            webhookUrl
          }
        }
      })

      // Conectar para obter QR Code
      const connectResult = await uazApiClient.connectInstance(initResult.token)
      
      result = {
        qrcode: connectResult.qrcode,
        status: connectResult.status || 'connecting',
        instanceToken: initResult.token,
        instanceName
      }
    }

    return NextResponse.json({
      success: true,
      ...result
    })
    
  } catch (error) {
    console.error('Erro ao conectar WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instanceToken = searchParams.get('instanceToken')

    if (!instanceToken) {
      return NextResponse.json({ 
        error: 'Token da instância é obrigatório' 
      }, { status: 400 })
    }

    try {
      const status = await uazApiClient.getInstanceStatus(instanceToken)
      
      // Verificar se está conectada
      const isConnected = await uazApiClient.isInstanceConnected(instanceToken)
      
      return NextResponse.json({ 
        success: true,
        status,
        isConnected
      })

    } catch (uazError: any) {
      console.error('Erro ao verificar status:', uazError)
      
      return NextResponse.json({ 
        error: 'Erro ao verificar status da instância',
        details: uazError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Erro ao verificar status WhatsApp:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 
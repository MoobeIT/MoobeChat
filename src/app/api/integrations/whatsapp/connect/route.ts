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

    // Verificar se já existe token da instância no config
    const config = platform.config as any
    const instanceToken = config?.instanceToken
    const instanceName = config?.instanceName

    if (!instanceToken) {
      return NextResponse.json({ 
        error: 'Instância não foi inicializada corretamente. Tente criar uma nova instância.' 
      }, { status: 400 })
    }

    console.log(`🔗 Tentando conectar instância: ${instanceName}`)
    console.log(`🔑 Token: ${instanceToken.slice(0, 10)}...`)

    // Verificar se a instância está pronta antes de conectar
    try {
      console.log('🔍 Verificando se instância está pronta...')
      const healthCheck = await uazApiClient.getInstanceStatus(instanceToken)
      console.log(`📊 Health check resultado:`, healthCheck)
      
      // Se a instância foi criada muito recentemente, aguardar um pouco
      const createdAt = config?.createdAt
      if (createdAt) {
        const timeSinceCreation = Date.now() - new Date(createdAt).getTime()
        const minWaitTime = 5000 // 5 segundos
        
        if (timeSinceCreation < minWaitTime) {
          const waitTime = minWaitTime - timeSinceCreation
          console.log(`⏳ Instância criada há ${timeSinceCreation}ms, aguardando mais ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    } catch (healthError) {
      console.warn('⚠️ Erro no health check, tentando conectar mesmo assim:', healthError)
    }

    // Conectar para obter QR Code
    console.log('🚀 Iniciando conexão para obter QR Code...')
    const connectResult = await uazApiClient.connectInstance(instanceToken)
    
    const result = {
      qrcode: connectResult.qrcode,
      status: connectResult.status || 'connecting',
      instanceToken: instanceToken,
      instanceName
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
      console.log(`🔍 Verificando status para token: ${instanceToken}`)
      
      const statusResult = await uazApiClient.getInstanceStatus(instanceToken)
      console.log(`📊 Status obtido:`, statusResult)
      
      // Verificar se está conectada
      const isConnected = await uazApiClient.isInstanceConnected(instanceToken)
      console.log(`🔗 Está conectada: ${isConnected}`)
      
      return NextResponse.json({ 
        success: true,
        status: statusResult.status,
        isConnected,
        instanceId: statusResult.instanceId
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { uazApiClient } from '@/lib/uazapi'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { action, token } = await request.json()

    if (!action || !token) {
      return NextResponse.json({ 
        error: 'Action e token são obrigatórios',
        usage: 'POST { "action": "status|connect", "token": "instance-token" }'
      }, { status: 400 })
    }

    console.log(`🔧 Teste direto UazAPI - Action: ${action}, Token: ${token.slice(0, 10)}...`)

    try {
      if (action === 'status') {
        console.log('📊 Testando status da instância...')
        const statusResult = await uazApiClient.getInstanceStatus(token)
        
        return NextResponse.json({
          success: true,
          action: 'status',
          result: statusResult,
          timestamp: new Date().toISOString()
        })
        
      } else if (action === 'connect') {
        console.log('🔗 Testando conexão da instância...')
        const connectResult = await uazApiClient.connectInstance(token)
        
        return NextResponse.json({
          success: true,
          action: 'connect',
          qrcode: connectResult.qrcode,
          status: connectResult.status,
          hasQrCode: !!connectResult.qrcode,
          qrCodeLength: connectResult.qrcode?.length || 0,
          timestamp: new Date().toISOString()
        })
        
      } else {
        return NextResponse.json({ 
          error: 'Action inválida. Use "status" ou "connect"' 
        }, { status: 400 })
      }
      
    } catch (uazError: any) {
      console.error(`❌ Erro na UazAPI (${action}):`, uazError)
      
      return NextResponse.json({
        success: false,
        action,
        error: uazError.message || 'Erro na UazAPI',
        details: {
          name: uazError.name,
          message: uazError.message,
          status: uazError.response?.status,
          statusText: uazError.response?.statusText,
          data: uazError.response?.data
        },
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste direto UazAPI:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
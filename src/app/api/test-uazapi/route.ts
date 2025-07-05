import { NextResponse } from 'next/server'
import { uazApiClient } from '@/lib/uazapi'

export async function GET() {
  try {
    console.log('🧪 Testando conexão UazAPI...')
    
    // Testar listagem de instâncias
    const instances = await uazApiClient.listInstances()
    
    return NextResponse.json({
      success: true,
      message: 'Conexão UazAPI funcionando',
      data: {
        instancesCount: instances.length,
        instances: instances.map(instance => ({
          id: instance.id,
          name: instance.name,
          status: instance.status,
          token: instance.token ? `${instance.token.slice(0, 10)}...` : null,
          created: instance.created
        }))
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no teste UazAPI:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error
    }, { status: 500 })
  }
} 
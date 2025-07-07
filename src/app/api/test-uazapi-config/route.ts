import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uazApiClient } from '@/lib/uazapi'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('🔍 Testando configuração do UazAPI...')

    const testResults = {
      config: {
        hasUrl: !!process.env.UAZAPI_URL,
        hasToken: !!process.env.UAZAPI_TOKEN,
        url: process.env.UAZAPI_URL || 'NÃO CONFIGURADO',
        tokenPreview: process.env.UAZAPI_TOKEN ? `${process.env.UAZAPI_TOKEN.slice(0, 10)}...` : 'NÃO CONFIGURADO'
      },
      tests: {
        listInstances: null as any,
        connectionTest: null as any
      }
    }

    // Teste 1: Listar instâncias
    try {
      console.log('🔍 Testando listagem de instâncias...')
      const instances = await uazApiClient.listInstances()
      testResults.tests.listInstances = {
        success: true,
        count: instances.length,
        instances: instances.map(i => ({
          name: i.name,
          status: i.status,
          id: i.id || i.instanceId
        }))
      }
      console.log('✅ Listagem de instâncias funcionando')
    } catch (error) {
      console.error('❌ Erro na listagem de instâncias:', error)
      
      // Verificar se é erro do servidor de demonstração
      const isDemoServer = error instanceof Error && error.message.includes('public demo server')
      
      testResults.tests.listInstances = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isDemoServer,
        note: isDemoServer ? 'Servidor de demonstração - endpoint /instance/all desabilitado' : undefined
      }
    }

    // Teste 2: Verificar conectividade básica
    try {
      console.log('🔍 Testando conectividade básica...')
      
      // Tentar diferentes endpoints para teste
      const endpoints = ['/health', '/status', '/']
      let connectionSuccess = false
      let lastResponse = null
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Testando endpoint: ${endpoint}`)
          const response = await fetch(`${process.env.UAZAPI_URL}${endpoint}`, {
            method: 'GET'
          })
          
          if (response.ok || response.status < 500) {
            connectionSuccess = true
            lastResponse = {
              endpoint,
              status: response.status,
              statusText: response.statusText
            }
            console.log(`✅ Conectividade OK no endpoint ${endpoint}`)
            break
          }
        } catch (endpointError) {
          console.log(`⚠️ Endpoint ${endpoint} falhou:`, endpointError)
          continue
        }
      }
      
      testResults.tests.connectionTest = {
        success: connectionSuccess,
        ...(lastResponse || { error: 'Nenhum endpoint respondeu' })
      }
      
      console.log('✅ Teste de conectividade concluído')
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error)
      testResults.tests.connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }

    // Verificar se configuração está válida
    const isConfigValid = testResults.config.hasUrl && 
                         testResults.config.hasToken && 
                         process.env.UAZAPI_TOKEN !== 'your-uazapi-token-here'

    const summary = {
      configValid: isConfigValid,
      testsRun: Object.keys(testResults.tests).length,
      testsSuccessful: Object.values(testResults.tests).filter(t => t?.success).length,
      recommendation: isConfigValid ? 
        'Configuração parece válida. Verifique os logs para mais detalhes.' :
        'Configure UAZAPI_URL e UAZAPI_TOKEN no arquivo .env.local'
    }

    return NextResponse.json({ 
      success: true,
      results: testResults,
      summary,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de configuração:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 
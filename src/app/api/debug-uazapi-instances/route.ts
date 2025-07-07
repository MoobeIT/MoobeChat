import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uazApiClient } from '@/lib/uazapi'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('🔍 DEBUG: Comparando instâncias UazAPI vs Banco de Dados')

    // 1. Buscar instâncias do banco de dados
    const localInstances = await prisma.platform.findMany({
      where: {
        type: 'WHATSAPP',
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    console.log(`📋 Instâncias no banco: ${localInstances.length}`)
    localInstances.forEach(instance => {
      const config = instance.config as any
      console.log(`  - ${instance.name}: Token ${config?.instanceToken?.slice(0, 10)}...`)
    })

    // 2. Buscar instâncias no UazAPI
    let uazInstances: any[] = []
    let uazError = null
    
    try {
      console.log('🔍 Buscando instâncias no UazAPI...')
      uazInstances = await uazApiClient.listInstances()
      console.log(`📊 Instâncias no UazAPI: ${uazInstances.length}`)
      
      uazInstances.forEach(instance => {
        console.log(`  - ${instance.name}: Token ${instance.token?.slice(0, 10)}... Status: ${instance.status}`)
      })
      
    } catch (error) {
      console.error('❌ Erro ao buscar instâncias UazAPI:', error)
      uazError = error instanceof Error ? error.message : 'Erro desconhecido'
      
      // Verificar se é erro do servidor gratuito
      if (error instanceof Error && error.message.includes('This is a public demo server')) {
        uazError = 'SERVIDOR_GRATUITO_LIMITADO'
      }
    }

    // 3. Comparar e encontrar divergências
    const comparison = {
      local: localInstances.map(instance => {
        const config = instance.config as any
        return {
          id: instance.id,
          name: instance.name,
          instanceName: config?.instanceName,
          token: config?.instanceToken,
          status: config?.status,
          created: instance.createdAt
        }
      }),
      uazapi: uazInstances.map(instance => ({
        id: instance.id,
        name: instance.name,
        token: instance.token,
        status: instance.status,
        created: instance.created
      })),
             analysis: {
         localCount: localInstances.length,
         uazapiCount: uazInstances.length,
         orphanInLocal: [] as any[],
         orphanInUazapi: [] as any[],
         matching: [] as any[]
       }
    }

    // Encontrar instâncias órfãs e correspondências
    if (!uazError) {
      // Instâncias que existem no banco mas não no UazAPI
      comparison.analysis.orphanInLocal = localInstances.filter(local => {
        const config = local.config as any
        const instanceName = config?.instanceName
        return !uazInstances.some(uaz => uaz.name === instanceName)
      }).map(instance => {
        const config = instance.config as any
        return {
          name: instance.name,
          instanceName: config?.instanceName,
          token: config?.instanceToken?.slice(0, 10) + '...',
          status: config?.status
        }
      })

      // Instâncias que existem no UazAPI mas não no banco
      comparison.analysis.orphanInUazapi = uazInstances.filter(uaz => {
        return !localInstances.some(local => {
          const config = local.config as any
          return config?.instanceName === uaz.name
        })
      }).map(instance => ({
        name: instance.name,
        token: instance.token?.slice(0, 10) + '...',
        status: instance.status
      }))

      // Instâncias que correspondem
      comparison.analysis.matching = localInstances.filter(local => {
        const config = local.config as any
        const instanceName = config?.instanceName
        return uazInstances.some(uaz => uaz.name === instanceName)
      }).map(instance => {
        const config = instance.config as any
        const uazInstance = uazInstances.find(uaz => uaz.name === config?.instanceName)
        return {
          name: instance.name,
          instanceName: config?.instanceName,
          localToken: config?.instanceToken?.slice(0, 10) + '...',
          uazToken: uazInstance?.token?.slice(0, 10) + '...',
          localStatus: config?.status,
          uazStatus: uazInstance?.status,
          tokensMatch: config?.instanceToken === uazInstance?.token
        }
      })
    }

    return NextResponse.json({
      success: true,
      comparison,
      uazError,
      isFreeTier: uazError === 'SERVIDOR_GRATUITO_LIMITADO',
      recommendations: {
        orphanInLocal: comparison.analysis.orphanInLocal.length > 0 ? 
          'Instâncias no banco que não existem no UazAPI - remover ou recriar' : null,
        orphanInUazapi: comparison.analysis.orphanInUazapi.length > 0 ? 
          'Instâncias no UazAPI que não estão no banco - importar ou ignorar' : null,
        tokenMismatches: !uazError ? comparison.analysis.matching.filter(m => !m.tokensMatch).length : 0,
        forFreeTier: uazError === 'SERVIDOR_GRATUITO_LIMITADO' ? 
          'Servidor gratuito: Use "Conectar Existente" com o token do painel para importar suas instâncias' : null
      }
    })

  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 
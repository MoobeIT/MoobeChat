import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { platformOperations } from '@/lib/database'
import { uazApiClient } from '@/lib/uazapi'

// POST - Sincronizar instâncias com UazAPI
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('🔄 Iniciando sincronização de instâncias com UazAPI...')

    // Buscar instâncias locais
    const localInstances = await platformOperations.findMany({
      type: 'WHATSAPP',
      workspace_id: session.user.workspaceId
    })

    console.log(`📊 Instâncias locais encontradas: ${localInstances.length}`)

    // Buscar instâncias no UazAPI
    let uazInstances: any[] = []
    let uazApiAvailable = true
    try {
      uazInstances = await uazApiClient.listInstances()
      console.log(`📊 Instâncias UazAPI encontradas: ${uazInstances.length}`)
    } catch (error) {
      console.error('❌ Erro ao buscar instâncias UazAPI:', error)
      
      // Verificar se é erro do servidor de demonstração
      if (error instanceof Error && error.message.includes('public demo server')) {
        console.log('⚠️ Servidor de demonstração detectado - sincronização limitada')
        uazApiAvailable = false
      } else {
        return NextResponse.json({ 
          error: 'Erro ao conectar com UazAPI',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
      }
    }

    const syncResults = {
      local: localInstances.length,
      uazApi: uazInstances.length,
      synchronized: 0,
      missing: 0,
      errors: 0,
      details: [] as any[]
    }

    // Sincronizar cada instância local
    for (const localInstance of localInstances) {
      const config = localInstance.config as any
      const instanceName = config?.instanceName
      const instanceToken = config?.instanceToken

      console.log(`🔄 Sincronizando instância: ${localInstance.name} (${instanceName})`)

      try {
        // Se UazAPI não está disponível, apenas verificar status das instâncias locais
        if (!uazApiAvailable) {
          if (instanceToken) {
            try {
              const status = await uazApiClient.getInstanceStatus(instanceToken)
              console.log(`📊 Status atual da instância ${instanceName}: ${status.status}`)
              
              // Atualizar status no banco
              await platformOperations.update(localInstance.id, {
                config: {
                  ...config,
                  status: status.status,
                  lastSyncAt: new Date().toISOString()
                }
              })
              
              syncResults.synchronized++
              syncResults.details.push({
                localId: localInstance.id,
                name: localInstance.name,
                instanceName,
                status: 'synchronized',
                currentStatus: status.status,
                message: `Status atualizado: ${status.status} (servidor de demonstração)`
              })
              
            } catch (statusError) {
              console.error(`❌ Erro ao verificar status de ${instanceName}:`, statusError)
              syncResults.errors++
              
              syncResults.details.push({
                localId: localInstance.id,
                name: localInstance.name,
                instanceName,
                status: 'error',
                error: statusError instanceof Error ? statusError.message : 'Erro desconhecido'
              })
            }
          } else {
            console.log(`⚠️ Instância ${instanceName} sem token`)
            syncResults.errors++
            
            syncResults.details.push({
              localId: localInstance.id,
              name: localInstance.name,
              instanceName,
              status: 'no_token',
              message: 'Instância local sem token UazAPI'
            })
          }
          continue
        }

        // Verificar se existe no UazAPI (apenas se UazAPI está disponível)
        const uazInstance = uazInstances.find(u => u.name === instanceName)
        
        if (!uazInstance) {
          console.log(`⚠️ Instância ${instanceName} não encontrada no UazAPI`)
          syncResults.missing++
          
          syncResults.details.push({
            localId: localInstance.id,
            name: localInstance.name,
            instanceName,
            status: 'missing_in_uazapi',
            message: 'Instância não encontrada no UazAPI'
          })
          continue
        }

        // Verificar status atual
        if (instanceToken) {
          try {
            const status = await uazApiClient.getInstanceStatus(instanceToken)
            console.log(`📊 Status atual da instância ${instanceName}: ${status.status}`)
            
            // Atualizar status no banco
            await platformOperations.update(localInstance.id, {
              config: {
                ...config,
                status: status.status,
                lastSyncAt: new Date().toISOString(),
                uazApiInstanceId: uazInstance.id || uazInstance.instanceId
              }
            })
            
            syncResults.synchronized++
            syncResults.details.push({
              localId: localInstance.id,
              name: localInstance.name,
              instanceName,
              status: 'synchronized',
              currentStatus: status.status,
              message: `Sincronizado com status: ${status.status}`
            })
            
          } catch (statusError) {
            console.error(`❌ Erro ao verificar status de ${instanceName}:`, statusError)
            syncResults.errors++
            
            syncResults.details.push({
              localId: localInstance.id,
              name: localInstance.name,
              instanceName,
              status: 'error',
              error: statusError instanceof Error ? statusError.message : 'Erro desconhecido'
            })
          }
        } else {
          console.log(`⚠️ Instância ${instanceName} sem token`)
          syncResults.errors++
          
          syncResults.details.push({
            localId: localInstance.id,
            name: localInstance.name,
            instanceName,
            status: 'no_token',
            message: 'Instância local sem token UazAPI'
          })
        }
        
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${instanceName}:`, error)
        syncResults.errors++
        
        syncResults.details.push({
          localId: localInstance.id,
          name: localInstance.name,
          instanceName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    // Verificar instâncias órfãs no UazAPI (apenas se UazAPI está disponível)
    const orphanInstances = uazApiAvailable ? uazInstances.filter(uazInstance => 
      !localInstances.some(localInstance => {
        const config = localInstance.config as any
        return config?.instanceName === uazInstance.name
      })
    ) : []

    if (orphanInstances.length > 0) {
      console.log(`⚠️ Instâncias órfãs no UazAPI: ${orphanInstances.length}`)
      
      orphanInstances.forEach(orphan => {
        syncResults.details.push({
          name: orphan.name,
          instanceName: orphan.name,
          status: 'orphan_in_uazapi',
          message: 'Instância existe no UazAPI mas não no sistema local'
        })
      })
    }

    console.log('✅ Sincronização concluída:', syncResults)

    return NextResponse.json({ 
      success: true,
      sync: syncResults,
      summary: {
        totalLocal: syncResults.local,
        totalUazApi: syncResults.uazApi,
        synchronized: syncResults.synchronized,
        missing: syncResults.missing,
        errors: syncResults.errors,
        orphans: orphanInstances.length,
        uazApiAvailable,
        demoServer: !uazApiAvailable
      }
    })
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
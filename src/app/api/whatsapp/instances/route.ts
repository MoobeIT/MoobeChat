import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uazApiClient } from '@/lib/uazapi'

// GET - Listar instâncias do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar plataformas WhatsApp do usuário
    const platforms = await prisma.platform.findMany({
      where: {
        type: 'WHATSAPP',
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        workspace: {
          select: {
            name: true
          }
        }
      }
    })

    // Verificar status das instâncias
    const instancesWithStatus = await Promise.all(
      platforms.map(async (platform) => {
        const config = platform.config as any
        const instanceToken = config?.instanceToken
        
        let status = 'disconnected'
        
        if (instanceToken) {
          try {
            const instanceStatus = await uazApiClient.getInstanceStatus(instanceToken)
            status = instanceStatus.status || 'disconnected'
          } catch (error) {
            console.error(`Erro ao verificar status da instância ${platform.id}:`, error)
            status = 'error'
          }
        }
        
        return {
          id: platform.id,
          name: platform.name,
          workspaceName: platform.workspace.name,
          status,
          isActive: platform.isActive,
          instanceToken: instanceToken ? '***' : null,
          instanceName: config?.instanceName || 'N/A',
          createdAt: platform.createdAt.toISOString(),
          updatedAt: platform.updatedAt.toISOString()
        }
      })
    )

    return NextResponse.json({ 
      success: true,
      instances: instancesWithStatus 
    })
    
  } catch (error) {
    console.error('Erro ao listar instâncias WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// POST - Criar nova instância
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ 
        error: 'Nome da instância é obrigatório' 
      }, { status: 400 })
    }

    // Buscar o workspace do usuário
    const workspace = await prisma.workspace.findFirst({
      where: {
        users: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!workspace) {
      return NextResponse.json({ 
        error: 'Workspace não encontrado' 
      }, { status: 404 })
    }

    // Criar plataforma WhatsApp
          const platform = await prisma.platform.create({
        data: {
          name,
          type: 'WHATSAPP',
          workspaceId: workspace.id,
        config: {
          status: 'disconnected',
          createdBy: session.user.id
        },
        isActive: false
      }
    })

    // Inicializar instância na UazAPI
    try {
      console.log(`🚀 Iniciando criação da instância UazAPI para platform ${platform.id}`)
      
      const instanceName = `moobi_${platform.id.replace(/-/g, '').slice(0, 8)}_${Date.now()}`
      const webhookUrl = `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`
      
      console.log(`📋 Configurações da instância:`)
      console.log(`  - Nome: ${instanceName}`)
      console.log(`  - Webhook: ${webhookUrl}`)
      console.log(`  - Platform ID: ${platform.id}`)
      
      const initResult = await uazApiClient.initInstance(instanceName, webhookUrl)
      
      console.log(`✅ Instância criada no UazAPI:`, initResult)
      
      if (initResult.token) {
        console.log(`🔗 Token recebido, atualizando plataforma no banco...`)
        
        // Atualizar plataforma com token da instância
        await prisma.platform.update({
          where: { id: platform.id },
          data: {
            config: {
              ...(platform.config as object),
              instanceToken: initResult.token,
              instanceName,
              webhookUrl,
              status: 'initialized',
              uazApiInitialized: true,
              createdAt: new Date().toISOString()
            }
          }
        })
        
        console.log(`✅ Plataforma atualizada com sucesso`)
        
        // Verificar se a instância foi realmente criada no UazAPI
        try {
          const instanceStatus = await uazApiClient.getInstanceStatus(initResult.token)
          console.log(`🔍 Status da instância após criação:`, instanceStatus)
          
          // Atualizar status no banco
          await prisma.platform.update({
            where: { id: platform.id },
            data: {
              config: {
                ...(platform.config as object),
                instanceToken: initResult.token,
                instanceName,
                webhookUrl,
                status: instanceStatus.status,
                uazApiInitialized: true,
                lastSyncAt: new Date().toISOString()
              }
            }
          })
          
          console.log(`✅ Status sincronizado: ${instanceStatus.status}`)
          
        } catch (statusError) {
          console.warn(`⚠️ Erro ao verificar status após criação:`, statusError)
          // Continuar mesmo com erro de status
        }
      }

      return NextResponse.json({ 
        success: true,
        platform: {
          id: platform.id,
          name: platform.name,
          status: 'initialized',
          instanceName,
          instanceToken: initResult.token ? '***' : null
        },
        debug: {
          instanceName,
          webhookUrl,
          hasToken: !!initResult.token
        }
      })
      
    } catch (uazError) {
      console.error('❌ Erro ao inicializar instância UazAPI:', uazError)
      
      // Log detalhado do erro
      if (uazError instanceof Error) {
        console.error('📋 Detalhes do erro:')
        console.error('  - Mensagem:', uazError.message)
        console.error('  - Stack:', uazError.stack)
      }
      
      // Remover plataforma se falhou na inicialização
      await prisma.platform.delete({
        where: { id: platform.id }
      })
      
      return NextResponse.json({ 
        error: 'Erro ao inicializar instância WhatsApp no UazAPI',
        details: uazError instanceof Error ? uazError.message : 'Erro desconhecido',
        debug: {
          platformId: platform.id,
          errorType: uazError instanceof Error ? uazError.constructor.name : 'unknown'
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Erro ao criar instância WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// DELETE - Remover instância
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get('platformId')

    if (!platformId) {
      return NextResponse.json({ 
        error: 'ID da plataforma é obrigatório' 
      }, { status: 400 })
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
      return NextResponse.json({ 
        error: 'Plataforma não encontrada' 
      }, { status: 404 })
    }

    // Desconectar instância na UazAPI
    const config = platform.config as any
    const instanceToken = config?.instanceToken
    
    if (instanceToken) {
      try {
        await uazApiClient.disconnectInstance(instanceToken)
      } catch (error) {
        console.error('Erro ao desconectar instância UazAPI:', error)
        // Continuar com a remoção mesmo se falhar na desconexão
      }
    }

    // Remover plataforma do banco
    await prisma.platform.delete({
      where: { id: platformId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Instância removida com sucesso' 
    })
    
  } catch (error) {
    console.error('Erro ao remover instância WhatsApp:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 
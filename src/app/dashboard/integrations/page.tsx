'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  RefreshCw, 
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Webhook,
  Info
} from 'lucide-react'

interface WhatsAppInstance {
  id: string
  name: string
  workspaceName: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'initialized'
  isActive: boolean
  instanceToken: string | null
  instanceName: string
  createdAt: string
  updatedAt: string
}

interface QRCodeData {
  qrcode: string
  instanceToken: string
  status: string
  instanceName?: string
}

export default function IntegrationsPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [configuringWebhook, setConfiguringWebhook] = useState<string | null>(null)
  const [checkingWebhook, setCheckingWebhook] = useState<string | null>(null)
  const [newInstanceName, setNewInstanceName] = useState('')
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [testingConfig, setTestingConfig] = useState(false)
  const [testingMessage, setTestingMessage] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do Moobe Chat 👋')
  const [selectedInstance, setSelectedInstance] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; response: any } | null>(null)

  // Carregar instâncias
  const loadInstances = async () => {
    try {
      const response = await fetch('/api/whatsapp/instances')
      const data = await response.json()
      
      if (data.success) {
        setInstances(data.instances)
      } else {
        setError(data.error || 'Erro ao carregar instâncias')
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error)
      setError('Erro ao carregar instâncias')
    } finally {
      setLoading(false)
    }
  }

  // Criar nova instância
  const createInstance = async () => {
    if (!newInstanceName.trim()) {
      setError('Nome da instância é obrigatório')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/whatsapp/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newInstanceName
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewInstanceName('')
        await loadInstances()
      } else {
        setError(data.error || 'Erro ao criar instância')
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error)
      setError('Erro ao criar instância')
    } finally {
      setCreating(false)
    }
  }

  // Conectar instância (obter QR Code)
  const connectInstance = async (platformId: string) => {
    setConnecting(platformId)
    setError(null)
    setQrCodeData(null)

    try {
      setError('🔄 Preparando conexão com WhatsApp...')
      
      const response = await fetch('/api/integrations/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platformId })
      })

      const data = await response.json()
      
      if (data.success && data.qrcode) {
        setQrCodeData({
          qrcode: data.qrcode,
          instanceToken: data.instanceToken,
          status: data.status,
          instanceName: data.instanceName
        })
        
        // Limpar erro anterior se houver
        setError(null)
        
        // Verificar status periodicamente
        checkConnectionStatus(data.instanceToken)
      } else {
        setError(data.error || 'Erro ao conectar instância')
        
        // Se falhou, sugerir tentar novamente
        if (data.error && !data.error.includes('Token da instância não encontrado')) {
          setTimeout(() => {
            setError(prev => prev + '\n💡 Dica: Se a instância foi criada recentemente, tente conectar novamente em alguns segundos.')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Erro ao conectar instância:', error)
      setError('❌ Erro ao conectar instância\n💡 Dica: Tente novamente em alguns segundos se a instância foi criada recentemente.')
    } finally {
      setConnecting(null)
    }
  }

  // Verificar status da conexão
  const checkConnectionStatus = async (instanceToken: string, isManual: boolean = false) => {
    try {
      console.log('🔍 Verificando status da instância...', instanceToken)
      
      const response = await fetch(`/api/integrations/whatsapp/connect?instanceToken=${instanceToken}`)
      const data = await response.json()
      
      console.log('📊 Status response:', data)
      
      if (data.success) {
        if (data.isConnected) {
          console.log('✅ WhatsApp conectado!')
          setQrCodeData(null)
          setError(null)
          await loadInstances()
        } else {
          console.log('⏳ Ainda não conectado, status:', data.status)
          
          if (isManual) {
            const statusMessage = data.status === 'connecting' 
              ? 'Aguardando escaneamento do QR Code...' 
              : `Status: ${data.status || 'connecting'}`
            setError(statusMessage)
          }
          
          // REMOVIDO: Verificação automática infinita
          // Apenas verificações manuais agora
        }
      } else {
        console.error('❌ Erro na verificação:', data.error)
        setError(data.error || 'Erro ao verificar status')
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error)
      if (isManual) {
        setError('Erro ao verificar status da conexão')
      }
    }
  }

  // Configurar webhook
  const configureWebhook = async (platformId: string) => {
    setConfiguringWebhook(platformId)
    setError(null)

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platformId })
      })

      const data = await response.json()
      
      if (data.success) {
        setError(`✅ Webhook configurado: ${data.webhookUrl}`)
      } else {
        setError(data.error || 'Erro ao configurar webhook')
      }
    } catch (error) {
      console.error('Erro ao configurar webhook:', error)
      setError('Erro ao configurar webhook')
    } finally {
      setConfiguringWebhook(null)
    }
  }

  // Verificar webhook
  const checkWebhook = async (platformId: string) => {
    setCheckingWebhook(platformId)
    setError(null)

    try {
      const response = await fetch('/api/check-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platformId })
      })

      const data = await response.json()
      
      if (data.success) {
        setError(`📊 Instância: ${data.instanceName} | Status: ${data.status} | Webhook: ${data.webhookUrl}`)
      } else {
        setError(data.error || 'Erro ao verificar webhook')
      }
    } catch (error) {
      console.error('Erro ao verificar webhook:', error)
      setError('Erro ao verificar webhook')
    } finally {
      setCheckingWebhook(null)
    }
  }

  // Sincronizar instâncias com UazAPI
  const syncInstances = async () => {
    setSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/whatsapp/instances/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        const summary = data.summary
        let message = `✅ Sincronização concluída: ${summary.synchronized} sincronizadas, ${summary.missing} ausentes, ${summary.errors} erros`
        
        if (summary.demoServer) {
          message += `\n⚠️ Servidor de demonstração detectado - sincronização limitada`
        }
        
        setError(message)
        await loadInstances()
      } else {
        setError(data.error || 'Erro ao sincronizar instâncias')
      }
    } catch (error) {
      console.error('Erro ao sincronizar instâncias:', error)
      setError('Erro ao sincronizar instâncias')
    } finally {
      setSyncing(false)
    }
  }

  // Testar configuração UazAPI
  const testUazApiConfig = async () => {
    setTestingConfig(true)
    setError(null)

    try {
      const response = await fetch('/api/test-uazapi-config')
      const data = await response.json()
      
      if (data.success) {
        const summary = data.summary
        const tests = data.results.tests
        
        let message = `🔍 Teste de configuração UazAPI:\n`
        message += `  • Configuração válida: ${summary.configValid ? '✅' : '❌'}\n`
        message += `  • Listagem de instâncias: ${tests.listInstances?.success ? '✅' : '❌'}\n`
        message += `  • Conectividade: ${tests.connectionTest?.success ? '✅' : '❌'}\n`
        
        if (tests.listInstances?.isDemoServer) {
          message += `  • Servidor de demonstração detectado\n`
          message += `  • Funcionalidade limitada (endpoint /instance/all desabilitado)\n`
        } else {
          message += `  • Instâncias encontradas: ${tests.listInstances?.count || 0}\n`
        }
        
        message += `\n${summary.recommendation}`
        
        setError(message)
      } else {
        setError(data.error || 'Erro ao testar configuração')
      }
    } catch (error) {
      console.error('Erro ao testar configuração:', error)
      setError('Erro ao testar configuração UazAPI')
    } finally {
      setTestingConfig(false)
    }
  }

  // Testar envio de mensagem
  const testSendMessage = async () => {
    if (!selectedInstance) {
      alert('Selecione uma instância primeiro')
      return
    }

    const instance = instances.find(i => i.id === selectedInstance)
    if (!instance?.instanceToken) {
      alert('Token da instância não encontrado')
      return
    }

    setTestLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/integrations/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platformId: selectedInstance,
          phone: testPhone,
          message: testMessage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResult({ success: true, response: data.response })
      } else {
        setTestResult({ success: false, response: data.error })
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setTestResult({ success: false, response: error })
    } finally {
      setTestLoading(false)
    }
  }

  // Remover instância
  const removeInstance = async (platformId: string) => {
    if (!confirm('Tem certeza que deseja remover esta instância?')) {
      return
    }

    try {
      setError('🗑️ Removendo instância...')
      
      const response = await fetch(`/api/whatsapp/instances?platformId=${platformId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setError('✅ Instância removida com sucesso!')
        
        // Remover da lista local imediatamente para feedback visual rápido
        setInstances(prev => prev.filter(instance => instance.id !== platformId))
        
        // Recarregar a lista para garantir sincronização
        await loadInstances()
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setError(null), 3000)
      } else {
        setError(data.error || 'Erro ao remover instância')
      }
    } catch (error) {
      console.error('Erro ao remover instância:', error)
      setError('Erro ao remover instância')
    }
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'initialized':
        return 'bg-blue-500'
      case 'disconnected':
        return 'bg-gray-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />
      case 'connecting':
        return <Clock className="w-4 h-4" />
      case 'initialized':
        return <QrCode className="w-4 h-4" />
      case 'disconnected':
        return <XCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <XCircle className="w-4 h-4" />
    }
  }

  useEffect(() => {
    loadInstances()
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold dark:text-white">Integrações</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Gerencie suas conexões WhatsApp</p>
        </div>
      </div>

      {/* Card de Conexão Rápida */}
      <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
            <Smartphone className="w-5 h-5 mr-2" />
            Conectar WhatsApp Rapidamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-600 dark:text-blue-300 mb-4">
            Para conectar uma plataforma WhatsApp rapidamente, você precisa dos dados da sua instância UazAPI:
          </p>
          <Button
            onClick={() => {
              const name = prompt('📝 Nome da instância (ex: "WhatsApp Principal"):')
              if (!name) return
              
              const token = prompt('🔗 Token da instância UazAPI:')
              if (!token) return
              
              setError('🔗 Conectando plataforma...')
              
              fetch('/api/integrations/whatsapp/connect-simple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  instanceName: name, 
                  instanceToken: token 
                })
              })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setError(`✅ ${data.message}`)
                  loadInstances()
                } else {
                  setError(`❌ ${data.error}`)
                }
              })
              .catch(err => {
                setError(`❌ Erro: ${err.message}`)
              })
            }}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Conectar Plataforma WhatsApp
          </Button>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
            💡 Você pode encontrar o token no painel da UazAPI em "Instâncias"
          </p>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div></div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadInstances} variant="outline" size="sm" className="flex-shrink-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Atualizar</span>
          </Button>
          <Button onClick={syncInstances} disabled={syncing} variant="outline" size="sm" className="flex-shrink-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Sincronizando...</span>
                <span className="sm:hidden">Sync...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sincronizar UazAPI</span>
                <span className="sm:hidden">Sync</span>
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              const token = prompt('🔗 Digite o token da instância do painel UazAPI:\n(exemplo: 142b1e63-adb7-4b5b-9ed0-40ab6bbb54df)\n\n📋 Onde encontrar:\n1. Acesse https://free.uazapi.com\n2. Vá na seção "Instâncias"\n3. Copie o token da sua instância')
              if (token) {
                const name = prompt('📝 Digite um nome para a instância (opcional):') || undefined
                
                setError('🔗 Conectando à instância existente...')
                
                fetch('/api/connect-existing-instance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ instanceToken: token, instanceName: name })
                })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    setError(`✅ ${data.message}`)
                    loadInstances() // Recarregar lista
                  } else {
                    setError(`❌ ${data.error}`)
                  }
                })
                .catch(err => {
                  setError(`❌ Erro: ${err.message}`)
                })
              }
            }}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Conectar Existente
          </Button>
                        <Button onClick={testUazApiConfig} disabled={testingConfig} variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                {testingConfig ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Testar UazAPI
                  </>
                )}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setError('🧪 Testando webhook...')
                    
                    // Pegar primeira instância conectada
                    const connectedInstance = instances.find(i => i.status === 'connected')
                    if (!connectedInstance) {
                      setError('❌ Nenhuma instância conectada encontrada. Conecte uma instância primeiro.')
                      return
                    }
                    
                    const testPhone = prompt('📱 Digite o número de telefone para testar (ex: 5511999887766):')
                    if (!testPhone) return
                    
                    const testMessage = prompt('💬 Digite a mensagem de teste:') || 'Esta é uma mensagem de teste do webhook!'
                    
                    const response = await fetch('/api/test-webhook-message', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        instanceName: connectedInstance.instanceName,
                        phone: testPhone,
                        message: testMessage,
                        senderName: 'Teste Webhook'
                      })
                    })
                    
                    const result = await response.json()
                    
                    if (result.success) {
                      setError(`✅ Webhook testado com sucesso!
                      
🔗 URL do webhook: ${result.details.webhookUrl}
📱 Instância: ${result.details.instanceName}
📞 Telefone: ${result.details.phone}
💬 Mensagem: ${result.details.message}

✅ A mensagem deve ter aparecido na conversa!
Verifique a aba "Conversas" para ver se a mensagem chegou.`)
                    } else {
                      setError(`❌ Erro no webhook: ${result.error}
                      
🔗 URL testada: ${result.details?.webhookUrl}
📊 Status: ${result.details?.status}

💡 Isso pode significar que o webhook não está configurado corretamente.`)
                    }
                  } catch (error) {
                    setError(`❌ Erro ao testar webhook: ${error}`)
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-600"
              >
                <Webhook className="w-4 h-4 mr-2" />
                Testar Webhook
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setError('🔍 Verificando webhooks recebidos...')
                    
                    const response = await fetch('/api/debug-webhook')
                    const result = await response.json()
                    
                    if (result.success) {
                      if (result.count === 0) {
                        setError(`📭 Nenhum webhook foi recebido ainda.

🔍 POSSÍVEIS CAUSAS:
1. O webhook não está configurado corretamente no painel UazAPI
2. Nenhuma mensagem foi enviada/recebida ainda
3. O servidor local não está acessível pelo UazAPI

💡 SOLUÇÕES:
1. Verifique se a URL está correta: http://localhost:3000/api/webhooks/uazapi
2. Certifique-se que o servidor está rodando
3. Teste enviando uma mensagem para alguém e peça para responder`)
                      } else {
                        let message = `✅ ${result.count} webhooks recebidos!\n\n`
                        
                        result.recentWebhooks.forEach((webhook: any, index: number) => {
                          message += `🔔 Webhook ${index + 1} (${webhook.timestamp}):\n`
                          message += `   Evento: ${webhook.payload?.event || 'N/A'}\n`
                          message += `   Instância: ${webhook.payload?.instance || webhook.payload?.instanceName || 'N/A'}\n`
                          
                          if (webhook.payload?.data?.messages) {
                            message += `   Mensagens: ${webhook.payload.data.messages.length}\n`
                          }
                          
                          message += `\n`
                        })
                        
                        message += `💡 Os webhooks estão chegando! Se as mensagens não aparecem nas conversas, pode ser um problema de processamento.`
                        
                        setError(message)
                      }
                    } else {
                      setError(`❌ Erro ao verificar webhooks: ${result.error}`)
                    }
                  } catch (error) {
                    setError(`❌ Erro: ${error}`)
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
              >
                <Info className="w-4 h-4 mr-2" />
                Debug Webhook
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // Pegar primeira instância conectada
                    const connectedInstance = instances.find(i => i.status === 'connected')
                    if (!connectedInstance) {
                      setError('❌ Nenhuma instância conectada encontrada. Conecte uma instância primeiro.')
                      return
                    }
                    
                    const testPhone = prompt('📱 Digite o número de telefone para testar (ex: 5511999887766):')
                    if (!testPhone) return
                    
                    const testMessage = prompt('💬 Digite a mensagem de teste:') || 'Teste forçado de mensagem webhook'
                    const testSender = prompt('👤 Nome do remetente:') || 'Teste Webhook'
                    
                    setError('🧪 Executando teste forçado...')
                    
                    const response = await fetch('/api/force-message-test', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        platformId: connectedInstance.id,
                        phone: testPhone,
                        message: testMessage,
                        senderName: testSender
                      })
                    })
                    
                    const result = await response.json()
                    
                    if (result.success) {
                      setError(`✅ Teste forçado executado com sucesso!
                      
📱 Plataforma: ${result.details.platform}
🏷️ Instância: ${result.details.instanceName}
📞 Telefone: ${result.details.phone}
💬 Mensagem: ${result.details.messageContent}
👤 Remetente: ${result.details.senderName}

📊 Webhook respondeu: ${result.details.webhookResult?.received ? '✅' : '❌'}
💾 Mensagem criada: ${result.details.messageCreated ? '✅' : '❌'}
💬 ID da conversa: ${result.details.conversationId || 'N/A'}

${result.details.messageCreated 
  ? '🎉 Sucesso! A mensagem deve aparecer na aba "Conversas".' 
  : '⚠️ Mensagem não foi criada. Verifique os logs do terminal para detalhes.'}`)
                    } else {
                      setError(`❌ Erro no teste forçado: ${result.error}`)
                    }
                  } catch (error) {
                    setError(`❌ Erro: ${error}`)
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-600"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Teste Forçado
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // Pegar primeira instância conectada
                    const connectedInstance = instances.find(i => i.status === 'connected')
                    if (!connectedInstance) {
                      setError('❌ Nenhuma instância conectada encontrada.')
                      return
                    }

                    setError('🎯 Configurando captura de webhook...')

                    // Primeiro, configurar o webhook para o endpoint de captura
                    const captureResponse = await fetch('/api/configure-webhook', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        platformId: connectedInstance.id,
                        customWebhookUrl: 'http://localhost:3000/api/capture-webhook'
                      })
                    })

                    if (captureResponse.ok) {
                      setError(`🎯 Webhook configurado para captura!

⚠️ IMPORTANTE: Agora o webhook está apontando para o capturador.

📋 PRÓXIMOS PASSOS:
1. Envie uma mensagem para alguém pelo sistema
2. Peça para a pessoa responder no WhatsApp
3. Clique em "Ver Capturas" abaixo para analisar o formato real
4. Depois reconfigure o webhook normal

🔗 Webhook atual: http://localhost:3000/api/capture-webhook`)
                    } else {
                      // Se não temos a API personalizada, mostrar instruções manuais
                      setError(`🎯 Para capturar webhooks reais:

📋 PASSOS MANUAIS:
1. Vá ao painel UazAPI (https://free.uazapi.com)
2. Configure o webhook temporariamente para:
   http://localhost:3000/api/capture-webhook
3. Envie uma mensagem para alguém e peça para responder
4. Clique em "Ver Capturas" abaixo
5. Depois volte o webhook para:
   http://localhost:3000/api/webhooks/uazapi

💡 Isso nos ajudará a ver exatamente que formato a UazAPI está enviando.`)
                    }
                  } catch (error) {
                    setError(`❌ Erro: ${error}`)
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-600"
              >
                <Webhook className="w-4 h-4 mr-2" />
                Capturar Real
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setError('🔍 Verificando capturas...')
                    
                    const response = await fetch('/api/capture-webhook')
                    const result = await response.json()
                    
                    if (result.success) {
                      if (result.count === 0) {
                        setError(`📭 Nenhum webhook real capturado ainda.

💡 COMO CAPTURAR:
1. Configure temporariamente o webhook para captura
2. Teste enviando/recebendo mensagens reais
3. Volte aqui para ver os resultados`)
                      } else {
                        let message = `✅ ${result.count} webhooks reais capturados!\n\n`
                        
                        if (result.analysis) {
                          message += `📊 ANÁLISE:\n`
                          message += `• Eventos únicos: ${result.analysis.uniqueEvents.join(', ')}\n`
                          message += `• Instâncias: ${result.analysis.uniqueInstances.join(', ')}\n\n`
                          
                          message += `🔍 ESTRUTURAS ENCONTRADAS:\n`
                          result.analysis.structures.forEach((struct: any, index: number) => {
                            message += `${index + 1}. ${struct.event || 'sem evento'} - Keys: [${struct.keys.join(', ')}]\n`
                          })
                          
                          if (result.analysis.commonStructure?.samplePayload) {
                            message += `\n📋 EXEMPLO REAL:\n${JSON.stringify(result.analysis.commonStructure.samplePayload, null, 2)}`
                          }
                        }
                        
                        setError(message)
                      }
                    } else {
                      setError(`❌ Erro ao verificar capturas: ${result.error}`)
                    }
                  } catch (error) {
                    setError(`❌ Erro: ${error}`)
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600"
              >
                <Info className="w-4 h-4 mr-2" />
                Ver Capturas
              </Button>
          <Button
            onClick={async () => {
              try {
                setError('🔍 Analisando instâncias...')
                
                const response = await fetch('/api/debug-uazapi-instances')
                const data = await response.json()
                
                if (data.success) {
                  const { comparison, isFreeTier, recommendations } = data
                  let message = `🔍 ANÁLISE DE INSTÂNCIAS:\n\n`
                  message += `📋 Banco de dados: ${comparison.analysis.localCount} instâncias\n`
                  
                  if (isFreeTier) {
                    message += `🌐 UazAPI: ⚠️ Servidor gratuito (listagem desabilitada)\n\n`
                    message += `🚨 SERVIDOR GRATUITO LIMITADO:\n`
                    message += `O servidor gratuito do UazAPI não permite listar instâncias por segurança.\n\n`
                    message += `🔗 SOLUÇÃO:\n`
                    message += `1. Vá ao painel UazAPI (https://free.uazapi.com)\n`
                    message += `2. Copie o token da sua instância\n`
                    message += `3. Use o botão "Conectar Existente" aqui\n`
                    message += `4. Cole o token para importar a instância\n\n`
                    message += `📝 EXEMPLO:\n`
                    message += `Se no painel você vê: "142b1e63-adb7-4b5b-9ed0-40ab6bbb54df"\n`
                    message += `Cole exatamente esse token no "Conectar Existente"\n\n`
                    message += `✅ Isso sincronizará perfeitamente com o painel!`
                  } else {
                    message += `🌐 UazAPI: ${comparison.analysis.uazapiCount} instâncias\n\n`
                    
                    if (comparison.analysis.orphanInUazapi.length > 0) {
                      message += `🔗 INSTÂNCIAS NO UAZAPI (não no banco):\n`
                      comparison.analysis.orphanInUazapi.forEach((instance: any) => {
                        message += `  - ${instance.name} (${instance.token}) - Status: ${instance.status}\n`
                      })
                      message += `\n💡 Você pode conectar a uma dessas instâncias existentes!\n\n`
                    }
                    
                    if (comparison.analysis.orphanInLocal.length > 0) {
                      message += `👻 INSTÂNCIAS FANTASMA (só no banco):\n`
                      comparison.analysis.orphanInLocal.forEach((instance: any) => {
                        message += `  - ${instance.name} (${instance.token})\n`
                      })
                      message += `\n⚠️ Essas instâncias não existem no UazAPI!\n\n`
                    }
                    
                    if (comparison.analysis.matching.length > 0) {
                      message += `✅ INSTÂNCIAS SINCRONIZADAS:\n`
                      comparison.analysis.matching.forEach((instance: any) => {
                        message += `  - ${instance.name} - Tokens ${instance.tokensMatch ? '✅' : '❌'}\n`
                      })
                    }
                  }
                  
                  setError(message)
                } else {
                  setError(`❌ Erro na análise: ${data.error}`)
                }
              } catch (error) {
                setError(`❌ Erro: ${error}`)
              }
            }}
            variant="outline"
            size="sm"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Info className="w-4 h-4 mr-2" />
            Debug Instâncias
          </Button>
        </div>
      </div>



      {/* Aviso sobre comportamento normal */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Comportamento Normal da Conexão
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                É normal que a <strong>primeira tentativa</strong> de conectar uma instância WhatsApp falhe após a criação. 
                Isso acontece porque a instância precisa de alguns segundos para estar completamente pronta no servidor UazAPI.
              </p>
              <p className="mt-2">
                <strong>Solução:</strong> Aguarde 5-10 segundos e clique em "Conectar" novamente. 
                O sistema agora faz retry automático com delay inteligente, mas se ainda assim falhar, 
                tente manualmente após alguns segundos.
              </p>
            </div>
          </div>
        </div>
      </div>



      {error && (
        <div className={`border rounded-lg p-4 ${
          error.includes('sucesso') || error.includes('Aguardando') || error.includes('Teste de configuração')
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            {error.includes('sucesso') || error.includes('Aguardando') || error.includes('Teste de configuração') ? (
              <Clock className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <div className={
              error.includes('sucesso') || error.includes('Aguardando') || error.includes('Teste de configuração')
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-red-700 dark:text-red-400'
            }>
              {error.split('\n').map((line, index) => (
                <div key={index} className={index > 0 ? 'mt-1' : ''}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Criar nova instância */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
            Nova Instância WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Nome da instância"
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
              className="flex-1 min-w-0"
            />
            <Button 
              onClick={createInstance}
              disabled={creating || !newInstanceName.trim()}
              className="flex-shrink-0"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Criando...</span>
                  <span className="sm:hidden">Criando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Criar</span>
                  <span className="sm:hidden">Criar</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {qrCodeData && (
        <Card className="border-2 border-blue-200 dark:border-blue-800 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white text-base md:text-lg">
              <QrCode className="w-5 h-5 mr-2 flex-shrink-0" />
              Conectar WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-2 md:p-4 rounded-lg inline-block max-w-full">
              <img 
                src={qrCodeData.qrcode} 
                alt="QR Code WhatsApp" 
                className="w-48 h-48 md:w-64 md:h-64 mx-auto max-w-full"
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 px-2">
                Abra o WhatsApp no seu telefone e escaneie o QR Code acima
              </p>
              
              {qrCodeData.instanceName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-2">
                  Instância: {qrCodeData.instanceName}
                </p>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Aguardando conexão...</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                onClick={() => checkConnectionStatus(qrCodeData.instanceToken, true)}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Status
              </Button>
              <Button 
                onClick={() => setQrCodeData(null)}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testar Envio de Mensagens */}
      {instances.some(instance => instance.status === 'connected') && (
        <Card className="border-2 border-green-200 dark:border-green-800 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white">
              <Smartphone className="w-5 h-5 mr-2" />
              Testar Envio de Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de destino
                </label>
                <Input
                  placeholder="5511999887766"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar Instância
                </label>
                <select
                  value={selectedInstance}
                  onChange={(e) => setSelectedInstance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">Selecione uma instância</option>
                  {instances
                    .filter(instance => instance.status === 'connected')
                    .map((instance) => (
                      <option key={instance.id} value={instance.id}>
                        {instance.name} - {instance.instanceName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagem
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Olá! Esta é uma mensagem de teste do Moobe Chat 👋"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={testSendMessage}
                disabled={!testPhone || !testMessage || !selectedInstance || testLoading}
                className={`px-4 py-2 rounded-md font-medium ${
                  !testPhone || !testMessage || !selectedInstance || testLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                }`}
              >
                {testLoading ? '📤 Enviando...' : '📤 Enviar Mensagem'}
              </button>

              <button
                onClick={async () => {
                  if (!selectedInstance) {
                    alert('Selecione uma instância primeiro')
                    return
                  }
                  
                  const instance = instances.find(i => i.id === selectedInstance)
                  if (!instance?.instanceToken) {
                    alert('Token da instância não encontrado')
                    return
                  }

                  setTestLoading(true)
                  try {
                    const response = await fetch('/api/test-format-discovery', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        token: instance.instanceToken,
                        phone: testPhone,
                        message: testMessage || 'Teste de descoberta de formato'
                      })
                    })

                    const result = await response.json()
                    
                    if (result.success && result.successfulFormat) {
                      alert(`🎉 Formato descoberto! 

📋 Formato que funcionou: ${result.successfulFormat.format}

📦 Payload correto:
${JSON.stringify(result.successfulFormat.payload, null, 2)}

✅ Resposta: ${JSON.stringify(result.successfulFormat.response, null, 2)}

📊 Resumo: ${result.summary.successful}/${result.summary.total} formatos testados`)
                    } else {
                      alert(`❌ Nenhum formato funcionou

📊 Testados: ${result.summary?.total || 0} formatos
❌ Falharam: ${result.summary?.failed || 0}

🔍 Verifique:
- Token da instância está correto
- Instância está conectada  
- Número de destino está válido

Detalhes: ${JSON.stringify(result.allResults, null, 2)}`)
                    }
                  } catch (error) {
                    alert(`Erro na descoberta de formato: ${error}`)
                  } finally {
                    setTestLoading(false)
                  }
                }}
                disabled={!testPhone || !selectedInstance || testLoading}
                className={`px-4 py-2 rounded-md font-medium ${
                  !testPhone || !selectedInstance || testLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'
                }`}
              >
                {testLoading ? '🧪 Descobrindo...' : '🧪 Descobrir Formato'}
              </button>

              {/* Botão de teste direto com token do painel - mantém funcionalidade existente */}
              <button
                onClick={async () => {
                  const token = prompt('Cole o token do painel UazAPI:')
                  if (!token) return

                  setTestLoading(true)
                  try {
                    const response = await fetch('/api/test-direct-token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        token,
                        phone: testPhone,
                        message: testMessage || 'Teste direto com token do painel'
                      })
                    })

                    const result = await response.json()
                    alert(result.success ? 
                      `✅ Teste bem-sucedido!\n\nResposta: ${JSON.stringify(result.response, null, 2)}` :
                      `❌ Teste falhou: ${result.error}`
                    )
                  } catch (error) {
                    alert(`Erro no teste direto: ${error}`)
                  } finally {
                    setTestLoading(false)
                  }
                }}
                disabled={!testPhone || testLoading}
                className={`px-4 py-2 rounded-md font-medium ${
                  !testPhone || testLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700'
                }`}
              >
                {testLoading ? '🔧 Testando...' : '🔧 Testar Token Painel'}
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <h4 className={`font-medium ${testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {testResult.success ? '✅ Mensagem enviada!' : '❌ Erro no envio'}
                </h4>
                <pre className={`text-sm mt-2 ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de instâncias */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Carregando instâncias...</p>
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">Nenhuma instância WhatsApp encontrada</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Crie uma nova instância para começar</p>
          </div>
        ) : (
          instances.map((instance) => (
            <Card key={instance.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 min-w-0">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Smartphone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-medium dark:text-white truncate">{instance.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{instance.workspaceName}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(instance.status)} text-white flex items-center flex-shrink-0`}
                    >
                      {getStatusIcon(instance.status)}
                      <span className="ml-1 capitalize">{instance.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {instance.status === 'disconnected' && (
                      <Button
                        onClick={() => connectInstance(instance.id)}
                        disabled={connecting === instance.id}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {connecting === instance.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Conectar
                          </>
                        )}
                      </Button>
                    )}
                    
                    {instance.status === 'initialized' && (
                      <Button
                        onClick={() => connectInstance(instance.id)}
                        disabled={connecting === instance.id}
                        size="sm"
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {connecting === instance.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Gerar QR Code
                          </>
                        )}
                      </Button>
                    )}
                    
                    {instance.status === 'connected' && (
                      <>
                        <Button
                          onClick={async () => {
                            try {
                              setError('🔗 Configurando webhook...')
                              
                              const response = await fetch('/api/configure-webhook', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ platformId: instance.id })
                              })
                              
                              const result = await response.json()
                              
                              if (result.success) {
                                setError(`✅ Webhook configurado com sucesso!
                                
🔗 URL: ${result.webhookUrl}
📱 Instância: ${result.instanceName}
📊 Status: ${result.status}

🎉 Agora você deve receber mensagens de volta quando as pessoas responderem no WhatsApp!`)
                              } else {
                                setError(`❌ Erro ao configurar webhook: ${result.error}`)
                              }
                            } catch (error) {
                              setError(`❌ Erro: ${error}`)
                            }
                          }}
                          disabled={configuringWebhook === instance.id}
                          variant="outline"
                          size="sm"
                          className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                        >
                          <Webhook className="w-4 h-4 mr-2" />
                          Configurar Webhook
                        </Button>
                        
                        <Button
                          onClick={() => checkWebhook(instance.id)}
                          disabled={checkingWebhook === instance.id}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {checkingWebhook === instance.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <Info className="w-4 h-4 mr-2" />
                              Info
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={() => removeInstance(instance.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm dark:text-gray-300">
                    <div className="truncate">
                      <span className="font-medium">Instância:</span>
                      <span className="ml-2 break-all">{instance.instanceName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Criado:</span>
                      <span className="ml-2">{new Date(instance.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
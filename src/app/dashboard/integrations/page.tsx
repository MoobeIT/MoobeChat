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
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
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
      }
    } catch (error) {
      console.error('Erro ao conectar instância:', error)
      setError('Erro ao conectar instância')
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

  // Remover instância
  const removeInstance = async (platformId: string) => {
    if (!confirm('Tem certeza que deseja remover esta instância?')) {
      return
    }

    try {
      const response = await fetch(`/api/whatsapp/instances?platformId=${platformId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadInstances()
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Integrações</h1>
          <p className="text-gray-600 dark:text-gray-300">Gerencie suas conexões WhatsApp</p>
        </div>
        <Button onClick={loadInstances} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className={`border rounded-lg p-4 ${
          error.includes('sucesso') || error.includes('Aguardando') 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            {error.includes('sucesso') || error.includes('Aguardando') ? (
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={
              error.includes('sucesso') || error.includes('Aguardando')
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-red-700 dark:text-red-400'
            }>{error}</span>
          </div>
        </div>
      )}

      {/* Criar nova instância */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Nova Instância WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Nome da instância"
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={createInstance}
              disabled={creating || !newInstanceName.trim()}
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar
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
            <CardTitle className="flex items-center dark:text-white">
              <QrCode className="w-5 h-5 mr-2" />
              Conectar WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src={qrCodeData.qrcode} 
                alt="QR Code WhatsApp" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Abra o WhatsApp no seu telefone e escaneie o QR Code acima
              </p>
              
              {qrCodeData.instanceName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instância: {qrCodeData.instanceName}
                </p>
              )}
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Aguardando conexão...</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
                             <Button 
                 onClick={() => checkConnectionStatus(qrCodeData.instanceToken, true)}
                 variant="outline"
                 size="sm"
               >
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Verificar Status
               </Button>
              <Button 
                onClick={() => setQrCodeData(null)}
                variant="outline"
                size="sm"
              >
                Fechar
              </Button>
            </div>
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium dark:text-white">{instance.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{instance.workspaceName}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(instance.status)} text-white flex items-center`}
                    >
                      {getStatusIcon(instance.status)}
                      <span className="ml-1 capitalize">{instance.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {instance.status === 'disconnected' && (
                      <Button
                        onClick={() => connectInstance(instance.id)}
                        disabled={connecting === instance.id}
                        size="sm"
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
                    
                    {instance.status === 'connected' && (
                      <>
                        <Button
                          onClick={() => configureWebhook(instance.id)}
                          disabled={configuringWebhook === instance.id}
                          variant="outline"
                          size="sm"
                        >
                          {configuringWebhook === instance.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Configurando...
                            </>
                          ) : (
                            <>
                              <Webhook className="w-4 h-4 mr-2" />
                              Webhook
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => checkWebhook(instance.id)}
                          disabled={checkingWebhook === instance.id}
                          variant="outline"
                          size="sm"
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                    <div>
                      <span className="font-medium">Instância:</span>
                      <span className="ml-2">{instance.instanceName || 'N/A'}</span>
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
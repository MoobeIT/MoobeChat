'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Integration {
  id: string
  name: string
  description: string
  type: 'whatsapp' | 'instagram' | 'facebook' | 'telegram'
  status: 'connected' | 'disconnected' | 'error' | 'connecting'
  icon: string
  instanceId?: string
  lastSync?: string
  provider?: string
  qrcode?: string
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'WhatsApp Business',
    description: 'Integração com WhatsApp através da UazAPI',
    type: 'whatsapp',
    status: 'disconnected',
    icon: '📱',
    instanceId: '',
    lastSync: undefined,
    provider: 'uazapi'
  },
  {
    id: '2',
    name: 'Instagram Business',
    description: 'Integração com Instagram Direct Messages',
    type: 'instagram',
    status: 'disconnected',
    icon: '📸',
    lastSync: undefined
  },
  {
    id: '3',
    name: 'Facebook Messenger',
    description: 'Integração com Facebook Messenger',
    type: 'facebook',
    status: 'disconnected',
    icon: '💬',
    lastSync: undefined
  },
  {
    id: '4',
    name: 'Telegram Bot',
    description: 'Integração com Telegram Bot API',
    type: 'telegram',
    status: 'disconnected',
    icon: '✈️',
    lastSync: undefined
  }
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [qrCodeModal, setQrCodeModal] = useState<{ show: boolean; qrcode?: string; instanceId?: string }>({ show: false })

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId)
    
    try {
      const integration = integrations.find(int => int.id === integrationId)
      
      if (integration?.type === 'whatsapp') {
        // Conectar WhatsApp via UazAPI
        const instanceId = `moobi_${Date.now()}`
        
        const response = await fetch('/api/integrations/whatsapp/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instanceId,
            platformId: integrationId,
            webhook: `${window.location.origin}/api/webhooks/uazapi`
          })
        })
        
        const data = await response.json()
        
        if (data.success && data.qrcode) {
          // Mostrar QR Code
          setQrCodeModal({
            show: true,
            qrcode: data.qrcode,
            instanceId: data.instanceId
          })
          
          setIntegrations(prev => 
            prev.map(int => 
              int.id === integrationId 
                ? { 
                    ...int, 
                    status: 'connecting', 
                    instanceId: data.instanceId,
                    qrcode: data.qrcode
                  }
                : int
            )
          )
        } else {
          throw new Error(data.error || 'Erro ao conectar')
        }
      } else {
        // Outras integrações (simulado)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setIntegrations(prev => 
          prev.map(int => 
            int.id === integrationId 
              ? { ...int, status: 'connected', lastSync: new Date().toISOString() }
              : int
          )
        )
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
      setIntegrations(prev => 
        prev.map(int => 
          int.id === integrationId 
            ? { ...int, status: 'error' }
            : int
        )
      )
    } finally {
      setIsConnecting(null)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      const integration = integrations.find(int => int.id === integrationId)
      
      if (integration?.type === 'whatsapp') {
        // Desconectar WhatsApp via UazAPI
        const response = await fetch('/api/integrations/whatsapp/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platformId: integrationId,
            deleteInstance: false // Apenas logout
          })
        })
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Erro ao desconectar')
        }
      }
      
      setIntegrations(prev => 
        prev.map(int => 
          int.id === integrationId 
            ? { ...int, status: 'disconnected', lastSync: undefined, instanceId: undefined, qrcode: undefined }
            : int
        )
      )
    } catch (error) {
      console.error('Erro ao desconectar:', error)
    }
  }

  const checkWhatsAppStatus = async (integrationId: string, instanceId: string) => {
    try {
      const response = await fetch(`/api/integrations/whatsapp/connect?instanceId=${instanceId}`)
      const data = await response.json()
      
      if (data.success && data.isConnected) {
        setIntegrations(prev => 
          prev.map(int => 
            int.id === integrationId 
              ? { ...int, status: 'connected', lastSync: new Date().toISOString() }
              : int
          )
        )
        setQrCodeModal({ show: false })
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'connecting': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'Conectado'
      case 'connecting': return 'Conectando'
      case 'error': return 'Erro'
      case 'disconnected': return 'Desconectado'
      default: return 'Desconectado'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as integrações com plataformas de mensageria
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                    {integration.provider && (
                      <div className="text-xs text-blue-600 mt-1">
                        via {integration.provider.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(integration.status)}>
                  {getStatusText(integration.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.instanceId && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Instância:</span> {integration.instanceId}
                  </div>
                )}
                
                {integration.lastSync && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Última sincronização:</span>{' '}
                    {new Date(integration.lastSync).toLocaleString('pt-BR')}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  {integration.status === 'connected' ? (
                    <>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Desconectar
                      </Button>
                      {integration.instanceId && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => checkWhatsAppStatus(integration.id, integration.instanceId!)}
                        >
                          Verificar Status
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(integration.id)}
                      disabled={isConnecting === integration.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isConnecting === integration.id ? 'Conectando...' : 'Conectar'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal QR Code */}
      {qrCodeModal.show && qrCodeModal.qrcode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4">Conectar WhatsApp</h3>
              <p className="text-gray-600 mb-4">
                Escaneie o QR Code com seu WhatsApp
              </p>
              
              <div className="flex justify-center mb-4">
                <img 
                  src={qrCodeModal.qrcode} 
                  alt="QR Code WhatsApp" 
                  className="w-64 h-64 border"
                />
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                Instância: {qrCodeModal.instanceId}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setQrCodeModal({ show: false })}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => qrCodeModal.instanceId && checkWhatsAppStatus('1', qrCodeModal.instanceId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Verificar Conexão
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Configurações aplicadas a todas as integrações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Webhook URL UazAPI
              </label>
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/uazapi`}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Webhook URL Geral
              </label>
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks`}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Timeout de Conexão (segundos)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="mt-1 block w-32 rounded-md border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoReconnect"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoReconnect" className="text-sm text-gray-700">
                Reconectar automaticamente em caso de falha
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
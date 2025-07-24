'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Phone
} from 'lucide-react'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [testPhone, setTestPhone] = useState('5511999999999')
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do MoobeChat.')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [platforms, setPlatforms] = useState<any[]>([])

  const addResult = (test: string, success: boolean, data?: any, error?: string) => {
    const result = {
      id: Date.now(),
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }
    setResults(prev => [result, ...prev])
  }

  const clearResults = () => {
    setResults([])
  }

  // Teste 1: Carregar instâncias WhatsApp
  const testLoadInstances = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/instances')
      const data = await response.json()
      
      if (data.success) {
        setPlatforms(data.instances)
        addResult('Carregar Instâncias', true, data.instances)
      } else {
        addResult('Carregar Instâncias', false, null, data.error)
      }
    } catch (error) {
      addResult('Carregar Instâncias', false, null, error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Teste 2: Verificar conexão de uma instância
  const testInstanceConnection = async (platformId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/integrations/whatsapp/connect?instanceToken=test`)
      const data = await response.json()
      
      addResult('Verificar Conexão', data.success, data)
    } catch (error) {
      addResult('Verificar Conexão', false, null, error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Teste 3: Verificar número WhatsApp
  const testCheckNumber = async () => {
    if (!selectedPlatform || !testPhone) {
      addResult('Verificar Número', false, null, 'Plataforma e telefone são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/integrations/whatsapp/send?platformId=${selectedPlatform}&phone=${testPhone}`)
      const data = await response.json()
      
      addResult('Verificar Número', data.success, data)
    } catch (error) {
      addResult('Verificar Número', false, null, error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Teste 4: Enviar mensagem de teste
  const testSendMessage = async () => {
    if (!selectedPlatform || !testPhone || !testMessage) {
      addResult('Enviar Mensagem', false, null, 'Todos os campos são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/integrations/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platformId: selectedPlatform,
          phone: testPhone,
          message: testMessage
        })
      })
      
      const data = await response.json()
      addResult('Enviar Mensagem', data.success, data, data.error)
    } catch (error) {
      addResult('Enviar Mensagem', false, null, error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Teste 5: Testar configuração UazAPI
  const testUazApiConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-uazapi-config')
      const data = await response.json()
      
      addResult('Configuração UazAPI', data.success, data)
    } catch (error) {
      addResult('Configuração UazAPI', false, null, error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Teste 6: Testar webhook
  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/uazapi')
      const data = await response.json()
      
      addResult('Testar Webhook', response.ok, data)
    } catch (error) {
      addResult('Testar Webhook', false, null, error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Executar todos os testes
  const runAllTests = async () => {
    clearResults()
    await testUazApiConfig()
    await testLoadInstances()
    await testWebhook()
    
    if (selectedPlatform) {
      await testCheckNumber()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teste de Integração UazAPI</h1>
          <p className="text-gray-600">Teste as funcionalidades da integração WhatsApp</p>
        </div>
        <Button onClick={clearResults} variant="outline" size="sm">
          Limpar Resultados
        </Button>
      </div>

      {/* Configurações de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Configurações de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Plataforma WhatsApp</label>
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione uma plataforma</option>
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name} ({platform.status})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Telefone de Teste</label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="5511999999999"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mensagem de Teste</label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Digite sua mensagem de teste"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testes Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Carregar Instâncias</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testLoadInstances} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verificar Número</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testCheckNumber} 
              disabled={loading || !selectedPlatform || !testPhone}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enviar Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testSendMessage} 
              disabled={loading || !selectedPlatform || !testPhone || !testMessage}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuração UazAPI</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testUazApiConfig} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Testar Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testWebhook} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Executar Todos os Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Executando Testes...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Executar Todos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.test}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-red-700 text-sm">{result.error}</span>
                      </div>
                    </div>
                  )}
                  
                  {result.data && (
                    <div className="bg-gray-50 border rounded p-3">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
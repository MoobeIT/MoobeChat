import axios, { AxiosError } from 'axios'

const UAZAPI_URL = process.env.UAZAPI_URL || 'https://free.uazapi.com'
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN || ''

// Validar se o token está configurado
if (!UAZAPI_TOKEN || UAZAPI_TOKEN === 'your-uazapi-token-here') {
  console.warn('⚠️  UAZAPI_TOKEN não configurado. Configure no arquivo .env.local')
}

const uazApi = axios.create({
  baseURL: UAZAPI_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos
})

// Interceptor para logs
uazApi.interceptors.request.use(
  (config) => {
    console.log(`🔄 UazAPI Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ UazAPI Request Error:', error)
    return Promise.reject(error)
  }
)

uazApi.interceptors.response.use(
  (response) => {
    console.log(`✅ UazAPI Response: ${response.status} ${response.config.url}`)
    if (response.data) {
      console.log('📊 Response data:', JSON.stringify(response.data, null, 2))
    }
    return response
  },
  (error: AxiosError) => {
    console.error(`❌ UazAPI Response Error: ${error.response?.status} ${error.config?.url}`)
    console.error('📋 Error details:', JSON.stringify(error.response?.data, null, 2))
    console.error('🔍 Request config:', {
      method: error.config?.method,
      url: error.config?.url,
      headers: error.config?.headers,
      data: error.config?.data
    })
    return Promise.reject(error)
  }
)

export interface UazInstance {
  instanceId: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  qrcode?: string
  webhook?: string
  token?: string
}

export interface SendMessageData {
  phone: string
  message?: string
  media?: {
    type: 'image' | 'video' | 'audio' | 'document'
    url: string
    caption?: string
  }
}

export interface UazWebhookMessage {
  instanceId: string
  data: {
    id: string
    from: string
    fromMe: boolean
    body: string
    type: 'text' | 'image' | 'video' | 'audio' | 'document'
    timestamp: number
    pushName?: string
    mediaUrl?: string
  }
}

export class UazApiClient {
  private validateToken(): void {
    if (!UAZAPI_TOKEN || UAZAPI_TOKEN === 'your-uazapi-token-here') {
      throw new Error('Token UazAPI não configurado. Configure UAZAPI_TOKEN no .env.local')
    }
  }

  private formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Se não começar com 55, adiciona (código do Brasil)
    if (!cleaned.startsWith('55')) {
      return `55${cleaned}`
    }
    
    return cleaned
  }

  // Inicializar instância (criar nova instância)
  async initInstance(instanceName: string, webhook?: string): Promise<UazInstance> {
    this.validateToken()
    
    try {
      console.log(`🚀 Inicializando instância UazAPI: ${instanceName}`)
      
      const response = await uazApi.post('/instance/init', {
        name: instanceName
      }, {
        headers: {
          'admintoken': UAZAPI_TOKEN
        }
      })
      
      console.log('✅ Instância inicializada:', response.data)
      
      // Configurar webhook se fornecido
      if (webhook && response.data.token) {
        try {
          await this.setWebhook(response.data.token, webhook)
        } catch (webhookError) {
          console.warn('⚠️ Erro ao configurar webhook:', webhookError)
        }
      }
      
      return {
        instanceId: instanceName,
        status: 'disconnected',
        token: response.data.token,
        webhook
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar instância UazAPI:', error)
      if (error instanceof AxiosError) {
        throw new Error(`Erro UazAPI: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  // Conectar instância (obter QR Code)
  async connectInstance(instanceToken: string): Promise<{ qrcode?: string; status?: string }> {
    try {
      console.log('🔗 Conectando instância UazAPI...')
      
      const response = await uazApi.post('/instance/connect', {}, {
        headers: {
          'token': instanceToken
        }
      })
      
      console.log('✅ Resposta de conexão:', response.data)
      
      return {
        qrcode: response.data.qrcode,
        status: response.data.status || 'connecting'
      }
    } catch (error) {
      console.error('❌ Erro ao conectar instância UazAPI:', error)
      
      if (error instanceof AxiosError) {
        // Status 409 significa que já está conectando - mas pode ter QR Code
        if (error.response?.status === 409) {
          const errorData = error.response.data
          
          // Se tem QR Code no erro, retornar normalmente
          if (errorData?.qrcode) {
            console.log('🔄 Erro 409 mas QR Code presente - retornando QR Code')
            return {
              qrcode: errorData.qrcode,
              status: errorData.instance?.status || 'connecting'
            }
          }
          
          // Se não tem QR Code, mas tem dados da instância, tentar extrair
          if (errorData?.instance?.qrcode) {
            console.log('🔄 QR Code encontrado nos dados da instância')
            return {
              qrcode: errorData.instance.qrcode,
              status: errorData.instance.status || 'connecting'
            }
          }
        }
        
        throw new Error(`Erro ao conectar: ${error.response?.data?.response || error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  // Obter status da instância
  async getInstanceStatus(instanceToken: string): Promise<UazInstance> {
    try {
      console.log(`🔍 Verificando status da instância...`)
      
      const response = await uazApi.get('/instance/status', {
        headers: {
          'token': instanceToken
        }
      })
      
      const data = response.data
      console.log(`📊 Status response:`, data)
      
      // Determinar status baseado na resposta
      let status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected'
      
      // Verificar se há informações de instância
      if (data.instance) {
        const instanceStatus = data.instance.status || data.status
        
        switch (instanceStatus?.toLowerCase()) {
          case 'connected':
          case 'open':
            status = 'connected'
            break
          case 'connecting':
          case 'qr':
            status = 'connecting'
            break
          case 'disconnected':
          case 'close':
            status = 'disconnected'
            break
          default:
            status = 'error'
        }
      } else {
        // Fallback para resposta direta
        const rawStatus = data.status || 'disconnected'
        switch (rawStatus.toLowerCase()) {
          case 'connected':
          case 'open':
            status = 'connected'
            break
          case 'connecting':
          case 'qr':
            status = 'connecting'
            break
          case 'disconnected':
          case 'close':
            status = 'disconnected'
            break
          default:
            status = 'error'
        }
      }
      
      console.log(`📊 Status processado: ${status}`)
      
      return {
        instanceId: String(data.instance?.name || data.instanceName || 'unknown'),
        status,
        qrcode: data.qrcode || data.instance?.qrcode
      }
    } catch (error) {
      console.error('❌ Erro ao obter status UazAPI:', error)
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new Error('Instância não encontrada. Verifique se foi criada corretamente.')
      }
      throw error
    }
  }

  // Verificar se instância está conectada
  async isInstanceConnected(instanceToken: string): Promise<boolean> {
    try {
      const status = await this.getInstanceStatus(instanceToken)
      console.log(`🔍 Status da instância: ${status.status}`)
      
      // Consideramos conectada se status for 'connected' ou 'open'
      return status.status === 'connected'
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error)
      return false
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(instanceToken: string, data: SendMessageData): Promise<any> {
    try {
      const formattedPhone = this.formatPhone(data.phone)
      
      console.log(`📤 Enviando mensagem de texto para ${formattedPhone}`)
      
      const response = await uazApi.post('/send/text', {
        phone: formattedPhone,
        message: data.message
      }, {
        headers: {
          'token': instanceToken
        }
      })
      
      console.log('✅ Mensagem enviada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem UazAPI:', error)
      if (error instanceof AxiosError) {
        throw new Error(`Erro ao enviar mensagem: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  // Enviar mídia
  async sendMediaMessage(instanceToken: string, data: SendMessageData): Promise<any> {
    try {
      const formattedPhone = this.formatPhone(data.phone)
      
      console.log(`📤 Enviando mídia para ${formattedPhone}`)
      
      const response = await uazApi.post('/send/media', {
        phone: formattedPhone,
        type: data.media?.type,
        url: data.media?.url,
        caption: data.media?.caption
      }, {
        headers: {
          'token': instanceToken
        }
      })
      
      console.log('✅ Mídia enviada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao enviar mídia UazAPI:', error)
      if (error instanceof AxiosError) {
        throw new Error(`Erro ao enviar mídia: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  // Desconectar instância
  async disconnectInstance(instanceToken: string): Promise<void> {
    try {
      console.log('🔌 Desconectando instância UazAPI...')
      
      await uazApi.post('/instance/disconnect', {}, {
        headers: {
          'token': instanceToken
        }
      })
      
      console.log('✅ Instância desconectada')
    } catch (error) {
      console.error('❌ Erro ao desconectar instância UazAPI:', error)
      throw error
    }
  }

  // Configurar webhook
  async setWebhook(instanceToken: string, webhookUrl: string): Promise<void> {
    try {
      console.log(`🔗 Configurando webhook: ${webhookUrl}`)
      
      await uazApi.post('/webhook', {
        webhook: webhookUrl,
        webhookByEvents: true,
        webhookBase64: false
      }, {
        headers: {
          'token': instanceToken
        }
      })
      
      console.log('✅ Webhook configurado')
    } catch (error) {
      console.error('❌ Erro ao configurar webhook UazAPI:', error)
      throw error
    }
  }

  // Verificar se número existe no WhatsApp
  async checkNumber(instanceToken: string, phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhone(phone)
      
      console.log(`🔍 Verificando número: ${formattedPhone}`)
      
      const response = await uazApi.post('/chat/check', {
        phone: formattedPhone
      }, {
        headers: {
          'token': instanceToken
        }
      })
      
      const exists = response.data.exists || false
      console.log(`✅ Número ${formattedPhone} existe no WhatsApp: ${exists}`)
      
      return exists
    } catch (error) {
      console.error('❌ Erro ao verificar número UazAPI:', error)
      return false
    }
  }

  // Obter informações da instância
  async getInstanceInfo(instanceToken: string): Promise<any> {
    try {
      const response = await uazApi.get('/instance/info', {
        headers: {
          'token': instanceToken
        }
      })
      
      return response.data
    } catch (error) {
      console.error('❌ Erro ao obter informações da instância:', error)
      throw error
    }
  }

  // Listar todas as instâncias (admin)
  async listInstances(): Promise<any[]> {
    this.validateToken()
    
    try {
      console.log('🔍 Listando instâncias UazAPI com admin token...')
      console.log('🔑 Admin Token:', UAZAPI_TOKEN ? `${UAZAPI_TOKEN.slice(0, 10)}...` : 'NÃO CONFIGURADO')
      
      const response = await uazApi.get('/instance/all', {
        headers: {
          'admintoken': UAZAPI_TOKEN
        }
      })
      
      console.log('✅ Resposta /instance/all:', response.data)
      console.log('📊 Número de instâncias encontradas:', response.data.instances?.length || 0)
      
      return response.data.instances || []
    } catch (error) {
      console.error('❌ Erro ao listar instâncias:', error)
      if (error instanceof AxiosError) {
        console.error('🔍 Status do erro:', error.response?.status)
        console.error('📋 Dados do erro:', error.response?.data)
      }
      throw error
    }
  }
}

export const uazApiClient = new UazApiClient() 
import axios from 'axios'

const UAZAPI_URL = process.env.UAZAPI_URL || 'https://free.uazapi.com'
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN || ''

const uazApi = axios.create({
  baseURL: UAZAPI_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

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
  // Inicializar instância (criar nova instância)
  async initInstance(instanceName: string, webhook?: string): Promise<UazInstance> {
    try {
      const response = await uazApi.post('/instance/init', {
        instanceName,
        webhook: webhook || `${process.env.WEBHOOK_URL}/api/webhooks/uazapi`,
        webhookByEvents: true,
        webhookBase64: false
      }, {
        headers: {
          'admintoken': UAZAPI_TOKEN
        }
      })
      
      return {
        instanceId: instanceName,
        status: 'disconnected',
        token: response.data.token,
        webhook
      }
    } catch (error) {
      console.error('Erro ao inicializar instância UazAPI:', error)
      throw error
    }
  }

  // Conectar instância (obter QR Code)
  async connectInstance(instanceToken: string): Promise<{ qrcode?: string; status?: string }> {
    try {
      const response = await uazApi.post('/instance/connect', {}, {
        headers: {
          'token': instanceToken
        }
      })
      
      return {
        qrcode: response.data.qrcode,
        status: response.data.status || 'connecting'
      }
    } catch (error) {
      console.error('Erro ao conectar instância UazAPI:', error)
      throw error
    }
  }

  // Obter status da instância
  async getInstanceStatus(instanceToken: string): Promise<UazInstance> {
    try {
      const response = await uazApi.get('/instance/status', {
        headers: {
          'token': instanceToken
        }
      })
      
      return {
        instanceId: response.data.instanceName || 'unknown',
        status: response.data.status || 'disconnected',
        qrcode: response.data.qrcode
      }
    } catch (error) {
      console.error('Erro ao obter status UazAPI:', error)
      throw error
    }
  }

  // Verificar se instância está conectada
  async isInstanceConnected(instanceToken: string): Promise<boolean> {
    try {
      const status = await this.getInstanceStatus(instanceToken)
      return status.status === 'connected'
    } catch (error) {
      return false
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(instanceToken: string, data: SendMessageData): Promise<any> {
    try {
      const response = await uazApi.post('/send/text', {
        phone: data.phone,
        message: data.message
      }, {
        headers: {
          'token': instanceToken
        }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao enviar mensagem UazAPI:', error)
      throw error
    }
  }

  // Enviar mídia
  async sendMediaMessage(instanceToken: string, data: SendMessageData): Promise<any> {
    try {
      const response = await uazApi.post('/send/media', {
        phone: data.phone,
        type: data.media?.type,
        url: data.media?.url,
        caption: data.media?.caption
      }, {
        headers: {
          'token': instanceToken
        }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao enviar mídia UazAPI:', error)
      throw error
    }
  }

  // Desconectar instância
  async disconnectInstance(instanceToken: string): Promise<void> {
    try {
      await uazApi.post('/instance/disconnect', {}, {
        headers: {
          'token': instanceToken
        }
      })
    } catch (error) {
      console.error('Erro ao desconectar instância UazAPI:', error)
      throw error
    }
  }

  // Configurar webhook
  async setWebhook(instanceToken: string, webhookUrl: string): Promise<void> {
    try {
      await uazApi.post('/webhook', {
        webhook: webhookUrl,
        webhookByEvents: true,
        webhookBase64: false
      }, {
        headers: {
          'token': instanceToken
        }
      })
    } catch (error) {
      console.error('Erro ao configurar webhook UazAPI:', error)
      throw error
    }
  }

  // Verificar se número existe no WhatsApp
  async checkNumber(instanceToken: string, phone: string): Promise<boolean> {
    try {
      const response = await uazApi.post('/chat/check', {
        phone
      }, {
        headers: {
          'token': instanceToken
        }
      })
      return response.data.exists || false
    } catch (error) {
      console.error('Erro ao verificar número UazAPI:', error)
      return false
    }
  }
}

export const uazApiClient = new UazApiClient() 
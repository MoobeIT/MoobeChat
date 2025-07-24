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
    // Verificar se phone não é undefined ou null
    if (!phone || typeof phone !== 'string') {
      throw new Error(`Número de telefone inválido: ${phone}. Verifique se o campo customerPhone está preenchido na conversa.`)
    }
    
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Verificar se ainda tem conteúdo após limpeza
    if (!cleaned) {
      throw new Error(`Número de telefone vazio após limpeza: ${phone}`)
    }
    
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
      console.log(`🔑 Usando admin token: ${UAZAPI_TOKEN ? `${UAZAPI_TOKEN.slice(0, 10)}...` : 'NÃO CONFIGURADO'}`)
      
      const response = await uazApi.post('/instance/init', {
        name: instanceName
      }, {
        headers: {
          'admintoken': UAZAPI_TOKEN
        }
      })
      
      console.log('✅ Instância inicializada:', response.data)
      
      // Verificar se recebeu token
      if (!response.data.token) {
        throw new Error('Token não recebido do UazAPI')
      }
      
      // Aguardar um pouco para garantir que a instância foi criada
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Verificar se a instância foi realmente criada
      try {
        const status = await this.getInstanceStatus(response.data.token)
        console.log(`🔍 Status da instância criada: ${status.status}`)
      } catch (statusError) {
        console.warn('⚠️ Erro ao verificar status da instância criada:', statusError)
        // Continuar mesmo com erro de status
      }
      
      // Configurar webhook se fornecido
      if (webhook && response.data.token) {
        try {
          await this.setWebhook(response.data.token, webhook)
          console.log(`🔗 Webhook configurado: ${webhook}`)
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
        console.error('📋 Detalhes do erro UazAPI:')
        console.error('  - Status:', error.response?.status)
        console.error('  - Data:', error.response?.data)
        console.error('  - Headers:', error.response?.headers)
        
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'Erro desconhecido'
        
        throw new Error(`Erro UazAPI: ${errorMessage}`)
      }
      throw error
    }
  }

  // Conectar instância (obter QR Code)
  async connectInstance(instanceToken: string): Promise<{ qrcode?: string; status?: string }> {
    try {
      console.log('🔗 Conectando instância UazAPI...')
      
      // Configurações de retry mais robustas
      const maxRetries = 5
      const baseDelay = 3000 // 3 segundos
      
      // Primeiro, verificar se a instância está pronta
      console.log('🔍 Verificando se a instância está pronta antes da conexão...')
      try {
        const statusCheck = await this.getInstanceStatus(instanceToken)
        console.log(`📊 Status atual da instância: ${statusCheck.status}`)
        
        // Se ainda está inicializando, aguardar mais
        if (statusCheck.status === 'error' || !statusCheck.status) {
          console.log('⏳ Instância ainda não está pronta, aguardando...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      } catch (statusError) {
        console.warn('⚠️ Erro ao verificar status inicial, tentando conectar mesmo assim:', statusError)
      }
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Tentativa ${attempt}/${maxRetries} de conexão...`)
          
          const response = await uazApi.post('/instance/connect', {}, {
            headers: {
              'token': instanceToken
            }
          })
          
          console.log(`✅ Conexão bem-sucedida na tentativa ${attempt}:`, response.data)
          
          return {
            qrcode: response.data.qrcode,
            status: response.data.status || 'connecting'
          }
          
        } catch (attemptError) {
          console.log(`⚠️ Tentativa ${attempt}/${maxRetries} falhou`)
          
          if (attemptError instanceof AxiosError) {
            // Status 409 significa que já está conectando - verificar QR Code
            if (attemptError.response?.status === 409) {
              const errorData = attemptError.response.data
              
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
            
            // Se é erro 400 ou 404, a instância pode não estar pronta ainda
            if (attemptError.response?.status === 400 || attemptError.response?.status === 404) {
              if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(1.5, attempt - 1)
                console.log(`⏳ Instância não pronta. Aguardando ${Math.round(delay)}ms... (${attempt}/${maxRetries})`)
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
              }
            }
          }
          
          // Se chegou aqui e é a última tentativa, lançar erro
          if (attempt === maxRetries) {
            console.error(`❌ Todas as ${maxRetries} tentativas falharam`)
            throw attemptError
          }
          
          // Delay progressivo entre tentativas
          const delay = baseDelay * Math.pow(1.3, attempt - 1) + Math.random() * 1000
          console.log(`⏳ Aguardando ${Math.round(delay)}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      
      throw new Error('Não foi possível conectar após múltiplas tentativas')
      
    } catch (error) {
      console.error('❌ Erro ao conectar instância UazAPI:', error)
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.response || 
                           error.response?.data?.message || 
                           error.response?.data?.error ||
                           error.message
        
        throw new Error(`Erro ao conectar: ${errorMessage}`)
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
      console.log(`📋 Dados da mensagem:`, { phone: formattedPhone, message: data.message })
      
      // Formatos que funcionam com a API
      const formatsToTry = [
        // Formato 5: number instead of phone (formato principal que funciona)
        {
          number: formattedPhone,
          text: data.message
        },
        // Formato 6: to field (alternativo)
        {
          to: formattedPhone,
          text: data.message
        },
        // Formato 7: phone com delay (fallback)
        {
          phone: formattedPhone,
          text: data.message,
          delay: 1000
        }
      ]
      
      let lastError: any = null
      
      const formatNumbers = [5, 6, 7] // Números reais dos formatos
      
      for (let i = 0; i < formatsToTry.length; i++) {
        const payload = formatsToTry[i]
        const formatNumber = formatNumbers[i]
        
        try {
          console.log(`🧪 Testando Formato ${formatNumber}:`, payload)
          
          const response = await uazApi.post('/send/text', payload, {
            headers: {
              'token': instanceToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
          
          console.log(`✅ Formato ${formatNumber} funcionou! Mensagem enviada:`, response.data)
          
          // Se chegou aqui, o formato funcionou. Salvar qual formato usar no futuro
          console.log(`💡 Formato bem-sucedido salvo:`, payload)
          
          return response.data
          
        } catch (formatError) {
          console.log(`❌ Formato ${formatNumber} falhou:`)
          
          if (formatError instanceof AxiosError) {
            const errorData = formatError.response?.data
            const status = formatError.response?.status
            
            console.log(`  - Status: ${status}`)
            console.log(`  - Error: ${JSON.stringify(errorData)}`)
            
            lastError = formatError
            
            // Se é erro 401 (token inválido), não tentar outros formatos
            if (status === 401) {
              console.log(`🚫 Erro de token (401) - parando tentativas`)
              break
            }
            
            // Se é erro 400 mas não "Missing required fields", pode ser formato incorreto
            if (status === 400 && !errorData?.error?.includes?.('Missing required fields')) {
              console.log(`⚠️ Erro 400 diferente de "Missing required fields" - tentando próximo formato`)
              continue
            }
          }
          
          // Se é último formato, lançar o erro
          if (i === formatsToTry.length - 1) {
            console.log(`❌ Todos os formatos falharam`)
            throw formatError
          }
        }
      }
      
      // Se chegou aqui, todos os formatos falharam
      throw lastError || new Error('Todos os formatos de payload falharam')
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem UazAPI:', error)
      if (error instanceof AxiosError) {
        console.error('📋 Detalhes do erro:')
        console.error('  - Status:', error.response?.status)
        console.error('  - Data:', error.response?.data)
        console.error('  - Headers:', error.response?.headers)
        throw new Error(`Erro ao enviar mensagem: ${error.response?.data?.message || error.response?.data?.error || error.message}`)
      }
      throw error
    }
  }

  // Enviar mídia
  async sendMediaMessage(instanceToken: string, data: SendMessageData): Promise<any> {
    try {
      const formattedPhone = this.formatPhone(data.phone)
      
      console.log(`📤 Enviando mídia para ${formattedPhone}`)
      console.log(`📋 Dados da mídia:`, { 
        phone: formattedPhone, 
        type: data.media?.type, 
        url: data.media?.url, 
        caption: data.media?.caption 
      })
      
      const payload = {
        phone: formattedPhone,
        type: data.media?.type,
        media: data.media?.url,     // Alguns APIs esperam 'media'
        url: data.media?.url,       // Outros esperam 'url'
        caption: data.media?.caption,
        filename: data.media?.caption || 'arquivo',
        delay: 1000
      }
      
      console.log(`📦 Payload de mídia enviado:`, payload)
      
      const response = await uazApi.post('/send/media', payload, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ Mídia enviada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao enviar mídia UazAPI:', error)
      if (error instanceof AxiosError) {
        console.error('📋 Detalhes do erro de mídia:')
        console.error('  - Status:', error.response?.status)
        console.error('  - Data:', error.response?.data)
        console.error('  - Headers:', error.response?.headers)
        throw new Error(`Erro ao enviar mídia: ${error.response?.data?.message || error.response?.data?.error || error.message}`)
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
        
        // Detectar servidor gratuito/demo
        if (error.response?.status === 401 && 
            error.response?.data?.error?.includes?.('public demo server')) {
          console.log('🎯 Servidor gratuito detectado - endpoint /instance/all desabilitado')
          
          // Criar erro específico para servidor gratuito
          const demoError = new Error('DEMO_SERVER_LIMITATION')
          demoError.name = 'DemoServerError'
          ;(demoError as any).isDemoServer = true
          ;(demoError as any).originalError = error.response?.data
          throw demoError
        }
      }
      throw error
    }
  }
}

export const uazApiClient = new UazApiClient()
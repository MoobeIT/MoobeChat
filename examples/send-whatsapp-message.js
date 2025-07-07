/**
 * 📱 Exemplo: Envio de Mensagens WhatsApp via API
 * 
 * Este arquivo demonstra como enviar mensagens WhatsApp
 * usando as APIs do MoobeChat + UazAPI
 */

const API_BASE_URL = 'http://localhost:3000'

// Função para fazer login e obter token de sessão
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Falha no login')
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Erro no login:', error)
    throw error
  }
}

// Função para listar instâncias WhatsApp disponíveis
async function getWhatsAppInstances(sessionToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/whatsapp/instances`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar instâncias')
    }

    const data = await response.json()
    return data.instances
  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error)
    throw error
  }
}

// Função para enviar mensagem de texto
async function sendTextMessage(sessionToken, platformId, phone, message) {
  try {
    console.log(`📤 Enviando mensagem para ${phone}...`)
    
    const response = await fetch(`${API_BASE_URL}/api/integrations/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platformId,
        phone,
        message
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar mensagem')
    }

    console.log('✅ Mensagem enviada:', data)
    return data
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error)
    throw error
  }
}

// Função para enviar mensagem com mídia
async function sendMediaMessage(sessionToken, platformId, phone, message, media) {
  try {
    console.log(`📤 Enviando mídia para ${phone}...`)
    
    const response = await fetch(`${API_BASE_URL}/api/integrations/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platformId,
        phone,
        message,
        media
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar mídia')
    }

    console.log('✅ Mídia enviada:', data)
    return data
  } catch (error) {
    console.error('❌ Erro ao enviar mídia:', error)
    throw error
  }
}

// Função para verificar se número existe no WhatsApp
async function checkNumber(sessionToken, platformId, phone) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/integrations/whatsapp/send?platformId=${platformId}&phone=${phone}`,
      {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao verificar número')
    }

    return data.numberExists
  } catch (error) {
    console.error('❌ Erro ao verificar número:', error)
    throw error
  }
}

// 🚀 Exemplo de uso completo
async function exemploCompleto() {
  try {
    console.log('🔐 Fazendo login...')
    
    // 1. Login (substitua pelas suas credenciais)
    const session = await login('admin@moobi.test', '123456')
    const sessionToken = session.token // Adapte conforme sua implementação
    
    console.log('✅ Login realizado com sucesso')

    // 2. Listar instâncias disponíveis
    console.log('📱 Buscando instâncias WhatsApp...')
    const instances = await getWhatsAppInstances(sessionToken)
    
    if (instances.length === 0) {
      throw new Error('Nenhuma instância WhatsApp encontrada')
    }

    // Usar a primeira instância conectada
    const connectedInstance = instances.find(i => i.status === 'connected')
    
    if (!connectedInstance) {
      throw new Error('Nenhuma instância conectada. Conecte uma instância primeiro.')
    }

    console.log(`✅ Usando instância: ${connectedInstance.name}`)

    // 3. Verificar se número existe (opcional)
    const targetPhone = '5511999999999' // Substitua pelo número de teste
    console.log(`🔍 Verificando número ${targetPhone}...`)
    
    const numberExists = await checkNumber(sessionToken, connectedInstance.id, targetPhone)
    console.log(`📞 Número existe no WhatsApp: ${numberExists ? 'Sim' : 'Não'}`)

    // 4. Enviar mensagem de texto
    console.log('📨 Enviando mensagem de texto...')
    await sendTextMessage(
      sessionToken,
      connectedInstance.id,
      targetPhone,
      'Olá! Esta é uma mensagem de teste do MoobeChat via API 🚀'
    )

    // 5. Enviar mensagem com imagem
    console.log('🖼️ Enviando mensagem com imagem...')
    await sendMediaMessage(
      sessionToken,
      connectedInstance.id,
      targetPhone,
      'Veja esta imagem de exemplo:',
      {
        type: 'image',
        url: 'https://picsum.photos/400/300',
        caption: 'Imagem de exemplo enviada via API'
      }
    )

    console.log('🎉 Todos os testes concluídos com sucesso!')

  } catch (error) {
    console.error('❌ Erro no exemplo:', error.message)
  }
}

// 📋 Exemplos específicos

// Exemplo 1: Mensagem simples
async function exemploMensagemSimples() {
  const sessionToken = 'seu-token-aqui'
  const platformId = 'sua-plataforma-id'
  
  await sendTextMessage(
    sessionToken,
    platformId,
    '5511999999999',
    'Olá! Como posso ajudar você hoje?'
  )
}

// Exemplo 2: Mensagem com imagem
async function exemploMensagemComImagem() {
  const sessionToken = 'seu-token-aqui'
  const platformId = 'sua-plataforma-id'
  
  await sendMediaMessage(
    sessionToken,
    platformId,
    '5511999999999',
    'Confira nosso catálogo:',
    {
      type: 'image',
      url: 'https://exemplo.com/catalogo.jpg',
      caption: 'Nossos produtos em destaque'
    }
  )
}

// Exemplo 3: Mensagem com documento
async function exemploMensagemComDocumento() {
  const sessionToken = 'seu-token-aqui'
  const platformId = 'sua-plataforma-id'
  
  await sendMediaMessage(
    sessionToken,
    platformId,
    '5511999999999',
    'Segue o documento solicitado:',
    {
      type: 'document',
      url: 'https://exemplo.com/documento.pdf',
      caption: 'Relatório mensal - Janeiro 2024'
    }
  )
}

// 🎯 Para executar os exemplos:

// Executar exemplo completo
// exemploCompleto()

// Ou executar exemplos específicos
// exemploMensagemSimples()
// exemploMensagemComImagem()
// exemploMensagemComDocumento()

// 📘 Documentação das APIs

/*
## Endpoints Disponíveis

### 1. Listar Instâncias WhatsApp
GET /api/whatsapp/instances

### 2. Enviar Mensagem
POST /api/integrations/whatsapp/send
Body: {
  platformId: string,
  phone: string,
  message: string,
  media?: {
    type: 'image' | 'video' | 'audio' | 'document',
    url: string,
    caption?: string
  }
}

### 3. Verificar Número
GET /api/integrations/whatsapp/send?platformId=ID&phone=NUMERO

## Tipos de Mídia Suportados

- **image**: JPG, PNG, GIF
- **video**: MP4, AVI, MOV
- **audio**: MP3, OGG, M4A
- **document**: PDF, DOC, XLS, TXT

## Formato do Telefone

- Use formato internacional: 5511999999999
- Inclua código do país (55 para Brasil)
- Não use símbolos (+, -, espaços)

## Tratamento de Erros

- **401**: Token inválido ou expirado
- **400**: Dados inválidos (telefone, mensagem, etc.)
- **404**: Instância não encontrada
- **500**: Erro interno (UazAPI, banco de dados, etc.)
*/

module.exports = {
  login,
  getWhatsAppInstances,
  sendTextMessage,
  sendMediaMessage,
  checkNumber,
  exemploCompleto,
  exemploMensagemSimples,
  exemploMensagemComImagem,
  exemploMensagemComDocumento
} 
# 🚀 Integração UazAPI - WhatsApp

Este documento explica como configurar e usar a integração com UazAPI para enviar e receber mensagens WhatsApp no MoobeChat.

## 📋 Pré-requisitos

1. **Token UazAPI**: Obtenha seu token em [UazAPI](https://uazapi.com)
2. **Arquivo .env.local**: Configure as variáveis de ambiente
3. **Supabase**: Banco de dados configurado

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local` e configure:

```bash
# UazAPI - WhatsApp
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="seu-token-aqui"

# Webhook URL
WEBHOOK_URL="http://localhost:3000"
```

### 2. Instalar Dependências

```bash
npm install axios
```

### 3. Configurar Webhook

O webhook da UazAPI deve apontar para:
```
https://seu-dominio.com/api/webhooks/uazapi
```

## 🔧 Funcionalidades Implementadas

### ✅ Gerenciamento de Instâncias

- **Criar instância**: `POST /api/whatsapp/instances`
- **Listar instâncias**: `GET /api/whatsapp/instances`
- **Remover instância**: `DELETE /api/whatsapp/instances`

### ✅ Conexão WhatsApp

- **Conectar**: `POST /api/integrations/whatsapp/connect`
- **Verificar status**: `GET /api/integrations/whatsapp/connect`
- **Desconectar**: `POST /api/integrations/whatsapp/disconnect`

### ✅ Envio de Mensagens

- **Enviar texto**: `POST /api/integrations/whatsapp/send`
- **Enviar mídia**: `POST /api/integrations/whatsapp/send`
- **Verificar número**: `GET /api/integrations/whatsapp/send`

### ✅ Recebimento de Mensagens

- **Webhook**: `POST /api/webhooks/uazapi`
- **Processamento automático**: Salva mensagens no banco
- **Suporte a mídias**: Imagens, vídeos, áudios, documentos

## 🎯 Como Usar

### 1. Criar uma Instância WhatsApp

```typescript
// Frontend
const response = await fetch('/api/whatsapp/instances', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Minha Instância',
    workspaceId: 'workspace-id'
  })
})
```

### 2. Conectar ao WhatsApp

```typescript
// Frontend
const response = await fetch('/api/integrations/whatsapp/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platformId: 'platform-id'
  })
})

const data = await response.json()
if (data.qrcode) {
  // Mostrar QR Code para o usuário escanear
  console.log('QR Code:', data.qrcode)
}
```

### 3. Enviar Mensagem

```typescript
// Enviar texto
const response = await fetch('/api/integrations/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platformId: 'platform-id',
    phone: '5511999999999',
    message: 'Olá! Como posso ajudar?'
  })
})

// Enviar mídia
const response = await fetch('/api/integrations/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platformId: 'platform-id',
    phone: '5511999999999',
    message: 'Veja esta imagem',
    media: {
      type: 'image',
      url: 'https://exemplo.com/imagem.jpg',
      caption: 'Legenda da imagem'
    }
  })
})
```

## 🔍 Testando a Integração

### Interface de Teste

Acesse `/test` para usar a interface de teste que permite:

- ✅ Carregar instâncias
- ✅ Verificar números
- ✅ Enviar mensagens de teste
- ✅ Testar webhook
- ✅ Executar todos os testes

### Testes Manuais

```bash
# Testar webhook
curl http://localhost:3000/api/webhooks/uazapi

# Listar instâncias
curl http://localhost:3000/api/whatsapp/instances

# Verificar número
curl "http://localhost:3000/api/integrations/whatsapp/send?platformId=ID&phone=5511999999999"
```

## 📊 Estrutura de Dados

### Instância WhatsApp
```typescript
interface WhatsAppInstance {
  id: string
  name: string
  workspaceName: string
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  isActive: boolean
  instanceToken: string | null
  instanceName: string
  instanceInfo: any
  createdAt: string
  updatedAt: string
}
```

### Mensagem
```typescript
interface Message {
  id: string
  conversationId: string
  externalId: string
  content: string
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'
  direction: 'INCOMING' | 'OUTGOING'
  senderName: string
  metadata: {
    uazApiData?: any
    mediaUrl?: string
    timestamp?: number
    phoneNumber?: string
    platform?: string
  }
}
```

## 🚨 Tratamento de Erros

### Erros Comuns

1. **Token não configurado**
   ```
   ⚠️ UAZAPI_TOKEN não configurado. Configure no arquivo .env.local
   ```

2. **Instância não conectada**
   ```
   WhatsApp não está conectado. Conecte primeiro.
   ```

3. **Número inválido**
   ```
   Número de telefone inválido
   ```

### Logs e Monitoramento

Todos os eventos são logados com emojis para facilitar o debugging:

- 🔄 Requisições
- ✅ Sucessos
- ❌ Erros
- 📨 Mensagens
- 🔗 Conexões
- 📱 QR Codes

## 🔄 Webhook Events

### Eventos Suportados

- `messages.upsert` - Nova mensagem recebida
- `connection.update` - Status de conexão alterado
- `qr` - Novo QR Code gerado
- `status` - Status de entrega da mensagem

### Exemplo de Payload

```json
{
  "event": "messages.upsert",
  "instanceName": "moobi_abc123",
  "data": {
    "messages": [{
      "key": {
        "id": "msg123",
        "remoteJid": "5511999999999@s.whatsapp.net"
      },
      "message": {
        "conversation": "Olá!"
      },
      "messageTimestamp": 1640995200,
      "pushName": "João Silva"
    }]
  }
}
```

## 🛠️ Desenvolvimento

### Estrutura de Arquivos

```
src/
├── lib/
│   └── uazapi.ts              # Cliente UazAPI
├── app/api/
│   ├── whatsapp/instances/    # Gerenciar instâncias
│   ├── integrations/whatsapp/ # Conectar/enviar
│   └── webhooks/uazapi/       # Receber mensagens
└── app/
    ├── dashboard/integrations/ # Interface de gerenciamento
    └── test/                  # Interface de teste
```

### Próximos Passos

- [ ] Implementar grupos
- [ ] Suporte a mais tipos de mídia
- [ ] Métricas de entrega
- [ ] Agendamento de mensagens
- [ ] Templates de mensagem

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs no console
2. Teste na interface `/test`
3. Consulte a documentação da UazAPI
4. Verifique as variáveis de ambiente

## 🔐 Segurança

- ✅ Tokens protegidos por variáveis de ambiente
- ✅ Validação de permissões por usuário
- ✅ Sanitização de dados de entrada
- ✅ Logs estruturados sem dados sensíveis 
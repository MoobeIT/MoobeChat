# 🔧 Backend de Integrações - Moobi Chat (UazAPI)

## ✅ O que foi atualizado:

### 1. **Migração para UazAPI**
- ✅ Criada nova biblioteca `src/lib/uazapi.ts` - Cliente UazAPI
- ✅ APIs WhatsApp atualizadas para usar UazAPI
- ✅ Webhook específico para UazAPI criado
- ✅ Interface atualizada com funcionalidades específicas da UazAPI

### 2. **Nova Estrutura de APIs**

#### **API WhatsApp com UazAPI**
- ✅ `src/app/api/integrations/whatsapp/connect/route.ts`
  - `POST` - Conectar instância WhatsApp via UazAPI
  - `GET` - Verificar status da instância com informações detalhadas

- ✅ `src/app/api/integrations/whatsapp/disconnect/route.ts`
  - `POST` - Desconectar ou deletar instância WhatsApp

- ✅ `src/app/api/integrations/whatsapp/send/route.ts`
  - `POST` - Enviar mensagens de texto e mídia via UazAPI

- ✅ `src/app/api/webhooks/uazapi/route.ts`
  - `POST` - Receber webhooks da UazAPI
  - `GET` - Verificar status do webhook

### 3. **Funcionalidades UazAPI**
- ✅ Criação de instâncias com webhook automático
- ✅ Geração e exibição de QR Code
- ✅ Verificação de status de conexão
- ✅ Envio de mensagens de texto e mídia
- ✅ Processamento de webhooks incoming
- ✅ Logout e exclusão de instâncias

### 4. **Interface Atualizada**
- ✅ Modal de QR Code para conexão WhatsApp
- ✅ Status de conexão em tempo real
- ✅ Informações específicas da UazAPI (instanceId, provider)
- ✅ Webhooks URLs configurados automaticamente

## 🚀 Como usar:

### **1. Configurar Variáveis de Ambiente**
```bash
# UazAPI - WhatsApp
UAZAPI_URL="https://api.uazapi.com"
UAZAPI_TOKEN="your-uazapi-token"

# Webhook URL
WEBHOOK_URL="http://localhost:3000/api/webhooks"
```

### **2. Conectar WhatsApp via UazAPI**
```javascript
POST /api/integrations/whatsapp/connect
{
  "instanceId": "minha_instancia_123",
  "platformId": "uuid-da-plataforma",
  "webhook": "https://meusite.com/api/webhooks/uazapi"
}

// Resposta
{
  "success": true,
  "instanceId": "minha_instancia_123",
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "Instância criada na UazAPI. Escaneie o QR Code para conectar."
}
```

### **3. Verificar Status da Conexão**
```javascript
GET /api/integrations/whatsapp/connect?instanceId=minha_instancia_123

// Resposta
{
  "success": true,
  "status": {
    "instanceId": "minha_instancia_123",
    "status": "connected"
  },
  "isConnected": true,
  "instanceInfo": {
    "user": "5511999999999",
    "pushName": "Meu WhatsApp Business"
  }
}
```

### **4. Enviar Mensagens**
```javascript
// Mensagem de texto
POST /api/integrations/whatsapp/send
{
  "phone": "5511999999999",
  "message": "Olá! Como posso ajudar?",
  "conversationId": "uuid-da-conversa"
}

// Mensagem com mídia
POST /api/integrations/whatsapp/send
{
  "phone": "5511999999999",
  "media": {
    "type": "image",
    "url": "https://exemplo.com/imagem.jpg",
    "caption": "Confira esta imagem!"
  },
  "conversationId": "uuid-da-conversa"
}
```

### **5. Webhook da UazAPI**
```javascript
// A UazAPI enviará webhooks para:
POST /api/webhooks/uazapi

// Formato do webhook
{
  "instanceId": "minha_instancia_123",
  "data": {
    "id": "msg_123456",
    "from": "5511999999999",
    "fromMe": false,
    "body": "Mensagem do cliente",
    "type": "text",
    "timestamp": 1640995200,
    "pushName": "Nome do Cliente"
  }
}
```

## 📊 Estrutura de Dados UazAPI:

### **Configuração da Plataforma**
```typescript
{
  id: string
  config: {
    instanceId: string           // ID da instância na UazAPI
    status: 'connecting' | 'connected' | 'disconnected' | 'error'
    qrcode?: string             // QR Code base64
    webhook: string             // URL do webhook
    provider: 'uazapi'          // Identificador do provedor
    uazApiUrl: string           // URL da API
    connectedAt?: string        // Data de conexão
    disconnectedAt?: string     // Data de desconexão
  }
}
```

### **Métodos da UazAPI Client**
```typescript
// Instância
await uazApiClient.createInstance(instanceId, webhook)
await uazApiClient.connectInstance(instanceId)
await uazApiClient.getInstanceStatus(instanceId)
await uazApiClient.isInstanceConnected(instanceId)
await uazApiClient.getInstanceInfo(instanceId)
await uazApiClient.logoutInstance(instanceId)
await uazApiClient.deleteInstance(instanceId)

// Mensagens
await uazApiClient.sendTextMessage(instanceId, { phone, message })
await uazApiClient.sendMediaMessage(instanceId, { phone, media })
await uazApiClient.checkNumber(instanceId, phone)

// Listagem
await uazApiClient.listInstances()
```

## 🔧 Fluxo de Conexão WhatsApp:

1. **Usuário clica "Conectar"** na interface
2. **Sistema cria instância** na UazAPI com webhook
3. **UazAPI retorna QR Code** 
4. **Modal exibe QR Code** para o usuário escanear
5. **Usuário escaneia** com WhatsApp
6. **Sistema verifica status** periodicamente
7. **Quando conectado**, atualiza interface e fecha modal

## 🗂️ Estrutura Final:

```
src/
├── lib/
│   └── uazapi.ts                      # Cliente UazAPI
├── app/api/integrations/whatsapp/
│   ├── connect/route.ts               # Conectar via UazAPI
│   ├── disconnect/route.ts            # Desconectar via UazAPI
│   └── send/route.ts                  # Enviar mensagens
└── app/api/webhooks/
    └── uazapi/route.ts                # Webhook UazAPI
```

## 🔗 URLs de Webhook:

- **UazAPI Webhook**: `https://seudominio.com/api/webhooks/uazapi`
- **Webhook Geral**: `https://seudominio.com/api/webhooks`

## ⚡ Funcionalidades da UazAPI:

- ✅ **QR Code dinâmico** - Geração automática
- ✅ **Status em tempo real** - Verificação de conexão
- ✅ **Múltiplas instâncias** - Suporte a várias contas
- ✅ **Webhooks automáticos** - Recebimento de mensagens
- ✅ **Envio de mídia** - Imagens, vídeos, documentos
- ✅ **Verificação de número** - Validar se existe no WhatsApp
- ✅ **Informações da conta** - Dados do usuário conectado

## ✅ Status Atualizado:

- [x] **UazAPI integrada** - Cliente completamente funcional
- [x] **APIs atualizadas** - WhatsApp usando UazAPI
- [x] **Webhooks configurados** - Recebimento automático
- [x] **Interface melhorada** - QR Code modal e status
- [x] **Documentação atualizada** - Guias específicos da UazAPI
- [ ] **Testes realizados** - Pendente configuração real
- [ ] **Deploy configurado** - Pendente ambiente produção

**🎉 WhatsApp via UazAPI totalmente integrado!** Agora o sistema usa a UazAPI para todas as operações do WhatsApp, incluindo conexão via QR Code, envio de mensagens e recebimento via webhook. 
# 📱 Guia de Teste - Envio de Mensagens WhatsApp

Este guia mostra como testar o envio de mensagens WhatsApp no MoobeChat usando o servidor gratuito do UazAPI.

## 🚀 Passo a Passo Completo

### 1️⃣ **Criar e Conectar Instância**

1. **Acesse**: `/dashboard/integrations`

2. **Criar Nova Instância**:
   - Digite um nome para sua instância (ex: "Teste Moobe")
   - Clique em **"Criar"**
   - ✅ A instância será criada automaticamente no UazAPI

3. **Conectar ao WhatsApp**:
   - Clique em **"Conectar"** na instância criada
   - 📱 QR Code será exibido
   - Abra WhatsApp no celular → **Aparelhos conectados** → **Conectar aparelho**
   - Escaneie o QR Code
   - ⏳ Aguarde alguns segundos
   - Clique em **"Verificar Status"** até aparecer **"Conectado"**

### 2️⃣ **Testar Envio de Mensagens**

Após a instância estar **conectada**, o card de **"Testar Envio de Mensagens"** aparecerá:

1. **Preencher Dados**:
   - **Número**: Digite com código do país (ex: `5511999999999`)
   - **Mensagem**: Digite sua mensagem de teste

2. **Enviar**:
   - Clique em **"Enviar Teste"** na instância desejada
   - ✅ Resultado aparecerá na área de mensagens

### 3️⃣ **Verificar Resultado**

**✅ Sucesso**:
```
✅ Mensagem enviada com sucesso!
  • Número: 5511999999999
  • Mensagem: Olá! Esta é uma mensagem de teste
  • ID: msg_12345
```

**❌ Erro Comum**:
```
❌ Erro ao enviar mensagem: WhatsApp não está conectado
```
→ **Solução**: Reconecte a instância

## 🔧 Funcionalidades Disponíveis

### **Interface Simples** (`/dashboard/integrations`)
- ✅ Envio de mensagens de texto
- ✅ Teste rápido com instâncias conectadas
- ✅ Feedback visual dos resultados

### **Interface Avançada** (`/test`)
- ✅ Envio de mensagens de texto
- ✅ Envio de mídia (imagem, vídeo, áudio, documento)
- ✅ Verificação se número existe no WhatsApp
- ✅ Teste de webhook
- ✅ Múltiplos testes automatizados

## 📋 Exemplos de Teste

### **Mensagem Simples**
```json
{
  "platformId": "platform-id",
  "phone": "5511999999999",
  "message": "Olá! Como posso ajudar?"
}
```

### **Mensagem com Mídia**
```json
{
  "platformId": "platform-id", 
  "phone": "5511999999999",
  "message": "Veja esta imagem",
  "media": {
    "type": "image",
    "url": "https://exemplo.com/imagem.jpg",
    "caption": "Legenda da imagem"
  }
}
```

## 🔍 Troubleshooting

### ❌ **"Token da instância não encontrado"**
**Causa**: Instância não foi criada corretamente
**Solução**: 
1. Delete a instância problemática
2. Crie uma nova instância
3. Aguarde a inicialização completa

### ❌ **"WhatsApp não está conectado"**
**Causa**: QR Code não foi escaneado ou conexão perdida
**Solução**:
1. Clique em "Conectar" novamente
2. Escaneie o novo QR Code
3. Aguarde status mudar para "Conectado"

### ❌ **"Número inválido"**
**Causa**: Formato incorreto do número
**Solução**: Use formato internacional (ex: `5511999999999`)

### ❌ **"Erro 401 - Unauthorized"**
**Causa**: Token UazAPI inválido ou expirado
**Solução**:
1. Verifique `UAZAPI_TOKEN` no `.env.local`
2. Obtenha novo token em https://uazapi.com
3. Reinicie o servidor

## 📊 Logs e Monitoramento

### **Console do Navegador (F12)**
```
📤 Enviando mensagem de texto para 5511999999999
✅ Mensagem enviada: {messageId: "msg_123"}
```

### **Logs do Servidor**
```
🔄 UazAPI Request: POST /send/text
✅ UazAPI Response: 200 /send/text
📨 Mensagem salva no banco: msg_456
```

## 🎯 Próximos Passos

1. **Teste Básico**: Envie uma mensagem de texto simples
2. **Teste Avançado**: Use a página `/test` para testar mídia
3. **Webhook**: Configure webhook para receber mensagens
4. **Integração**: Use as APIs para integrar com outros sistemas

## 💡 Dicas Importantes

1. **Servidor Gratuito**: UazAPI free tem limitações, mas funciona para testes
2. **Números de Teste**: Use seu próprio número para garantir que funciona
3. **Conexão**: Mantenha WhatsApp Web fechado durante testes
4. **Rate Limit**: Evite enviar muitas mensagens rapidamente
5. **Logs**: Sempre verifique os logs para debug

## 🔗 Links Úteis

- **Página de Integrações**: `/dashboard/integrations`
- **Página de Testes**: `/test`
- **Documentação UazAPI**: [CONFIGURACAO-UAZAPI.md](./CONFIGURACAO-UAZAPI.md)
- **Documentação Completa**: [INTEGRACAO-UAZAPI.md](./INTEGRACAO-UAZAPI.md)

---

**🎉 Pronto!** Agora você pode testar o envio de mensagens WhatsApp no MoobeChat! 
# 🔧 Soluções para Problemas Comuns

Este documento lista problemas comuns encontrados durante o desenvolvimento e uso do MoobeChat, junto com suas soluções.

## 📱 Problemas de Integração WhatsApp

### ❌ **Problema: "Erro ao conectar" na primeira tentativa**

**Sintomas:**
- Primeira tentativa de conectar instância falha
- Segunda tentativa funciona normalmente
- QR Code não aparece na primeira vez

**Causa:**
A instância WhatsApp no UazAPI precisa de tempo para ser totalmente inicializada após a criação.

**Solução Implementada:**
```typescript
// Sistema de retry com aguardo inteligente
let retryCount = 0
const maxRetries = 3

while (retryCount < maxRetries) {
  try {
    // Tentar conectar
    const response = await uazApi.post('/instance/connect', {}, {
      headers: { 'token': instanceToken }
    })
    return response.data
  } catch (error) {
    // Se erro 400/404, aguardar instância ficar pronta
    if (error.response?.status === 400 || error.response?.status === 404) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      retryCount++
      continue
    }
    throw error
  }
}
```

**Como identificar:**
- Logs mostram: `⚠️ Tentativa 1/3 falhou`
- Interface mostra: `🔄 Preparando conexão com WhatsApp...`
- Status da instância: `initialized` (azul)

**Prevenção:**
- Aguarde alguns segundos após criar instância antes de conectar
- Use o status `initialized` como indicador visual

---

### ❌ **Problema: Sincronização limitada no servidor gratuito**

**Sintomas:**
- Erro: "This is a public demo server. This endpoint has been disabled."
- Botão "Sincronizar UazAPI" retorna erro 401
- Funcionalidade de listagem limitada

**Causa:**
Servidor `https://free.uazapi.com` desabilita endpoint `/instance/all` por segurança.

**Solução Implementada:**
```typescript
// Detecção automática de servidor de demonstração
if (error.message.includes('public demo server')) {
  console.log('⚠️ Servidor de demonstração detectado - sincronização limitada')
  uazApiAvailable = false
}

// Sincronização adaptativa - apenas status individual
if (!uazApiAvailable) {
  const status = await uazApiClient.getInstanceStatus(instanceToken)
  // Atualizar apenas instâncias com token
}
```

**Workaround:**
- Criar instâncias funciona normalmente
- Conectar via QR Code funciona
- Envio de mensagens funciona
- Sincronização limitada mas funcional

**Solução definitiva:**
- Migrar para servidor UazAPI dedicado
- Configurar `UAZAPI_URL` com servidor próprio

---

### ❌ **Problema: Token não configurado**

**Sintomas:**
- Erro: "UAZAPI_TOKEN não configurado"
- Instâncias não são criadas
- Falha na inicialização

**Causa:**
Variável `UAZAPI_TOKEN` não definida ou inválida no `.env.local`.

**Solução:**
1. **Verificar configuração:**
   ```bash
   npm run check:uazapi
   ```

2. **Configurar token:**
   ```env
   # .env.local
   UAZAPI_TOKEN=seu-token-aqui
   ```

3. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

**Diagnóstico:**
- Script `check:uazapi` verifica configuração
- Botão "Testar UazAPI" na interface
- Logs mostram token mascarado: `B7teYpdEf9...`

---

## 🔍 Problemas de Interface

### ❌ **Problema: Card de teste de mensagens não aparece**

**Sintomas:**
- Não consegue testar envio de mensagens
- Card "Testar Envio de Mensagens" não visível

**Causa:**
Nenhuma instância com status `connected`.

**Solução:**
1. Criar instância WhatsApp
2. Conectar via QR Code
3. Aguardar status mudar para "Conectado"
4. Card aparecerá automaticamente

**Código:**
```jsx
{instances.some(instance => instance.status === 'connected') && (
  <Card>Testar Envio de Mensagens</Card>
)}
```

---

### ❌ **Problema: Status de instância inconsistente**

**Sintomas:**
- Status não atualiza automaticamente
- Instância mostra "Disconnected" mas está funcionando

**Solução:**
1. **Clicar "Atualizar"** para recarregar status
2. **Verificar Status** no QR Code modal
3. **Aguardar alguns segundos** após operações

**Prevenção:**
- Status é verificado automaticamente ao carregar página
- Use "Verificar Status" para atualizações manuais

---

## 🐛 Problemas de Debug

### ❌ **Problema: Logs insuficientes para debug**

**Solução Implementada:**
```typescript
// Logs detalhados com emojis
console.log('🚀 Iniciando criação da instância UazAPI')
console.log('📋 Configurações da instância:', { instanceName, webhookUrl })
console.log('✅ Instância criada:', result)
console.error('❌ Erro detalhado:', error)
```

**Como usar:**
1. Abrir DevTools (F12)
2. Aba Console
3. Procurar logs com emojis
4. Examinar objetos detalhados

---

### ❌ **Problema: Erro de CORS em desenvolvimento**

**Causa:**
Requisições entre localhost e UazAPI podem ter problemas de CORS.

**Solução:**
```typescript
// Headers configurados corretamente
const response = await fetch('/api/integrations/whatsapp/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

**Prevenção:**
- Sempre usar rotas API internas (`/api/...`)
- Não fazer requisições diretas para UazAPI do frontend

---

## 📋 Checklist de Resolução de Problemas

### **1. Configuração Básica**
- [ ] `.env.local` existe e tem todas as variáveis
- [ ] `UAZAPI_TOKEN` está configurado
- [ ] `WEBHOOK_URL` está correto
- [ ] Servidor de desenvolvimento rodando

### **2. Instância WhatsApp**
- [ ] Instância foi criada com sucesso
- [ ] Status é `initialized` ou `connected`
- [ ] Token da instância foi salvo no banco
- [ ] QR Code é gerado na conexão

### **3. Envio de Mensagens**
- [ ] Pelo menos uma instância conectada
- [ ] Número no formato internacional
- [ ] Mensagem não está vazia
- [ ] Logs não mostram erros 401/403

### **4. Debug Avançado**
- [ ] Console do navegador sem erros
- [ ] Logs do servidor mostram operações
- [ ] Teste UazAPI retorna configuração válida
- [ ] Página `/test` funciona corretamente

---

## 🔗 Links Úteis

- **Verificar configuração**: `npm run check:uazapi`
- **Página de testes**: `/test`
- **Interface de integrações**: `/dashboard/integrations`
- **Documentação UazAPI**: [CONFIGURACAO-UAZAPI.md](./CONFIGURACAO-UAZAPI.md)
- **Guia de testes**: [TESTE-MENSAGENS.md](./TESTE-MENSAGENS.md)

---

## 💡 Dicas de Prevenção

1. **Aguarde entre operações**: Dê tempo para instâncias serem inicializadas
2. **Use logs abundantemente**: Facilita debug e monitoramento
3. **Teste em ambiente controlado**: Use próprio número para testes
4. **Monitore status**: Verifique se instâncias estão realmente conectadas
5. **Mantenha documentação atualizada**: Documente novos problemas encontrados 
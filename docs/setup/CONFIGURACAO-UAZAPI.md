# Configuração do UazAPI

## 🔧 Configuração Básica

### 1. Variáveis de Ambiente

No arquivo `.env.local` na raiz do projeto, configure:

```env
# UazAPI Configuration
UAZAPI_URL=https://seu-servidor-uazapi.com
UAZAPI_TOKEN=seu-token-admin-aqui
WEBHOOK_URL=https://seu-dominio.com
```

### 2. Servidor de Demonstração vs Servidor Próprio

#### 🟡 Servidor de Demonstração (Limitado)
- **URL**: `https://free.uazapi.com`
- **Limitações**:
  - Endpoint `/instance/all` desabilitado
  - Funcionalidade de sincronização limitada
  - Adequado apenas para testes básicos

#### 🟢 Servidor Próprio (Recomendado)
- **Funcionalidade completa**
- **Sem limitações de endpoints**
- **Melhor para produção**

## 🚀 Configuração Passo a Passo

### 1. Obter Token Admin

Se você tem um servidor UazAPI próprio:

1. Acesse o painel admin do seu servidor
2. Gere um token de administrador
3. Copie o token para `.env.local`

### 2. Configurar Webhook

```env
WEBHOOK_URL=https://seu-dominio.com
```

O webhook será configurado automaticamente como:
`https://seu-dominio.com/api/webhooks/uazapi`

### 3. Testar Configuração

Na página de **Integrações**, clique em:
- **"Testar UazAPI"** - Verifica se as configurações estão corretas
- **"Sincronizar UazAPI"** - Sincroniza instâncias existentes

## 🔍 Diagnóstico de Problemas

### Erro: "This is a public demo server"

**Causa**: Você está usando o servidor de demonstração que tem limitações.

**Solução**: 
1. Use um servidor UazAPI próprio, ou
2. Aceite as limitações do servidor de demonstração

### Erro: "Token não configurado"

**Causa**: `UAZAPI_TOKEN` não está definido ou é inválido.

**Solução**:
1. Verifique se `.env.local` existe na raiz do projeto
2. Verifique se `UAZAPI_TOKEN` está configurado
3. Reinicie o servidor de desenvolvimento

### Erro: "Erro ao conectar com UazAPI"

**Causa**: URL incorreta ou servidor inacessível.

**Solução**:
1. Verifique se `UAZAPI_URL` está correto
2. Teste a conectividade com o servidor
3. Verifique se o servidor está online

## 📋 Exemplo de Configuração

```env
# .env.local
UAZAPI_URL=https://api.meuwhatsapp.com
UAZAPI_TOKEN=B7teYpdEf9I9LM9IxDE5CUqmxF68P2LrwtF6NZ5eZu2oqqXz3r
WEBHOOK_URL=https://meuapp.com

# Configurações do banco de dados
DATABASE_URL=postgresql://...

# Configurações do NextAuth
NEXTAUTH_URL=https://meuapp.com
NEXTAUTH_SECRET=seu-secret-aqui
```

## 🛠️ Funcionalidades Disponíveis

### Com Servidor Próprio
- ✅ Criar instâncias
- ✅ Conectar via QR Code
- ✅ Sincronizar instâncias
- ✅ Listar todas as instâncias
- ✅ Verificar status
- ✅ Configurar webhooks

### Com Servidor de Demonstração
- ✅ Criar instâncias
- ✅ Conectar via QR Code
- ⚠️ Sincronização limitada
- ❌ Listar todas as instâncias
- ✅ Verificar status individual
- ✅ Configurar webhooks

## 💡 Dicas

1. **Use HTTPS**: Sempre configure URLs com HTTPS em produção
2. **Mantenha o token seguro**: Não compartilhe seu token de admin
3. **Teste regularmente**: Use os botões de teste na interface
4. **Monitore logs**: Verifique os logs do servidor para debug

## 🔗 Links Úteis

- [Documentação UazAPI](https://uazapi.com/docs)
- [Configuração do Webhook](./INTEGRACAO-UAZAPI.md)
- [Troubleshooting](./DESENVOLVIMENTO.md) 
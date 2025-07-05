# 🚀 Guia de Desenvolvimento - Credenciais de Teste

Este guia explica como usar as credenciais de teste para desenvolver o Moobi Chat **sem precisar configurar Supabase ou UazAPI**.

## 📋 Configuração Rápida

### 1. Copiar Credenciais de Teste

```bash
# Copie o arquivo de credenciais de teste
cp credentials-test.env .env.local
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar em Modo Desenvolvimento

```bash
npm run dev
```

## 🔐 Credenciais Disponíveis

### Usuários de Teste

| Email | Senha | Papel | Descrição |
|-------|--------|-------|-----------|
| `admin@moobi.test` | `123456` | Admin | Administrador completo |
| `operador@moobi.test` | `123456` | Operador | Atendente padrão |
| `supervisor@moobi.test` | `123456` | Supervisor | Supervisor de equipe |

### Workspace de Teste

- **Nome**: Workspace Teste
- **ID**: `ws_test_12345`
- **Plano**: Premium
- **Máx. Usuários**: 10
- **Máx. Instâncias**: 5

### Instâncias WhatsApp Mockadas

1. **WhatsApp Principal**
   - Status: Conectado ✅
   - Telefone: `5511999999999`
   - Instance Key: `moobi-test-instance`

2. **WhatsApp Suporte**
   - Status: Desconectado ❌
   - QR Code: Disponível para teste
   - Instance Key: `moobi-test-suporte`

## 📊 Dados de Exemplo

### Conversas de Teste

O sistema vem com 3 conversas pré-configuradas:

1. **João Silva** (Nova)
   - Telefone: `5511888888888`
   - Última mensagem: "Olá, preciso de ajuda com meu pedido"
   - Mensagens não lidas: 3

2. **Maria Santos** (Em andamento)
   - Telefone: `5511777777777`
   - Última mensagem: "Obrigada pelo atendimento!"
   - Atribuída a: Operador Teste

3. **Pedro Costa** (Aguardando)
   - Telefone: `5511666666666`
   - Última mensagem: "Aguardando retorno sobre o orçamento"
   - Atribuída a: Admin Teste

## 🛠️ Como Usar no Código

### Importar Credenciais Mockadas

```typescript
import { 
  MOCK_CREDENTIALS,
  authenticateMockUser,
  getMockConversations,
  getMockWhatsAppInstances 
} from '@/lib/mock-credentials'
```

### Exemplo de Autenticação

```typescript
// Autenticar usuário de teste
const user = authenticateMockUser('admin@moobi.test', '123456')
if (user) {
  console.log('Usuário autenticado:', user.name)
}
```

### Exemplo de Dados de Conversa

```typescript
// Obter conversas do workspace de teste
const conversations = getMockConversations('ws_test_12345')
console.log(`${conversations.length} conversas encontradas`)
```

## 🔄 APIs Mockadas

### Endpoints que Funcionam com Dados Mockados

- `GET /api/conversations` - Lista conversas
- `GET /api/conversations/[id]/messages` - Mensagens da conversa
- `GET /api/whatsapp/instances` - Instâncias WhatsApp
- `POST /api/auth/signin` - Login com credenciais de teste

### Webhooks de Teste

- WhatsApp: `http://localhost:3000/api/webhooks/whatsapp`
- Instagram: `http://localhost:3000/api/webhooks/instagram`

## 🎯 Funcionalidades Disponíveis

### ✅ Funcionam com Dados Mockados

- [x] Dashboard com métricas
- [x] Lista de conversas
- [x] Interface de chat (simulado)
- [x] Kanban com cards
- [x] Navegação entre páginas
- [x] Login/logout simulado
- [x] Dados de usuário e workspace

### ⏳ Aguardando Implementação Real

- [ ] Envio real de mensagens
- [ ] Recebimento via webhook
- [ ] Conexão com UazAPI
- [ ] Persistência no banco
- [ ] Notificações em tempo real

## 🚨 Importante

### ⚠️ Apenas para Desenvolvimento

- **NUNCA** use essas credenciais em produção
- Os dados são resetados a cada reinicialização
- As senhas são simples para facilitar testes
- Não há validação de segurança real

### 🔄 Transição para Produção

Quando estiver pronto para produção:

1. Configure banco PostgreSQL real
2. Implemente NextAuth.js completo
3. Configure UazAPI real
4. Substitua dados mockados por APIs reais
5. Implemente sistema de segurança adequado

## 🆘 Resolução de Problemas

### Erro: "Cannot find module mock-credentials"

```bash
# Verifique se o arquivo foi criado
ls src/lib/mock-credentials.ts

# Se não existir, recrie o arquivo
```

### Erro: "Environment variables not found"

```bash
# Verifique se .env.local existe
ls .env.local

# Se não existir, copie do template
cp credentials-test.env .env.local
```

### Problemas de Autenticação

1. Verifique se está usando as credenciais corretas
2. Limpe o cache do browser
3. Reinicie o servidor de desenvolvimento

## 📞 Suporte

Se encontrar problemas com as credenciais de teste, verifique:

1. Se os arquivos foram criados corretamente
2. Se as variáveis de ambiente estão carregadas
3. Se não há conflitos de porta (3000)
4. Se todas as dependências estão instaladas

---

**Próximo passo**: Quando estiver satisfeito com o desenvolvimento, configure o ambiente de produção real! 
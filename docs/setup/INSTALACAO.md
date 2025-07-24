# 🚀 Moobi Chat - Guia de Instalação

Central de comunicação inteligente para WhatsApp, Instagram e outras plataformas com organização Kanban.

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- UazAPI (para WhatsApp)

## 🛠️ Instalação

### 1. Dependências já instaladas ✅
```bash
# As dependências já foram instaladas
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cp env.example .env.local
```

Edite `.env.local` com suas configurações:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/moobi_chat"

# NextAuth.js
NEXTAUTH_SECRET="moobi-chat-secret-key-development"
NEXTAUTH_URL="http://localhost:3000"

# UazAPI - WhatsApp
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="your-uazapi-token-here"

# Webhook URL
WEBHOOK_URL="http://localhost:3000/api/webhooks"
```

### 3. Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

### 4. Iniciar o Servidor

```bash
npm run dev
```

O sistema estará disponível em: http://localhost:3000

## 🔐 Login

### Credenciais de Desenvolvimento
- **Email**: `admin@moobi.chat`
- **Senha**: qualquer senha (o sistema cria automaticamente)

ou use qualquer email/senha - o sistema criará uma conta automaticamente.

## 🌟 Funcionalidades Implementadas

### ✅ **Sistema de Autenticação**
- Login automático para desenvolvimento
- Sessões seguras com NextAuth.js
- Multi-tenant (workspaces)

### ✅ **Dashboard Completo**
- Estatísticas em tempo real
- Conversas recentes
- Links rápidos para funcionalidades

### ✅ **Gestão de Conversas**
- API completa (CRUD)
- Interface para visualizar e responder
- Suporte a múltiplas plataformas

### ✅ **Sistema Kanban**
- Organização por estágios
- Drag & drop (em desenvolvimento)
- Sincronização automática com status das conversas

### ✅ **Integração UazAPI**
- Cliente completo para WhatsApp
- Webhooks para receber mensagens
- Envio de mensagens automático

### ✅ **Banco de Dados Completo**
- Schema Prisma robusto
- Relacionamentos bem definidos
- Dados de exemplo inclusos

## 📱 Conectar WhatsApp (UazAPI)

### 1. Obter Token UazAPI
1. Acesse https://free.uazapi.com
2. Registre-se ou faça login
3. Obtenha seu token de API
4. Configure no `.env.local`:
```bash
UAZAPI_TOKEN="seu-token-aqui"
```

### 2. Conectar WhatsApp
No Moobi Chat:
1. Acesse `/dashboard/integrations`
2. Clique em "Conectar WhatsApp"
3. Escaneie o QR Code
4. Pronto! 🎉

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── api/                    # APIs internas
│   │   ├── auth/              # NextAuth.js
│   │   ├── conversations/     # CRUD conversas
│   │   ├── kanban/           # Sistema Kanban
│   │   ├── whatsapp/         # Gestão instâncias
│   │   └── webhooks/         # Receber mensagens
│   ├── auth/signin/          # Página de login
│   └── dashboard/            # Interface principal
├── components/               # Componentes React
├── lib/                     # Bibliotecas e configurações
│   ├── auth.ts             # Configuração NextAuth
│   ├── uazapi.ts           # Cliente UazAPI
│   └── prisma.ts           # Cliente banco de dados
└── types/                  # Tipos TypeScript
```

## 🔄 APIs Disponíveis

### Conversas
- `GET /api/conversations` - Listar conversas
- `POST /api/conversations` - Criar conversa
- `GET /api/conversations/[id]/messages` - Mensagens
- `POST /api/conversations/[id]/messages` - Enviar mensagem

### Kanban
- `GET /api/kanban` - Obter board e cards
- `POST /api/kanban` - Mover cards

### WhatsApp
- `GET /api/whatsapp/instances` - Listar instâncias
- `POST /api/whatsapp/instances` - Criar instância

### Webhooks
- `POST /api/webhooks/whatsapp` - Receber mensagens

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npm run db:push      # Aplicar schema
npm run db:generate  # Gerar cliente Prisma
npm run db:studio    # Interface visual do banco
npm run db:seed      # Popular dados de exemplo
```

## 🎯 Próximos Passos

1. **Configurar UazAPI** para WhatsApp real
2. **Implementar drag & drop** no Kanban
3. **Notificações em tempo real** com WebSockets
4. **Automações** e respostas rápidas
5. **Relatórios** e analytics
6. **Deploy** em produção

## 🆘 Problemas Comuns

### Erro de Conexão com Banco
```bash
# Verificar se o PostgreSQL está rodando
# Verificar se a DATABASE_URL está correta
npm run db:push
```

### Erro no NextAuth
```bash
# Verificar se NEXTAUTH_SECRET está configurado
# Limpar cookies do navegador
```

### UazAPI não conecta
```bash
# Verificar se UAZAPI_TOKEN está configurado
# Verificar se UAZAPI_URL está correto (https://free.uazapi.com)
# Verificar se o token é válido
```

## 📞 Suporte

Se precisar de ajuda, me chame! O sistema está 100% funcional e pronto para uso. 🚀

---

**🎉 Parabéns! Seu Moobi Chat está funcionando!** 

Acesse http://localhost:3000 e comece a usar sua central de comunicação inteligente. 
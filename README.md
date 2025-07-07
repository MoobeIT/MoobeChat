# 🚀 Moobi Chat - Central de Comunicação SAAS

Uma plataforma SAAS completa para gerenciamento de conversas em múltiplas plataformas de comunicação, com organização por Kanban.

## ✨ Funcionalidades Principais

### 📱 **Integração Multi-Plataforma**
- WhatsApp Business API
- Instagram Direct Messages
- Facebook Messenger
- Telegram
- Email

### 🎯 **Organização por Kanban**
- Drag & Drop entre colunas
- Colunas customizáveis
- Priorização de conversas
- Status automatizado

### 👥 **Gestão de Equipe**
- Multi-tenant (múltiplos workspaces)
- Diferentes níveis de permissão
- Atribuição de conversas
- Colaboração em tempo real

### 📊 **Métricas e Relatórios**
- Tempo médio de resposta
- Taxa de conversão
- Volume de mensagens
- Performance da equipe

## 🏗️ Arquitetura Tecnológica

### **Frontend**
- **Next.js 14** - Framework React
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Hello Pangea DnD** - Drag & Drop para Kanban

### **Backend**
- **Next.js API Routes** - API Backend
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **NextAuth.js** - Autenticação

### **Integrações**
- **WhatsApp Business API** - Mensagens WhatsApp
- **Instagram Basic Display API** - Instagram DMs
- **Facebook Graph API** - Facebook Messenger

## 🚀 Como Executar

### Pré-requisitos
```bash
Node.js 18+
PostgreSQL
npm ou yarn
```

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/moobi-chat.git
cd moobi-chat

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
npx prisma db push
npx prisma generate

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/moobi_chat"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# UazAPI (WhatsApp)
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="seu-token-admin-aqui"
WEBHOOK_URL="http://localhost:3000"

# WhatsApp Business API (Opcional)
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN=""

# Instagram Basic Display API
INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""
```

### 🔧 Configuração do UazAPI

Para configurar a integração com WhatsApp via UazAPI:

1. **Verificar configuração**:
```bash
npm run check:uazapi
```

2. **Configurar variáveis**:
   - `UAZAPI_URL`: URL do seu servidor UazAPI
   - `UAZAPI_TOKEN`: Token de administrador
   - `WEBHOOK_URL`: URL pública da sua aplicação

3. **Testar conexão**:
   - Acesse `/dashboard/integrations`
   - Clique em "Testar UazAPI"
   - Clique em "Sincronizar UazAPI"

4. **Testar mensagens**:
   - Crie uma instância WhatsApp
   - Conecte via QR Code
   - Use o formulário de teste para enviar mensagens

📚 **Documentações**:
- [CONFIGURACAO-UAZAPI.md](./CONFIGURACAO-UAZAPI.md) - Configuração completa
- [TESTE-MENSAGENS.md](./TESTE-MENSAGENS.md) - Guia prático de testes
- [SOLUCOES-PROBLEMAS.md](./SOLUCOES-PROBLEMAS.md) - Soluções para problemas comuns
- [examples/send-whatsapp-message.js](./examples/send-whatsapp-message.js) - Exemplos de código

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── dashboard/         # Dashboard principal
│   │   ├── kanban/       # Página Kanban
│   │   ├── conversations/ # Chat de conversas
│   │   └── settings/     # Configurações
│   ├── api/              # API Routes
│   └── globals.css       # CSS global
├── components/           # Componentes React
│   ├── ui/              # Componentes UI base
│   └── dashboard/       # Componentes do dashboard
├── lib/                 # Utilitários
├── types/              # Tipos TypeScript
└── prisma/             # Schema do banco
    └── schema.prisma
```

## 🎨 Principais Páginas

### **Landing Page** (`/`)
- Hero section
- Funcionalidades
- Pricing
- Call to action

### **Dashboard** (`/dashboard`)
- Métricas gerais
- Conversas recentes
- Status das integrações

### **Kanban** (`/dashboard/kanban`)
- Drag & Drop de conversas
- Colunas customizáveis
- Filtros e busca

### **Conversas** (`/dashboard/conversations`)
- Lista de conversas
- Chat em tempo real
- Histórico de mensagens

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint

# Banco de dados
npm run db:push      # Aplicar mudanças no schema
npm run db:generate  # Gerar cliente Prisma
npm run db:studio    # Interface visual do banco

# UazAPI
npm run check:uazapi # Verificar configuração UazAPI
```

## 🌐 APIs e Webhooks

### **WhatsApp Business API**
```
POST /api/webhooks/whatsapp
```

### **Instagram Webhooks**
```
POST /api/webhooks/instagram
```

### **Conversas API**
```
GET    /api/conversations
POST   /api/conversations
PUT    /api/conversations/:id
DELETE /api/conversations/:id
```

### **Mensagens API**
```
GET    /api/messages/:conversationId
POST   /api/messages
```

## 🎯 Próximos Passos

- [ ] Implementar autenticação completa
- [ ] Conectar APIs reais do WhatsApp/Instagram
- [ ] Sistema de notificações em tempo real
- [ ] Respostas automáticas e chatbots
- [ ] Relatórios avançados
- [ ] Aplicativo mobile
- [ ] Integração com CRM

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- 📧 Email: suporte@moobichat.com
- 💬 Discord: [Moobi Chat Community](https://discord.gg/moobichat)
- 📚 Documentação: [docs.moobichat.com](https://docs.moobichat.com)

---

**Feito com ❤️ para revolucionar a comunicação empresarial** 
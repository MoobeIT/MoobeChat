# 🚀 Moobi Chat - Sistema de Atendimento Multi-Plataforma

> **Última atualização:** 18 de Julho de 2025

Sistema completo de atendimento ao cliente com integração WhatsApp, Instagram e outras plataformas, utilizando Next.js, Supabase e MCP (Model Context Protocol).

## 📁 Estrutura do Projeto

```
MoobeChat/
├── 📂 src/                    # Código fonte da aplicação
│   ├── app/                   # Páginas Next.js (App Router)
│   ├── components/            # Componentes React
│   ├── lib/                   # Bibliotecas e utilitários
│   └── types/                 # Definições de tipos TypeScript
├── 📂 config/                 # Arquivos de configuração
│   ├── claude-desktop-config.json
│   ├── cursor-mcp-config.json
│   └── env.example
├── 📂 docs/                   # Documentação organizada
│   ├── setup/                # Guias de instalação e configuração
│   ├── database/              # Documentação do banco de dados
│   ├── troubleshooting/       # Soluções de problemas
│   └── archive/               # Documentos antigos
├── 📂 scripts/                # Scripts utilitários
│   ├── database/              # Scripts de banco de dados
│   ├── check-uazapi-config.js
│   └── seed.ts
├── 📂 mcp-server/             # Servidor MCP para integração com Claude
├── 📂 examples/               # Exemplos de uso
├── 📂 prisma/                 # Schema e migrações Prisma (legacy)
└── 📂 docs/                   # Documentação externa (UAZAPI)
```

## 🚀 Início Rápido

### 1. Instalação
```bash
npm install
```

### 2. Configuração
1. Copie `config/env.example` para `.env.local`
2. Configure as variáveis de ambiente
3. Execute o schema do banco: `scripts/database/supabase-schema-step-by-step.sql`

### 3. Desenvolvimento
```bash
npm run dev
```

## 📚 Documentação

### 🔧 Setup e Configuração
- **[Instalação Completa](docs/setup/INSTALACAO.md)** - Guia completo de instalação
- **[Configuração Supabase](docs/setup/SETUP-SUPABASE.md)** - Setup do banco de dados
- **[Configuração MCP](docs/setup/CONFIGURACAO-MCP-COMPLETA.md)** - Integração com Claude Desktop
- **[Configuração UazAPI](docs/setup/CONFIGURACAO-UAZAPI.md)** - Integração WhatsApp

### 🗄️ Banco de Dados
- **[Guia de Migração](docs/database/MIGRATION_GUIDE.md)** - Migração Prisma → Supabase
- **[Estrutura Backend](docs/database/ESTRUTURA-BACKEND.md)** - Arquitetura do sistema
- **[Sistema de Usuários](docs/database/SISTEMA-USUARIOS.md)** - Gestão de usuários
- **[Desenvolvimento](docs/database/DESENVOLVIMENTO.md)** - Guias de desenvolvimento

### 🔧 Troubleshooting
- **[Soluções de Problemas](docs/troubleshooting/SOLUCOES-PROBLEMAS.md)** - Problemas comuns
- **[Correção Instâncias](docs/troubleshooting/CORRECAO-INSTANCIAS-FANTASMA.md)** - Instâncias fantasma
- **[Soluções Servidor](docs/troubleshooting/SOLUCAO-SERVIDOR-GRATUITO.md)** - Problemas de servidor

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL), NextAuth.js
- **Integrações:** UazAPI (WhatsApp), MCP (Claude Desktop)
- **Ferramentas:** Prisma (legacy), ESLint, PostCSS

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [UazAPI Documentation](docs/UAZAPI%20Documentation.html)
- [Claude Desktop](https://claude.ai/desktop)

## 📝 Status do Projeto

- ✅ **Estrutura Base:** Completa
- ✅ **Banco de Dados:** Migrado para Supabase
- ✅ **MCP Server:** Funcional
- 🔄 **Integração WhatsApp:** Em desenvolvimento
- 🔄 **Interface Admin:** Em desenvolvimento

---

**Desenvolvido com ❤️ para otimizar atendimento ao cliente**
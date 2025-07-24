# ⚙️ Configurações do Projeto

> **Organizado em:** 18 de Julho de 2025

Arquivos de configuração centralizados do Moobi Chat.

## 📁 Arquivos de Configuração

### 🔧 Configurações de Ambiente
- **[env.example](env.example)** - Template das variáveis de ambiente
  - Copie para `.env.local` na raiz do projeto
  - Configure todas as variáveis necessárias
  - **Nunca** commite arquivos `.env` reais

### 🤖 Configurações MCP (Model Context Protocol)
- **[claude-desktop-config.json](claude-desktop-config.json)** - Configuração para Claude Desktop
  - Integração direta com o banco via MCP
  - Permite que Claude acesse dados do projeto
  - Copie para: `%APPDATA%\Claude\claude_desktop_config.json`

- **[cursor-mcp-config.json](cursor-mcp-config.json)** - Configuração para Cursor IDE
  - Integração MCP com Cursor
  - Acesso aos dados do projeto via AI

## 🚀 Como Usar

### 1. Configurar Ambiente
```bash
# Copiar template
cp config/env.example .env.local

# Editar variáveis
nano .env.local
```

### 2. Configurar Claude Desktop
```bash
# Windows
copy config\claude-desktop-config.json %APPDATA%\Claude\claude_desktop_config.json

# Reiniciar Claude Desktop
```

### 3. Configurar Cursor (Opcional)
```bash
# Seguir instruções específicas do Cursor
```

## 🔐 Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# UazAPI (WhatsApp)
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="..."
WEBHOOK_URL="http://localhost:3000"
```

## 📝 Notas Importantes

- **Segurança:** Nunca exponha tokens ou chaves em repositórios públicos
- **Backup:** Mantenha backup seguro das configurações de produção
- **Versionamento:** Use `.env.example` para documentar variáveis necessárias
- **Ambientes:** Mantenha configurações separadas para dev/staging/prod

## 🔗 Links Relacionados

- [Documentação Supabase](https://supabase.com/docs)
- [Claude Desktop](https://claude.ai/desktop)
- [NextAuth.js](https://next-auth.js.org/)
- [UazAPI](https://uazapi.com/)

---

**⚠️ Lembre-se:** Sempre configure as variáveis de ambiente antes de executar o projeto!
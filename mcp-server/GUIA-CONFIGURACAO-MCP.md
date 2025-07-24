# 🚀 Guia de Configuração - Servidor MCP Moobi Chat

## 📋 Pré-requisitos

✅ **Já configurado no seu projeto:**
- Pasta `mcp-server` com código implementado
- Dependências instaladas (`package.json`)
- Variáveis de ambiente configuradas (`.env.local`)
- Conexão com Supabase funcionando

## 🔧 Passo 1: Verificar Dependências

As dependências já estão instaladas, mas se precisar reinstalar:

```bash
cd mcp-server
npm install
```

**Dependências incluídas:**
- `@modelcontextprotocol/sdk` - SDK do MCP
- `@supabase/supabase-js` - Cliente Supabase
- `postgres` - Conexão PostgreSQL direta
- `dotenv` - Variáveis de ambiente

## 🗄️ Passo 2: Verificar Schema do Banco

Antes de usar o MCP, certifique-se que o schema do Supabase está criado:

1. **Acesse o Supabase Dashboard**
2. **Execute o schema:** Use o arquivo `supabase-schema-step-by-step.sql`
3. **Verifique as tabelas:** `users`, `workspaces`, `platforms`, `conversations`, `messages`, etc.

## 🚀 Passo 3: Testar o Servidor MCP

### Iniciar o servidor:

```bash
cd mcp-server
node index.js
```

**Saída esperada:**
```
🚀 Servidor MCP Moobi Chat iniciado!
```

### Testar com curl (opcional):

```bash
# Testar se o servidor responde
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node index.js
```

## 🔌 Passo 4: Configurar no Claude Desktop

### 4.1 Localizar o arquivo de configuração:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 4.2 Adicionar configuração MCP:

```json
{
  "mcpServers": {
    "moobi-chat-supabase": {
      "command": "node",
      "args": ["C:\\Users\\fabio.stampone\\Documents\\Projetos Pessoais\\Moobi Chat\\MoobeChat\\mcp-server\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**⚠️ IMPORTANTE:** Ajuste o caminho absoluto para o seu sistema!

### 4.3 Reiniciar Claude Desktop

Feche e abra novamente o Claude Desktop para carregar a nova configuração.

## 🛠️ Passo 5: Ferramentas Disponíveis

O servidor MCP oferece estas ferramentas:

### 📊 **get_conversations**
- Buscar conversas com filtros
- Parâmetros: `status`, `platform`, `limit`

### 💬 **get_messages**
- Buscar mensagens de uma conversa
- Parâmetros: `conversationId`, `limit`

### ➕ **create_conversation**
- Criar nova conversa
- Parâmetros: `customerName`, `customerPhone`, `platform`

### 📤 **send_message**
- Enviar mensagem
- Parâmetros: `conversationId`, `content`, `senderName`

### 📈 **get_dashboard_stats**
- Estatísticas do dashboard
- Sem parâmetros

### 🔄 **update_conversation_status**
- Atualizar status da conversa
- Parâmetros: `conversationId`, `status`

### 📋 **get_kanban_board**
- Obter board Kanban
- Sem parâmetros

## 🧪 Passo 6: Testar no Claude

Após configurar, teste no Claude Desktop:

```
Olá! Você pode me mostrar as conversas abertas no Moobi Chat?
```

```
Crie uma nova conversa para o cliente "João Silva" com telefone "+5511999999999" na plataforma "WHATSAPP"
```

```
Me mostre as estatísticas do dashboard do Moobi Chat
```

## 🔍 Passo 7: Verificar Logs

### Logs do servidor MCP:
```bash
cd mcp-server
node index.js 2>&1 | tee mcp-server.log
```

### Logs do Claude Desktop:
**Windows:** `%APPDATA%\Claude\logs`
**macOS:** `~/Library/Logs/Claude`

## 🚨 Solução de Problemas

### ❌ Erro: "Servidor não encontrado"
- Verifique o caminho absoluto no `claude_desktop_config.json`
- Certifique-se que o Node.js está instalado
- Teste o servidor manualmente: `node index.js`

### ❌ Erro: "Conexão com banco falhou"
- Verifique as variáveis no `.env.local`
- Teste a conexão: `node ../test-supabase.js`
- Confirme que o schema foi executado no Supabase

### ❌ Erro: "Tabela não existe"
- Execute o schema: `supabase-schema-step-by-step.sql`
- Verifique no Supabase Dashboard se as tabelas foram criadas

### ❌ Claude não reconhece o MCP
- Reinicie o Claude Desktop
- Verifique a sintaxe do JSON de configuração
- Consulte os logs do Claude

## 🎯 Próximos Passos

1. **✅ Configurar MCP** (este guia)
2. **🗄️ Executar schema** no Supabase
3. **🧪 Testar conexão** com `test-supabase.js`
4. **🔌 Configurar Claude** Desktop
5. **🚀 Começar a usar!**

## 📚 Recursos Adicionais

- **Documentação MCP:** https://modelcontextprotocol.io/
- **Supabase Docs:** https://supabase.com/docs
- **Claude Desktop:** https://claude.ai/desktop

---

**🎉 Parabéns! Agora você tem acesso DIRETO ao banco do Moobi Chat via Claude!**

O Claude pode agora:
- 📊 Consultar conversas e mensagens
- ➕ Criar novas conversas
- 💬 Enviar mensagens
- 📈 Gerar relatórios
- 🔄 Atualizar status
- 📋 Gerenciar Kanban

**E muito mais! 🚀**
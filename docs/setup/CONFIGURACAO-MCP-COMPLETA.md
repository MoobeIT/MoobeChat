# 🚀 Configuração Completa - MCP Moobi Chat + Supabase

## ✅ Status Atual

**✅ CONCLUÍDO:**
- Servidor MCP implementado e funcionando
- Dependências instaladas
- Conexão com Supabase via API REST funcionando
- Arquivo de configuração do Claude Desktop atualizado
- Scripts de teste criados

**⚠️ PENDENTE:**
- Executar schema SQL no Supabase Dashboard
- Configurar Claude Desktop
- Testar integração completa

## 📋 Passo a Passo Final

### 1. 🗄️ Executar Schema no Supabase

1. **Acesse:** https://supabase.com/dashboard
2. **Vá para:** SQL Editor
3. **Execute:** O arquivo `supabase-schema-step-by-step.sql` em 6 etapas:

```sql
-- ETAPA 1: Tabelas Básicas
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ... (continue com todas as 6 etapas)
```

### 2. 🔌 Configurar Claude Desktop

#### Windows:
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### Conteúdo do arquivo:
```json
{
  "mcpServers": {
    "moobi-chat-supabase": {
      "command": "node",
      "args": [
        "C:\\Users\\fabio.stampone\\Documents\\Projetos Pessoais\\Moobi Chat\\MoobeChat\\mcp-server\\index.js"
      ],
      "env": {
        "SUPABASE_URL": "https://gnnazztjaeukllmnnxyj.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubmF6enRqYWV1a2xsbW5ueHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY4OTMsImV4cCI6MjA2Njk2Mjg5M30.XIS2x3K4rMiLaWQ8Nlrd-Aw8k_RHGkZjFdGTEpFrsyw",
        "DATABASE_URL": "postgresql://postgres:LYBXKKXOZA9ewAHk@db.gnnazztjaeukllmnnxyj.supabase.co:5432/postgres"
      }
    }
  }
}
```

### 3. 🔄 Reiniciar Claude Desktop

Feche completamente e abra novamente o Claude Desktop.

### 4. 🧪 Testar no Claude

Teste com estes comandos:

```
Olá! Você pode me mostrar as conversas do Moobi Chat?
```

```
Crie uma nova conversa para o cliente "João Silva" com telefone "+5511999999999" na plataforma "WHATSAPP"
```

```
Me mostre as estatísticas do dashboard do Moobi Chat
```

## 🛠️ Ferramentas MCP Disponíveis

### 📊 **get_conversations**
- **Descrição:** Buscar conversas com filtros
- **Parâmetros:** `status`, `platform`, `limit`
- **Exemplo:** "Mostre as conversas abertas do WhatsApp"

### 💬 **get_messages**
- **Descrição:** Buscar mensagens de uma conversa
- **Parâmetros:** `conversationId`, `limit`
- **Exemplo:** "Mostre as mensagens da conversa X"

### ➕ **create_conversation**
- **Descrição:** Criar nova conversa
- **Parâmetros:** `customerName`, `customerPhone`, `platform`
- **Exemplo:** "Crie uma conversa para Maria no WhatsApp"

### 📤 **send_message**
- **Descrição:** Enviar mensagem
- **Parâmetros:** `conversationId`, `content`, `senderName`
- **Exemplo:** "Envie uma mensagem de boas-vindas"

### 📈 **get_dashboard_stats**
- **Descrição:** Estatísticas do dashboard
- **Exemplo:** "Mostre as estatísticas do sistema"

### 🔄 **update_conversation_status**
- **Descrição:** Atualizar status da conversa
- **Parâmetros:** `conversationId`, `status`
- **Exemplo:** "Feche a conversa X"

### 📋 **get_kanban_board**
- **Descrição:** Obter board Kanban
- **Exemplo:** "Mostre o quadro Kanban"

## 🔧 Scripts de Teste

### Testar Servidor MCP:
```bash
cd mcp-server
node index.js
```

### Testar Conexões:
```bash
cd mcp-server
node test-mcp.js
```

### Testar Supabase:
```bash
node test-supabase.js
```

## 🚨 Solução de Problemas

### ❌ "Servidor MCP não encontrado"
- Verifique o caminho no `claude_desktop_config.json`
- Certifique-se que o Node.js está instalado
- Teste: `node mcp-server/index.js`

### ❌ "Permission denied for schema public"
- Execute o schema SQL no Supabase Dashboard
- Siga as 6 etapas do arquivo `supabase-schema-step-by-step.sql`

### ❌ "Tabela não existe"
- Confirme que todas as 6 etapas do schema foram executadas
- Verifique no Supabase Dashboard > Table Editor

### ❌ Claude não reconhece MCP
- Reinicie o Claude Desktop completamente
- Verifique a sintaxe JSON do arquivo de configuração
- Consulte logs: `%APPDATA%\Claude\logs`

## 📁 Arquivos Criados/Atualizados

```
mcp-server/
├── index.js                    ✅ Servidor MCP principal
├── test-mcp.js                 ✅ Script de teste
├── package.json                ✅ Dependências
├── GUIA-CONFIGURACAO-MCP.md    ✅ Guia detalhado
└── node_modules/               ✅ Dependências instaladas

raiz/
├── claude-desktop-config.json  ✅ Configuração Claude
├── supabase-schema-step-by-step.sql ✅ Schema em etapas
├── INSTRUCOES-SUPABASE.md      ✅ Instruções Supabase
└── CONFIGURACAO-MCP-COMPLETA.md ✅ Este arquivo
```

## 🎯 Próximos Passos

1. **✅ Servidor MCP** - Funcionando
2. **🗄️ Executar Schema** - Pendente (você precisa fazer)
3. **🔌 Configurar Claude** - Arquivo criado (você precisa copiar)
4. **🧪 Testar Integração** - Após os passos anteriores
5. **🚀 Usar no Projeto** - Migrar APIs do Prisma para Supabase

## 🎉 Resultado Final

Após completar todos os passos, você terá:

- **🤖 Claude Desktop** conectado diretamente ao banco Supabase
- **📊 Acesso completo** a conversas, mensagens, estatísticas
- **⚡ Operações em tempo real** via MCP
- **🔧 Automação avançada** do Moobi Chat
- **📈 Relatórios inteligentes** gerados pelo Claude

**🚀 O Claude será seu assistente pessoal para o Moobi Chat!**

---

## 📞 Comandos de Exemplo para Testar

```
# Estatísticas
"Mostre um resumo das conversas do Moobi Chat"

# Criar conversa
"Crie uma nova conversa para o cliente 'Ana Silva' com telefone '+5511987654321' no WhatsApp"

# Buscar conversas
"Liste as 5 conversas mais recentes"

# Enviar mensagem
"Envie uma mensagem de boas-vindas para a conversa [ID]"

# Atualizar status
"Marque a conversa [ID] como resolvida"

# Kanban
"Mostre o quadro Kanban das conversas"
```

**🎊 Divirta-se explorando as possibilidades!**
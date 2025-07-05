# 🚀 Servidor MCP Moobi Chat - Supabase

Servidor MCP (Model Context Protocol) personalizado para integração direta com o banco de dados Supabase do Moobi Chat.

## 📋 Funcionalidades

O servidor MCP oferece **7 ferramentas poderosas** para interagir com o Moobi Chat:

### 🔧 **Ferramentas Disponíveis:**

| Ferramenta | Descrição | Parâmetros |
|------------|-----------|------------|
| `get_conversations` | Buscar conversas com filtros | `status`, `platform`, `limit` |
| `get_messages` | Mensagens de uma conversa | `conversationId`, `limit` |
| `create_conversation` | Criar nova conversa | `customerName`, `customerPhone`, `platform` |
| `send_message` | Enviar mensagem | `conversationId`, `content`, `senderName` |
| `get_dashboard_stats` | Estatísticas do dashboard | - |
| `update_conversation_status` | Atualizar status | `conversationId`, `status` |
| `get_kanban_board` | Board Kanban completo | - |

## 🛠️ Instalação

### 1. Instalar Dependências
```bash
cd mcp-server
npm install
```

### 2. Configurar Variáveis
Copie as configurações do projeto principal:
```bash
# O MCP lerá automaticamente do ../env.local
# Certifique-se que DATABASE_URL está configurado
```

### 3. Iniciar Servidor
```bash
npm start
# ou para desenvolvimento:
npm run dev
```

## 💡 Como Usar

### **Exemplo 1: Buscar Conversas**
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_conversations",
    "arguments": {
      "status": "OPEN",
      "limit": 5
    }
  }
}
```

### **Exemplo 2: Criar Conversa**
```json
{
  "method": "tools/call", 
  "params": {
    "name": "create_conversation",
    "arguments": {
      "customerName": "João Silva",
      "customerPhone": "5511999999999",
      "platform": "WHATSAPP"
    }
  }
}
```

### **Exemplo 3: Enviar Mensagem**
```json
{
  "method": "tools/call",
  "params": {
    "name": "send_message", 
    "arguments": {
      "conversationId": "abc123",
      "content": "Olá! Como posso ajudar?",
      "senderName": "Atendente IA"
    }
  }
}
```

### **Exemplo 4: Estatísticas**
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_dashboard_stats",
    "arguments": {}
  }
}
```

## 🔗 Integração com Claude Desktop

Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "moobi-chat": {
      "command": "node",
      "args": ["/caminho/para/moobi-chat/mcp-server/index.js"],
      "env": {
        "DATABASE_URL": "sua-database-url-aqui"
      }
    }
  }
}
```

## 🎯 Casos de Uso Práticos

### **1. Automações Inteligentes**
- Criar conversas automaticamente
- Responder mensagens com IA
- Atualizar status baseado em regras

### **2. Análises e Relatórios**
- Estatísticas em tempo real
- Relatórios personalizados
- Monitoramento de performance

### **3. Integrações Externas**
- Conectar com outros sistemas
- Sincronizar dados
- Webhooks avançados

### **4. Chatbots Avançados**
- IA que acessa dados reais
- Respostas contextualizadas
- Automação de atendimento

## 🔧 Arquitetura

```
MCP Server
├── Conexão PostgreSQL Direta
├── API Supabase (opcional)
├── 7 Ferramentas Especializadas
└── Protocol MCP Standard
```

## 📊 **Vantagens do MCP:**

✅ **Acesso Direto ao Banco** - Zero latência
✅ **Operações Complexas** - Queries SQL otimizadas  
✅ **Integração IA** - Claude/GPT com dados reais
✅ **Automações** - Workflows inteligentes
✅ **Escalabilidade** - Suporte a múltiplas conexões

## 🚀 Próximos Passos

1. **Configurar DATABASE_URL** no Supabase
2. **Instalar dependências** do MCP
3. **Iniciar servidor** MCP
4. **Conectar com Claude** Desktop
5. **Começar a usar!** 🎉

---

**🔥 Agora você tem SUPERPODERES no Moobi Chat!**

O servidor MCP permite que IAs como Claude tenham acesso **COMPLETO** ao seu banco de dados, criando possibilidades infinitas de automação e integração! 
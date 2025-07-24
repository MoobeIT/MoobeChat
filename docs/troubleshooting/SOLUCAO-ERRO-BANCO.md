# 🚨 Solução: Erro 42501 - Permission Denied for Schema Public

## 🔍 Problema Identificado

O erro `permission denied for schema public` (código 42501) indica que **o schema do banco de dados não foi executado no Supabase**.

### ❌ Erro Atual:
```
POST /api/auth/callback/credentials 401 in 938ms
Erro ao criar usuário: {
  code: '42501',
  details: null,
  hint: null,
  message: 'permission denied for schema public'
}
```

## ✅ Solução Passo a Passo

### 1. 🗄️ Executar Schema no Supabase Dashboard

1. **Acesse:** https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Selecione o projeto:** `gnnazztjaeukllmnnxyj`
4. **Vá para:** SQL Editor (menu lateral esquerdo)
5. **Clique em:** "New query"

### 2. 📝 Executar Schema em 6 Etapas

**⚠️ IMPORTANTE:** Execute cada etapa separadamente, uma por vez!

#### ETAPA 1: Tabelas Básicas
```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuário-workspace
CREATE TABLE IF NOT EXISTS workspace_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);
```

**✅ Execute e aguarde "Success. No rows returned"**

#### ETAPA 2: Tabelas de Aplicação
```sql
-- Tabela de plataformas (WhatsApp, Instagram, etc.)
CREATE TABLE IF NOT EXISTS platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('WHATSAPP', 'INSTAGRAM', 'FACEBOOK')),
  status VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED' CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'PENDING')),
  config JSONB DEFAULT '{}',
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'PENDING')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT')),
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  platform_message_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'READ', 'FAILED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**✅ Execute e aguarde "Success. No rows returned"**

#### ETAPA 3: Tabelas Kanban
```sql
-- Tabela de boards do Kanban
CREATE TABLE IF NOT EXISTS kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de colunas do Kanban
CREATE TABLE IF NOT EXISTS kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cards do Kanban
CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  column_id UUID NOT NULL REFERENCES kanban_columns(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**✅ Execute e aguarde "Success. No rows returned"**

#### ETAPA 4: Índices
```sql
-- Índices para tabelas básicas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workspace_users_user_id ON workspace_users(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_users_workspace_id ON workspace_users(workspace_id);

-- Índices para outras tabelas
CREATE INDEX IF NOT EXISTS idx_platforms_workspace_id ON platforms(workspace_id);
CREATE INDEX IF NOT EXISTS idx_platforms_type ON platforms(type);
CREATE INDEX IF NOT EXISTS idx_contacts_platform_id ON contacts(platform_id);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_platform_id ON conversations(platform_id);
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_id ON conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_platform_message_id ON messages(platform_message_id);
CREATE INDEX IF NOT EXISTS idx_kanban_boards_workspace_id ON kanban_boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_board_id ON kanban_columns(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column_id ON kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_conversation_id ON kanban_cards(conversation_id);
```

**✅ Execute e aguarde "Success. No rows returned"**

#### ETAPA 5: Triggers
```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_users_updated_at BEFORE UPDATE ON workspace_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kanban_boards_updated_at BEFORE UPDATE ON kanban_boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kanban_columns_updated_at BEFORE UPDATE ON kanban_columns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kanban_cards_updated_at BEFORE UPDATE ON kanban_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**✅ Execute e aguarde "Success. No rows returned"**

#### ETAPA 6: RLS (Row Level Security)
```sql
-- Habilitar RLS para todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir todas as operações para usuários autenticados)
CREATE POLICY "Enable all operations for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON workspaces FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON workspace_users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON kanban_boards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON kanban_columns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for authenticated users" ON kanban_cards FOR ALL USING (auth.role() = 'authenticated');
```

**✅ Execute e aguarde "Success. No rows returned"**

### 3. 🧪 Testar a Conexão

Após executar todas as 6 etapas, teste a conexão:

```bash
node scripts/database/test-supabase.js
```

**Resultado esperado:**
```
✅ Conexão com Supabase estabelecida com sucesso!
✅ Tabela "users" existe
✅ Tabela "workspaces" existe
✅ Tabela "platforms" existe
...
```

### 4. 🚀 Testar a Aplicação

Após confirmar que o banco está funcionando:

```bash
npm run dev
```

E tente fazer login novamente.

## 📋 Checklist de Verificação

- [ ] ✅ Executei ETAPA 1 no SQL Editor
- [ ] ✅ Executei ETAPA 2 no SQL Editor
- [ ] ✅ Executei ETAPA 3 no SQL Editor
- [ ] ✅ Executei ETAPA 4 no SQL Editor
- [ ] ✅ Executei ETAPA 5 no SQL Editor
- [ ] ✅ Executei ETAPA 6 no SQL Editor
- [ ] ✅ Testei com `node scripts/database/test-supabase.js`
- [ ] ✅ Todas as tabelas foram criadas com sucesso
- [ ] ✅ Login funcionando na aplicação

## 🆘 Se Ainda Houver Problemas

1. **Verifique se você é o proprietário do projeto Supabase**
2. **Confirme se as variáveis de ambiente estão corretas**
3. **Tente recriar o projeto no Supabase se necessário**

---

**💡 Dica:** Mantenha o SQL Editor do Supabase aberto em uma aba do navegador para facilitar a execução dos comandos.
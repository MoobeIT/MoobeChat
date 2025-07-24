# 🚀 Instruções para Configurar o Supabase

## ❌ Problema Atual
O erro `permission denied for schema public` indica que as tabelas ainda não foram criadas no seu projeto Supabase.

## ✅ Solução - Execute os Passos Abaixo:

### 1. Acesse o Supabase Dashboard
1. Vá para [https://app.supabase.com](https://app.supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto: `gnnazztjaeukllmnnxyj`

### 2. Abra o SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

### 3. Execute o Schema em Etapas

#### ETAPA 1: Tabelas Básicas
Copie e cole o código da **ETAPA 1** do arquivo `supabase-schema-step-by-step.sql` e execute:

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

#### ETAPA 2: Tabelas de Aplicação
Após a ETAPA 1 executar com sucesso, execute a **ETAPA 2** do arquivo `supabase-schema-step-by-step.sql`

#### ETAPA 3: Tabelas Kanban
Após a ETAPA 2 executar com sucesso, execute a **ETAPA 3**

#### ETAPA 4: Índices
Execute a **ETAPA 4** para criar os índices

#### ETAPA 5: Triggers
Execute a **ETAPA 5** para criar os triggers de updated_at

#### ETAPA 6: RLS (Row Level Security)
Execute a **ETAPA 6** para habilitar as políticas de segurança

### 4. Verificar se Funcionou
Após executar todas as etapas, execute no terminal:

```bash
node test-supabase.js
```

Você deve ver:
```
✅ Conexão com Supabase estabelecida com sucesso!
✅ Tabela "users" existe
✅ Tabela "workspaces" existe
...
```

## 🔧 Alternativa: Executar Tudo de Uma Vez

Se preferir, você pode tentar executar o arquivo `supabase-schema.sql` completo de uma vez no SQL Editor, mas recomendo fazer por etapas para identificar possíveis erros.

## 🆘 Se Ainda Houver Problemas

1. **Verifique as permissões**: Certifique-se de que você é o proprietário do projeto Supabase
2. **Verifique a URL**: Confirme se `SUPABASE_URL` em `.env.local` está correta
3. **Verifique a chave**: Confirme se `SUPABASE_ANON_KEY` em `.env.local` está correta
4. **Tente recriar o projeto**: Se nada funcionar, crie um novo projeto no Supabase

## 📋 Próximos Passos Após Configurar

1. ✅ Executar `node test-supabase.js` com sucesso
2. 🔄 Migrar os arquivos de API do Prisma para Supabase
3. 🗑️ Remover dependências do Prisma (opcional)
4. 🚀 Testar a aplicação completa

---

**💡 Dica**: Mantenha o SQL Editor do Supabase aberto em uma aba do navegador para facilitar a execução dos comandos.
# Guia de Migração: Prisma → Supabase-JS

Este guia explica como migrar o projeto MoobeChat do Prisma para Supabase-JS.

## 📋 Resumo da Migração

### ✅ O que foi feito:

1. **Instalação do Supabase-JS**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Criação dos arquivos de configuração:**
   - `src/lib/supabase.ts` - Cliente Supabase com tipos
   - `src/lib/auth-supabase.ts` - Autenticação com Supabase
   - `src/lib/database.ts` - Operações de banco compatíveis com Prisma
   - `supabase-schema.sql` - Schema SQL para criar tabelas

3. **Exemplo de migração:**
   - `src/app/api/admin/users/route-supabase.ts` - Versão migrada da API

## 🗄️ Schema do Banco

### Passo 1: Executar o Schema SQL

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Execute o conteúdo do arquivo `supabase-schema.sql`

Este script criará todas as tabelas necessárias:
- `platforms` - Plataformas de integração (WhatsApp, Instagram, etc.)
- `contacts` - Contatos dos clientes
- `conversations` - Conversas
- `messages` - Mensagens
- `kanban_boards`, `kanban_columns`, `kanban_cards` - Sistema Kanban

## 🔄 Como Migrar os Arquivos

### Padrão de Migração

**Antes (Prisma):**
```typescript
import { prisma } from '@/lib/prisma'

// Buscar usuários
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
})
```

**Depois (Supabase-JS):**
```typescript
import { supabaseTyped } from '@/lib/supabase'

// Buscar usuários
const { data: users, error } = await supabaseTyped
  .from('users')
  .select('id, name, email')

if (error) {
  console.error('Erro:', error)
  return
}
```

### Operações Comuns

#### 1. Buscar Registros

**Prisma:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
})
```

**Supabase:**
```typescript
const { data: user, error } = await supabaseTyped
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

#### 2. Criar Registros

**Prisma:**
```typescript
const user = await prisma.user.create({
  data: {
    name: 'João',
    email: 'joao@email.com'
  }
})
```

**Supabase:**
```typescript
const { data: user, error } = await supabaseTyped
  .from('users')
  .insert({
    name: 'João',
    email: 'joao@email.com'
  })
  .select()
  .single()
```

#### 3. Atualizar Registros

**Prisma:**
```typescript
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: 'João Silva' }
})
```

**Supabase:**
```typescript
const { data: user, error } = await supabaseTyped
  .from('users')
  .update({ name: 'João Silva' })
  .eq('id', userId)
  .select()
  .single()
```

#### 4. Deletar Registros

**Prisma:**
```typescript
await prisma.user.delete({
  where: { id: userId }
})
```

**Supabase:**
```typescript
const { error } = await supabaseTyped
  .from('users')
  .delete()
  .eq('id', userId)
```

#### 5. Relacionamentos (Joins)

**Prisma:**
```typescript
const users = await prisma.user.findMany({
  include: {
    workspaces: {
      include: {
        workspace: true
      }
    }
  }
})
```

**Supabase:**
```typescript
const { data: users, error } = await supabaseTyped
  .from('users')
  .select(`
    *,
    workspace_users(
      *,
      workspaces(*)
    )
  `)
```

## 🔧 Usando a Biblioteca de Compatibilidade

Para facilitar a migração, criamos `src/lib/database.ts` que simula a API do Prisma:

```typescript
import { db } from '@/lib/database'

// Usar como se fosse Prisma
const users = await db.user.findMany({})
const user = await db.user.findFirst({ email: 'test@email.com' })
const newUser = await db.user.create({ name: 'João', email: 'joao@email.com' })
```

## 📝 Lista de Arquivos para Migrar

Arquivos que usam Prisma e precisam ser migrados:

### APIs principais:
- `src/app/api/auth/register/route.ts`
- `src/app/api/admin/users/route.ts` ✅ (exemplo criado)
- `src/app/api/contacts/route.ts`
- `src/app/api/contacts/[id]/route.ts`
- `src/app/api/conversations/route.ts`
- `src/app/api/conversations/[id]/route.ts`
- `src/app/api/conversations/[id]/messages/route.ts`

### Integrações:
- `src/app/api/integrations/route.ts`
- `src/app/api/integrations/[id]/route.ts`
- `src/app/api/integrations/whatsapp/connect/route.ts`
- `src/app/api/integrations/whatsapp/disconnect/route.ts`
- `src/app/api/integrations/whatsapp/send/route.ts`
- `src/app/api/integrations/instagram/connect/route.ts`
- `src/app/api/integrations/instagram/disconnect/route.ts`

### WhatsApp APIs:
- `src/app/api/whatsapp/instances/route.ts`
- `src/app/api/whatsapp/instances/sync/route.ts`

### Webhooks:
- `src/app/api/webhooks/uazapi/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`

### Outros:
- `src/app/api/kanban/route.ts`
- `src/lib/auth.ts` ✅ (nova versão criada)
- `src/lib/workspace.ts`

## 🚀 Próximos Passos

### 1. Executar o Schema SQL
1. Acesse o Supabase Dashboard
2. Execute o `supabase-schema.sql`
3. Verifique se todas as tabelas foram criadas

### 2. Testar a Configuração
1. Verifique se as variáveis de ambiente estão corretas:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 3. Migrar Arquivo por Arquivo
1. Comece com arquivos simples
2. Use o exemplo em `route-supabase.ts` como referência
3. Teste cada migração antes de continuar

### 4. Atualizar Autenticação
1. Substitua `src/lib/auth.ts` por `src/lib/auth-supabase.ts`
2. Atualize as importações nos arquivos que usam autenticação

### 5. Remover Prisma (Opcional)
Após migrar tudo:
```bash
npm uninstall @prisma/client prisma @next-auth/prisma-adapter
```

## ⚠️ Considerações Importantes

1. **Transações**: Supabase não tem transações como Prisma. Para operações complexas, implemente rollback manual.

2. **Tipos**: Os tipos TypeScript são diferentes. Use os tipos definidos em `src/lib/supabase.ts`.

3. **Erros**: Sempre verifique o campo `error` nas respostas do Supabase.

4. **Performance**: Supabase pode ser mais rápido para consultas simples, mas cuidado com N+1 queries.

5. **RLS (Row Level Security)**: Está habilitado. Ajuste as políticas conforme necessário.

## 🆘 Solução de Problemas

### Erro de Conexão
- Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Permissão
- Verifique as políticas RLS no Supabase Dashboard
- Para desenvolvimento, pode desabilitar RLS temporariamente

### Erro de Schema
- Confirme se todas as tabelas foram criadas corretamente
- Verifique se as foreign keys estão funcionando

## 📚 Recursos Úteis

- [Documentação Supabase-JS](https://supabase.com/docs/reference/javascript)
- [Guia de Migração Prisma → Supabase](https://supabase.com/docs/guides/migrations/prisma)
- [Supabase Dashboard](https://app.supabase.com)

---

**Status da Migração**: 🟡 Em Progresso
- ✅ Configuração inicial
- ✅ Schema do banco
- ✅ Exemplo de migração
- 🔄 Migração dos arquivos de API
- ⏳ Testes e validação
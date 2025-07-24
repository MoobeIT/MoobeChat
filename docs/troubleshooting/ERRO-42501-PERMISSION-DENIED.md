# 🔧 Solução para Erro 42501: Permission Denied for Schema Public

## 🚨 Problema Identificado

**Erro:** `permission denied for schema public` (código: 42501) <mcreference link="https://github.com/orgs/supabase/discussions/4687" index="1">1</mcreference>

**Causa:** Este erro ocorre quando as permissões GRANT necessárias para o schema `public` não estão configuradas corretamente no Supabase. <mcreference link="https://www.reddit.com/r/Supabase/comments/nd5pz3/permissions_issue_using_supabase_client/" index="2">2</mcreference>

## ✅ Solução Definitiva

### 1. Execute o Script de Correção

**Arquivo:** `scripts/database/corrigir-permissoes-schema.sql`

1. Acesse o **Supabase Dashboard** → **SQL Editor**
2. Copie e cole todo o conteúdo do arquivo `corrigir-permissoes-schema.sql`
3. Execute o script completo

### 2. Comandos Principais (caso prefira executar manualmente)

```sql
-- Conceder permissões essenciais
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Definir privilégios padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
```

## 🔍 Por que isso acontece?

1. **Migração com Prisma:** Quando você executa `prisma migrate reset` ou `prisma migrate dev` em um banco Supabase remoto, isso pode limpar as permissões GRANT necessárias. <mcreference link="https://stackoverflow.com/questions/67551593/supabase-client-permission-denied-for-schema-public" index="4">4</mcreference>

2. **PostgREST Requirements:** O Supabase usa PostgREST internamente, que requer permissões específicas no schema public para funcionar corretamente. <mcreference link="https://stackoverflow.com/questions/67551593/supabase-client-permission-denied-for-schema-public" index="4">4</mcreference>

3. **Roles do Supabase:** Os roles `anon`, `authenticated` e `service_role` precisam de acesso explícito ao schema public. <mcreference link="https://www.reddit.com/r/Supabase/comments/nd5pz3/permissions_issue_using_supabase_client/" index="2">2</mcreference>

## 🧪 Teste da Solução

Após executar o script, teste com:

```bash
node scripts/database/verificar-rls-status.js
```

Ou teste diretamente na aplicação fazendo login.

## 📋 Resultado Esperado

- ✅ Erro 42501 resolvido
- ✅ Login funcionando
- ✅ Operações de banco de dados funcionando
- ✅ API routes respondendo corretamente

## 🔗 Diferença entre RLS e Permissões de Schema

| Aspecto | RLS (Row Level Security) | Permissões de Schema |
|---------|-------------------------|---------------------|
| **Função** | Controla quais linhas um usuário pode ver/modificar | Controla se o usuário pode acessar o schema |
| **Nível** | Linha por linha | Schema/tabela inteira |
| **Erro quando falta** | Dados não aparecem ou são bloqueados | Erro 42501 "permission denied" |
| **Comando** | `CREATE POLICY` | `GRANT USAGE/ALL` |

## 📞 Próximos Passos

1. Execute o script `corrigir-permissoes-schema.sql`
2. Teste a aplicação
3. Se ainda houver problemas, verifique:
   - Variáveis de ambiente (`.env.local`)
   - Configuração do cliente Supabase
   - Logs do servidor Next.js

---

**Arquivos relacionados:**
- `scripts/database/corrigir-permissoes-schema.sql` - Script de correção
- `scripts/database/verificar-rls-status.js` - Teste de funcionamento
- `config/env.example` - Variáveis de ambiente necessárias
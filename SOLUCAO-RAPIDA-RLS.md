# 🚀 Solução Rápida: Configurar RLS (Row Level Security)

## ✅ Problema Identificado

**Boa notícia!** Todas as tabelas já existem no seu Supabase! 🎉

O problema é apenas que o **RLS (Row Level Security) não está configurado**, causando o erro:
```
code: '42501'
message: 'permission denied for schema public'
```

## 🔧 Solução em 2 Passos Simples

### Passo 1: Acessar Supabase Dashboard
1. Vá para: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: `gnnazztjaeukllmnnxyj`
4. Clique em **"SQL Editor"** (menu lateral esquerdo)
5. Clique em **"New query"**

### Passo 2: Executar Script RLS

Copie e cole o conteúdo completo do arquivo `scripts/database/configurar-rls.sql` no SQL Editor:

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

-- Políticas adicionais para permitir acesso com chave anônima (para desenvolvimento)
CREATE POLICY "Enable read access for anon users" ON users FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON users FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON users FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON workspaces FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON workspaces FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON workspaces FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON workspace_users FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON workspace_users FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON workspace_users FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON platforms FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON platforms FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON platforms FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON contacts FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON contacts FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON contacts FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON conversations FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON conversations FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON conversations FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON messages FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON messages FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON messages FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON kanban_boards FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON kanban_boards FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON kanban_boards FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON kanban_columns FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON kanban_columns FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON kanban_columns FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read access for anon users" ON kanban_cards FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert access for anon users" ON kanban_cards FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update access for anon users" ON kanban_cards FOR UPDATE USING (auth.role() = 'anon');

-- Confirmar que tudo foi aplicado
SELECT 'RLS configurado com sucesso!' as status;
```

**Clique em "Run" e aguarde a mensagem: "RLS configurado com sucesso!"**

## 🧪 Testar a Solução

Após executar o script SQL:

```bash
# Testar conexão
node scripts/database/verificar-schema-atual.js

# Iniciar aplicação
npm run dev
```

## ✅ Resultado Esperado

- ✅ Conexão com Supabase funcionando
- ✅ Login na aplicação funcionando
- ✅ Erro 42501 resolvido
- ✅ Todas as operações de banco funcionais

## 📋 O que foi feito

1. **Identificamos** que todas as 10 tabelas já existem
2. **Descobrimos** que o problema era apenas RLS não configurado
3. **Criamos** script específico para configurar apenas o RLS
4. **Configuramos** políticas para usuários autenticados e anônimos

---

**🎉 Muito mais simples do que recriar todo o schema!**
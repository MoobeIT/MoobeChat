-- Script para habilitar RLS em todas as tabelas do projeto de uma vez
-- Execute este script completo no SQL Editor do Supabase Dashboard

-- ========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ========================================

-- Método 1: Comando direto para cada tabela
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

-- ========================================
-- VERIFICAR SE RLS FOI HABILITADO
-- ========================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'workspaces', 'workspace_users', 'platforms',
    'contacts', 'conversations', 'messages',
    'kanban_boards', 'kanban_columns', 'kanban_cards'
)
ORDER BY tablename;

-- ========================================
-- CRIAR POLÍTICAS BÁSICAS PARA TODAS AS TABELAS
-- ========================================

-- Políticas para usuários autenticados (acesso total)
CREATE POLICY "Enable all for authenticated" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON workspaces FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON workspace_users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON kanban_boards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON kanban_columns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for authenticated" ON kanban_cards FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para usuários anônimos (desenvolvimento)
CREATE POLICY "Enable read for anon" ON users FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON users FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON users FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON workspaces FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON workspaces FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON workspaces FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON workspace_users FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON workspace_users FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON workspace_users FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON platforms FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON platforms FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON platforms FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON contacts FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON contacts FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON contacts FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON conversations FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON conversations FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON conversations FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON messages FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON messages FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON messages FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON kanban_boards FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON kanban_boards FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON kanban_boards FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON kanban_columns FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON kanban_columns FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON kanban_columns FOR UPDATE USING (auth.role() = 'anon');

CREATE POLICY "Enable read for anon" ON kanban_cards FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Enable insert for anon" ON kanban_cards FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Enable update for anon" ON kanban_cards FOR UPDATE USING (auth.role() = 'anon');

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Contar políticas criadas
SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'workspaces', 'workspace_users', 'platforms',
    'contacts', 'conversations', 'messages',
    'kanban_boards', 'kanban_columns', 'kanban_cards'
)
GROUP BY tablename
ORDER BY tablename;

-- Mensagem de sucesso
SELECT 'RLS habilitado e políticas criadas com sucesso!' as status;
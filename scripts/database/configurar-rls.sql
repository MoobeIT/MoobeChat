-- Script para configurar RLS (Row Level Security) no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard
-- TODAS as tabelas já existem, só falta configurar as permissões

-- ========================================
-- CONFIGURAÇÃO RLS - EXECUTE TUDO DE UMA VEZ
-- ========================================

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
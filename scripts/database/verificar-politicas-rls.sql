-- Script para verificar se as políticas RLS foram criadas no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'workspaces', 'workspace_users', 'platforms',
    'contacts', 'conversations', 'messages',
    'kanban_boards', 'kanban_columns', 'kanban_cards'
)
ORDER BY tablename;

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Contar políticas por tabela
SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'workspaces', 'workspace_users', 'platforms',
    'contacts', 'conversations', 'messages',
    'kanban_boards', 'kanban_columns', 'kanban_cards'
)
ORDER BY table_name;
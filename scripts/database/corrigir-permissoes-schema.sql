-- Script para corrigir permissões do schema public no Supabase
-- Este script resolve o erro 42501: "permission denied for schema public"
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- CORRIGIR PERMISSÕES DO SCHEMA PUBLIC
-- ========================================

-- Conceder permissões de uso no schema public para todos os roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Conceder todas as permissões em todas as tabelas do schema public
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Conceder todas as permissões em todas as funções/rotinas do schema public
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Conceder todas as permissões em todas as sequências do schema public
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Definir privilégios padrão para futuras tabelas criadas pelo postgres
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Definir privilégios padrão para futuras funções criadas pelo postgres
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Definir privilégios padrão para futuras sequências criadas pelo postgres
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ========================================
-- VERIFICAR PERMISSÕES APLICADAS
-- ========================================

-- Verificar permissões do schema
SELECT 
    schema_name,
    schema_owner,
    default_character_set_catalog,
    default_character_set_schema
FROM information_schema.schemata 
WHERE schema_name = 'public';

-- Verificar privilégios nas tabelas
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;

-- Mensagem de sucesso
SELECT 'Permissões do schema public corrigidas com sucesso!' as status;
SELECT 'Agora você pode testar a aplicação novamente.' as proximos_passos;
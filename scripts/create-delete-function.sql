-- Função SQL para deletar plataforma ignorando RLS
CREATE OR REPLACE FUNCTION delete_platform_admin(platform_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar mensagens relacionadas
  DELETE FROM messages 
  WHERE conversation_id IN (
    SELECT id FROM conversations WHERE platform_id = delete_platform_admin.platform_id
  );
  
  -- Deletar cards do kanban se existirem
  BEGIN
    DELETE FROM kanban_cards 
    WHERE conversation_id IN (
      SELECT id FROM conversations WHERE platform_id = delete_platform_admin.platform_id
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Tabela não existe, continuar
      NULL;
  END;
  
  -- Deletar conversas
  DELETE FROM conversations WHERE platform_id = delete_platform_admin.platform_id;
  
  -- Deletar contatos
  DELETE FROM contacts WHERE platform_id = delete_platform_admin.platform_id;
  
  -- Deletar a plataforma
  DELETE FROM platforms WHERE id = delete_platform_admin.platform_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao deletar plataforma: %', SQLERRM;
    RETURN false;
END;
$$;

-- Dar permissões para a função
GRANT EXECUTE ON FUNCTION delete_platform_admin(text) TO anon;
GRANT EXECUTE ON FUNCTION delete_platform_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_platform_admin(text) TO service_role;
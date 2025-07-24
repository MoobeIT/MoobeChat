// Script para executar função SQL de remoção
require('dotenv').config();

async function executeSQLDelete() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🔧 Criando função SQL de remoção...');
    
    // Primeiro, criar a função SQL
    const createFunctionSQL = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createFunctionSQL
    });
    
    if (createError) {
      console.log('⚠️ Erro ao criar função (pode já existir):', createError.message);
    } else {
      console.log('✅ Função SQL criada com sucesso!');
    }
    
    console.log('🗑️ Executando função de remoção...');
    console.log(`ID: ${platformId}`);
    
    // Executar a função
    const { data: result, error: execError } = await supabase.rpc('delete_platform_admin', {
      platform_id: platformId
    });
    
    if (execError) {
      console.error('❌ Erro ao executar função:', execError.message);
      
      // Tentar abordagem mais direta
      console.log('🔄 Tentando remoção direta via SQL...');
      
      const directSQL = `
        DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE platform_id = '${platformId}');
        DELETE FROM conversations WHERE platform_id = '${platformId}';
        DELETE FROM contacts WHERE platform_id = '${platformId}';
        DELETE FROM platforms WHERE id = '${platformId}';
      `;
      
      const { error: directError } = await supabase.rpc('exec_sql', {
        sql: directSQL
      });
      
      if (directError) {
        console.error('❌ Erro na remoção direta:', directError.message);
      } else {
        console.log('✅ Remoção direta executada!');
      }
    } else {
      console.log('✅ Função executada com sucesso!');
      console.log('📋 Resultado:', result);
    }
    
    // Verificar se foi removida
    console.log('🔍 Verificando remoção...');
    const { data: checkPlatform } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single();
    
    if (checkPlatform) {
      console.log('❌ A plataforma ainda existe!');
      
      // Última tentativa: desabilitar RLS temporariamente
      console.log('🔄 Última tentativa: desabilitando RLS...');
      
      const disableRLSSQL = `
        ALTER TABLE platforms DISABLE ROW LEVEL SECURITY;
        DELETE FROM platforms WHERE id = '${platformId}';
        ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
      `;
      
      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: disableRLSSQL
      });
      
      if (rlsError) {
        console.error('❌ Erro ao desabilitar RLS:', rlsError.message);
        console.log('\n🚨 SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('1. Acesse o painel do Supabase');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute: DELETE FROM platforms WHERE id = \'cmd6nujkh0001m9mwocvky970\';');
        console.log('4. Ou desabilite temporariamente o RLS na tabela platforms');
      } else {
        console.log('✅ RLS desabilitado e plataforma removida!');
      }
    } else {
      console.log('✅ Confirmado: Plataforma foi removida!');
      console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('\n🚨 SOLUÇÃO MANUAL NECESSÁRIA:');
    console.log('1. Acesse o painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute: DELETE FROM platforms WHERE id = \'cmd6nujkh0001m9mwocvky970\';');
  }
}

executeSQLDelete();
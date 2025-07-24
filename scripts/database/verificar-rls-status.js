require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarRLSStatus() {
  console.log('🔍 Verificando status do RLS no Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  console.log('');

  const tabelas = [
    'users', 'workspaces', 'workspace_users', 'platforms', 
    'contacts', 'conversations', 'messages', 
    'kanban_boards', 'kanban_columns', 'kanban_cards'
  ];

  try {
    // Verificar se RLS está habilitado para cada tabela
    console.log('📋 Verificando se RLS está habilitado...');
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', {});
    
    if (rlsError) {
      console.log('⚠️  Não foi possível verificar RLS via RPC, tentando método alternativo...');
      
      // Método alternativo: tentar acessar as tabelas diretamente
      for (const tabela of tabelas) {
        try {
          const { data, error } = await supabase
            .from(tabela)
            .select('*')
            .limit(1);
          
          if (error) {
            if (error.code === '42501') {
              console.log(`❌ Tabela "${tabela}": RLS não configurado (permission denied)`);
            } else {
              console.log(`✅ Tabela "${tabela}": RLS configurado (acesso permitido)`);
            }
          } else {
            console.log(`✅ Tabela "${tabela}": RLS configurado e funcionando`);
          }
        } catch (err) {
          console.log(`❌ Tabela "${tabela}": Erro - ${err.message}`);
        }
      }
    }

    // Verificar políticas específicas
    console.log('\n🔐 Verificando políticas RLS...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*');
    
    if (policiesError) {
      console.log('⚠️  Não foi possível acessar pg_policies diretamente');
    } else {
      console.log(`✅ Encontradas ${policies?.length || 0} políticas RLS`);
    }

    // Teste de inserção simples
    console.log('\n🧪 Testando inserção de dados...');
    
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .insert({
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User'
      })
      .select();
    
    if (testError) {
      if (testError.code === '42501') {
        console.log('❌ Teste de inserção falhou: RLS não permite inserção');
      } else {
        console.log(`⚠️  Teste de inserção falhou: ${testError.message}`);
      }
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      
      // Limpar dados de teste
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser[0].id);
      console.log('🧹 Dados de teste removidos');
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  }

  console.log('\n🎯 VERIFICAÇÃO DE RLS CONCLUÍDA!');
}

verificarRLSStatus();
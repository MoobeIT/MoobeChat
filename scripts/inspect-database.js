// Script para inspecionar a estrutura do banco de dados
require('dotenv').config();

async function inspectDatabase() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('🔍 Conectando ao Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Listar todas as tabelas
    console.log('\n📋 TABELAS DO BANCO:');
    console.log('=' .repeat(50));
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables');
    
    if (tablesError) {
      console.log('⚠️ Erro ao buscar tabelas via RPC, tentando query direta...');
      
      // Tentar query direta
      const { data: directTables, error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (directError) {
        console.log('❌ Erro na query direta também:', directError.message);
        
        // Tentar listar tabelas conhecidas
        console.log('\n🔍 Verificando tabelas conhecidas...');
        const knownTables = ['users', 'workspaces', 'workspace_users', 'platforms', 'contacts', 'conversations', 'messages'];
        
        for (const tableName of knownTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (!error) {
              console.log(`✅ ${tableName} - Existe`);
              
              // Contar registros
              const { count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });
              
              console.log(`   📊 Registros: ${count || 0}`);
            } else {
              console.log(`❌ ${tableName} - Erro: ${error.message}`);
            }
          } catch (e) {
            console.log(`❌ ${tableName} - Erro: ${e.message}`);
          }
        }
      } else {
        console.log('📋 Tabelas encontradas:');
        directTables.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      }
    } else {
      console.log('📋 Tabelas encontradas via RPC:');
      console.log(tables);
    }
    
    // Verificar dados específicos das plataformas
    console.log('\n🔍 DADOS DAS PLATAFORMAS:');
    console.log('=' .repeat(50));
    
    const { data: platforms, error: platformsError } = await supabase
      .from('platforms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (platformsError) {
      console.log('❌ Erro ao buscar plataformas:', platformsError.message);
    } else {
      console.log(`📊 Total de plataformas: ${platforms.length}`);
      
      platforms.forEach((platform, index) => {
        console.log(`\n${index + 1}. ${platform.name}`);
        console.log(`   ID: ${platform.id}`);
        console.log(`   Tipo: ${platform.type}`);
        console.log(`   Status: ${platform.is_active ? 'Ativa' : 'Inativa'}`);
        console.log(`   Workspace: ${platform.workspace_id}`);
        console.log(`   Criada: ${new Date(platform.created_at).toLocaleString('pt-BR')}`);
        
        if (platform.config) {
          console.log(`   Config: ${JSON.stringify(platform.config, null, 2)}`);
        }
      });
    }
    
    // Verificar conversas
    console.log('\n💬 CONVERSAS:');
    console.log('=' .repeat(50));
    
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (conversationsError) {
      console.log('❌ Erro ao buscar conversas:', conversationsError.message);
    } else {
      console.log(`📊 Total de conversas (últimas 10): ${conversations.length}`);
      
      conversations.forEach((conv, index) => {
        console.log(`\n${index + 1}. ${conv.title || 'Sem título'}`);
        console.log(`   ID: ${conv.id}`);
        console.log(`   Plataforma: ${conv.platform_id}`);
        console.log(`   Status: ${conv.status}`);
        console.log(`   Criada: ${new Date(conv.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    // Verificar mensagens
    console.log('\n📨 MENSAGENS:');
    console.log('=' .repeat(50));
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (messagesError) {
      console.log('❌ Erro ao buscar mensagens:', messagesError.message);
    } else {
      console.log(`📊 Total de mensagens (últimas 5): ${messages.length}`);
      
      messages.forEach((msg, index) => {
        console.log(`\n${index + 1}. ${msg.content.substring(0, 50)}...`);
        console.log(`   ID: ${msg.id}`);
        console.log(`   Conversa: ${msg.conversation_id}`);
        console.log(`   Direção: ${msg.direction}`);
        console.log(`   Tipo: ${msg.type}`);
        console.log(`   Criada: ${new Date(msg.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    console.log('\n✅ Inspeção concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

inspectDatabase();
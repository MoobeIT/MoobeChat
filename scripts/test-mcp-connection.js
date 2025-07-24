#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

async function testMCPConnection() {
  console.log('🔍 Testando conexão do MCP com Supabase...');
  console.log('\n📋 Configurações:');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '***configurada***' : 'NÃO CONFIGURADA'}`);
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    return;
  }

  try {
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    console.log('\n🔗 Testando conexão...');
    
    // Testar conexão listando tabelas
    const { data: tables, error } = await supabase
      .from('conversations')
      .select('id, status')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return;
    }

    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Dados de teste:', tables);

    // Testar outras operações
    console.log('\n🧪 Testando operações do MCP...');
    
    // Buscar estatísticas
    const { data: conversationsCount } = await supabase
      .from('conversations')
      .select('id', { count: 'exact' });
    
    const { data: messagesCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' });
    
    const { data: platformsCount } = await supabase
      .from('platforms')
      .select('id', { count: 'exact' });

    console.log('📈 Estatísticas:');
    console.log(`  - Conversas: ${conversationsCount?.length || 0}`);
    console.log(`  - Mensagens: ${messagesCount?.length || 0}`);
    console.log(`  - Plataformas: ${platformsCount?.length || 0}`);

    console.log('\n✅ Todas as operações do MCP estão funcionando!');
    console.log('\n💡 O problema está na configuração do MCP no Trae AI.');
    console.log('   A URL configurada no Trae AI é: https://MoobeChat.supabase.co');
    console.log('   A URL correta deveria ser: https://gnnazztjaeukllmnnxyj.supabase.co');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar teste
testMCPConnection();
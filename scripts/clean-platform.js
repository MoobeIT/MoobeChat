const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanPlatform() {
  try {
    const platformId = 'cmd6nujkh0001m9mwocvky970'; // ID da plataforma "teste"
    
    console.log('🗑️ Removendo plataforma órfã...');
    console.log(`ID: ${platformId}`);
    
    // Primeiro, verificar se a plataforma existe
    const { data: platform, error: fetchError } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single();
    
    if (fetchError || !platform) {
      console.log('❌ Plataforma não encontrada ou já foi removida.');
      return;
    }
    
    console.log('📋 Plataforma encontrada:');
    console.log(`   Nome: ${platform.name}`);
    console.log(`   Tipo: ${platform.type}`);
    console.log(`   Workspace: ${platform.workspace_id}`);
    console.log(`   Criada em: ${platform.created_at}`);
    
    // Verificar se há conversas associadas
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('platform_id', platformId);
    
    if (convError) {
      console.error('❌ Erro ao verificar conversas:', convError);
      return;
    }
    
    if (conversations && conversations.length > 0) {
      console.log(`⚠️ Encontradas ${conversations.length} conversas associadas.`);
      console.log('🗑️ Removendo conversas primeiro...');
      
      // Remover mensagens das conversas
      for (const conv of conversations) {
        const { error: msgError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conv.id);
        
        if (msgError) {
          console.error(`❌ Erro ao remover mensagens da conversa ${conv.id}:`, msgError);
        }
      }
      
      // Remover conversas
      const { error: convDeleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('platform_id', platformId);
      
      if (convDeleteError) {
        console.error('❌ Erro ao remover conversas:', convDeleteError);
        return;
      }
      
      console.log('✅ Conversas removidas com sucesso.');
    }
    
    // Verificar se há contatos associados
    const { data: contacts, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('platform_id', platformId);
    
    if (contactError) {
      console.error('❌ Erro ao verificar contatos:', contactError);
      return;
    }
    
    if (contacts && contacts.length > 0) {
      console.log(`⚠️ Encontrados ${contacts.length} contatos associados.`);
      console.log('🗑️ Removendo contatos...');
      
      const { error: contactDeleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('platform_id', platformId);
      
      if (contactDeleteError) {
        console.error('❌ Erro ao remover contatos:', contactDeleteError);
        return;
      }
      
      console.log('✅ Contatos removidos com sucesso.');
    }
    
    // Finalmente, remover a plataforma
    const { error: deleteError } = await supabase
      .from('platforms')
      .delete()
      .eq('id', platformId);
    
    if (deleteError) {
      console.error('❌ Erro ao remover plataforma:', deleteError);
      return;
    }
    
    console.log('✅ Plataforma removida com sucesso!');
    console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

cleanPlatform();
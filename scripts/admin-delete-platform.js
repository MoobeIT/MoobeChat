// Script para remover plataforma com permissões administrativas
require('dotenv').config();

async function adminDeletePlatform() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    console.log('🔑 Usando chave:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🗑️ Removendo plataforma com permissões administrativas...');
    console.log(`ID: ${platformId}`);
    
    // Primeiro, vamos verificar se a plataforma existe
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single();
    
    if (platformError || !platform) {
      console.log('❌ Plataforma não encontrada:', platformError?.message || 'Não existe');
      return;
    }
    
    console.log('📋 Plataforma encontrada:');
    console.log(`   Nome: ${platform.name}`);
    console.log(`   Tipo: ${platform.type}`);
    console.log(`   Workspace: ${platform.workspace_id}`);
    
    // Buscar e remover mensagens primeiro
    console.log('🔍 Buscando conversas...');
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('platform_id', platformId);
    
    if (conversations && conversations.length > 0) {
      console.log(`📋 Encontradas ${conversations.length} conversas`);
      
      for (const conv of conversations) {
        console.log(`🗑️ Removendo mensagens da conversa ${conv.id}...`);
        const { error: msgError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conv.id);
        
        if (msgError) {
          console.warn(`⚠️ Erro ao remover mensagens:`, msgError.message);
        }
      }
      
      // Remover conversas
      console.log('🗑️ Removendo conversas...');
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('platform_id', platformId);
      
      if (convError) {
        console.warn(`⚠️ Erro ao remover conversas:`, convError.message);
      }
    }
    
    // Remover contatos
    console.log('🗑️ Removendo contatos...');
    const { error: contactError } = await supabase
      .from('contacts')
      .delete()
      .eq('platform_id', platformId);
    
    if (contactError) {
      console.warn(`⚠️ Erro ao remover contatos:`, contactError.message);
    }
    
    // Tentar remover cards do kanban se existirem
    console.log('🗑️ Verificando cards do kanban...');
    try {
      const { error: kanbanError } = await supabase
        .from('kanban_cards')
        .delete()
        .in('conversation_id', conversations?.map(c => c.id) || []);
      
      if (kanbanError && !kanbanError.message.includes('relation "kanban_cards" does not exist')) {
        console.warn(`⚠️ Erro ao remover cards do kanban:`, kanbanError.message);
      }
    } catch (e) {
      console.log('ℹ️ Tabela kanban_cards não existe (normal)');
    }
    
    // Finalmente, remover a plataforma
    console.log('🗑️ Removendo plataforma...');
    const { error: platformDeleteError } = await supabase
      .from('platforms')
      .delete()
      .eq('id', platformId);
    
    if (platformDeleteError) {
      console.error('❌ Erro ao remover plataforma:', platformDeleteError.message);
      console.log('🔍 Detalhes do erro:', platformDeleteError);
      
      // Tentar com RLS desabilitado temporariamente
      console.log('🔄 Tentando com query SQL direta...');
      const { error: sqlError } = await supabase.rpc('delete_platform_admin', {
        platform_id: platformId
      });
      
      if (sqlError) {
        console.error('❌ Erro na função SQL:', sqlError.message);
      } else {
        console.log('✅ Plataforma removida via função SQL!');
      }
    } else {
      console.log('✅ Plataforma removida com sucesso!');
    }
    
    // Verificar se foi realmente removida
    console.log('🔍 Verificando remoção...');
    const { data: checkPlatform } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single();
    
    if (checkPlatform) {
      console.log('❌ A plataforma ainda existe no banco!');
      console.log('🔍 Dados:', checkPlatform);
    } else {
      console.log('✅ Confirmado: Plataforma foi removida!');
      console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

adminDeletePlatform();
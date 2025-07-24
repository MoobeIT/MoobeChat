const fetch = require('node-fetch');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function forceCleanPlatform() {
  try {
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🗑️ Forçando remoção da plataforma via API REST...');
    console.log(`ID: ${platformId}`);
    
    // 1. Buscar conversas relacionadas
    console.log('🔍 Buscando conversas relacionadas...');
    const conversationsResponse = await fetch(
      `${supabaseUrl}/rest/v1/conversations?platform_id=eq.${platformId}&select=id`,
      { headers }
    );
    
    if (!conversationsResponse.ok) {
      console.error('❌ Erro ao buscar conversas:', await conversationsResponse.text());
      return;
    }
    
    const conversations = await conversationsResponse.json();
    console.log(`📋 Encontradas ${conversations.length} conversas`);
    
    // 2. Remover mensagens de cada conversa
    for (const conv of conversations) {
      console.log(`🗑️ Removendo mensagens da conversa ${conv.id}...`);
      const deleteMessagesResponse = await fetch(
        `${supabaseUrl}/rest/v1/messages?conversation_id=eq.${conv.id}`,
        {
          method: 'DELETE',
          headers
        }
      );
      
      if (!deleteMessagesResponse.ok) {
        console.warn(`⚠️ Erro ao remover mensagens da conversa ${conv.id}:`, await deleteMessagesResponse.text());
      }
    }
    
    // 3. Remover cards do kanban
    for (const conv of conversations) {
      console.log(`🗑️ Removendo cards do kanban da conversa ${conv.id}...`);
      const deleteKanbanResponse = await fetch(
        `${supabaseUrl}/rest/v1/kanban_cards?conversation_id=eq.${conv.id}`,
        {
          method: 'DELETE',
          headers
        }
      );
      
      if (!deleteKanbanResponse.ok) {
        console.warn(`⚠️ Erro ao remover cards do kanban da conversa ${conv.id}:`, await deleteKanbanResponse.text());
      }
    }
    
    // 4. Remover conversas
    console.log('🗑️ Removendo conversas...');
    const deleteConversationsResponse = await fetch(
      `${supabaseUrl}/rest/v1/conversations?platform_id=eq.${platformId}`,
      {
        method: 'DELETE',
        headers
      }
    );
    
    if (!deleteConversationsResponse.ok) {
      console.warn('⚠️ Erro ao remover conversas:', await deleteConversationsResponse.text());
    }
    
    // 5. Remover contatos
    console.log('🗑️ Removendo contatos...');
    const deleteContactsResponse = await fetch(
      `${supabaseUrl}/rest/v1/contacts?platform_id=eq.${platformId}`,
      {
        method: 'DELETE',
        headers
      }
    );
    
    if (!deleteContactsResponse.ok) {
      console.warn('⚠️ Erro ao remover contatos:', await deleteContactsResponse.text());
    }
    
    // 6. Finalmente, remover a plataforma
    console.log('🗑️ Removendo plataforma...');
    const deletePlatformResponse = await fetch(
      `${supabaseUrl}/rest/v1/platforms?id=eq.${platformId}`,
      {
        method: 'DELETE',
        headers
      }
    );
    
    if (!deletePlatformResponse.ok) {
      console.error('❌ Erro ao remover plataforma:', await deletePlatformResponse.text());
      return;
    }
    
    console.log('✅ Plataforma removida com sucesso!');
    console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    
    // Verificar se foi realmente removida
    console.log('🔍 Verificando se a plataforma foi removida...');
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/platforms?id=eq.${platformId}`,
      { headers }
    );
    
    if (checkResponse.ok) {
      const remainingPlatforms = await checkResponse.json();
      if (remainingPlatforms.length === 0) {
        console.log('✅ Confirmado: Plataforma foi removida do banco de dados.');
      } else {
        console.log('⚠️ A plataforma ainda existe no banco de dados.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

forceCleanPlatform();
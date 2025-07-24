// Script para remover plataforma usando o sistema de database da aplicação
require('dotenv').config();

async function deletePlatformDirect() {
  try {
    // Importar o sistema de database da aplicação
    const { db } = require('../src/lib/database.ts');
    
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🗑️ Removendo plataforma usando sistema da aplicação...');
    console.log(`ID: ${platformId}`);
    
    // Verificar se a plataforma existe
    const platform = await db.platform.findFirst({
      id: platformId
    });
    
    if (!platform) {
      console.log('❌ Plataforma não encontrada ou já foi removida.');
      return;
    }
    
    console.log('📋 Plataforma encontrada:');
    console.log(`   Nome: ${platform.name}`);
    console.log(`   Tipo: ${platform.type}`);
    console.log(`   Workspace: ${platform.workspace_id}`);
    console.log(`   Criada em: ${platform.created_at}`);
    
    // Buscar conversas relacionadas
    const conversations = await db.conversation.findMany({
      platform_id: platformId
    });
    
    console.log(`📋 Encontradas ${conversations.length} conversas relacionadas`);
    
    // Remover mensagens das conversas
    for (const conv of conversations) {
      console.log(`🗑️ Removendo mensagens da conversa ${conv.id}...`);
      const messages = await db.message.findMany({
        conversation_id: conv.id
      });
      
      for (const message of messages) {
        await db.message.delete({ id: message.id });
      }
    }
    
    // Remover cards do kanban (se existirem)
    for (const conv of conversations) {
      console.log(`🗑️ Verificando cards do kanban da conversa ${conv.id}...`);
      try {
        if (db.kanbanCard && db.kanbanCard.findMany) {
          const cards = await db.kanbanCard.findMany({
            conversation_id: conv.id
          });
          
          for (const card of cards) {
            await db.kanbanCard.delete({ id: card.id });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao remover cards do kanban (pode não existir):`, error.message);
      }
    }
    
    // Remover conversas
    console.log('🗑️ Removendo conversas...');
    for (const conv of conversations) {
      await db.conversation.delete({ id: conv.id });
    }
    
    // Remover contatos
    console.log('🗑️ Removendo contatos...');
    const contacts = await db.contact.findMany({
      platform_id: platformId
    });
    
    for (const contact of contacts) {
      await db.contact.delete({ id: contact.id });
    }
    
    // Finalmente, remover a plataforma
    console.log('🗑️ Removendo plataforma...');
    await db.platform.delete({
      id: platformId
    });
    
    console.log('✅ Plataforma removida com sucesso!');
    console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    console.log('\n🔄 Tentando abordagem alternativa via Supabase...');
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const platformId = 'cmd6nujkh0001m9mwocvky970';
      
      console.log('🗑️ Tentando remover diretamente via Supabase...');
      
      // Remover mensagens primeiro
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('platform_id', platformId);
      
      if (conversations && conversations.length > 0) {
        for (const conv of conversations) {
          console.log(`🗑️ Removendo mensagens da conversa ${conv.id}...`);
          await supabase
            .from('messages')
            .delete()
            .eq('conversation_id', conv.id);
        }
        
        console.log('🗑️ Removendo conversas...');
        await supabase
          .from('conversations')
          .delete()
          .eq('platform_id', platformId);
      }
      
      // Remover contatos
      console.log('🗑️ Removendo contatos...');
      await supabase
        .from('contacts')
        .delete()
        .eq('platform_id', platformId);
      
      // Remover plataforma
      console.log('🗑️ Removendo plataforma...');
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', platformId);
      
      if (error) {
        console.error('❌ Erro ao remover via Supabase:', error);
      } else {
        console.log('✅ Plataforma removida via Supabase!');
        console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
      }
      
    } catch (supabaseError) {
      console.error('❌ Erro na abordagem alternativa:', supabaseError);
    }
  }
}

deletePlatformDirect();
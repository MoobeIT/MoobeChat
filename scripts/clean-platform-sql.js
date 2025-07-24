const { Client } = require('pg');
require('dotenv').config();

// Configuração do PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function cleanPlatformSQL() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados PostgreSQL');
    
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🗑️ Removendo plataforma e dados relacionados...');
    console.log(`ID: ${platformId}`);
    
    // Verificar se a plataforma existe
    const platformQuery = 'SELECT * FROM platforms WHERE id = $1';
    const platformResult = await client.query(platformQuery, [platformId]);
    
    if (platformResult.rows.length === 0) {
      console.log('❌ Plataforma não encontrada ou já foi removida.');
      return;
    }
    
    const platform = platformResult.rows[0];
    console.log('📋 Plataforma encontrada:');
    console.log(`   Nome: ${platform.name}`);
    console.log(`   Tipo: ${platform.type}`);
    console.log(`   Workspace: ${platform.workspace_id}`);
    console.log(`   Criada em: ${platform.created_at}`);
    
    // Iniciar transação
    await client.query('BEGIN');
    
    try {
      // 1. Remover mensagens das conversas relacionadas
      const deleteMessagesQuery = `
        DELETE FROM messages 
        WHERE conversation_id IN (
          SELECT id FROM conversations WHERE platform_id = $1
        )
      `;
      const messagesResult = await client.query(deleteMessagesQuery, [platformId]);
      console.log(`🗑️ Removidas ${messagesResult.rowCount} mensagens`);
      
      // 2. Remover cards do kanban relacionados às conversas
      const deleteKanbanCardsQuery = `
        DELETE FROM kanban_cards 
        WHERE conversation_id IN (
          SELECT id FROM conversations WHERE platform_id = $1
        )
      `;
      const kanbanResult = await client.query(deleteKanbanCardsQuery, [platformId]);
      console.log(`🗑️ Removidos ${kanbanResult.rowCount} cards do kanban`);
      
      // 3. Remover conversas
      const deleteConversationsQuery = 'DELETE FROM conversations WHERE platform_id = $1';
      const conversationsResult = await client.query(deleteConversationsQuery, [platformId]);
      console.log(`🗑️ Removidas ${conversationsResult.rowCount} conversas`);
      
      // 4. Remover contatos
      const deleteContactsQuery = 'DELETE FROM contacts WHERE platform_id = $1';
      const contactsResult = await client.query(deleteContactsQuery, [platformId]);
      console.log(`🗑️ Removidos ${contactsResult.rowCount} contatos`);
      
      // 5. Finalmente, remover a plataforma
      const deletePlatformQuery = 'DELETE FROM platforms WHERE id = $1';
      const platformDeleteResult = await client.query(deletePlatformQuery, [platformId]);
      console.log(`🗑️ Removidas ${platformDeleteResult.rowCount} plataformas`);
      
      // Confirmar transação
      await client.query('COMMIT');
      
      console.log('✅ Plataforma e todos os dados relacionados foram removidos com sucesso!');
      console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
      
    } catch (error) {
      // Reverter transação em caso de erro
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão com o banco encerrada.');
  }
}

cleanPlatformSQL();
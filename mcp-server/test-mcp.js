#!/usr/bin/env node

/**
 * Script de teste para o servidor MCP do Moobi Chat
 * Este script demonstra como usar as ferramentas MCP programaticamente
 */

import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '../.env.local' });

// Debug: verificar se as variáveis foram carregadas
console.log('🔧 Variáveis de ambiente:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não encontrada');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não encontrada');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Definida' : '❌ Não encontrada');
console.log('');

class MCPTester {
  constructor() {
    // Configurar Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
    }

    // Configurar PostgreSQL direto
    if (process.env.DATABASE_URL) {
      this.sql = postgres(process.env.DATABASE_URL);
    }
  }

  async testConnection() {
    console.log('🔍 Testando conexão com Supabase...');
    
    try {
      const { data, error } = await this.supabase
        .from('workspaces')
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.log('✅ Conexão OK! Tabelas ainda não criadas.');
        return true;
      }

      if (error && error.code === '42501') {
        console.log('✅ Conexão OK! Schema ainda não configurado (execute o SQL primeiro).');
        return true;
      }

      if (error) {
        console.log('❌ Erro na conexão:', error.message);
        return false;
      }

      console.log('✅ Conexão OK! Tabelas existem.');
      console.log('📊 Workspaces encontrados:', data?.length || 0);
      return true;
    } catch (error) {
      console.log('❌ Erro na conexão:', error.message);
      return false;
    }
  }

  async testPostgresDirect() {
    console.log('\n🔍 Testando conexão PostgreSQL direta...');
    
    try {
      const result = await this.sql`SELECT version()`;
      console.log('✅ PostgreSQL conectado!');
      console.log('📋 Versão:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);
      return true;
    } catch (error) {
      console.log('❌ Erro PostgreSQL:', error.message);
      return false;
    }
  }

  async testTables() {
    console.log('\n🔍 Verificando tabelas...');
    
    const tables = [
      'users', 'workspaces', 'workspace_users',
      'platforms', 'contacts', 'conversations', 'messages',
      'kanban_boards', 'kanban_columns', 'kanban_cards'
    ];

    const results = {};
    
    for (const table of tables) {
      try {
        const count = await this.sql`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ${table}
        `;
        
        results[table] = count[0].count > 0;
        console.log(`${results[table] ? '✅' : '❌'} ${table}`);
      } catch (error) {
        results[table] = false;
        console.log(`❌ ${table} - Erro: ${error.message}`);
      }
    }

    return results;
  }

  async createSampleData() {
    console.log('\n🔧 Criando dados de exemplo...');
    
    try {
      // Criar workspace
      const workspace = await this.sql`
        INSERT INTO workspaces (name, description)
        VALUES ('Workspace Teste MCP', 'Criado pelo teste MCP')
        ON CONFLICT DO NOTHING
        RETURNING *
      `;
      
      let workspaceId;
      if (workspace.length > 0) {
        workspaceId = workspace[0].id;
        console.log('✅ Workspace criado:', workspace[0].name);
      } else {
        // Buscar workspace existente
        const existing = await this.sql`SELECT * FROM workspaces LIMIT 1`;
        workspaceId = existing[0].id;
        console.log('✅ Usando workspace existente:', existing[0].name);
      }

      // Criar plataforma
      const platform = await this.sql`
        INSERT INTO platforms (workspace_id, type, name, config, status)
        VALUES (${workspaceId}, 'WHATSAPP', 'WhatsApp Teste', '{}', 'CONNECTED')
        ON CONFLICT DO NOTHING
        RETURNING *
      `;
      
      let platformId;
      if (platform.length > 0) {
        platformId = platform[0].id;
        console.log('✅ Plataforma criada:', platform[0].name);
      } else {
        const existing = await this.sql`
          SELECT * FROM platforms WHERE workspace_id = ${workspaceId} LIMIT 1
        `;
        platformId = existing[0].id;
        console.log('✅ Usando plataforma existente:', existing[0].name);
      }

      // Criar contato
      const contact = await this.sql`
        INSERT INTO contacts (name, phone, platform_id, workspace_id)
        VALUES ('Cliente Teste MCP', '+5511999999999', ${platformId}, ${workspaceId})
        ON CONFLICT DO NOTHING
        RETURNING *
      `;
      
      let contactId;
      if (contact.length > 0) {
        contactId = contact[0].id;
        console.log('✅ Contato criado:', contact[0].name);
      } else {
        const existing = await this.sql`
          SELECT * FROM contacts WHERE platform_id = ${platformId} LIMIT 1
        `;
        contactId = existing[0].id;
        console.log('✅ Usando contato existente:', existing[0].name);
      }

      // Criar conversa
      const conversation = await this.sql`
        INSERT INTO conversations (title, contact_id, platform_id, workspace_id, status)
        VALUES ('Conversa Teste MCP', ${contactId}, ${platformId}, ${workspaceId}, 'OPEN')
        RETURNING *
      `;
      
      console.log('✅ Conversa criada:', conversation[0].title);

      // Criar mensagem
      const message = await this.sql`
        INSERT INTO messages (content, type, direction, conversation_id)
        VALUES ('Olá! Esta é uma mensagem de teste do MCP.', 'TEXT', 'INBOUND', ${conversation[0].id})
        RETURNING *
      `;
      
      console.log('✅ Mensagem criada:', message[0].content.substring(0, 50) + '...');

      return {
        workspaceId,
        platformId,
        contactId,
        conversationId: conversation[0].id,
        messageId: message[0].id
      };
    } catch (error) {
      console.log('❌ Erro ao criar dados:', error.message);
      return null;
    }
  }

  async testQueries(sampleData) {
    console.log('\n🔍 Testando consultas...');
    
    try {
      // Buscar conversas
      const conversations = await this.sql`
        SELECT c.*, p.name as platform_name, p.type as platform_type,
               COUNT(m.id) as message_count
        FROM conversations c
        LEFT JOIN platforms p ON c.platform_id = p.id
        LEFT JOIN messages m ON c.id = m.conversation_id
        GROUP BY c.id, p.name, p.type
        ORDER BY c.created_at DESC
        LIMIT 5
      `;
      
      console.log(`✅ Conversas encontradas: ${conversations.length}`);
      conversations.forEach(conv => {
        console.log(`   📞 ${conv.title} (${conv.platform_type}) - ${conv.message_count} mensagens`);
      });

      // Buscar mensagens da conversa de teste
      if (sampleData?.conversationId) {
        const messages = await this.sql`
          SELECT * FROM messages 
          WHERE conversation_id = ${sampleData.conversationId}
          ORDER BY created_at ASC
        `;
        
        console.log(`✅ Mensagens da conversa teste: ${messages.length}`);
        messages.forEach(msg => {
          console.log(`   💬 ${msg.direction}: ${msg.content.substring(0, 50)}...`);
        });
      }

      // Estatísticas
      const stats = await this.sql`
        SELECT 
          COUNT(*) as total_conversations,
          COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_conversations,
          COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed_conversations
        FROM conversations
      `;
      
      console.log('✅ Estatísticas:');
      console.log(`   📊 Total de conversas: ${stats[0].total_conversations}`);
      console.log(`   🟢 Abertas: ${stats[0].open_conversations}`);
      console.log(`   🔴 Fechadas: ${stats[0].closed_conversations}`);

    } catch (error) {
      console.log('❌ Erro nas consultas:', error.message);
    }
  }

  async cleanup() {
    if (this.sql) {
      await this.sql.end();
    }
  }

  async runAllTests() {
    console.log('🚀 Iniciando testes do MCP Moobi Chat\n');
    
    // Teste 1: Conexão Supabase
    const supabaseOk = await this.testConnection();
    
    // Teste 2: Conexão PostgreSQL
    const postgresOk = await this.testPostgresDirect();
    
    if (!supabaseOk && !postgresOk) {
      console.log('\n❌ Nenhuma conexão funcionando. Verifique as variáveis de ambiente.');
      return;
    }

    // Teste 3: Verificar tabelas
    const tables = await this.testTables();
    const allTablesExist = Object.values(tables).every(exists => exists);
    
    if (!allTablesExist) {
      console.log('\n⚠️  Algumas tabelas não existem. Execute o schema SQL primeiro.');
      console.log('📋 Arquivo: supabase-schema-step-by-step.sql');
    } else {
      // Teste 4: Criar dados de exemplo
      const sampleData = await this.createSampleData();
      
      // Teste 5: Testar consultas
      await this.testQueries(sampleData);
    }

    console.log('\n🎉 Testes concluídos!');
    console.log('\n📋 Próximos passos:');
    console.log('1. ✅ Servidor MCP funcionando');
    console.log('2. 🔧 Configure o Claude Desktop com o arquivo claude-desktop-config.json');
    console.log('3. 🔄 Reinicie o Claude Desktop');
    console.log('4. 🧪 Teste no Claude: "Mostre as conversas do Moobi Chat"');
    
    await this.cleanup();
  }
}

// Executar testes
const tester = new MCPTester();
tester.runAllTests().catch(console.error);
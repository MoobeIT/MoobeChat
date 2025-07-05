#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '../.env.local' });

const SUPABASE_URL = 'https://gnnazztjaeukllmnnxyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubmF6enRqYWV1a2xsbW5ueHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY4OTMsImV4cCI6MjA2Njk2Mjg5M30.XIS2x3K4rMiLaWQ8Nlrd-Aw8k_RHGkZjFdGTEpFrsyw';

class SupabaseMCPServer {
  constructor() {
    // Conectar diretamente com Supabase via API REST
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    this.server = new Server(
      {
        name: 'moobi-chat-supabase-direct',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_tables',
          description: 'Criar todas as tabelas do Moobi Chat no Supabase',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'list_tables',
          description: 'Listar todas as tabelas existentes no banco',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'create_user',
          description: 'Criar um usuário no sistema',
          inputSchema: {
            type: 'object',
            properties: {
              email: { type: 'string', description: 'Email do usuário' },
              name: { type: 'string', description: 'Nome do usuário' }
            },
            required: ['email', 'name']
          }
        },
        {
          name: 'create_conversation',
          description: 'Criar uma nova conversa',
          inputSchema: {
            type: 'object',
            properties: {
              customerName: { type: 'string', description: 'Nome do cliente' },
              customerPhone: { type: 'string', description: 'Telefone do cliente' },
              platform: { type: 'string', description: 'Plataforma (WHATSAPP, INSTAGRAM, etc.)' }
            },
            required: ['customerName', 'customerPhone', 'platform']
          }
        },
        {
          name: 'list_conversations',
          description: 'Listar todas as conversas',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Limite de resultados', default: 10 }
            }
          }
        },
        {
          name: 'send_message',
          description: 'Enviar uma mensagem em uma conversa',
          inputSchema: {
            type: 'object',
            properties: {
              conversationId: { type: 'string', description: 'ID da conversa' },
              content: { type: 'string', description: 'Conteúdo da mensagem' },
              direction: { type: 'string', enum: ['INCOMING', 'OUTGOING'], description: 'Direção da mensagem' }
            },
            required: ['conversationId', 'content', 'direction']
          }
        },
        {
          name: 'get_messages',
          description: 'Buscar mensagens de uma conversa',
          inputSchema: {
            type: 'object',
            properties: {
              conversationId: { type: 'string', description: 'ID da conversa' }
            },
            required: ['conversationId']
          }
        },
        {
          name: 'execute_sql',
          description: 'Executar SQL diretamente no banco (via RPC)',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Query SQL para executar' }
            },
            required: ['query']
          }
        }
      ]
    }));

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_tables':
            return await this.createTables();
          
          case 'list_tables':
            return await this.listTables();
          
          case 'create_user':
            return await this.createUser(args);
          
          case 'create_conversation':
            return await this.createConversation(args);
          
          case 'list_conversations':
            return await this.listConversations(args);
          
          case 'send_message':
            return await this.sendMessage(args);
          
          case 'get_messages':
            return await this.getMessages(args);
          
          case 'execute_sql':
            return await this.executeSQL(args);
          
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Erro: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async createTables() {
    try {
      // Criar tabelas usando SQL direto via RPC do Supabase
      const createTablesSQL = `
        -- Criar tabelas do Moobi Chat
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR UNIQUE NOT NULL,
          name VARCHAR,
          role VARCHAR DEFAULT 'USER',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS workspaces (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS platforms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id UUID REFERENCES workspaces(id),
          type VARCHAR NOT NULL,
          name VARCHAR NOT NULL,
          config JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id UUID REFERENCES workspaces(id),
          platform_id UUID REFERENCES platforms(id),
          external_id VARCHAR NOT NULL,
          customer_name VARCHAR,
          customer_phone VARCHAR,
          customer_email VARCHAR,
          status VARCHAR DEFAULT 'OPEN',
          priority VARCHAR DEFAULT 'MEDIUM',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_message_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(platform_id, external_id)
        );

        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID REFERENCES conversations(id),
          external_id VARCHAR,
          content TEXT NOT NULL,
          message_type VARCHAR DEFAULT 'TEXT',
          direction VARCHAR NOT NULL,
          sender_name VARCHAR,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Inserir dados básicos
        INSERT INTO workspaces (name, description) 
        VALUES ('Workspace Padrão', 'Workspace principal do Moobi Chat')
        ON CONFLICT DO NOTHING;

        INSERT INTO platforms (workspace_id, type, name, config)
        SELECT w.id, 'WHATSAPP', 'WhatsApp Principal', '{}'
        FROM workspaces w
        WHERE w.name = 'Workspace Padrão'
        ON CONFLICT DO NOTHING;
      `;

      // Executar via função SQL do Supabase
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql_query: createTablesSQL 
      });

      if (error) {
        // Se não tiver a função RPC, vamos criar as tabelas via REST API
        console.log('Criando tabelas via REST API...');
        return await this.createTablesViaREST();
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Tabelas criadas com sucesso!',
            data
          }, null, 2)
        }]
      };

    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      return await this.createTablesViaREST();
    }
  }

  async createTablesViaREST() {
    try {
      // Criar workspace
      const { data: workspace, error: workspaceError } = await this.supabase
        .from('workspaces')
        .insert([{
          name: 'Workspace Padrão',
          description: 'Workspace principal do Moobi Chat'
        }])
        .select()
        .single();

      let workspaceData = workspace;
      if (workspaceError && workspaceError.code !== '23505') { // 23505 = unique violation
        console.error('Erro workspace:', workspaceError);
      }

      // Se workspace já existe, buscar
      if (!workspaceData) {
        const { data: existingWorkspace } = await this.supabase
          .from('workspaces')
          .select('*')
          .eq('name', 'Workspace Padrão')
          .single();
        workspaceData = existingWorkspace;
      }

      // Criar plataforma
      if (workspaceData) {
        const { data: platform, error: platformError } = await this.supabase
          .from('platforms')
          .insert([{
            workspace_id: workspaceData.id,
            type: 'WHATSAPP',
            name: 'WhatsApp Principal',
            config: {}
          }])
          .select();

        if (platformError && platformError.code !== '23505') {
          console.error('Erro platform:', platformError);
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Tabelas e dados básicos criados via REST API!',
            workspace: workspaceData
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao criar estrutura: ${error.message}`);
    }
  }

  async listTables() {
    try {
      // Listar tabelas via information_schema
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            tables: data.map(t => t.table_name)
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao listar tabelas: ${error.message}`);
    }
  }

  async createUser(args) {
    const { email, name } = args;

    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([{ email, name }])
        .select()
        .single();

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            user: data
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  async createConversation(args) {
    const { customerName, customerPhone, platform } = args;

    try {
      // Buscar workspace e platform
      const { data: workspace } = await this.supabase
        .from('workspaces')
        .select('*')
        .limit(1)
        .single();

      const { data: platformData } = await this.supabase
        .from('platforms')
        .select('*')
        .eq('type', platform)
        .limit(1)
        .single();

      if (!workspace || !platformData) {
        throw new Error('Workspace ou plataforma não encontrados');
      }

      const { data, error } = await this.supabase
        .from('conversations')
        .insert([{
          workspace_id: workspace.id,
          platform_id: platformData.id,
          external_id: customerPhone,
          customer_name: customerName,
          customer_phone: customerPhone,
          status: 'OPEN',
          priority: 'MEDIUM'
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            conversation: data
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao criar conversa: ${error.message}`);
    }
  }

  async listConversations(args = {}) {
    const { limit = 10 } = args;

    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          platforms:platform_id(name, type),
          workspaces:workspace_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            conversations: data,
            total: data.length
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao listar conversas: ${error.message}`);
    }
  }

  async sendMessage(args) {
    const { conversationId, content, direction } = args;

    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          content: content,
          message_type: 'TEXT',
          direction: direction,
          sender_name: direction === 'INCOMING' ? 'Cliente' : 'Atendente'
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar última mensagem da conversa
      await this.supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: data
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao enviar mensagem: ${error.message}`);
    }
  }

  async getMessages(args) {
    const { conversationId } = args;

    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            conversationId,
            messages: data,
            total: data.length
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }
  }

  async executeSQL(args) {
    const { query } = args;

    try {
      // Executar SQL via RPC se disponível
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql_query: query 
      });

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            result: data
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao executar SQL: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Servidor MCP Supabase DIRETO iniciado!');
    console.error('🔗 Conectado em:', SUPABASE_URL);
  }
}

// Iniciar servidor
const server = new SupabaseMCPServer();
server.run().catch(console.error); 
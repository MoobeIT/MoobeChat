#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gnnazztjaeukllmnnxyj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubmF6enRqYWV1a2xsbW5ueHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY4OTMsImV4cCI6MjA2Njk2Mjg5M30.XIS2x3K4rMiLaWQ8Nlrd-Aw8k_RHGkZjFdGTEpFrsyw';

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
          name: 'test_connection',
          description: 'Testar conexão com Supabase',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'create_tables',
          description: 'Criar todas as tabelas do Moobi Chat no Supabase',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'get_conversations',
          description: 'Buscar conversas do Moobi Chat',
          inputSchema: {
            type: 'object',
            properties: {
              limit: { type: 'number', description: 'Limite de resultados', default: 10 }
            }
          }
        },
        {
          name: 'create_conversation',
          description: 'Criar nova conversa',
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
          name: 'create_workspace',
          description: 'Criar workspace padrão',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Nome do workspace' }
            }
          }
        },
        {
          name: 'setup_initial_data',
          description: 'Configurar dados iniciais (workspace, plataforma, etc.)',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'test_connection':
            return await this.testConnection();
          
          case 'create_tables':
            return await this.createTables();
          
          case 'get_conversations':
            return await this.getConversations(args);
          
          case 'create_conversation':
            return await this.createConversation(args);
          
          case 'create_workspace':
            return await this.createWorkspace(args);
          
          case 'setup_initial_data':
            return await this.setupInitialData();
          
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

  async testConnection() {
    try {
      // Testar conexão fazendo uma consulta simples
      const { data, error } = await this.supabase
        .from('workspaces')
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              connected: true,
              message: 'Conexão com Supabase OK! Tabelas ainda não criadas.',
              url: SUPABASE_URL,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            connected: true,
            message: 'Conexão com Supabase OK! Tabelas existem.',
            url: SUPABASE_URL,
            tablesExist: true,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            url: SUPABASE_URL
          }, null, 2)
        }]
      };
    }
  }

  async createTables() {
    try {
      // Criar tabelas usando SQL RPC
      const { data, error } = await this.supabase.rpc('create_moobi_tables');

      if (error) {
        throw error;
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Tabelas criadas com sucesso!',
            tables: [
              'users', 'accounts', 'sessions', 'workspaces', 'workspace_users',
              'platforms', 'conversations', 'messages', 'kanban_boards',
              'kanban_columns', 'kanban_cards'
            ]
          }, null, 2)
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            suggestion: 'Talvez seja necessário criar as tabelas manualmente no Supabase Dashboard.'
          }, null, 2)
        }]
      };
    }
  }

  async getConversations(args = {}) {
    const { limit = 10 } = args;

    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          *,
          platform:platforms(*),
          messages(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            total: data.length,
            conversations: data
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao buscar conversas: ${error.message}`);
    }
  }

  async createConversation(args) {
    const { customerName, customerPhone, platform } = args;

    try {
      // Buscar workspace padrão
      const { data: workspace, error: workspaceError } = await this.supabase
        .from('workspaces')
        .select('*')
        .limit(1)
        .single();

      if (workspaceError) {
        throw new Error('Workspace não encontrado. Execute setup_initial_data primeiro.');
      }

      // Buscar plataforma
      const { data: platformData, error: platformError } = await this.supabase
        .from('platforms')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('type', platform)
        .limit(1)
        .single();

      if (platformError) {
        throw new Error('Plataforma não encontrada. Execute setup_initial_data primeiro.');
      }

      // Criar conversa
      const { data: conversation, error: conversationError } = await this.supabase
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

      if (conversationError) throw conversationError;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            conversation
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao criar conversa: ${error.message}`);
    }
  }

  async createWorkspace(args) {
    const { name = 'Workspace Padrão' } = args;

    try {
      const { data, error } = await this.supabase
        .from('workspaces')
        .insert([{
          name: name,
          description: 'Workspace criado via MCP'
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            workspace: data
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao criar workspace: ${error.message}`);
    }
  }

  async setupInitialData() {
    try {
      // Criar workspace padrão
      const { data: workspace, error: workspaceError } = await this.supabase
        .from('workspaces')
        .upsert([{
          id: 'workspace-default',
          name: 'Workspace Padrão',
          description: 'Workspace criado automaticamente'
        }])
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Criar plataforma WhatsApp
      const { data: platform, error: platformError } = await this.supabase
        .from('platforms')
        .upsert([{
          workspace_id: workspace.id,
          type: 'WHATSAPP',
          name: 'WhatsApp Principal',
          config: {},
          is_active: true
        }])
        .select()
        .single();

      if (platformError) throw platformError;

      // Criar board Kanban padrão
      const { data: board, error: boardError } = await this.supabase
        .from('kanban_boards')
        .upsert([{
          workspace_id: workspace.id,
          name: 'Board Principal',
          description: 'Board Kanban padrão',
          is_default: true
        }])
        .select()
        .single();

      if (boardError) throw boardError;

      // Criar colunas do Kanban
      const columns = [
        { name: 'Novo', color: '#3B82F6', position: 0 },
        { name: 'Em Andamento', color: '#F59E0B', position: 1 },
        { name: 'Aguardando', color: '#8B5CF6', position: 2 },
        { name: 'Resolvido', color: '#10B981', position: 3 }
      ];

      for (const column of columns) {
        const { error: columnError } = await this.supabase
          .from('kanban_columns')
          .upsert([{
            board_id: board.id,
            ...column
          }]);

        if (columnError) throw columnError;
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Dados iniciais configurados com sucesso!',
            workspace: workspace.name,
            platform: platform.name,
            board: board.name,
            columns: columns.length
          }, null, 2)
        }]
      };

    } catch (error) {
      throw new Error(`Erro ao configurar dados iniciais: ${error.message}`);
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
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '../.env.local' });

class MoobiChatMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'moobi-chat-mcp-supabase',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configurar Supabase (se disponível)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
    }

    // Configurar conexão PostgreSQL direta
    if (process.env.DATABASE_URL) {
      this.sql = postgres(process.env.DATABASE_URL);
    }

    this.setupHandlers();
  }

  setupHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_conversations',
          description: 'Buscar conversas do Moobi Chat com filtros opcionais',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'],
                description: 'Filtrar por status da conversa'
              },
              platform: {
                type: 'string',
                description: 'Filtrar por plataforma (ex: WHATSAPP)'
              },
              limit: {
                type: 'number',
                description: 'Limite de resultados (padrão: 10)',
                default: 10
              }
            }
          }
        },
        {
          name: 'get_messages',
          description: 'Buscar mensagens de uma conversa específica',
          inputSchema: {
            type: 'object',
            properties: {
              conversationId: {
                type: 'string',
                description: 'ID da conversa'
              },
              limit: {
                type: 'number',
                description: 'Limite de mensagens (padrão: 50)',
                default: 50
              }
            },
            required: ['conversationId']
          }
        },
        {
          name: 'create_conversation',
          description: 'Criar uma nova conversa',
          inputSchema: {
            type: 'object',
            properties: {
              customerName: {
                type: 'string',
                description: 'Nome do cliente'
              },
              customerPhone: {
                type: 'string',
                description: 'Telefone do cliente'
              },
              platform: {
                type: 'string',
                description: 'Plataforma (WHATSAPP, INSTAGRAM, etc.)'
              }
            },
            required: ['customerName', 'customerPhone', 'platform']
          }
        },
        {
          name: 'send_message',
          description: 'Enviar mensagem em uma conversa',
          inputSchema: {
            type: 'object',
            properties: {
              conversationId: {
                type: 'string',
                description: 'ID da conversa'
              },
              content: {
                type: 'string',
                description: 'Conteúdo da mensagem'
              },
              senderName: {
                type: 'string',
                description: 'Nome do remetente',
                default: 'MCP Bot'
              }
            },
            required: ['conversationId', 'content']
          }
        },
        {
          name: 'get_dashboard_stats',
          description: 'Obter estatísticas do dashboard',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'update_conversation_status',
          description: 'Atualizar status de uma conversa',
          inputSchema: {
            type: 'object',
            properties: {
              conversationId: {
                type: 'string',
                description: 'ID da conversa'
              },
              status: {
                type: 'string',
                enum: ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'],
                description: 'Novo status da conversa'
              }
            },
            required: ['conversationId', 'status']
          }
        },
        {
          name: 'get_kanban_board',
          description: 'Obter board Kanban com todas as conversas organizadas',
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
          case 'get_conversations':
            return await this.getConversations(args);
          
          case 'get_messages':
            return await this.getMessages(args);
          
          case 'create_conversation':
            return await this.createConversation(args);
          
          case 'send_message':
            return await this.sendMessage(args);
          
          case 'get_dashboard_stats':
            return await this.getDashboardStats();
          
          case 'update_conversation_status':
            return await this.updateConversationStatus(args);
          
          case 'get_kanban_board':
            return await this.getKanbanBoard();
          
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

  async getConversations(args = {}) {
    const { status, platform, limit = 10 } = args;
    
    let query = `
      SELECT c.*, p.name as platform_name, p.type as platform_type,
             COUNT(m.id) as message_count,
             MAX(m."createdAt") as last_message_time
      FROM "conversations" c
      LEFT JOIN "platforms" p ON c."platformId" = p.id
      LEFT JOIN "messages" m ON c.id = m."conversationId"
    `;
    
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push(`c.status = $${conditions.length + 1}`);
      params.push(status);
    }
    
    if (platform) {
      conditions.push(`p.type = $${conditions.length + 1}`);
      params.push(platform);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` GROUP BY c.id, p.name, p.type ORDER BY c."lastMessageAt" DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const conversations = await this.sql.unsafe(query, params);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          total: conversations.length,
          conversations: conversations.map(conv => ({
            id: conv.id,
            customerName: conv.customerName,
            customerPhone: conv.customerPhone,
            status: conv.status,
            priority: conv.priority,
            platform: {
              name: conv.platform_name,
              type: conv.platform_type
            },
            messageCount: parseInt(conv.message_count),
            lastMessageAt: conv.lastMessageAt,
            createdAt: conv.createdAt
          }))
        }, null, 2)
      }]
    };
  }

  async getMessages(args) {
    const { conversationId, limit = 50 } = args;
    
    const messages = await this.sql`
      SELECT * FROM "messages" 
      WHERE "conversationId" = ${conversationId}
      ORDER BY "createdAt" ASC
      LIMIT ${limit}
    `;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          conversationId,
          total: messages.length,
          messages: messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            messageType: msg.messageType,
            direction: msg.direction,
            senderName: msg.senderName,
            createdAt: msg.createdAt
          }))
        }, null, 2)
      }]
    };
  }

  async createConversation(args) {
    const { customerName, customerPhone, platform } = args;
    
    // Buscar ou criar workspace padrão
    let workspace = await this.sql`
      SELECT * FROM "workspaces" LIMIT 1
    `;
    
    if (workspace.length === 0) {
      workspace = await this.sql`
        INSERT INTO "workspaces" (name, description)
        VALUES ('Workspace Padrão', 'Criado via MCP')
        RETURNING *
      `;
      workspace = workspace[0];
    } else {
      workspace = workspace[0];
    }

    // Buscar ou criar plataforma
    let platformRecord = await this.sql`
      SELECT * FROM "platforms" 
      WHERE "workspaceId" = ${workspace.id} AND type = ${platform}
      LIMIT 1
    `;
    
    if (platformRecord.length === 0) {
      platformRecord = await this.sql`
        INSERT INTO "platforms" ("workspaceId", type, name, config, "isActive")
        VALUES (${workspace.id}, ${platform}, ${platform + ' Principal'}, '{}', true)
        RETURNING *
      `;
      platformRecord = platformRecord[0];
    } else {
      platformRecord = platformRecord[0];
    }

    // Criar conversa
    const conversation = await this.sql`
      INSERT INTO "conversations" (
        "workspaceId", "platformId", "externalId", 
        "customerName", "customerPhone", status, priority
      )
      VALUES (
        ${workspace.id}, ${platformRecord.id}, ${customerPhone},
        ${customerName}, ${customerPhone}, 'OPEN', 'MEDIUM'
      )
      RETURNING *
    `;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          conversation: {
            id: conversation[0].id,
            customerName: conversation[0].customerName,
            customerPhone: conversation[0].customerPhone,
            status: conversation[0].status,
            createdAt: conversation[0].createdAt
          }
        }, null, 2)
      }]
    };
  }

  async sendMessage(args) {
    const { conversationId, content, senderName = 'MCP Bot' } = args;
    
    const message = await this.sql`
      INSERT INTO "messages" (
        "conversationId", content, "messageType", direction, "senderName"
      )
      VALUES (
        ${conversationId}, ${content}, 'TEXT', 'OUTGOING', ${senderName}
      )
      RETURNING *
    `;

    // Atualizar última mensagem da conversa
    await this.sql`
      UPDATE "conversations" 
      SET "lastMessageAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${conversationId}
    `;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: {
            id: message[0].id,
            content: message[0].content,
            senderName: message[0].senderName,
            createdAt: message[0].createdAt
          }
        }, null, 2)
      }]
    };
  }

  async getDashboardStats() {
    const stats = await this.sql`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_conversations,
        COUNT(CASE WHEN status = 'RESOLVED' AND DATE("updatedAt") = CURRENT_DATE THEN 1 END) as resolved_today
      FROM "conversations"
    `;

    const messageStats = await this.sql`
      SELECT COUNT(*) as total_messages
      FROM "messages"
    `;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          totalConversations: parseInt(stats[0].total_conversations),
          openConversations: parseInt(stats[0].open_conversations),
          resolvedToday: parseInt(stats[0].resolved_today),
          totalMessages: parseInt(messageStats[0].total_messages),
          generatedAt: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  async updateConversationStatus(args) {
    const { conversationId, status } = args;
    
    const updated = await this.sql`
      UPDATE "conversations" 
      SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${conversationId}
      RETURNING *
    `;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          conversation: {
            id: updated[0].id,
            status: updated[0].status,
            updatedAt: updated[0].updatedAt
          }
        }, null, 2)
      }]
    };
  }

  async getKanbanBoard() {
    const board = await this.sql`
      SELECT 
        b.*,
        json_agg(
          json_build_object(
            'id', col.id,
            'name', col.name,
            'color', col.color,
            'position', col.position,
            'cards', col_cards.cards
          ) ORDER BY col.position
        ) as columns
      FROM "kanban_boards" b
      LEFT JOIN "kanban_columns" col ON b.id = col."boardId"
      LEFT JOIN (
        SELECT 
          kc."columnId",
          json_agg(
            json_build_object(
              'id', kc.id,
              'position', kc.position,
              'conversation', json_build_object(
                'id', c.id,
                'customerName', c."customerName",
                'status', c.status,
                'platform', p.type
              )
            ) ORDER BY kc.position
          ) as cards
        FROM "kanban_cards" kc
        JOIN "conversations" c ON kc."conversationId" = c.id
        JOIN "platforms" p ON c."platformId" = p.id
        GROUP BY kc."columnId"
      ) col_cards ON col.id = col_cards."columnId"
      WHERE b."isDefault" = true
      GROUP BY b.id
      LIMIT 1
    `;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          board: board.length > 0 ? board[0] : null
        }, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Servidor MCP Moobi Chat iniciado!');
  }
}

// Iniciar servidor
const server = new MoobiChatMCPServer();
server.run().catch(console.error); 
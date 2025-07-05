// ===========================================
// CREDENCIAIS E DADOS MOCKADOS PARA DESENVOLVIMENTO
// ===========================================
// ⚠️  APENAS PARA DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO! ⚠️

export const MOCK_CREDENTIALS = {
  // Usuários de teste
  users: [
    {
      id: 'user_test_001',
      email: 'admin@moobi.test',
      password: '123456', // Em produção, seria hasheado
      name: 'Admin Teste',
      role: 'admin',
      avatar: 'https://github.com/shadcn.png',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'user_test_002',
      email: 'operador@moobi.test',
      password: '123456',
      name: 'Operador Teste',
      role: 'operator',
      avatar: 'https://github.com/vercel.png',
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'user_test_003',
      email: 'supervisor@moobi.test',
      password: '123456',
      name: 'Supervisor Teste',
      role: 'supervisor',
      avatar: 'https://github.com/nextjs.png',
      createdAt: new Date('2024-01-03'),
    }
  ],

  // Workspaces de teste
  workspaces: [
    {
      id: 'ws_test_12345',
      name: 'Workspace Teste',
      slug: 'workspace-teste',
      description: 'Workspace para testes de desenvolvimento',
      plan: 'premium',
      maxUsers: 10,
      maxInstances: 5,
      createdAt: new Date('2024-01-01'),
    }
  ],

  // Instâncias de WhatsApp de teste
  whatsappInstances: [
    {
      id: 'inst_test_001',
      name: 'WhatsApp Principal',
      instanceKey: 'moobi-test-instance',
      status: 'connected',
      qrCode: null,
      phone: '5511999999999',
      workspaceId: 'ws_test_12345',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'inst_test_002',
      name: 'WhatsApp Suporte',
      instanceKey: 'moobi-test-suporte',
      status: 'disconnected',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      phone: null,
      workspaceId: 'ws_test_12345',
      createdAt: new Date('2024-01-02'),
    }
  ],

  // Conversas de teste
  conversations: [
    {
      id: 'conv_test_001',
      platformId: 'inst_test_001',
      platform: 'whatsapp',
      contactName: 'João Silva',
      contactPhone: '5511888888888',
      lastMessage: 'Olá, preciso de ajuda com meu pedido',
      lastMessageAt: new Date('2024-01-15T10:30:00'),
      status: 'new',
      assignedTo: null,
      kanbanColumn: 'new',
      workspaceId: 'ws_test_12345',
      unreadCount: 3,
    },
    {
      id: 'conv_test_002',
      platformId: 'inst_test_001',
      platform: 'whatsapp',
      contactName: 'Maria Santos',
      contactPhone: '5511777777777',
      lastMessage: 'Obrigada pelo atendimento!',
      lastMessageAt: new Date('2024-01-15T09:15:00'),
      status: 'in_progress',
      assignedTo: 'user_test_002',
      kanbanColumn: 'in_progress',
      workspaceId: 'ws_test_12345',
      unreadCount: 0,
    },
    {
      id: 'conv_test_003',
      platformId: 'inst_test_001',
      platform: 'whatsapp',
      contactName: 'Pedro Costa',
      contactPhone: '5511666666666',
      lastMessage: 'Aguardando retorno sobre o orçamento',
      lastMessageAt: new Date('2024-01-14T16:45:00'),
      status: 'waiting',
      assignedTo: 'user_test_001',
      kanbanColumn: 'waiting',
      workspaceId: 'ws_test_12345',
      unreadCount: 1,
    }
  ],

  // Mensagens de teste
  messages: [
    {
      id: 'msg_test_001',
      conversationId: 'conv_test_001',
      content: 'Olá! Como posso ajudá-lo?',
      type: 'text',
      direction: 'outbound',
      status: 'sent',
      sentAt: new Date('2024-01-15T10:00:00'),
      senderId: 'user_test_002',
    },
    {
      id: 'msg_test_002',
      conversationId: 'conv_test_001',
      content: 'Olá, preciso de ajuda com meu pedido',
      type: 'text',
      direction: 'inbound',
      status: 'received',
      receivedAt: new Date('2024-01-15T10:30:00'),
      senderId: null,
    }
  ],

  // Configurações de API
  apiConfig: {
    webhooks: {
      whatsapp: 'http://localhost:3000/api/webhooks/uazapi',
      instagram: 'http://localhost:3000/api/webhooks/instagram',
    }
  }
}

// Função para autenticar usuário mockado
export function authenticateMockUser(email: string, password: string) {
  const user = MOCK_CREDENTIALS.users.find(u => u.email === email && u.password === password)
  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}

// Função para obter dados do workspace
export function getMockWorkspace(userId: string) {
  return MOCK_CREDENTIALS.workspaces[0] // Retorna o primeiro workspace para desenvolvimento
}

// Função para obter conversas de um workspace
export function getMockConversations(workspaceId: string) {
  return MOCK_CREDENTIALS.conversations.filter(c => c.workspaceId === workspaceId)
}

// Função para obter mensagens de uma conversa
export function getMockMessages(conversationId: string) {
  return MOCK_CREDENTIALS.messages.filter(m => m.conversationId === conversationId)
}

// Função para obter instâncias de WhatsApp
export function getMockWhatsAppInstances(workspaceId: string) {
  return MOCK_CREDENTIALS.whatsappInstances.filter(i => i.workspaceId === workspaceId)
} 
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário exemplo
  const user = await prisma.user.upsert({
    where: { email: 'admin@moobi.chat' },
    update: {},
    create: {
      email: 'admin@moobi.chat',
      name: 'Administrador',
      role: 'ADMIN'
    }
  })

  console.log('👤 Usuário criado:', user.email)

  // Criar workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'default-workspace' },
    update: {},
    create: {
      id: 'default-workspace',
      name: 'Minha Empresa',
      description: 'Workspace principal'
    }
  })

  console.log('🏢 Workspace criado:', workspace.name)

  // Associar usuário ao workspace
  await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'OWNER'
    }
  })

  // Criar plataforma WhatsApp
  const platform = await prisma.platform.upsert({
    where: { id: 'whatsapp-instance-1' },
    update: {},
    create: {
      id: 'whatsapp-instance-1',
      workspaceId: workspace.id,
      type: 'WHATSAPP',
      name: 'WhatsApp Principal',
      config: {
        instanceName: 'whatsapp-principal'
      },
      isActive: true
    }
  })

  console.log('📱 Plataforma criada:', platform.name)

  // Criar board Kanban
  const kanbanBoard = await prisma.kanbanBoard.upsert({
    where: { id: 'default-board' },
    update: {},
    create: {
      id: 'default-board',
      workspaceId: workspace.id,
      name: 'Atendimento',
      description: 'Board principal de atendimento',
      isDefault: true
    }
  })

  // Criar colunas do Kanban
  const columns = [
    { name: 'Novas', color: '#3b82f6', position: 0 },
    { name: 'Em Andamento', color: '#f59e0b', position: 1 },
    { name: 'Aguardando', color: '#ef4444', position: 2 },
    { name: 'Resolvidas', color: '#10b981', position: 3 }
  ]

  for (const column of columns) {
    const existingColumn = await prisma.kanbanColumn.findFirst({
      where: {
        boardId: kanbanBoard.id,
        position: column.position
      }
    })

    if (!existingColumn) {
      await prisma.kanbanColumn.create({
        data: {
          boardId: kanbanBoard.id,
          ...column
        }
      })
    }
  }

  console.log('📋 Board Kanban criado com colunas')

  // Criar conversas de exemplo
  const sampleConversations = [
    {
      customerName: 'João Silva',
      customerPhone: '5511999999999',
      customerEmail: 'joao@email.com',
      status: 'OPEN' as const
    },
    {
      customerName: 'Maria Santos',
      customerPhone: '5511888888888',
      customerEmail: 'maria@email.com',
      status: 'IN_PROGRESS' as const
    },
    {
      customerName: 'Pedro Costa',
      customerPhone: '5511777777777',
      customerEmail: 'pedro@email.com',
      status: 'RESOLVED' as const
    }
  ]

  for (let i = 0; i < sampleConversations.length; i++) {
    const convData = sampleConversations[i]
    
    const conversation = await prisma.conversation.upsert({
      where: {
        platformId_externalId: {
          platformId: platform.id,
          externalId: convData.customerPhone
        }
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        platformId: platform.id,
        externalId: convData.customerPhone,
        customerName: convData.customerName,
        customerPhone: convData.customerPhone,
        customerEmail: convData.customerEmail,
        status: convData.status,
        priority: 'MEDIUM',
        lastMessageAt: new Date()
      }
    })

    // Criar algumas mensagens de exemplo
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          content: `Olá! Sou ${convData.customerName}. Preciso de ajuda com um produto.`,
          messageType: 'TEXT',
          direction: 'INCOMING',
          senderName: convData.customerName,
          createdAt: new Date(Date.now() - 60000 * (i + 1))
        },
        {
          conversationId: conversation.id,
          content: 'Olá! Claro, posso te ajudar. Qual produto você gostaria de saber mais?',
          messageType: 'TEXT',
          direction: 'OUTGOING',
          senderName: 'Atendente',
          createdAt: new Date(Date.now() - 30000 * (i + 1))
        }
      ]
    })

    // Criar card no Kanban
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        boardId: kanbanBoard.id,
        position: i // Distribuir entre as colunas
      }
    })

    if (column) {
      await prisma.kanbanCard.upsert({
        where: { conversationId: conversation.id },
        update: {},
        create: {
          columnId: column.id,
          conversationId: conversation.id,
          position: 0
        }
      })
    }
  }

  console.log('💬 Conversas de exemplo criadas')
  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
import { prisma } from './prisma'

export async function ensureUserWorkspace(userId: string, userEmail?: string, userName?: string) {
  console.log('🔍 Debug - ensureUserWorkspace chamado com:', { userId, userEmail, userName })
  
  // Estratégia robusta: garantir que o usuário existe
  let user = await prisma.user.findUnique({
    where: { id: userId }
  })

  // Se não encontrou por ID, tentar por email
  if (!user && userEmail) {
    console.log('👤 Usuário não encontrado por ID, buscando por email:', userEmail)
    user = await prisma.user.findUnique({
      where: { email: userEmail }
    })
    
    if (user) {
      console.log('✅ Usuário encontrado por email, usando ID correto:', user.id)
      userId = user.id // Atualizar para usar o ID correto
    }
  }

  // Se ainda não existe, criar o usuário FORA da transação primeiro
  if (!user && userEmail) {
    console.log('👤 Criando novo usuário:', userEmail)
    try {
      // Usar upsert para evitar conflitos
      user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
          name: userName || null
        },
        create: {
          id: userId,
          email: userEmail,
          name: userName || null,
          role: 'USER'
        }
      })
      console.log('✅ Usuário criado/atualizado:', user.id)
      userId = user.id // Garantir que usamos o ID correto
    } catch (createError) {
      console.error('❌ Erro ao criar usuário:', createError)
      
      // Última tentativa: buscar novamente
      user = await prisma.user.findUnique({
        where: { email: userEmail }
      })
      
      if (user) {
        console.log('✅ Usuário encontrado na segunda tentativa:', user.id)
        userId = user.id
      } else {
        throw new Error(`Erro ao criar usuário: ${createError instanceof Error ? createError.message : 'Erro desconhecido'}`)
      }
    }
  }

  if (!user) {
    throw new Error('Usuário não encontrado e não foi possível criar')
  }

  // Buscar workspace existente (usando o userId correto)
  let workspace = await prisma.workspace.findFirst({
    where: {
      users: {
        some: {
          userId: user.id
        }
      }
    }
  })
  
  console.log('🔍 Workspace encontrado:', workspace ? workspace.id : 'null')

  if (!workspace) {
    console.log('🏢 Criando workspace para usuário:', userEmail || userId)
    
    // Criar workspace em uma transação
    workspace = await prisma.$transaction(async (tx) => {
      // Criar workspace padrão
      const newWorkspace = await tx.workspace.create({
        data: {
          name: `${userName || userEmail || 'Usuário'} - Workspace`,
          description: 'Workspace criado automaticamente'
        }
      })

      // Associar usuário ao workspace como OWNER
      await tx.workspaceUser.create({
        data: {
          userId: user.id,
          workspaceId: newWorkspace.id,
          role: 'OWNER'
        }
      })

      // Criar board Kanban padrão
      const board = await tx.kanbanBoard.create({
        data: {
          workspaceId: newWorkspace.id,
          name: 'Atendimento',
          description: 'Board principal de atendimento',
          isDefault: true
        }
      })

      // Criar colunas do Kanban
      const columns = [
        { name: 'Novo', color: '#3B82F6', position: 0 },
        { name: 'Em Andamento', color: '#F59E0B', position: 1 },
        { name: 'Aguardando', color: '#8B5CF6', position: 2 },
        { name: 'Resolvido', color: '#10B981', position: 3 }
      ]

      for (const column of columns) {
        await tx.kanbanColumn.create({
          data: {
            boardId: board.id,
            ...column
          }
        })
      }

      return newWorkspace
    })

    console.log('✅ Workspace criado:', workspace.id)
  }

  return workspace
} 
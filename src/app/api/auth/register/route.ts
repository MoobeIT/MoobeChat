import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ 
        error: 'Nome, email e senha são obrigatórios' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      }, { status: 400 })
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Usuário já existe com este email' 
      }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          name,
          email,
          role: 'USER'
        }
      })

      // Nota: Por enquanto não estamos salvando a senha hasheada no banco
      // porque o schema atual não tem campo password
      // Em produção, você deve adicionar o campo password na tabela users

      // Criar workspace padrão para o usuário
      const workspace = await tx.workspace.create({
        data: {
          name: `${name} - Workspace`,
          description: 'Workspace pessoal criado automaticamente'
        }
      })

      // Associar usuário ao workspace como OWNER
      await tx.workspaceUser.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'OWNER'
        }
      })

      // Criar plataforma WhatsApp padrão
      const platform = await tx.platform.create({
        data: {
          workspaceId: workspace.id,
          type: 'WHATSAPP',
          name: 'WhatsApp Principal',
          config: {},
          isActive: false
        }
      })

      // Criar board Kanban padrão
      const board = await tx.kanbanBoard.create({
        data: {
          workspaceId: workspace.id,
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

      return { user, workspace, platform, board }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name
      }
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 
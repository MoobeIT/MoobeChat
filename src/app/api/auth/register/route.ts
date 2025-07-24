import { NextRequest, NextResponse } from 'next/server'
import { userOperations, workspaceOperationsExtended } from '@/lib/database'
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
    const existingUser = await userOperations.findByEmail(email)

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Usuário já existe com este email' 
      }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await userOperations.create({
      email,
      name,
      password: hashedPassword
    })

    // Criar workspace padrão e associar usuário
    const workspace = await workspaceOperationsExtended.createWithUser({
      name: `Workspace de ${name}`,
      description: 'Workspace criado automaticamente',
      userId: user.id,
      role: 'ADMIN'
    })

    const result = { user, workspace }

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
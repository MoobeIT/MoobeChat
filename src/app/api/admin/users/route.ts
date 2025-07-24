import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os usuários com seus workspaces
    const users = await userOperations.findMany()

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        workspaces: user.workspaces.map(ws => ({
          role: ws.role,
          workspace: ws.workspace
        }))
      }))
    })

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        error: 'ID do usuário é obrigatório' 
      }, { status: 400 })
    }

    // Verificar se usuário existe
    const user = await userOperations.findById(userId)

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 })
    }

    // Deletar usuário (cascade irá deletar relacionamentos)
    await userOperations.delete(userId)

    return NextResponse.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
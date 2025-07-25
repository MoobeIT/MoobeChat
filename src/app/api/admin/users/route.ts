import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { supabaseTyped } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os usuários
    const users = await db.user.findMany()

    // Para cada usuário, buscar seus workspaces
    const usersWithWorkspaces = await Promise.all(
      users.map(async (user) => {
        const { data: workspaceUsers, error } = await supabaseTyped
          .from('workspace_users')
          .select(`
            role,
            workspace:workspaces(
              id,
              name,
              description
            )
          `)
          .eq('user_id', user.id)

        const workspaces = workspaceUsers?.map((wu: any) => ({
          role: wu.role,
          workspace: wu.workspace
        })) || []

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          workspaces
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: usersWithWorkspaces
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
    const user = await db.user.findById(userId)

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 })
    }

    // Deletar usuário (cascade irá deletar relacionamentos)
    await db.user.delete({ id: userId })

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
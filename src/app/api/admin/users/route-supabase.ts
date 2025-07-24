import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/lib/auth-supabase'
import { supabaseTyped } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os usuários com seus workspaces usando Supabase
    const { data: users, error } = await supabaseTyped
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        created_at,
        workspace_users(
          role,
          workspaces(
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ 
        error: 'Erro ao buscar usuários',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      users: users?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        workspaces: user.workspace_users?.map(ws => ({
          role: ws.role,
          workspace: ws.workspaces
        })) || []
      })) || []
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
    const { data: user, error: findError } = await supabaseTyped
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (findError || !user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 })
    }

    // Deletar usuário (cascade irá deletar relacionamentos automaticamente)
    const { error: deleteError } = await supabaseTyped
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('Erro ao deletar usuário:', deleteError)
      return NextResponse.json({ 
        error: 'Erro ao deletar usuário',
        details: deleteError.message
      }, { status: 500 })
    }

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
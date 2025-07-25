import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { kanbanColumnOperationsExtended, kanbanBoardOperationsExtended, workspaceOperationsExtended } from '@/lib/database'
import { supabaseTyped } from '@/lib/supabase'

// GET - Listar colunas de um board
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')

    if (!boardId) {
      return NextResponse.json({ error: 'Board ID é obrigatório' }, { status: 400 })
    }

    // Buscar colunas do board
    const { data: columns, error } = await supabaseTyped
      .from('kanban_columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position')

    if (error) {
      console.error('Erro ao buscar colunas:', error)
      return NextResponse.json({ error: 'Erro ao buscar colunas' }, { status: 500 })
    }

    return NextResponse.json({ columns: columns || [] })
    
  } catch (error) {
    console.error('Erro ao buscar colunas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar nova coluna
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, boardId, color } = await request.json()

    if (!name || !boardId) {
      return NextResponse.json({ error: 'Nome e Board ID são obrigatórios' }, { status: 400 })
    }

    // Verificar se o board pertence ao workspace do usuário
    const userWorkspaces = await workspaceOperationsExtended.findUserWorkspaces(session.user.id)
    const workspaceData = userWorkspaces[0]

    if (!workspaceData) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Extrair o workspace do objeto retornado
    const workspace = workspaceData.workspace
    const workspaceId = (workspace as any)?.id || workspaceData.workspace_id

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID não encontrado' }, { status: 404 })
    }

    const board = await kanbanBoardOperationsExtended.findFirst({ 
      workspace_id: workspaceId,
      id: boardId 
    })

    if (!board) {
      return NextResponse.json({ error: 'Board não encontrado' }, { status: 404 })
    }

    // Buscar próxima posição
    const { count } = await supabaseTyped
      .from('kanban_columns')
      .select('*', { count: 'exact', head: true })
      .eq('board_id', boardId)

    const position = (count || 0) + 1

    // Gerar ID único para a coluna
    const columnId = `column_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Criar coluna
    const now = new Date().toISOString()
    const { data: column, error } = await supabaseTyped
      .from('kanban_columns')
      .insert({
        id: columnId,
        name,
        board_id: boardId,
        position,
        color: color || '#6B7280',
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar coluna:', error)
      return NextResponse.json({ error: 'Erro ao criar coluna' }, { status: 500 })
    }

    return NextResponse.json({ column })
    
  } catch (error) {
    console.error('Erro ao criar coluna:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
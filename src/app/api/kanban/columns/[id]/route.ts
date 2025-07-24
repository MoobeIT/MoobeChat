import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { supabaseTyped } from '@/lib/supabase'

// PATCH - Atualizar coluna (renomear, mudar cor, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, color, position } = await request.json()
    const columnId = params.id

    if (!columnId) {
      return NextResponse.json({ error: 'ID da coluna é obrigatório' }, { status: 400 })
    }

    // Verificar se a coluna existe
    const { data: existingColumn, error: fetchError } = await supabaseTyped
      .from('kanban_columns')
      .select('*')
      .eq('id', columnId)
      .single()

    if (fetchError || !existingColumn) {
      return NextResponse.json({ error: 'Coluna não encontrada' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color
    if (position !== undefined) updateData.position = position

    // Atualizar coluna
    const { data: column, error } = await supabaseTyped
      .from('kanban_columns')
      .update(updateData)
      .eq('id', columnId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar coluna:', error)
      return NextResponse.json({ error: 'Erro ao atualizar coluna' }, { status: 500 })
    }

    return NextResponse.json({ column })
    
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Deletar coluna
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const columnId = params.id

    if (!columnId) {
      return NextResponse.json({ error: 'ID da coluna é obrigatório' }, { status: 400 })
    }

    // Verificar se a coluna existe
    const { data: existingColumn, error: fetchError } = await supabaseTyped
      .from('kanban_columns')
      .select('*')
      .eq('id', columnId)
      .single()

    if (fetchError || !existingColumn) {
      return NextResponse.json({ error: 'Coluna não encontrada' }, { status: 404 })
    }

    // Verificar se há cards na coluna
    const { count } = await supabaseTyped
      .from('kanban_cards')
      .select('*', { count: 'exact', head: true })
      .eq('column_id', columnId)

    if (count && count > 0) {
      return NextResponse.json({ 
        error: 'Não é possível deletar coluna com cards. Mova os cards primeiro.' 
      }, { status: 400 })
    }

    // Deletar coluna
    const { error } = await supabaseTyped
      .from('kanban_columns')
      .delete()
      .eq('id', columnId)

    if (error) {
      console.error('Erro ao deletar coluna:', error)
      return NextResponse.json({ error: 'Erro ao deletar coluna' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao deletar coluna:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
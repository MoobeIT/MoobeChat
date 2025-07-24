import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { supabaseTyped } from '@/lib/supabase'

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

    // Buscar cards do board com informações da conversa
    const { data: cards, error } = await supabaseTyped
      .from('kanban_cards')
      .select(`
        *,
        conversations (
          id,
          customer_name,
          customer_phone,
          status,
          created_at,
          updated_at
        ),
        kanban_columns!inner (
          id,
          name,
          board_id
        )
      `)
      .eq('kanban_columns.board_id', boardId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Erro ao buscar cards:', error)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    return NextResponse.json({ cards: cards || [] })
    
  } catch (error) {
    console.error('Erro ao buscar cards do Kanban:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
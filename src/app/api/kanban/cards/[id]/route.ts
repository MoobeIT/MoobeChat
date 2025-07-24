import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { supabaseTyped } from '@/lib/supabase'
import { kanbanCardOperations } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const cardId = params.id

    if (!cardId) {
      return NextResponse.json({ error: 'ID do card é obrigatório' }, { status: 400 })
    }

    // Verificar se o card existe
    const card = await kanbanCardOperations.findById(cardId)

    if (!card) {
      return NextResponse.json({ error: 'Card não encontrado' }, { status: 404 })
    }

    // Deletar card
    const { error } = await supabaseTyped
      .from('kanban_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Erro ao deletar card:', error)
      return NextResponse.json({ error: 'Erro ao deletar card' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao deletar card:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
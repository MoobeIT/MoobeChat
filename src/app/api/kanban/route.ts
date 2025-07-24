import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { kanbanBoardOperationsExtended, kanbanColumnOperationsExtended, kanbanCardOperations, conversationOperations, workspaceOperationsExtended } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar workspace do usuário
    const userWorkspaces = await workspaceOperationsExtended.findUserWorkspaces(session.user.id)
    const workspaceData = userWorkspaces[0]

    if (!workspaceData) {
      return NextResponse.json({ board: null })
    }

    // Extrair o workspace do objeto retornado
    const workspace = workspaceData.workspace || workspaceData
    const workspaceId = workspace.id || workspaceData.workspace_id

    if (!workspaceId) {
      console.error('Workspace ID não encontrado:', { workspaceData, workspace })
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar ou criar board padrão
    let board = await kanbanBoardOperationsExtended.findByWorkspaceId(workspaceId)

    if (!board) {
      // Criar board padrão com colunas
      board = await kanbanBoardOperationsExtended.create({
        workspace_id: workspaceId,
        name: 'Atendimento',
        description: 'Board principal de atendimento',
        is_default: true
      })
    }

    return NextResponse.json({ board })
    
  } catch (error) {
    console.error('Erro ao buscar Kanban:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cardId, sourceColumnId, destinationColumnId, destinationIndex } = await request.json()

    // Verificar se o card pertence ao workspace do usuário
    const card = await kanbanCardOperations.findById(cardId)

    if (!card) {
      return NextResponse.json({ error: 'Card não encontrado' }, { status: 404 })
    }

    // Se movendo para a mesma coluna, apenas reordenar
    if (sourceColumnId === destinationColumnId) {
      // Atualizar posições
      await kanbanCardOperations.update(cardId, { position: destinationIndex })
    } else {
      // Movendo para coluna diferente
      await kanbanCardOperations.update(cardId, {
        column_id: destinationColumnId,
        position: destinationIndex
      })

      // Atualizar status da conversa baseado na coluna
      const column = await kanbanColumnOperationsExtended.findById(destinationColumnId)

      if (column) {
        let status = 'OPEN'
        const columnName = column.name.toLowerCase()
        
        if (columnName.includes('andamento') || columnName.includes('progress')) {
          status = 'IN_PROGRESS'
        } else if (columnName.includes('aguardando') || columnName.includes('waiting')) {
          status = 'WAITING'
        } else if (columnName.includes('resolvida') || columnName.includes('resolved')) {
          status = 'RESOLVED'
        }

        await conversationOperations.update(card.conversation_id, {
          status: status as any
        })
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao mover card:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
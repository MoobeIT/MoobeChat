import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar workspace do usuário
    const workspace = await prisma.workspace.findFirst({
      where: {
        users: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!workspace) {
      return NextResponse.json({ board: null })
    }

    // Buscar ou criar board padrão
    let board = await prisma.kanbanBoard.findFirst({
      where: {
        workspaceId: workspace.id
      },
      include: {
        columns: {
          include: {
            cards: {
              include: {
                conversation: {
                  include: {
                    platform: true,
                    _count: {
                      select: { messages: true }
                    }
                  }
                }
              },
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!board) {
      // Criar board padrão com colunas
      board = await prisma.kanbanBoard.create({
        data: {
          workspaceId: workspace.id,
          name: 'Atendimento',
          description: 'Board principal de atendimento',
          isDefault: true,
          columns: {
            create: [
              { name: 'Novas', color: '#3b82f6', position: 0 },
              { name: 'Em Andamento', color: '#f59e0b', position: 1 },
              { name: 'Aguardando', color: '#ef4444', position: 2 },
              { name: 'Resolvidas', color: '#10b981', position: 3 }
            ]
          }
        },
        include: {
          columns: {
            include: {
              cards: {
                include: {
                  conversation: {
                    include: {
                      platform: true,
                      _count: {
                        select: { messages: true }
                      }
                    }
                  }
                },
                orderBy: { position: 'asc' }
              }
            },
            orderBy: { position: 'asc' }
          }
        }
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cardId, sourceColumnId, destinationColumnId, destinationIndex } = await request.json()

    // Verificar se o card pertence ao workspace do usuário
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        conversation: {
          workspace: {
            users: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card não encontrado' }, { status: 404 })
    }

    // Se movendo para a mesma coluna, apenas reordenar
    if (sourceColumnId === destinationColumnId) {
      // Atualizar posições
      await prisma.kanbanCard.update({
        where: { id: cardId },
        data: { position: destinationIndex }
      })
    } else {
      // Movendo para coluna diferente
      await prisma.kanbanCard.update({
        where: { id: cardId },
        data: {
          columnId: destinationColumnId,
          position: destinationIndex
        }
      })

      // Atualizar status da conversa baseado na coluna
      const column = await prisma.kanbanColumn.findUnique({
        where: { id: destinationColumnId }
      })

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

        await prisma.conversation.update({
          where: { id: card.conversationId },
          data: { status: status as any }
        })
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao mover card:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 
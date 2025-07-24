'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { RefreshCw, MessageSquare, Clock, Phone, Mail, Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { redirect } from 'next/navigation'

interface Conversation {
  id: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  platform?: {
    type: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK'
    name: string
  }
  createdAt: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

interface KanbanColumn {
  id: string
  name: string
  board_id: string
  position: number
  color: string
  created_at: string
  updated_at: string
}

interface KanbanCard {
  id: string
  conversation_id: string
  column_id: string
  position: number
  created_at: string
  updated_at: string
  conversation?: Conversation
  conversations?: Conversation
}

interface DraggedItem {
  id: string
  type: 'card' | 'column'
  data: KanbanCard | KanbanColumn
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-purple-100 text-purple-800'
}

const platformColors = {
  WHATSAPP: 'bg-green-100 text-green-800',
  INSTAGRAM: 'bg-pink-100 text-pink-800',
  FACEBOOK: 'bg-blue-100 text-blue-800'
}

const statusMapping = {
  'OPEN': 'novo',
  'IN_PROGRESS': 'em-andamento',
  'WAITING_CUSTOMER': 'aguardando',
  'RESOLVED': 'resolvido',
  'CLOSED': 'fechado'
}

export default function KanbanPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null)
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnColor, setNewColumnColor] = useState('#6B7280')
  const [editingColumn, setEditingColumn] = useState<{ id: string; name: string; color?: string } | null>(null)
  const [boardId, setBoardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchKanbanData()
    }
  }, [session])

  const fetchKanbanData = async () => {
    try {
      setLoading(true)
      
      // Buscar ou criar board
      const boardResponse = await fetch('/api/kanban')
      if (!boardResponse.ok) {
        throw new Error('Erro ao buscar board')
      }
      const boardData = await boardResponse.json()
      setBoardId(boardData.board.id)
      
      // Buscar colunas
      const columnsResponse = await fetch(`/api/kanban/columns?boardId=${boardData.board.id}`)
      if (!columnsResponse.ok) {
        throw new Error('Erro ao buscar colunas')
      }
      const columnsData = await columnsResponse.json()
      setColumns(columnsData.columns || [])
      
      // Buscar conversas
      const conversationsResponse = await fetch('/api/conversations')
      if (!conversationsResponse.ok) {
        throw new Error('Erro ao buscar conversas')
      }
      const conversationsData = await conversationsResponse.json()
      setConversations(conversationsData.conversations || [])
      
      // Buscar cards do kanban
      const cardsResponse = await fetch(`/api/kanban/cards?boardId=${boardData.board.id}`)
      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData.cards || [])
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados do Kanban:', error)
      toast.error('Erro ao carregar dados do Kanban')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}min`
    } else if (hours < 24) {
      return `${hours}h`
    } else {
      const days = Math.floor(hours / 24)
      return `${days}d`
    }
  }

  const createColumn = async () => {
    if (!newColumnName.trim() || !boardId) return
    
    try {
      const response = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newColumnName,
          boardId,
          color: newColumnColor
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setColumns(prev => [...prev, data.column])
        setNewColumnName('')
        setNewColumnColor('#6B7280')
        toast.success('Coluna criada com sucesso!')
      } else {
        toast.error('Erro ao criar coluna')
      }
    } catch (error) {
      console.error('Erro ao criar coluna:', error)
      toast.error('Erro ao criar coluna')
    }
  }

  const updateColumn = async (columnId: string, name: string, color?: string) => {
    try {
      const updateData: any = { name }
      if (color) updateData.color = color
      
      const response = await fetch(`/api/kanban/columns/${columnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setColumns(prev => 
          prev.map(col => col.id === columnId ? data.column : col)
        )
        setEditingColumn(null)
        toast.success('Coluna atualizada com sucesso!')
      } else {
        toast.error('Erro ao atualizar coluna')
      }
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error)
      toast.error('Erro ao atualizar coluna')
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      const response = await fetch(`/api/kanban/columns/${columnId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setColumns(prev => prev.filter(col => col.id !== columnId))
        setCards(prev => prev.filter(card => card.column_id !== columnId))
        toast.success('Coluna deletada com sucesso!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao deletar coluna')
      }
    } catch (error) {
      console.error('Erro ao deletar coluna:', error)
      toast.error('Erro ao deletar coluna')
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/kanban/cards/${cardId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCards(prev => prev.filter(card => card.id !== cardId))
        toast.success('Card deletado com sucesso!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao deletar card')
      }
    } catch (error) {
      console.error('Erro ao deletar card:', error)
      toast.error('Erro ao deletar card')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string
    
    // Determinar se é um card ou coluna
    const card = cards.find(c => c.id === activeId)
    const column = columns.find(c => c.id === activeId)
    
    if (card) {
      setDraggedItem({ id: activeId, type: 'card', data: card })
    } else if (column) {
      setDraggedItem({ id: activeId, type: 'column', data: column })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Se estamos arrastando um card
    const activeCard = cards.find(c => c.id === activeId)
    if (activeCard) {
      const overColumn = columns.find(c => c.id === overId)
      const overCard = cards.find(c => c.id === overId)
      
      if (overColumn && activeCard.column_id !== overColumn.id) {
        // Movendo para uma coluna diferente
        setCards(prev => 
          prev.map(card => 
            card.id === activeId 
              ? { ...card, column_id: overColumn.id }
              : card
          )
        )
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedItem(null)
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    // Se estamos arrastando um card
    const activeCard = cards.find(c => c.id === activeId)
    if (activeCard) {
      const overColumn = columns.find(c => c.id === overId)
      const overCard = cards.find(c => c.id === overId)
      
      let targetColumnId = activeCard.column_id
      
      if (overColumn) {
        targetColumnId = overColumn.id
      } else if (overCard) {
        targetColumnId = overCard.column_id
      }
      
      if (targetColumnId !== activeCard.column_id) {
        await moveCardToColumn(activeCard.conversation_id, targetColumnId)
      }
    }
    
    // Se estamos arrastando uma coluna
    const activeColumn = columns.find(c => c.id === activeId)
    const overColumn = columns.find(c => c.id === overId)
    
    if (activeColumn && overColumn) {
      const activeIndex = columns.findIndex(c => c.id === activeId)
      const overIndex = columns.findIndex(c => c.id === overId)
      
      if (activeIndex !== overIndex) {
        const newColumns = [...columns]
        const [removed] = newColumns.splice(activeIndex, 1)
        newColumns.splice(overIndex, 0, removed)
        
        // Atualizar posições
        const updatedColumns = newColumns.map((col, index) => ({
          ...col,
          position: index + 1
        }))
        
        setColumns(updatedColumns)
        
        // Salvar no backend
        await updateColumnPositions(updatedColumns)
      }
    }
  }

  const moveCardToColumn = async (conversationId: string, columnId: string) => {
    try {
      const response = await fetch('/api/kanban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          columnId
        }),
      })

      if (response.ok) {
        toast.success('Card movido com sucesso!')
        fetchKanbanData() // Recarregar dados
      } else {
        toast.error('Erro ao mover card')
        fetchKanbanData() // Reverter mudanças
      }
    } catch (error) {
      console.error('Erro ao mover card:', error)
      toast.error('Erro ao mover card')
      fetchKanbanData() // Reverter mudanças
    }
  }

  const updateColumnPositions = async (updatedColumns: KanbanColumn[]) => {
    try {
      for (const column of updatedColumns) {
        await fetch(`/api/kanban/columns/${column.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: column.position }),
        })
      }
    } catch (error) {
      console.error('Erro ao atualizar posições das colunas:', error)
      toast.error('Erro ao reordenar colunas')
      fetchKanbanData() // Reverter mudanças
    }
  }

  // Componente para card arrastável
  const DraggableCard = ({ card, conversation }: { card: KanbanCard; conversation: Conversation }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: card.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteCard(card.id)
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group"
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <Card className="mb-3 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    {conversation.platform?.type === 'WHATSAPP' && (
                      <Phone className="h-4 w-4 text-green-600" />
                    )}
                    {conversation.platform?.type === 'INSTAGRAM' && (
                      <Mail className="h-4 w-4 text-purple-600" />
                    )}
                    {conversation.platform?.type === 'FACEBOOK' && (
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="font-medium text-sm dark:text-gray-200">
                        {typeof conversation.customerName === 'string' ? conversation.customerName : 'Cliente'}
                      </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant={conversation.priority === 'HIGH' ? 'destructive' : 
                            conversation.priority === 'MEDIUM' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {conversation.priority === 'HIGH' ? 'Alta' :
                     conversation.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDeleteClick}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {typeof conversation.customerPhone === 'string' ? conversation.customerPhone : 'Sem telefone'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : 'Data inválida'}
                  </span>
                </div>
              </div>
              
              <div className="mt-3">
                <Link href={`/dashboard/conversations/${conversation.id}`}>
                  <Button size="sm" variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Ver Conversa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Componente para coluna arrastável
  const DraggableColumn = ({ column }: { column: KanbanColumn }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: column.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const columnCards = cards.filter(card => card.column_id === column.id)
    const cardsWithConversations = columnCards.map(card => {
      // Se o card já tem dados da conversa (da API), use esses dados
      if (card.conversations) {
        return { card, conversation: card.conversations }
      }
      // Caso contrário, busque na lista de conversas
      const conversation = conversations.find(conv => conv.id === card.conversation_id)
      return { card, conversation }
    }).filter(item => item.conversation)

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex-shrink-0 w-80"
      >
        <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" 
                  style={{ backgroundColor: column.color }}
                />
                {editingColumn?.id === column.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingColumn.name}
                      onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateColumn(column.id, editingColumn.name, editingColumn.color)
                        }
                        if (e.key === 'Escape') {
                          setEditingColumn(null)
                        }
                      }}
                      className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600"
                      autoFocus
                    />
                    <ColorPicker
                      color={editingColumn.color || column.color}
                      onChange={(color) => setEditingColumn({ ...editingColumn, color })}
                    />
                    <Button
                      size="sm"
                      onClick={() => updateColumn(column.id, editingColumn.name, editingColumn.color)}
                      className="h-8 px-2"
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <CardTitle className="text-lg dark:text-gray-200">{column.name}</CardTitle>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingColumn({ id: column.id, name: column.name, color: column.color })}
                  className="h-8 w-8 p-0 dark:hover:bg-gray-700"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteColumn(column.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="ml-2 dark:bg-gray-700 dark:text-gray-300">
                  {cardsWithConversations.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <SortableContext items={columnCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 min-h-[200px]">
                {cardsWithConversations.map(({ card, conversation }) => {
                  // Garantir que conversation é um objeto válido
                  if (!conversation || typeof conversation !== 'object') {
                    return null
                  }
                  return (
                    <DraggableCard key={card.id} card={card} conversation={conversation} />
                  )
                }).filter(Boolean)}
              </div>
            </SortableContext>
          </CardContent>
        </Card>
      </div>
    )
  }



  const getStatusFromColumnId = (columnId: string): string => {
    const mapping: { [key: string]: string } = {
      'novo': 'OPEN',
      'em-andamento': 'IN_PROGRESS',
      'aguardando': 'WAITING_CUSTOMER',
      'resolvido': 'RESOLVED',
      'fechado': 'CLOSED'
    }
    return mapping[columnId] || 'OPEN'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-gray-200">Kanban</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Gerencie suas conversas por etapas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Coluna
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-200">Criar Nova Coluna</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome da coluna"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createColumn()
                    }
                  }}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cor:</span>
                  <ColorPicker
                    color={newColumnColor}
                    onChange={setNewColumnColor}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewColumnName('')
                      setNewColumnColor('#6B7280')
                    }}
                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={createColumn} disabled={!newColumnName.trim()}>
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchKanbanData} variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          <SortableContext items={sortedColumns.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {sortedColumns.map((column) => (
              <DraggableColumn key={column.id} column={column} />
            ))}
          </SortableContext>
          
          {sortedColumns.length === 0 && (
            <div className="flex-1 text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 dark:text-gray-400" />
              <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Nenhuma coluna criada</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Crie sua primeira coluna para começar a organizar suas conversas
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="dark:bg-blue-600 dark:hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Coluna
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-gray-200">Criar Nova Coluna</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nome da coluna"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          createColumn()
                        }
                      }}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cor:</span>
                      <ColorPicker
                        color={newColumnColor}
                        onChange={setNewColumnColor}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewColumnName('')
                          setNewColumnColor('#6B7280')
                        }}
                        className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={createColumn} disabled={!newColumnName.trim()}>
                        Criar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        <DragOverlay>
          {draggedItem && draggedItem.type === 'card' && (
            <Card className="w-80 opacity-90 rotate-3 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-sm dark:text-gray-200">
                    Movendo card...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {draggedItem && draggedItem.type === 'column' && (
            <Card className="w-80 opacity-90 rotate-3 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-gray-200">
                  {(draggedItem.data as KanbanColumn).name}
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
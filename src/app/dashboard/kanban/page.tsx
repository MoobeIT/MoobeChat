'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface Conversation {
  id: string
  customerName: string
  customerPhone: string
  platform: {
    type: string
    name: string
  }
  lastMessage?: {
    content: string
    createdAt: string
  }
  status: string
  messageCount: number
  priority: string
  createdAt: string
}

interface KanbanColumn {
  id: string
  title: string
  color: string
  tasks: Conversation[]
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
  'RESOLVED': 'resolvido'
}

export default function KanbanPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
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

  const moveCard = async (conversationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchConversations() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao mover card:', error)
    }
  }

  const getColumns = (): KanbanColumn[] => {
    const columns: KanbanColumn[] = [
      {
        id: 'novo',
        title: 'Novas Conversas',
        color: 'bg-blue-500',
        tasks: conversations.filter(c => c.status === 'OPEN')
      },
      {
        id: 'em-andamento',
        title: 'Em Andamento',
        color: 'bg-yellow-500',
        tasks: conversations.filter(c => c.status === 'IN_PROGRESS')
      },
      {
        id: 'aguardando',
        title: 'Aguardando Cliente',
        color: 'bg-orange-500',
        tasks: conversations.filter(c => c.status === 'WAITING_CUSTOMER')
      },
      {
        id: 'resolvido',
        title: 'Resolvidas',
        color: 'bg-green-500',
        tasks: conversations.filter(c => c.status === 'RESOLVED')
      }
    ]

    return columns
  }

  const getStatusFromColumnId = (columnId: string): string => {
    const mapping: { [key: string]: string } = {
      'novo': 'OPEN',
      'em-andamento': 'IN_PROGRESS',
      'aguardando': 'WAITING_CUSTOMER',
      'resolvido': 'RESOLVED'
    }
    return mapping[columnId] || 'OPEN'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando kanban...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const columns = getColumns()

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban de Conversas</h1>
          <p className="text-gray-600">Organize suas conversas por estágio</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchConversations}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="flex space-x-6 h-full overflow-x-auto">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-white rounded-lg border shadow-sm h-full">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="text-lg font-semibold">{column.title}</h3>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                    {column.tasks.length}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 min-h-[200px]">
                  {column.tasks.length > 0 ? (
                    column.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {task.customerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <span className="font-medium text-sm">{task.customerName}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-md ${platformColors[task.platform.type as keyof typeof platformColors] || 'bg-gray-100 text-gray-800'}`}>
                              {task.platform.name}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {task.lastMessage?.content || 'Sem mensagens'}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span>💬</span>
                              <span>{task.messageCount}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>🕒</span>
                              <span>{formatTime(task.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs rounded-md ${priorityColors[task.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
                              {task.priority === 'LOW' && 'Baixa'}
                              {task.priority === 'MEDIUM' && 'Média'}
                              {task.priority === 'HIGH' && 'Alta'}
                              {task.priority === 'URGENT' && 'Urgente'}
                            </span>
                            
                            {/* Botões para mover entre colunas */}
                            <div className="flex space-x-1">
                              {columns.map((targetColumn) => {
                                if (targetColumn.id === column.id) return null
                                return (
                                  <button
                                    key={targetColumn.id}
                                    onClick={() => moveCard(task.id, getStatusFromColumnId(targetColumn.id))}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                                    title={`Mover para ${targetColumn.title}`}
                                  >
                                    →
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Nenhuma conversa</p>
                      <p className="text-sm mt-2">Cards aparecerão aqui conforme o status</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instruções */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Como usar o Kanban:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use os botões → nos cards para mover conversas entre colunas</li>
          <li>• Organize suas conversas por estágio de atendimento</li>
          <li>• Monitore prioridades através das cores dos badges</li>
          <li>• Os dados são atualizados automaticamente do banco</li>
        </ul>
      </div>
    </div>
  )
} 
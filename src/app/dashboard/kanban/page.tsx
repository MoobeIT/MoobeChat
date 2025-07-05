'use client'

import { useState } from 'react'

// Dados mockados para demonstração
const initialColumns = {
  'novo': {
    id: 'novo',
    title: 'Novas Conversas',
    color: 'bg-blue-500',
    tasks: [
      {
        id: '1',
        customerName: 'Ana Santos',
        platform: 'WhatsApp',
        lastMessage: 'Olá, gostaria de saber sobre seus produtos',
        messageCount: 1,
        priority: 'medium',
        createdAt: new Date('2024-01-15T10:30:00'),
      },
      {
        id: '2',
        customerName: 'Carlos Silva',
        platform: 'Instagram',
        lastMessage: 'Vi sua página no Instagram, muito interessante!',
        messageCount: 3,
        priority: 'low',
        createdAt: new Date('2024-01-15T09:15:00'),
      }
    ]
  },
  'em-andamento': {
    id: 'em-andamento',
    title: 'Em Andamento',
    color: 'bg-yellow-500',
    tasks: [
      {
        id: '3',
        customerName: 'Maria Oliveira',
        platform: 'WhatsApp',
        lastMessage: 'Perfeito! Quando posso fazer o pedido?',
        messageCount: 8,
        priority: 'high',
        createdAt: new Date('2024-01-15T08:45:00'),
      }
    ]
  },
  'aguardando': {
    id: 'aguardando',
    title: 'Aguardando Cliente',
    color: 'bg-orange-500',
    tasks: [
      {
        id: '4',
        customerName: 'João Pereira',
        platform: 'Instagram',
        lastMessage: 'Enviamos as informações por email',
        messageCount: 5,
        priority: 'medium',
        createdAt: new Date('2024-01-14T16:20:00'),
      }
    ]
  },
  'resolvido': {
    id: 'resolvido',
    title: 'Resolvidas',
    color: 'bg-green-500',
    tasks: [
      {
        id: '5',
        customerName: 'Lucas Costa',
        platform: 'WhatsApp',
        lastMessage: 'Muito obrigado pelo atendimento!',
        messageCount: 12,
        priority: 'low',
        createdAt: new Date('2024-01-14T14:30:00'),
      }
    ]
  }
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
  urgent: 'bg-purple-100 text-purple-800'
}

const platformColors = {
  WhatsApp: 'bg-green-100 text-green-800',
  Instagram: 'bg-pink-100 text-pink-800',
  Facebook: 'bg-blue-100 text-blue-800'
}

export default function KanbanPage() {
  const [columns, setColumns] = useState(initialColumns)

  const formatTime = (date: Date) => {
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

  const moveCard = (taskId: string, fromColumn: string, toColumn: string) => {
    // Função simples para mover cards entre colunas (sem drag & drop)
    const sourceColumn = columns[fromColumn as keyof typeof columns]
    const targetColumn = columns[toColumn as keyof typeof columns]
    
    const taskToMove = sourceColumn.tasks.find(task => task.id === taskId)
    if (!taskToMove) return

    const newSourceTasks = sourceColumn.tasks.filter(task => task.id !== taskId)
    const newTargetTasks = [...targetColumn.tasks, taskToMove]

    setColumns({
      ...columns,
      [fromColumn]: {
        ...sourceColumn,
        tasks: newSourceTasks
      },
      [toColumn]: {
        ...targetColumn,
        tasks: newTargetTasks
      }
    })
  }

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kanban de Conversas</h1>
          <p className="text-gray-600">Organize suas conversas por estágio</p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          ➕ Nova Coluna
        </button>
      </div>

      <div className="flex space-x-6 h-full overflow-x-auto">
        {Object.values(columns).map((column) => (
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
                  {column.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {task.customerName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-sm">{task.customerName}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-md ${platformColors[task.platform as keyof typeof platformColors]}`}>
                            {task.platform}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {task.lastMessage}
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
                          <span className={`px-2 py-1 text-xs rounded-md ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            {task.priority === 'low' && 'Baixa'}
                            {task.priority === 'medium' && 'Média'}
                            {task.priority === 'high' && 'Alta'}
                            {task.priority === 'urgent' && 'Urgente'}
                          </span>
                          
                          {/* Botões para mover entre colunas */}
                          <div className="flex space-x-1">
                            {Object.keys(columns).map((columnId) => {
                              if (columnId === column.id) return null
                              return (
                                <button
                                  key={columnId}
                                  onClick={() => moveCard(task.id, column.id, columnId)}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                                  title={`Mover para ${columns[columnId as keyof typeof columns].title}`}
                                >
                                  →
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
          <li>• Versão com drag & drop será implementada em breve!</li>
        </ul>
      </div>
    </div>
  )
} 
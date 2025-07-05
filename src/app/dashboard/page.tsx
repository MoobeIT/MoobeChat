'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  totalConversations: number
  openConversations: number
  resolvedToday: number
  avgResponseTime: string
}

interface RecentConversation {
  id: string
  customerName: string
  platform: {
    type: string
    name: string
  }
  lastMessage?: {
    content: string
    createdAt: string
  }
  status: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [conversationsRes, statsRes] = await Promise.all([
        fetch('/api/conversations'),
        fetch('/api/dashboard/stats')
      ])

      if (conversationsRes.ok) {
        const { conversations } = await conversationsRes.json()
        setRecentConversations(conversations.slice(0, 5))
        
        // Calcular estatísticas básicas
        const totalConversations = conversations.length
        const openConversations = conversations.filter((c: any) => c.status === 'OPEN').length
        const resolvedToday = conversations.filter((c: any) => {
          const today = new Date().toDateString()
          return c.status === 'RESOLVED' && new Date(c.updatedAt).toDateString() === today
        }).length

        setStats({
          totalConversations,
          openConversations,
          resolvedToday,
          avgResponseTime: '2.5 min'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao Moobi Chat, {session.user?.name || session.user?.email}</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💬</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Conversas</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalConversations || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔓</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Conversas Abertas</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.openConversations || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolvidas Hoje</p>
              <p className="text-2xl font-bold text-green-600">{stats?.resolvedToday || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⏱️</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.avgResponseTime || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversas Recentes e Links Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversas Recentes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Conversas Recentes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentConversations.length > 0 ? (
                recentConversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {conversation.platform.type === 'WHATSAPP' ? '📱' : '📧'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.customerName}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          conversation.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                          conversation.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          conversation.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.status === 'OPEN' ? 'Aberta' :
                           conversation.status === 'IN_PROGRESS' ? 'Em Andamento' :
                           conversation.status === 'RESOLVED' ? 'Resolvida' : conversation.status}
                        </span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {conversation.platform.name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma conversa encontrada</p>
              )}
            </div>
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link href="/dashboard/conversations" className="flex items-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <span className="text-2xl mr-4">💬</span>
                <div>
                  <h3 className="font-medium text-gray-900">Ver Todas as Conversas</h3>
                  <p className="text-sm text-gray-500">Gerenciar e responder mensagens</p>
                </div>
              </Link>

              <Link href="/dashboard/kanban" className="flex items-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <span className="text-2xl mr-4">📋</span>
                <div>
                  <h3 className="font-medium text-gray-900">Kanban</h3>
                  <p className="text-sm text-gray-500">Organizar por estágio de atendimento</p>
                </div>
              </Link>

              <button className="w-full flex items-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <span className="text-2xl mr-4">📱</span>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Conectar WhatsApp</h3>
                  <p className="text-sm text-gray-500">Adicionar nova instância</p>
                </div>
              </button>

              <button className="w-full flex items-center p-4 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                <span className="text-2xl mr-4">⚙️</span>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Configurações</h3>
                  <p className="text-sm text-gray-500">Personalizar preferências</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
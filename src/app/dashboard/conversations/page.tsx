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
  unreadCount: number
}

interface Message {
  id: string
  content: string
  sender: 'USER' | 'CUSTOMER'
  timestamp: string
  type: string
}

interface Platform {
  id: string
  name: string
  type: string
  is_active: boolean
}

const platformColors = {
  WHATSAPP: 'bg-green-100 text-green-800',
  INSTAGRAM: 'bg-pink-100 text-pink-800',
  FACEBOOK: 'bg-blue-100 text-blue-800'
}

export default function ConversationsPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [platforms, setPlatforms] = useState<Platform[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchConversations()
      fetchPlatforms()
      
      // Atualizar conversas apenas a cada 30 segundos (ao invés de 5)
      const interval = setInterval(fetchConversations, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
        if (data.conversations && data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0])
        }
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/integrations')
      if (response.ok) {
        const data = await response.json()
        setPlatforms(data.platforms || [])
      } else {
        setPlatforms([])
      }
    } catch (error) {
      console.error('Erro ao buscar plataformas:', error)
      setPlatforms([])
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          sender: 'USER'
        }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedConversation.id)
        fetchConversations() // Atualizar lista de conversas
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remover a conversa da lista
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        
        // Se a conversa deletada estava selecionada, limpar seleção
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
          setMessages([])
        }
        
        // Atualizar lista de conversas
        fetchConversations()
      } else {
        const errorData = await response.json()
        alert(`Erro ao excluir conversa: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao excluir conversa:', error)
      alert('Erro ao excluir conversa. Tente novamente.')
    }
  }

  const filteredConversations = conversations.filter(conv =>
    (conv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.customerPhone || '').includes(searchTerm)
  )

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando conversas...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Lista de Conversas */}
      <div className="w-80 border-r bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversas</h2>
            <div className="flex space-x-2">
              <button 
                onClick={fetchConversations}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                title="Atualizar conversas"
              >
                🔄
              </button>
              <button 
                onClick={() => setShowNewConversationModal(true)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                + Nova
              </button>
            </div>
          </div>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              📊 Filtros
            </button>
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
              Todas ({filteredConversations.length})
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-blue-400' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {(conversation.customerName || 'N/A').split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.customerName || 'Nome não disponível'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-md ${platformColors[conversation.platform?.type as keyof typeof platformColors] || 'bg-gray-100 text-gray-800'}`}>
                          {conversation.platform?.name || 'Plataforma não encontrada'}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                      {conversation.lastMessage?.content || 'Sem mensagens'}
                    </p>
                    
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Nenhuma conversa encontrada</p>
              <p className="text-sm mt-2">Clique em "Nova" para iniciar uma conversa</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(selectedConversation.customerName || 'N/A').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedConversation.customerName || 'Nome não disponível'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-md ${platformColors[selectedConversation.platform?.type as keyof typeof platformColors] || 'bg-gray-100 text-gray-800'}`}>
                        {selectedConversation.platform?.name || 'Plataforma não encontrada'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{selectedConversation.customerPhone || 'Telefone não disponível'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    📞
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    📹
                  </button>
                  <button 
                    onClick={() => handleDeleteConversation(selectedConversation.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Excluir conversa"
                  >
                    🗑️
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    ⋮
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-0">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'USER'
                          ? 'bg-blue-500 dark:bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'USER' ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm mt-2">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  📎
                </button>
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim()}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    newMessage.trim() 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  📤
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <p className="text-lg">Selecione uma conversa</p>
              <p className="text-sm mt-2">Escolha uma conversa da lista para começar</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Conversa */}
      {showNewConversationModal && <NewConversationModal />}
    </div>
  )

  function NewConversationModal() {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [selectedPlatform, setSelectedPlatform] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreateConversation = async () => {
      if (!phoneNumber.trim() || !selectedPlatform) return

      setLoading(true)
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platformId: selectedPlatform,
            customerName: customerName.trim() || 'Cliente',
            customerPhone: phoneNumber.trim(),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setShowNewConversationModal(false)
          setPhoneNumber('')
          setCustomerName('')
          setSelectedPlatform('')
          fetchConversations()
          
          // Selecionar a nova conversa
          if (data.conversation) {
            setSelectedConversation(data.conversation)
          }
        } else {
          const error = await response.json()
          alert(error.error || 'Erro ao criar conversa')
        }
      } catch (error) {
        console.error('Erro ao criar conversa:', error)
        alert('Erro ao criar conversa')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nova Conversa</h3>
            <button 
              onClick={() => setShowNewConversationModal(false)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plataforma
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">Selecione uma plataforma</option>
                {platforms.filter(p => p.is_active === true).map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name} ({platform.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número do WhatsApp
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 5511999999999"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Digite o número com código do país (Ex: 55 para Brasil)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Cliente (opcional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowNewConversationModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateConversation}
              disabled={!phoneNumber.trim() || !selectedPlatform || loading}
              className={`px-4 py-2 rounded-md transition-colors ${
                phoneNumber.trim() && selectedPlatform && !loading
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Criando...' : 'Criar Conversa'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}
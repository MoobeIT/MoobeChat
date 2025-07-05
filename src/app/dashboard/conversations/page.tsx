'use client'

import { useState } from 'react'

// Dados mockados
const conversations = [
  {
    id: '1',
    customerName: 'Ana Santos',
    platform: 'WhatsApp',
    lastMessage: 'Olá, gostaria de saber sobre seus produtos',
    lastMessageTime: new Date('2024-01-15T10:30:00'),
    unreadCount: 2,
    status: 'active',
    avatar: 'AS'
  },
  {
    id: '2',
    customerName: 'Carlos Silva',
    platform: 'Instagram',
    lastMessage: 'Vi sua página no Instagram, muito interessante!',
    lastMessageTime: new Date('2024-01-15T09:15:00'),
    unreadCount: 0,
    status: 'waiting',
    avatar: 'CS'
  },
  {
    id: '3',
    customerName: 'Maria Oliveira',
    platform: 'WhatsApp',
    lastMessage: 'Perfeito! Quando posso fazer o pedido?',
    lastMessageTime: new Date('2024-01-15T08:45:00'),
    unreadCount: 1,
    status: 'active',
    avatar: 'MO'
  }
]

const messages = [
  {
    id: '1',
    content: 'Olá! Como posso ajudar você hoje?',
    sender: 'agent',
    timestamp: new Date('2024-01-15T10:00:00'),
    type: 'text'
  },
  {
    id: '2',
    content: 'Olá, gostaria de saber sobre seus produtos',
    sender: 'customer',
    timestamp: new Date('2024-01-15T10:30:00'),
    type: 'text'
  },
  {
    id: '3',
    content: 'Claro! Temos uma variedade de produtos. Você está procurando algo específico?',
    sender: 'agent',
    timestamp: new Date('2024-01-15T10:31:00'),
    type: 'text'
  },
  {
    id: '4',
    content: 'Estou interessada em smartphones',
    sender: 'customer',
    timestamp: new Date('2024-01-15T10:32:00'),
    type: 'text'
  }
]

const platformColors = {
  WhatsApp: 'bg-green-100 text-green-800',
  Instagram: 'bg-pink-100 text-pink-800',
  Facebook: 'bg-blue-100 text-blue-800'
}

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState('')

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aqui você adicionaria a lógica para enviar a mensagem
      console.log('Enviando mensagem:', newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-full">
      {/* Lista de Conversas */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Conversas</h2>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              📊 Filtros
            </button>
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">Todas (3)</span>
          </div>
        </div>
        
        <div className="overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.avatar}
                  </div>
                  {conversation.status === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.customerName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-md ${platformColors[conversation.platform as keyof typeof platformColors]}`}>
                        {conversation.platform}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(conversation.lastMessageTime)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedConversation.avatar}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedConversation.customerName}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-md ${platformColors[selectedConversation.platform as keyof typeof platformColors]}`}>
                    {selectedConversation.platform}
                  </span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                📞
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                📹
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                ⋮
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'agent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              📎
            </button>
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>
    </div>
  )
} 
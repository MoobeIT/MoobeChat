'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
  tags: string[]
  platform: {
    id: string
    name: string
    type: string
  }
  createdAt: string
  updatedAt: string
}

interface Platform {
  id: string
  name: string
  type: string
  isActive: boolean
}

const platformColors = {
  WHATSAPP: 'bg-green-100 text-green-800',
  INSTAGRAM: 'bg-pink-100 text-pink-800',
  FACEBOOK: 'bg-blue-100 text-blue-800'
}

export default function ContactsPage() {
  const { data: session, status } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchContacts()
      fetchPlatforms()
    }
  }, [session])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
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
      }
    } catch (error) {
      console.error('Erro ao buscar plataformas:', error)
    }
  }

  const handleStartConversation = async (contact: Contact) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformId: contact.platform.id,
          customerName: contact.name,
          customerPhone: contact.phone,
          customerEmail: contact.email,
        }),
      })

      if (response.ok) {
        // Redirecionar para a página de conversas
        window.location.href = '/dashboard/conversations'
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao iniciar conversa')
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error)
      alert('Erro ao iniciar conversa')
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando contatos...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Contatos</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          + Adicionar Contato
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-md ${platformColors[contact.platform.type as keyof typeof platformColors] || 'bg-gray-100 text-gray-800'}`}>
                  {contact.platform.name}
                </span>
              </div>

              {contact.email && (
                <p className="text-sm text-gray-600 mb-2">
                  📧 {contact.email}
                </p>
              )}

              {contact.notes && (
                <p className="text-sm text-gray-600 mb-3">
                  📝 {contact.notes}
                </p>
              )}

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartConversation(contact)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                  💬 Conversar
                </button>
                <button
                  onClick={() => setSelectedContact(contact)}
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum contato encontrado</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Tente buscar por outros termos' : 'Clique em "Adicionar Contato" para começar'}
          </p>
        </div>
      )}

      {/* Modal Adicionar/Editar Contato */}
      {(showAddModal || selectedContact) && (
        <ContactModal
          contact={selectedContact}
          platforms={platforms}
          onClose={() => {
            setShowAddModal(false)
            setSelectedContact(null)
          }}
          onSave={fetchContacts}
        />
      )}
    </div>
  )
}

interface ContactModalProps {
  contact: Contact | null
  platforms: Platform[]
  onClose: () => void
  onSave: () => void
}

function ContactModal({ contact, platforms, onClose, onSave }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    phone: contact?.phone || '',
    email: contact?.email || '',
    notes: contact?.notes || '',
    platformId: contact?.platform.id || '',
    tags: contact?.tags.join(', ') || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim() || !formData.platformId) return

    setLoading(true)
    try {
      const method = contact ? 'PUT' : 'POST'
      const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        }),
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar contato')
      }
    } catch (error) {
      console.error('Erro ao salvar contato:', error)
      alert('Erro ao salvar contato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {contact ? 'Editar Contato' : 'Adicionar Contato'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do contato"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Ex: 5511999999999"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma *
            </label>
            <select
              value={formData.platformId}
              onChange={(e) => setFormData(prev => ({ ...prev, platformId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma plataforma</option>
              {platforms.filter(p => p.isActive).map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} ({platform.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="cliente, vip, lead (separadas por vírgula)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre o contato"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || !formData.phone.trim() || !formData.platformId || loading}
              className={`px-4 py-2 rounded-md transition-colors ${
                formData.name.trim() && formData.phone.trim() && formData.platformId && !loading
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Salvando...' : contact ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
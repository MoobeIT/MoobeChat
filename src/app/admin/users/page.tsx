'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  workspaces: Array<{
    role: string
    workspace: {
      id: string
      name: string
    }
  }>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || 'Erro ao carregar usuários')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        const data = await response.json()
        alert('Erro ao deletar usuário: ' + data.error)
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando usuários...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração de Usuários</h1>
          <p className="text-gray-600 mt-2">Gerencie os usuários do sistema</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {users.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Nenhum usuário encontrado</p>
              <p className="text-sm text-gray-400 mt-2">
                Crie o primeiro usuário em{' '}
                <a href="/auth/register" className="text-blue-600 hover:underline">
                  /auth/register
                </a>
              </p>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Workspaces:</h4>
                      {user.workspaces.map((ws, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">{ws.workspace?.name || 'Workspace não encontrado'}</span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {ws.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(user.id)}
                    >
                      Copiar ID
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Total: {users.length} usuário(s)
          </div>
          
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={loadUsers}
            >
              Recarregar
            </Button>
            <Button
              onClick={() => window.location.href = '/auth/register'}
            >
              Criar Usuário
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900 mb-2">Links Úteis:</h3>
          <div className="space-y-1 text-sm">
            <div>
              <a href="/auth/register" className="text-blue-600 hover:underline">
                → Página de Registro
              </a>
            </div>
            <div>
              <a href="/auth/signin" className="text-blue-600 hover:underline">
                → Página de Login
              </a>
            </div>
            <div>
              <a href="/dashboard" className="text-blue-600 hover:underline">
                → Dashboard Principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
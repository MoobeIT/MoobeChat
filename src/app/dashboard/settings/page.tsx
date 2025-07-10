'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function SettingsPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Configurações</h1>
        
        <div className="space-y-6">
          {/* Informações do Perfil */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil do Usuário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={session.user.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={session.user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              ⚠️ Edição de perfil em desenvolvimento
            </p>
          </div>

          {/* Configurações de Notificação */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Novas mensagens</h3>
                  <p className="text-sm text-gray-600">Receber notificações quando novas mensagens chegarem</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email diário</h3>
                  <p className="text-sm text-gray-600">Resumo diário das atividades por email</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              ⚠️ Configurações de notificação em desenvolvimento
            </p>
          </div>

          {/* Configurações do Workspace */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Workspace</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Workspace
                </label>
                <input
                  type="text"
                  placeholder="Carregando..."
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Carregando..."
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              ⚠️ Configurações de workspace em desenvolvimento
            </p>
          </div>

          {/* Configurações de Integração */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrações</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">WhatsApp</h3>
                    <p className="text-sm text-gray-600">Conectar via UazAPI</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
                  Disponível
                </span>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <p className="text-sm text-gray-600">Integração com email</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md">
                  Em breve
                </span>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Versão:</span> v1.0.0
              </div>
              <div>
                <span className="font-medium">Ambiente:</span> Desenvolvimento
              </div>
              <div>
                <span className="font-medium">Último backup:</span> Em breve
              </div>
              <div>
                <span className="font-medium">Status:</span> <span className="text-green-600">Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
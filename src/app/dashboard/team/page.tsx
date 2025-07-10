'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function TeamPage() {
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
        <h1 className="text-2xl font-semibold mb-6">Equipe</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gerenciamento de Equipe
            </h2>
            <p className="text-gray-600 mb-6">
              Esta funcionalidade está em desenvolvimento. Em breve você poderá:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Convidar membros para a equipe</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Definir permissões e roles</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Gerenciar acessos aos workspaces</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Monitorar atividade da equipe</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Membro atual:</strong> {session.user.name || session.user.email} (Proprietário)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
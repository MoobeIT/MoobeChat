'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AnalyticsPage() {
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Relatórios e Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card de Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Conversas</h3>
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-sm text-gray-600">Total de conversas</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mensagens</h3>
              <span className="text-2xl">📨</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <p className="text-sm text-gray-600">Total de mensagens</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contatos</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <p className="text-sm text-gray-600">Total de contatos</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Relatórios Avançados
            </h2>
            <p className="text-gray-600 mb-6">
              Esta funcionalidade está em desenvolvimento. Em breve você terá acesso a:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Gráficos de volume de mensagens por período</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Análise de tempo de resposta</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Relatório de satisfação do cliente</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Métricas de performance da equipe</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Análise de sentimento das conversas</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Exportação de dados em diversos formatos</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Os dados serão atualizados automaticamente conforme você usar o sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AutomationsPage() {
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
        <h1 className="text-2xl font-semibold mb-6">Automações</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Cards de Automações Disponíveis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Respostas Automáticas</h3>
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure respostas automáticas para mensagens comuns
            </p>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
              Em breve
            </span>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chatbot</h3>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Crie fluxos de conversa automatizados para atendimento
            </p>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
              Em breve
            </span>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Horário de Funcionamento</h3>
              <span className="text-2xl">🕐</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Defina mensagens automáticas fora do horário comercial
            </p>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
              Em breve
            </span>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribuição Automática</h3>
              <span className="text-2xl">⚖️</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Distribua conversas automaticamente para a equipe
            </p>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
              Em breve
            </span>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tags Automáticas</h3>
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Classifique conversas automaticamente com base em palavras-chave
            </p>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
              Em breve
            </span>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Integração com CRM</h3>
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sincronize automaticamente dados com seu CRM
            </p>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md">
              Em breve
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Automações Inteligentes
            </h2>
            <p className="text-gray-600 mb-6">
              Esta funcionalidade está em desenvolvimento. Em breve você poderá automatizar:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Respostas baseadas em palavras-chave</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Fluxos de conversa com múltiplas etapas</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Envio programado de mensagens</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Coleta automática de dados do cliente</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Integração com webhooks externos</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600">Relatórios de performance das automações</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              🚀 <strong>Roadmap:</strong> Automações inteligentes com IA estão planejadas para as próximas versões
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-preencher email se vier da página de registro
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Credenciais inválidas')
      } else {
        // Verificar se a sessão foi criada
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">💬</span>
            <span className="text-2xl font-bold text-gray-900">Moobi Chat</span>
          </div>
          <p className="text-gray-600">Faça login para acessar sua central</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua senha"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para registro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link 
              href="/auth/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Separador */}
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou para testes</span>
          </div>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 text-center mb-3">
            <strong>🧪 Usuários de Desenvolvimento:</strong>
          </p>
          <div className="text-xs text-blue-700 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@moobi.test')
                  setPassword('123456')
                }}
                className="flex justify-between items-center p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium">Admin</span>
                <span className="font-mono text-blue-600">admin@moobi.test</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('operador@moobi.test')
                  setPassword('123456')
                }}
                className="flex justify-between items-center p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium">Operador</span>
                <span className="font-mono text-blue-600">operador@moobi.test</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('supervisor@moobi.test')
                  setPassword('123456')
                }}
                className="flex justify-between items-center p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium">Supervisor</span>
                <span className="font-mono text-blue-600">supervisor@moobi.test</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800">
            ← Voltar ao site principal
          </a>
        </div>
      </div>
    </div>
  )
} 
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💬</span>
          <span className="text-2xl font-bold text-gray-900">Moobi Chat</span>
        </div>
        <div className="space-x-4">
          <Link href="/dashboard">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Entrar
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Começar Agora
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Central de Comunicação
          <span className="text-blue-600 block mt-2">Inteligente</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Gerencie todas as suas conversas do WhatsApp, Instagram e outras plataformas 
          em um só lugar com organização por Kanban
        </p>
        <div className="space-x-4">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700">
              Experimente Grátis
            </button>
          </Link>
          <Link href="#features">
            <button className="px-8 py-4 border border-blue-600 text-blue-600 text-lg rounded-md hover:bg-blue-50">
              Ver Recursos
            </button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Recursos Principais
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <span className="text-4xl mb-4 block">💬</span>
            <h3 className="text-xl font-semibold mb-2">Múltiplas Plataformas</h3>
            <p className="text-gray-600">
              WhatsApp, Instagram, Facebook e mais em uma única interface
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <span className="text-4xl mb-4 block">📋</span>
            <h3 className="text-xl font-semibold mb-2">Organização Kanban</h3>
            <p className="text-gray-600">
              Organize suas conversas por estágio e gerencie o fluxo de atendimento
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <span className="text-4xl mb-4 block">⚡</span>
            <h3 className="text-xl font-semibold mb-2">Respostas Rápidas</h3>
            <p className="text-gray-600">
              Automações e respostas rápidas para agilizar o atendimento
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para revolucionar seu atendimento?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já usam o Moobi Chat para 
            gerenciar suas comunicações
          </p>
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-white text-blue-600 text-lg rounded-md hover:bg-gray-100">
              Começar Agora - Grátis
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">💬</span>
            <span className="text-xl font-bold">Moobi Chat</span>
          </div>
          <p className="text-gray-400">
            © 2024 Moobi Chat. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
} 
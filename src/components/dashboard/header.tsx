'use client'

import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function DashboardHeader() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-gray-900 dark:border-gray-700 px-4 md:px-6">
      <div className="flex items-center space-x-4">
        {/* Logo e Nome do Software */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
            Moobe Chat
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Toggle Dark Mode */}
        <ThemeToggle />

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* Menu do Usuário */}
        <div className="relative">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                {session?.user?.name || session?.user?.email || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session?.user?.email ? 'Usuário' : 'Carregando...'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Menu dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium">{session?.user?.name || 'Usuário'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</div>
              </div>
              
              <button
                onClick={() => setShowUserMenu(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay para fechar menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}
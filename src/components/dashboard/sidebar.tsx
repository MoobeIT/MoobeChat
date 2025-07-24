'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Kanban, 
  Settings, 
  Users,
  BarChart3,
  Zap,
  Plug,
  Home,
  Contact,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversas', href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Contatos', href: '/dashboard/contacts', icon: Contact },
  { name: 'Kanban', href: '/dashboard/kanban', icon: Kanban },
  { name: 'Integrações', href: '/dashboard/integrations', icon: Plug },
  { name: 'Automações', href: '/dashboard/automations', icon: Zap },
  { name: 'Equipe', href: '/dashboard/team', icon: Users },
  { name: 'Relatórios', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

const bottomNavigation = [
  { name: 'Voltar ao Site', href: '/', icon: Home },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64'
  const sidebarClasses = cn(
    'flex h-full flex-col bg-gray-900 dark:bg-gray-950 transition-all duration-300 ease-in-out',
    isMobile ? (
      isOpen 
        ? 'fixed inset-y-0 left-0 z-50 w-64 transform translate-x-0'
        : 'fixed inset-y-0 left-0 z-50 w-64 transform -translate-x-full'
    ) : sidebarWidth
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      <div className={sidebarClasses}>
        <div className="flex h-16 shrink-0 items-center px-6">
          <MessageSquare className="h-8 w-8 text-white flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-2 text-xl font-bold text-white truncate">Moobe Chat</span>
          )}
        </div>
        
        {/* Desktop toggle button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="mx-2 mb-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isCollapsed ? 'mx-auto' : 'mr-3',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Bottom navigation */}
        <div className="space-y-1 px-2 py-4 border-t border-gray-800 dark:border-gray-700">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isCollapsed ? 'mx-auto' : 'mr-3',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
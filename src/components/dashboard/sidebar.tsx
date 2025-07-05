'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Kanban, 
  Settings, 
  Users,
  BarChart3,
  Zap,
  Plug,
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversas', href: '/dashboard/conversations', icon: MessageSquare },
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

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 dark:bg-gray-950">
      <div className="flex h-16 shrink-0 items-center px-6">
        <MessageSquare className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">Moobe Chat</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
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
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 
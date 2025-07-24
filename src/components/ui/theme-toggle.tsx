'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evita problemas de hidratação
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      // Se for 'system', alterna para 'light' ou 'dark' baseado na preferência atual
      if (mounted && typeof window !== 'undefined') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setTheme(systemTheme === 'dark' ? 'light' : 'dark')
      } else {
        setTheme('light')
      }
    }
  }

  // Evita problemas de hidratação renderizando sempre o mesmo ícone no servidor
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <Moon className="h-5 w-5" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    )
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
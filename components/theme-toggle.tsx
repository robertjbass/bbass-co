'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { createLogger } from '@/lib/logger'

const logger = createLogger('theme-toggle')

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn('profile-theme-toggle', className)} />
  }

  const isDark = resolvedTheme === 'dark'

  function handleToggle() {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)
    fetch('/api/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch((error) => {
      logger.error('[ThemeToggle] Failed to persist theme:', error)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn('profile-theme-toggle', className)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

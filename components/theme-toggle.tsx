'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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
    return (
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg',
          className,
        )}
      />
    )
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
    <motion.button
      onClick={handleToggle}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:text-foreground',
        className,
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Sun className="h-3.75 w-3.75" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Moon className="h-3.75 w-3.75" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

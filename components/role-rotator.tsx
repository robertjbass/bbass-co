'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

type RoleRotatorProps = {
  roles: readonly string[]
  intervalMs?: number
}

export function RoleRotator({ roles, intervalMs = 2200 }: RoleRotatorProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (roles.length <= 1) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [roles.length, intervalMs])

  return (
    <span className="inline-flex items-baseline gap-2 text-lg text-muted-foreground md:text-xl">
      <span className="text-muted-foreground/70">I&apos;m a</span>
      <span className="relative inline-grid">
        {roles.map((role, i) => (
          <span
            key={role}
            aria-hidden={i !== index}
            className={cn(
              'col-start-1 row-start-1 whitespace-nowrap font-medium text-foreground transition-all duration-500',
              i === index
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-1 opacity-0',
            )}
          >
            {role}
          </span>
        ))}
      </span>
    </span>
  )
}

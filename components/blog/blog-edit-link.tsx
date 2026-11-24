'use client'

import Link from 'next/link'
import { SquarePen } from 'lucide-react'
import { useEffect, useState } from 'react'

export function BlogEditLink({ id }: { id: number }) {
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/user/me?depth=0', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(
        async (response) =>
          response.ok && (await response.json()).user?.role === 'admin',
      )
      .then(setIsAdmin)
      .catch(() => {})
    return () => controller.abort()
  }, [])
  if (!isAdmin) return null
  return (
    <Link
      href={`/admin/collections/blog/${id}`}
      className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <SquarePen className="size-3" /> Edit
    </Link>
  )
}

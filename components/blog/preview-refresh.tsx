'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

export function PreviewRefresh() {
  const router = useRouter()
  if (typeof window === 'undefined') return null
  return (
    <RefreshRouteOnSave
      refresh={router.refresh}
      serverURL={window.location.origin}
    />
  )
}

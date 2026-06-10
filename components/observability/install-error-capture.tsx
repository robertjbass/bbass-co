'use client'

import { useEffect } from 'react'
import { installGlobalErrorCapture } from '@/lib/observability/error-capture'

/**
 * Tiny client island that runs `installGlobalErrorCapture()` on mount.
 * Idempotent - the install function guards against double-install under
 * StrictMode and route group remounts. Sitting in its own file so layout
 * components can render `<InstallErrorCapture />` without going client
 * themselves.
 */
export function InstallErrorCapture() {
  useEffect(() => {
    installGlobalErrorCapture()
  }, [])
  return null
}

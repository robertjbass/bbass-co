'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

function scrollToElement(el: Element) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  el.scrollIntoView({
    behavior: prefersReducedMotion ? 'instant' : 'smooth',
    block: 'start',
  })
}

export function HashScroll() {
  const pathname = usePathname()

  const scrollToHash = useCallback(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const el = document.getElementById(hash)
    if (el) {
      requestAnimationFrame(() => scrollToElement(el))
      return
    }

    setTimeout(() => {
      const retryEl = document.getElementById(hash)
      if (retryEl) {
        requestAnimationFrame(() => scrollToElement(retryEl))
      }
    }, 100)
  }, [])

  // Scroll on pathname change (cross-page navigation with hash)
  useEffect(() => {
    scrollToHash()
  }, [pathname, scrollToHash])

  // Scroll on hashchange (same-page hash navigation)
  useEffect(() => {
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [scrollToHash])

  return null
}

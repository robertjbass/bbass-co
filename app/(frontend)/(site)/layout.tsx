import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HashScroll } from '@/components/hash-scroll'

export default function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div data-site-theme="vercel-warm">
      <HashScroll />
      <SiteHeader />
      <div className="min-h-screen">{children}</div>
      <SiteFooter />
    </div>
  )
}

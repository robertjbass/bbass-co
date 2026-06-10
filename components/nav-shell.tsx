'use client'

import { useState } from 'react'
import { NavWordmark } from '@/components/nav-wordmark'
import { NavLinks } from '@/components/nav-links'
import { NavCta } from '@/components/nav-cta'
import { NavExternalLinks } from '@/components/nav-external-links'
import { MobileNav } from '@/components/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { type NavConfig } from '@/lib/nav-config'

type NavShellProps = {
  config: NavConfig
  allowPathnameOverride?: boolean
}

export function NavShell({ config }: NavShellProps) {
  const [barHovered, setBarHovered] = useState(false)

  const resolved = config

  const hasAlternateBrand = !!resolved.alternateBrand

  return (
    <>
      {/* Wrap wordmark + desktop nav together for shared hover zone */}
      <div
        className="flex flex-1 items-center justify-between"
        onMouseEnter={hasAlternateBrand ? () => setBarHovered(true) : undefined}
        onMouseLeave={
          hasAlternateBrand ? () => setBarHovered(false) : undefined
        }
      >
        <NavWordmark
          brand={resolved.brand}
          alternateBrand={resolved.alternateBrand}
          expanded={barHovered}
        />

        <nav id="desktop-nav" className="hidden items-center gap-1 md:flex">
          <NavLinks links={resolved.links} />

          <div id="nav-divider" className="mx-1.5 h-4 w-px bg-border/50" />

          <NavExternalLinks links={resolved.externalLinks} />

          {resolved.showThemeToggle && <ThemeToggle />}

          {resolved.cta && <NavCta cta={resolved.cta} />}
        </nav>
      </div>

      <div id="mobile-nav" className="flex items-center md:hidden">
        <MobileNav config={resolved} />
      </div>

      {/* Sticky mobile theme toggle - always visible bottom-right */}
      {resolved.showThemeToggle && (
        <div className="fixed bottom-5 right-5 z-50 md:hidden">
          <ThemeToggle />
        </div>
      )}
    </>
  )
}

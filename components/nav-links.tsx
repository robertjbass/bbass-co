'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavLink } from '@/lib/nav-config'
import { Fragment, type MouseEvent } from 'react'

type NavLinksProps = {
  links: NavLink[]
}

export function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname()

  const linkClass =
    'nav-link relative px-3 py-1.5 text-[13px] text-foreground/55 transition-colors hover:text-foreground'

  function handleHashClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) return

    const hash = href.slice(hashIndex + 1)
    const linkPath = href.slice(0, hashIndex) || '/'

    if (pathname !== linkPath) return

    const el = document.getElementById(hash)
    if (!el) return

    e.preventDefault()

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'start',
    })

    window.history.replaceState(null, '', `${linkPath}#${hash}`)
  }

  return (
    <>
      {links.map((link) => {
        const isInternal =
          link.href.startsWith('/') || link.href.startsWith('#')

        // The trailing space gives text scrapers (e.g. Googlebot building a
        // fallback meta description) a word boundary between links. The nav is
        // a flex container, where a whitespace-only text node becomes a
        // whitespace-only anonymous flex item that CSS does not render - so
        // this is invisible on screen but stops the labels concatenating into
        // one word ("CloudStacksDesktop...") when the nav is scraped.
        return (
          <Fragment key={link.href}>
            {isInternal ? (
              <Link
                href={link.href}
                className={linkClass}
                onClick={(e) => handleHashClick(e, link.href)}
              >
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className={linkClass}>
                {link.label}
              </a>
            )}{' '}
          </Fragment>
        )
      })}
    </>
  )
}

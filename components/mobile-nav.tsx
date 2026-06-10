'use client'

import {
  type TouchEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowRight, Terminal, Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { motion, type Variants, type Transition } from 'motion/react'
import { cn } from '@/lib/cn'
import { BbassMark } from '@/components/icons/bbass-mark'
import { ThemeToggle } from '@/components/theme-toggle'
import type { NavConfig } from '@/lib/nav-config'

function isInternalRoute(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

type MobileNavProps = {
  config: NavConfig
}

const TRANSITION: Transition = {
  duration: 0.4,
  ease: [0.32, 0.72, 0, 1],
}

const itemVariants: Variants = {
  closed: { opacity: 0, x: -12 },
  open: { opacity: 1, x: 0 },
}

const footerVariants: Variants = {
  closed: { opacity: 0, y: 8 },
  open: { opacity: 1, y: 0 },
}

const CTA_ICON_MAP = {
  arrow: ArrowRight,
  terminal: Terminal,
  mail: Mail,
} as const

const EXTERNAL_ICON_MAP = {
  github: FaGithub,
  linkedin: FaLinkedin,
  mail: Mail,
} as const

function hrefPathname(href: string): string | null {
  if (href.startsWith('#') || href.startsWith('//')) return null
  if (href.startsWith('/')) {
    const hashIndex = href.indexOf('#')
    return hashIndex === -1 ? href : href.slice(0, hashIndex)
  }
  try {
    return new URL(href).pathname
  } catch {
    return null
  }
}

function isLinkActive(linkHref: string, pathname: string | null): boolean {
  if (!pathname) return false
  const linkPath = hrefPathname(linkHref)
  if (!linkPath) return false
  if (linkPath === '/') return pathname === '/'
  return pathname === linkPath || pathname.startsWith(linkPath + '/')
}

export function MobileNav({ config }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const mq = window.matchMedia('(min-width: 768px)')
    function handleChange(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false)
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  const touchRef = useRef<{ startX: number; startY: number } | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchRef.current = { startX: touch.clientX, startY: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchRef.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchRef.current.startX
      const dy = Math.abs(touch.clientY - touchRef.current.startY)
      touchRef.current = null
      // Horizontal swipe: distance > 80px and more horizontal than vertical
      if (Math.abs(dx) > 80 && Math.abs(dx) > dy) {
        close()
      }
    },
    [close],
  )

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'relative z-50 flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
          open
            ? 'pointer-events-none opacity-0'
            : 'text-foreground/50 hover:text-foreground',
        )}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id="mobile-nav-overlay"
            className="fixed inset-0 z-60 flex flex-col bg-background dark:bg-card"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Spacer matches site-header pt-3 */}
            <div className="h-3 shrink-0" />
            {/* Header: h-12 + px matches site-header inner bar (px-4 + px-5 + 1px border) */}
            <div className="flex h-12 shrink-0 items-center justify-between px-9.25">
              <div className="flex items-center gap-2">
                <BbassMark className="size-6 shrink-0" />
                <span className="font-display text-base font-semibold tracking-tight">
                  {config.brand.name}
                  {config.brand.nameHighlight
                    ? ` ${config.brand.nameHighlight}`
                    : ''}
                </span>
              </div>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav
              aria-label="Mobile navigation"
              className="relative flex flex-1 flex-col justify-center px-8"
            >
              <div className="flex flex-col gap-1">
                {config.links.map((link, i) => {
                  const active = isLinkActive(link.href, pathname)
                  const linkClass = cn(
                    'group flex items-center gap-4 rounded-xl py-4 text-2xl font-medium transition-colors hover:text-foreground',
                    active ? 'text-foreground' : 'text-foreground/50',
                  )
                  const content = link.label
                  const motionProps = {
                    variants: itemVariants,
                    initial: 'closed' as const,
                    animate: 'open' as const,
                    transition: {
                      ...TRANSITION,
                      delay: 0.06 * (i + 1),
                    },
                  }

                  return isInternalRoute(link.href) ? (
                    <motion.div key={link.href} {...motionProps}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className={linkClass}
                        aria-current={active ? 'page' : undefined}
                      >
                        {content}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className={linkClass}
                      aria-current={active ? 'page' : undefined}
                      {...motionProps}
                    >
                      {content}
                    </motion.a>
                  )
                })}
              </div>

              {config.cta &&
                (() => {
                  const ctaClass =
                    'mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber py-3.5 text-sm font-medium text-amber-foreground transition-colors hover:bg-amber/85'
                  const CtaIcon = CTA_ICON_MAP[config.cta.icon]
                  const ctaContent = (
                    <>
                      {config.cta.label}
                      <CtaIcon className="h-3.5 w-3.5" />
                    </>
                  )
                  const ctaMotionProps = {
                    variants: footerVariants,
                    initial: 'closed' as const,
                    animate: 'open' as const,
                    transition: {
                      ...TRANSITION,
                      delay: 0.06 * (config.links.length + 1),
                    },
                  }

                  return isInternalRoute(config.cta.href) ? (
                    <motion.div {...ctaMotionProps}>
                      <Link
                        href={config.cta.href}
                        onClick={close}
                        className={ctaClass}
                      >
                        {ctaContent}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      href={config.cta.href}
                      onClick={close}
                      className={ctaClass}
                      {...ctaMotionProps}
                    >
                      {ctaContent}
                    </motion.a>
                  )
                })()}
            </nav>

            {/* Footer */}
            <motion.div
              className="relative flex shrink-0 items-center justify-between border-t border-border/20 px-8 py-5"
              variants={footerVariants}
              initial="closed"
              animate="open"
              transition={{ ...TRANSITION, delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                {config.externalLinks.map((link) => {
                  const Icon = EXTERNAL_ICON_MAP[link.icon]
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-foreground/30 transition-colors hover:text-foreground"
                      onClick={close}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </a>
                  )
                })}
              </div>
              {config.showThemeToggle && (
                <ThemeToggle className="h-8 w-8 text-foreground/30" />
              )}
            </motion.div>
          </div>,
          document.body,
        )}
    </div>
  )
}

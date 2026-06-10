import Link from 'next/link'
import { ArrowRight, Terminal, Mail } from 'lucide-react'
import type { NavCtaConfig } from '@/lib/nav-config'

const ICON_MAP = {
  arrow: ArrowRight,
  terminal: Terminal,
  mail: Mail,
} as const

type NavCtaProps = {
  cta: NavCtaConfig
}

const ctaClass =
  'ml-1.5 inline-flex h-7 items-center gap-1.5 rounded-lg bg-amber px-3 text-xs font-medium text-amber-foreground transition-colors hover:bg-amber/85'

export function NavCta({ cta }: NavCtaProps) {
  const Icon = ICON_MAP[cta.icon]
  const isInternal = cta.href.startsWith('/') && !cta.href.startsWith('//')

  if (isInternal) {
    return (
      <Link href={cta.href} className={ctaClass}>
        {cta.label}
        <Icon className="h-3 w-3" />
      </Link>
    )
  }

  return (
    <a href={cta.href} className={ctaClass}>
      {cta.label}
      <Icon className="h-3 w-3" />
    </a>
  )
}

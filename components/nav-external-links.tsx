import type { NavExternalLink } from '@/lib/nav-config'
import { GitHub } from '@/components/icons/github'
import { FaLinkedin } from 'react-icons/fa'
import { Mail } from 'lucide-react'

const ICON_MAP = {
  github: GitHub,
  linkedin: FaLinkedin,
  mail: Mail,
} as const

type NavExternalLinksProps = {
  links: NavExternalLink[]
}

export function NavExternalLinks({ links }: NavExternalLinksProps) {
  return (
    <>
      {links.map((link) => {
        const Icon = ICON_MAP[link.icon]
        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:text-foreground"
            aria-label={link.label}
          >
            <Icon className="h-3.75 w-3.75" />
          </a>
        )
      })}
    </>
  )
}

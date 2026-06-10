import { socialLinks } from '@/lib/data'

export type NavBrand = {
  name: string
  nameHighlight?: string
  href: string
}

export type NavLink = {
  href: string
  label: string
}

export type NavCtaConfig = {
  href: string
  label: string
  icon: 'arrow' | 'terminal' | 'mail'
}

export type NavExternalLink = {
  href: string
  label: string
  icon: 'github' | 'linkedin' | 'mail'
}

export type HeaderVariant = 'default' | 'subdomain'

export type NavConfig = {
  brand: NavBrand
  alternateBrand?: NavBrand
  links: NavLink[]
  cta: NavCtaConfig | null
  externalLinks: NavExternalLink[]
  showThemeToggle: boolean
  headerVariant: HeaderVariant
}

export function getMainNavConfig(): NavConfig {
  return {
    brand: {
      name: 'Bob',
      nameHighlight: 'Bass',
      href: '/',
    },
    links: [
      { href: '/', label: 'Home' },
      { href: '/blog', label: 'Blog' },
    ],
    cta: null,
    externalLinks: [
      { href: socialLinks.github, label: 'GitHub', icon: 'github' },
      { href: socialLinks.linkedin, label: 'LinkedIn', icon: 'linkedin' },
    ],
    showThemeToggle: true,
    headerVariant: 'default',
  }
}

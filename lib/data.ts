export const contactInfo = {
  email: 'bob@bbass.co',
  location: 'Austin, TX',
  name: 'Bob Bass',
  company: {
    name: 'Bob Bass',
    legalName: 'Bob Bass',
    tagline: 'Engineer & Founder',
  },
} as const

export const socialLinks = {
  website: 'https://bbass.co',
  email: 'mailto:bob@bbass.co',
  github: 'https://github.com/robertjbass',
  linkedin: 'https://linkedin.com/in/bbass9490',
  twitter: 'https://x.com/bobdotjs',
  youtube: 'https://youtube.com/@bobDotJS',
  discord: 'https://ourpassion.dev',
  startup: 'https://layerbase.com',
} as const

export type ContactIcon =
  | 'email'
  | 'github'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'discord'
  | 'startup'

// Rotating role labels in the hero.
export const roles = [
  'Head of Engineering',
  'TypeScript Enthusiast',
  'Startup Founder',
  'Full-Stack Developer',
] as const

// Contact channels surfaced on the landing page.
export const contactLinks = [
  {
    label: 'Email',
    href: 'mailto:bob@bbass.co',
    display: 'bob@bbass.co',
    icon: 'email',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/robertjbass',
    display: '@robertjbass',
    icon: 'github',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/bbass9490',
    display: 'bbass9490',
    icon: 'linkedin',
  },
  {
    label: 'X',
    href: 'https://x.com/bobdotjs',
    display: '@bobdotjs',
    icon: 'x',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@bobDotJS',
    display: '@bobDotJS',
    icon: 'youtube',
  },
  {
    label: 'Discord',
    href: 'https://ourpassion.dev',
    display: 'ourpassion.dev',
    icon: 'discord',
  },
  {
    label: 'My Startup',
    href: 'https://layerbase.com',
    display: 'layerbase.com',
    icon: 'startup',
  },
] as const satisfies ReadonlyArray<{
  label: string
  href: string
  display: string
  icon: ContactIcon
}>

// "About" cards on the landing page.
export const aboutCards = [
  {
    emoji: '🎸',
    title: 'Interests',
    description: 'Programming, Skateboarding, Guitar, and Pet Rats',
  },
  {
    emoji: '🚀',
    title: 'Founder',
    description:
      'Ashland Development (2011 — Sold 2019), DebtOS (Pioneer 2020), Layerbase (2025 — Current)',
  },
  {
    emoji: '💡',
    title: 'Philosophy',
    description: 'Passionate about mentorship and helping others grow',
  },
] as const

export const projects = [
  {
    name: 'Layerbase',
    description:
      'Developer tooling to install, run, and manage any database engine in seconds.',
    technologies: ['TypeScript', 'Next.js', 'PostgreSQL', 'Payload'],
    link: 'https://layerbase.com',
    category: 'Developer Tools',
  },
  {
    name: 'Efficient App',
    description:
      'Flagship developer tooling platform providing productivity solutions for modern development teams.',
    technologies: ['TypeScript', 'Next.js', 'PostgreSQL', 'AWS'],
    link: 'https://efficient.app',
    category: 'SaaS Platform',
  },
  {
    name: 'DebtOS',
    description:
      'SaaS platform for accounts receivable automation. Winner of the 2020 Pioneer startup program.',
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    category: 'FinTech',
    link: undefined,
  },
] as const

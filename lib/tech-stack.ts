import type { ComponentType, SVGProps } from 'react'
import { TechIcons } from '@/components/icons/tech-icons'
import {
  PostgreSQLIcon,
  MySQLIcon,
  SQLiteIcon,
  RedisIcon,
} from '@/components/icons/db-icons'

export enum TechCategory {
  Languages = 'languages',
  Frontend = 'frontend',
  Backend = 'backend',
  Databases = 'databases',
  Cloud = 'cloud',
  DevOps = 'devops',
}

export const TECH_CATEGORY_LABELS: Record<TechCategory, string> = {
  [TechCategory.Languages]: 'Languages',
  [TechCategory.Frontend]: 'Frontend',
  [TechCategory.Backend]: 'Backend & Data',
  [TechCategory.Databases]: 'Databases',
  [TechCategory.Cloud]: 'Cloud & Hosting',
  [TechCategory.DevOps]: 'DevOps & Tools',
}

export type TechInfo = {
  name: string
  category: TechCategory
  Icon:
    | ComponentType<SVGProps<SVGSVGElement>>
    | ComponentType<{ className?: string }>
  brandColor: { light: string; dark: string }
}

export const TECH_STACK: TechInfo[] = [
  // Languages
  {
    name: 'TypeScript',
    category: TechCategory.Languages,
    Icon: TechIcons.TypeScript,
    brandColor: { light: '#3178C6', dark: '#5A9BF6' },
  },
  {
    name: 'Go',
    category: TechCategory.Languages,
    Icon: TechIcons.Go,
    brandColor: { light: '#00ADD8', dark: '#00ADD8' },
  },
  {
    name: 'Rust',
    category: TechCategory.Languages,
    Icon: TechIcons.Rust,
    brandColor: { light: '#A0501D', dark: '#DEA584' },
  },
  {
    name: 'C++',
    category: TechCategory.Languages,
    Icon: TechIcons.CPlusPlus,
    brandColor: { light: '#00599C', dark: '#659AD2' },
  },
  {
    name: 'Zig',
    category: TechCategory.Languages,
    Icon: TechIcons.Zig,
    brandColor: { light: '#F7A41D', dark: '#F7A41D' },
  },
  {
    name: 'Elixir',
    category: TechCategory.Languages,
    Icon: TechIcons.Elixir,
    brandColor: { light: '#6E4A7E', dark: '#A57BBD' },
  },

  // Frontend
  {
    name: 'React',
    category: TechCategory.Frontend,
    Icon: TechIcons.React,
    brandColor: { light: '#087EA4', dark: '#61DAFB' },
  },
  {
    name: 'Next.js',
    category: TechCategory.Frontend,
    Icon: TechIcons.NextJS,
    brandColor: { light: '#171717', dark: '#EDEDED' },
  },
  {
    name: 'Vue',
    category: TechCategory.Frontend,
    Icon: TechIcons.Vue,
    brandColor: { light: '#42B883', dark: '#42B883' },
  },
  {
    name: 'Nuxt',
    category: TechCategory.Frontend,
    Icon: TechIcons.Nuxt,
    brandColor: { light: '#00DC82', dark: '#00DC82' },
  },
  {
    name: 'Svelte',
    category: TechCategory.Frontend,
    Icon: TechIcons.Svelte,
    brandColor: { light: '#FF3E00', dark: '#FF3E00' },
  },
  {
    name: 'Tailwind',
    category: TechCategory.Frontend,
    Icon: TechIcons.TailwindCSS,
    brandColor: { light: '#0EA5E9', dark: '#38BDF8' },
  },

  // Backend & Data
  {
    name: 'Node.js',
    category: TechCategory.Backend,
    Icon: TechIcons.NodeJS,
    brandColor: { light: '#339933', dark: '#5FA04E' },
  },
  {
    name: 'Payload CMS',
    category: TechCategory.Backend,
    Icon: TechIcons.PayloadCMS,
    brandColor: { light: '#171717', dark: '#EDEDED' },
  },

  // Databases
  {
    name: 'PostgreSQL',
    category: TechCategory.Databases,
    Icon: PostgreSQLIcon,
    brandColor: { light: '#336791', dark: '#5A9BD5' },
  },
  {
    name: 'MySQL',
    category: TechCategory.Databases,
    Icon: MySQLIcon,
    brandColor: { light: '#4479A1', dark: '#6BB3E0' },
  },
  {
    name: 'SQLite',
    category: TechCategory.Databases,
    Icon: SQLiteIcon,
    brandColor: { light: '#003B57', dark: '#4A9FD9' },
  },
  {
    name: 'Redis',
    category: TechCategory.Databases,
    Icon: RedisIcon,
    brandColor: { light: '#DC382D', dark: '#DC382D' },
  },

  // Cloud & Hosting
  {
    name: 'AWS',
    category: TechCategory.Cloud,
    Icon: TechIcons.AWS,
    brandColor: { light: '#FF9900', dark: '#FF9900' },
  },
  {
    name: 'Vercel',
    category: TechCategory.Cloud,
    Icon: TechIcons.Vercel,
    brandColor: { light: '#171717', dark: '#EDEDED' },
  },

  // DevOps & Tools
  {
    name: 'Docker',
    category: TechCategory.DevOps,
    Icon: TechIcons.Docker,
    brandColor: { light: '#2496ED', dark: '#2496ED' },
  },
  {
    name: 'Linux',
    category: TechCategory.DevOps,
    Icon: TechIcons.Linux,
    brandColor: { light: '#333333', dark: '#FCC624' },
  },
  {
    name: 'GitHub',
    category: TechCategory.DevOps,
    Icon: TechIcons.GitHub,
    brandColor: { light: '#24292F', dark: '#E6EDF3' },
  },
]

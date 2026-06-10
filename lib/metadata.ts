import type { Metadata } from 'next'

function normalizeSiteUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined

  const withProtocol = /^https?:\/\//.test(value)
    ? value.trim()
    : `https://${value.trim()}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return undefined
  }
}

export const SITE_URL =
  normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL ??
      process.env.AUTH_URL,
  ) ?? 'https://bbass.co'

// Whether the running deployment should be hidden from search engines.
//
// Trust VERCEL_ENV first because it is the authoritative signal Vercel sets
// on every build: 'production' | 'preview' | 'development'. Older logic that
// checked process.env.VERCEL_URL was incorrect because VERCEL_URL always
// resolves to a .vercel.app URL even on production deployments, which
// silently noindexed the whole site.
//
// Outside of Vercel (local dev, self-hosted), fall back to inspecting the
// configured SITE_URL itself: localhost, dev. subdomain, or a raw
// .vercel.app domain all imply a non-public deployment.
//
// Exported as a pure function so unit tests can pin the behaviour against
// every combination of env vars without booting the whole module.
export function computeShouldNoindex(env: {
  vercelEnv: string | undefined
  siteUrl: string
}): boolean {
  if (env.vercelEnv === 'production') return false
  if (env.vercelEnv === 'preview' || env.vercelEnv === 'development')
    return true

  // No Vercel context: inspect the served origin.
  return (
    env.siteUrl.includes('localhost') ||
    env.siteUrl.endsWith('.vercel.app') ||
    env.siteUrl.includes('://dev.')
  )
}

export const SHOULD_NOINDEX_SITE = computeShouldNoindex({
  vercelEnv: process.env.VERCEL_ENV,
  siteUrl: SITE_URL,
})

const SITE_NAME = 'Bob Bass'
const DEFAULT_TITLE = 'Bob Bass — Engineer & Founder'
const DEFAULT_DESCRIPTION =
  'Bob Bass is a software engineer and founder in Austin, TX. Head of Engineering at Efficient App and founder of Layerbase. Writing about TypeScript, developer tooling, and building products.'

export function siteMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bobdotjs',
      creator: '@bobdotjs',
    },
    alternates: {
      canonical: './',
    },
    ...(SHOULD_NOINDEX_SITE && {
      robots: { index: false, follow: false },
    }),
  }
}

type PageMetadataOptions = {
  title: string | { absolute: string }
  description: string
  path: string
  noIndex?: boolean
}

// Next.js merges metadata fields shallowly: any child-level openGraph
// REPLACES the parent's openGraph object instead of spreading into it.
// Restate type / siteName / locale here so the per-page openGraph still
// emits the og:type, og:site_name, og:locale tags that we declare once
// in siteMetadata(). Without this, the only page that emits those tags
// is the one that bypasses pageMetadata() entirely.
export function pageMetadata({
  title,
  description,
  path,
  noIndex,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      url: path,
    },
    ...((noIndex || SHOULD_NOINDEX_SITE) && {
      robots: { index: false, follow: false },
    }),
  }
}

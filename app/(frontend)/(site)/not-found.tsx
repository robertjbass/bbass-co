import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Renders inside (site)/layout.tsx so it inherits the SiteHeader +
// SiteFooter, which makes a 404 feel like the rest of the site rather
// than a Next.js fallback. Covers every marketing route under (site):
// /, /db/<bad>, /blog/<bad>, /create/<bad>, /pricing, /spindb, /desktop,
// /stacks, /support, /terms, /privacy, /data-residency, etc.

// Static fragment + no data fetching — safe to mark static so the page
// is pre-rendered at build time and served from the CDN.
export const dynamic = 'force-static'

export const metadata = {
  title: 'Page not found',
  // We intentionally do NOT want this page to rank or accumulate
  // backlinks; the noindex keeps it out of GSC and out of the
  // /sitemap.xml chain.
  robots: { index: false, follow: false },
}

const POPULAR_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/db/postgresql', label: 'PostgreSQL' },
  { href: '/blog', label: 'Blog' },
  { href: '/support', label: 'Contact support' },
]

export default function SiteNotFound() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="container mx-auto max-w-2xl text-center">
        <p className="section-label">404</p>
        <h1 className="site-heading mt-3 text-4xl tracking-tight md:text-5xl">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
          The link may be out of date, mistyped, or the page may have moved.
          Here are a few places that probably have what you came for.
        </p>
        <ul className="mx-auto mt-10 flex max-w-md flex-col divide-y divide-border/40 overflow-hidden rounded-xl site-ring">
          {POPULAR_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center justify-between bg-card px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-card/60"
              >
                <span>{link.label}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

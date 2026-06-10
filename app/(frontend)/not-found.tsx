import Link from 'next/link'

// Bare fallback that renders inside (frontend)/layout.tsx (which
// provides html/body + theme provider) but without the (site) header/
// footer or the cloud sidebar. Reached when a request hits a path
// outside the (site) and cloud groups — e.g. /auth/<bad>,
// /teams/accept/<bad>, /users/<bad>, or any apex path that hasn't
// been registered. Kept minimal because there's no chrome to anchor
// it to and most of these paths are auth-internal anyway.

export const dynamic = 'force-static'

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function FrontendNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
          404
        </p>
        <h1 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          The page you were looking for doesn&rsquo;t exist or has moved.
        </p>
        <Link
          href="/"
          className="bg-foreground text-background hover:bg-foreground/90 mt-6 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}

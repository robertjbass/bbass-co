import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Bob Bass',
    default: 'Blog | Bob Bass',
  },
  description:
    'Writing on TypeScript, developer tooling, building products, and lessons from shipping software.',
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/blog/rss.xml', title: 'Bob Bass Blog RSS feed' },
      ],
    },
  },
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="min-h-screen text-foreground">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">{children}</main>
    </div>
  )
}

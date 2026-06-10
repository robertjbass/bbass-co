import type { ReactNode } from 'react'
import Script from 'next/script'
import {
  Inter,
  JetBrains_Mono,
  Instrument_Serif,
  Geist,
} from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { siteMetadata, SITE_URL } from '@/lib/metadata'
import { GlobalErrorBoundary } from '@/components/observability/error-boundary'
import { InstallErrorCapture } from '@/components/observability/install-error-capture'

import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

// The serif is a dormant accent (no current `font-serif` usage), so its
// preload was pure waste competing on the critical path. Skip it; `swap`
// (next/font default) still loads it on demand if a future surface uses it.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  preload: false,
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata = siteMetadata()

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  let defaultTheme = 'dark'
  try {
    const { getThemePreference } =
      await import('@/lib/auth/get-theme-preference')
    defaultTheme = await getThemePreference()
  } catch {
    // Auth/Payload module chain failed  - use default theme
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Person',
                  '@id': `${SITE_URL}/#person`,
                  name: 'Bob Bass',
                  url: SITE_URL,
                  jobTitle: 'Head of Engineering',
                  description:
                    'Software engineer and founder. Head of Engineering at Efficient App and founder of Layerbase.',
                  sameAs: [
                    'https://github.com/robertjbass',
                    'https://x.com/bobdotjs',
                    'https://linkedin.com/in/bbass9490',
                    'https://youtube.com/@bobDotJS',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  name: 'Bob Bass',
                  url: SITE_URL,
                  publisher: { '@id': `${SITE_URL}/#person` },
                },
              ],
            }).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${geist.variable} font-sans antialiased`}
      >
        <Script strategy="beforeInteractive" id="theme-sync">
          {`(function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme-preference=([^;]*)/);if(m){var t=decodeURIComponent(m[1]);if(t==='light'||t==='dark'||t==='system')localStorage.setItem('theme',t)}}catch(e){}})()`}
        </Script>
        <Script strategy="beforeInteractive" id="scroll-restore">
          {`history.scrollRestoration = "manual"`}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem
          disableTransitionOnChange
        >
          <InstallErrorCapture />
          <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}

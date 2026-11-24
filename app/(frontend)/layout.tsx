import type { ReactNode } from 'react'
import Script from 'next/script'
import {
  Inter,
  JetBrains_Mono,
  Instrument_Serif,
  Geist,
} from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { JsonLd } from '@/components/structured-data'
import { siteGraph } from '@/lib/structured-data'
import { siteMetadata } from '@/lib/metadata'
import { GlobalErrorBoundary } from '@/components/observability/error-boundary'
import { InstallErrorCapture } from '@/components/observability/install-error-capture'

import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: false,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

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
        <JsonLd data={siteGraph} />
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

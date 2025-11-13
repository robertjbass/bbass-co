import './globals.css'
import type { Metadata } from 'next'
import Cursor from '@/components/Cursor'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Bob Bass',
  description: 'Portfolio for Bob Bass',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Cursor />
        <Navigation />
        <div className="min-h-screen transition-all">
          <main className="w-full min-h-screen flex items-center justify-center p-8 pt-32 md:pt-8">
            <div className="text-white max-w-5xl w-full">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}

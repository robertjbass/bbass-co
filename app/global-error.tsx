'use client'

import { useEffect } from 'react'
import { captureException } from '@/lib/observability/error-capture'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Forward to the client-error → Loki pipeline so this lands in
    // Grafana alongside everything else. console.error keeps a local
    // copy for browser-devtools debugging.
    console.error('[GlobalError]', error)
    captureException(error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --bg: #fff;
                --text: #171717;
                --muted: #666;
                --btn-bg: #171717;
                --btn-text: #fff;
                --btn-border: transparent;
              }
              @media (prefers-color-scheme: dark) {
                :root {
                  --bg: #0a0a0a;
                  --text: #ededed;
                  --muted: #a0a0a0;
                  --btn-bg: #ededed;
                  --btn-text: #0a0a0a;
                  --btn-border: transparent;
                }
              }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                background: var(--bg);
                color: var(--text);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-font-smoothing: antialiased;
              }
            `,
          }}
        />
      </head>
      <body>
        <div
          style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--muted)',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '2.25rem',
              padding: '0 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              cursor: 'pointer',
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: '1px solid var(--btn-border)',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

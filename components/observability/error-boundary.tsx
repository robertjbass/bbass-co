'use client'

import { Component, type ReactNode } from 'react'
import Link from 'next/link'
import { captureException } from '@/lib/observability/error-capture'

type Props = {
  children: ReactNode
  /** Rendered when the boundary catches an error. Defaults to a minimal
   *  app-shell-style fallback so a render crash doesn't leave the user
   *  staring at a white page. */
  fallback?: ReactNode
}

type State = {
  hasError: boolean
}

/**
 * Root-level React error boundary. Catches render-phase errors that
 * `window.onerror` doesn't see and forwards them to `/api/errors` via
 * the shared capture pipeline. Lives in `components/observability` so
 * the route-group layouts can wrap their content without each one
 * re-implementing the boundary.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              We&apos;ve been notified and will look into it. Refresh the page
              or head back to the home screen.
            </p>
            <Link
              href="/"
              className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/60"
            >
              Go home
            </Link>
          </div>
        )
      )
    }
    return this.props.children
  }
}

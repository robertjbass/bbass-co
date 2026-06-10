'use client'

import {
  BREADCRUMB_LIMIT,
  type Breadcrumb,
  type ErrorEvent,
  type ExceptionValue,
  type StackFrame,
} from '@/lib/observability/error-event'

/**
 * Client-side error transport. The companion of `pushErrorEventToLoki`
 * on the server. We deliberately keep this dependency-free - no SDK, no
 * source-map magic - so the bundle cost is < 2KB and the failure mode
 * when reporting itself errors is "we lose one log line", never an app
 * crash. Migration to Sentry would replace this entire module; the
 * server endpoint stays.
 */

let breadcrumbs: Breadcrumb[] = []
let isInstalled = false

const ENVIRONMENT =
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.NEXT_PUBLIC_ENVIRONMENT ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'development')

const RELEASE =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_RELEASE ||
  'dev'

export function addBreadcrumb(crumb: Omit<Breadcrumb, 'timestamp'>): void {
  breadcrumbs.push({
    ...crumb,
    timestamp: Math.round(Date.now() / 1000),
  })
  if (breadcrumbs.length > BREADCRUMB_LIMIT) {
    breadcrumbs = breadcrumbs.slice(-BREADCRUMB_LIMIT)
  }
}

function eventId(): string {
  // 32 hex chars to match Sentry's event_id contract.
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Parses an Error's stack into rough Sentry stack frames. The format
 * varies by engine; this captures the V8/Firefox common cases and
 * fails open (returns no frames) on anything weird rather than throwing.
 */
function parseStackFrames(stack: string | undefined): StackFrame[] {
  if (!stack) return []
  const lines = stack.split('\n').slice(1) // first line is the message
  const frames: StackFrame[] = []
  for (const line of lines) {
    // V8: `    at functionName (https://host/path:line:col)`
    //  or `    at https://host/path:line:col`
    const v8 = line.match(/^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?\s*$/)
    if (v8) {
      frames.push({
        function: v8[1] || undefined,
        filename: v8[2],
        lineno: Number(v8[3]),
        colno: Number(v8[4]),
        in_app: !v8[2].includes('/_next/static/chunks/framework'),
      })
      continue
    }
    // Firefox: `functionName@https://host/path:line:col`
    const ff = line.match(/^(.*?)@(.+?):(\d+):(\d+)$/)
    if (ff) {
      frames.push({
        function: ff[1] || undefined,
        filename: ff[2],
        lineno: Number(ff[3]),
        colno: Number(ff[4]),
        in_app: !ff[2].includes('/_next/static/chunks/framework'),
      })
      continue
    }
    // Unknown shape - skip.
  }
  // Sentry orders frames innermost-last; V8/FF parse innermost-first.
  return frames.reverse()
}

function buildException(err: unknown): ExceptionValue {
  if (err instanceof Error) {
    return {
      type: err.name || 'Error',
      value: err.message,
      stacktrace: { frames: parseStackFrames(err.stack) },
    }
  }
  if (typeof err === 'string') {
    return { type: 'Error', value: err }
  }
  try {
    return {
      type: 'NonError',
      value: JSON.stringify(err),
    }
  } catch {
    return { type: 'NonError', value: String(err) }
  }
}

function buildEvent(err: unknown): ErrorEvent {
  return {
    timestamp: Date.now(),
    event_id: eventId(),
    level: 'error',
    release: RELEASE,
    environment: ENVIRONMENT,
    request: {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    },
    exception: { values: [buildException(err)] },
    breadcrumbs: { values: breadcrumbs.slice() },
  }
}

function dispatch(event: ErrorEvent): void {
  try {
    const body = JSON.stringify(event)
    // navigator.sendBeacon is the right primitive for "ship this no
    // matter what happens to the page next" but it can't set custom
    // Content-Type. Fall back to fetch+keepalive if Beacon would lose
    // the content-type fidelity our endpoint needs.
    if (
      typeof navigator !== 'undefined' &&
      typeof Blob !== 'undefined' &&
      'sendBeacon' in navigator
    ) {
      const blob = new Blob([body], { type: 'application/json' })
      const ok = navigator.sendBeacon('/api/errors', blob)
      if (ok) return
    }
    void fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  } catch {
    // Reporting itself failed. Swallow - we're not going to loop on
    // "error while reporting an error."
  }
}

/**
 * Public API. Synchronous, fire-and-forget. Safe to call during a render
 * (e.g. from a React error boundary's componentDidCatch).
 */
export function captureException(err: unknown): void {
  dispatch(buildEvent(err))
}

/**
 * Installs the global `window.onerror` and `unhandledrejection` handlers,
 * plus a fetch wrapper that drops navigation/HTTP breadcrumbs. Idempotent.
 * Called from the root layout after hydration; safe under StrictMode.
 */
export function installGlobalErrorCapture(): void {
  if (isInstalled) return
  if (typeof window === 'undefined') return
  isInstalled = true

  window.addEventListener('error', (event: globalThis.ErrorEvent) => {
    captureException(event.error ?? event.message)
  })

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      captureException(event.reason)
    },
  )

  // Navigation breadcrumbs via the History API.
  const origPush = history.pushState
  const origReplace = history.replaceState
  history.pushState = function (...args) {
    addBreadcrumb({
      category: 'navigation',
      type: 'navigation',
      message: String(args[2] ?? ''),
    })
    return origPush.apply(this, args)
  }
  history.replaceState = function (...args) {
    addBreadcrumb({
      category: 'navigation',
      type: 'navigation',
      message: String(args[2] ?? ''),
    })
    return origReplace.apply(this, args)
  }
  window.addEventListener('popstate', () => {
    addBreadcrumb({
      category: 'navigation',
      type: 'navigation',
      message: window.location.pathname,
    })
  })

  // HTTP breadcrumbs via fetch wrapping. Skips /api/errors itself so
  // reporting a fetch failure doesn't generate an infinite tail of
  // "/api/errors 200" crumbs.
  const origFetch = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const start = Date.now()
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    const method =
      init?.method?.toUpperCase() ||
      (typeof input === 'object' && 'method' in input
        ? input.method?.toUpperCase()
        : undefined) ||
      'GET'
    try {
      const response = await origFetch(input, init)
      if (!url.includes('/api/errors')) {
        addBreadcrumb({
          category: 'fetch',
          type: 'http',
          message: `${method} ${url}`,
          data: {
            status: response.status,
            duration_ms: Date.now() - start,
          },
        })
      }
      return response
    } catch (error) {
      if (!url.includes('/api/errors')) {
        addBreadcrumb({
          category: 'fetch',
          type: 'http',
          level: 'error',
          message: `${method} ${url}`,
          data: { error: String(error) },
        })
      }
      throw error
    }
  }
}

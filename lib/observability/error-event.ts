/**
 * Sentry-compatible event envelope. We don't ship to Sentry today - events
 * are forwarded to our self-hosted Loki - but matching the schema means
 * the future migration (if we ever take on the Sentry vendor dependency)
 * is just swapping the transport: drop in `@sentry/nextjs`, keep the
 * payload shape, retire `/api/errors`.
 *
 * Fields are a subset of the upstream Sentry SDK event interface:
 *   https://develop.sentry.dev/sdk/data-model/event-payloads/
 *
 * Anything we don't actually consume (contexts, tags, fingerprint,
 * sdk, extras) is intentionally left off the type so we don't drift
 * into our own dialect.
 */

export type ErrorLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export type StackFrame = {
  filename?: string
  function?: string
  module?: string
  lineno?: number
  colno?: number
  in_app?: boolean
}

export type Stacktrace = {
  frames: StackFrame[]
}

export type ExceptionValue = {
  type: string
  value: string
  stacktrace?: Stacktrace
}

export type Breadcrumb = {
  /** Unix seconds (Sentry convention). */
  timestamp: number
  type?: 'default' | 'http' | 'navigation' | 'ui' | 'info'
  category?: string
  message?: string
  level?: ErrorLevel
  data?: Record<string, unknown>
}

export type ErrorEventUser = {
  /** Stable account id (Payload user id). Never send PII like email/IP. */
  id?: string
}

export type ErrorEventRequest = {
  url?: string
  /** User-agent only. Headers like cookies/auth are intentionally excluded. */
  user_agent?: string
}

export type ErrorEvent = {
  /** Client-side timestamp in ms. We re-stamp server-side too. */
  timestamp: number
  /** Random client-side id so dupes from retries can be deduped later. */
  event_id?: string
  level?: ErrorLevel
  /** Release / commit SHA, populated from a build-time public env var. */
  release?: string
  /** 'production' | 'preview' | 'development' - set by NEXT_PUBLIC_ENV. */
  environment?: string

  user?: ErrorEventUser
  request?: ErrorEventRequest

  /** Free-form message - used by `captureMessage`-style calls. */
  message?: string

  /** Thrown exceptions. `values` is an array because Sentry models error
   *  chains (`cause`) as a list - for v1 we send exactly one. */
  exception?: {
    values: ExceptionValue[]
  }

  /** Recent user actions leading up to the error. Capped client-side. */
  breadcrumbs?: {
    values: Breadcrumb[]
  }
}

/** Hard cap on the JSON-encoded body the API route will accept. Roughly
 *  matches Sentry's default `maxValueLength * 100 frames` worst case. */
export const ERROR_EVENT_MAX_BYTES = 200_000

/** Per-process breadcrumb queue length on the client. */
export const BREADCRUMB_LIMIT = 30

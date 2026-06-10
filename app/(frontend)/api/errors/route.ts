import { NextResponse, type NextRequest } from 'next/server'
import {
  ERROR_EVENT_MAX_BYTES,
  type ErrorEvent,
} from '@/lib/observability/error-event'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/errors')

// Public endpoint - client code POSTs unhandled-error envelopes here and
// we log them server-side. No auth (we want errors from unauthenticated
// parts of the site too), but we cap body size aggressively and drop
// anything that doesn't shape up like an ErrorEvent so a malicious
// client can't pollute the log stream.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Cheap shape validation. We don't try to fully validate the Sentry
 * schema here - Loki accepts whatever JSON we hand it - but we reject
 * anything that's obviously not an ErrorEvent so the stream stays
 * readable. Defensive: a malicious POST shouldn't be able to spam
 * arbitrary log lines.
 */
function looksLikeErrorEvent(value: unknown): value is ErrorEvent {
  if (!isPlainObject(value)) return false
  if (typeof value.timestamp !== 'number') return false
  // Must have at least an exception or a message.
  const hasException =
    isPlainObject(value.exception) &&
    Array.isArray((value.exception as Record<string, unknown>).values)
  const hasMessage = typeof value.message === 'string'
  return hasException || hasMessage
}

export async function POST(req: NextRequest) {
  // Read with a hard cap. Streaming would be cleaner but Vercel's
  // 4.5MB body limit already covers most abuse; we add our own cap
  // to keep individual events from blowing up the log payload.
  const raw = await req.text()
  if (raw.length > ERROR_EVENT_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, reason: 'too_large' },
      { status: 413 },
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'invalid_json' },
      { status: 400 },
    )
  }
  if (!looksLikeErrorEvent(parsed)) {
    return NextResponse.json(
      { ok: false, reason: 'shape_mismatch' },
      { status: 400 },
    )
  }

  const event = parsed as ErrorEvent
  const firstException = event.exception?.values?.[0]
  logger.error('client error reported', {
    message: event.message ?? firstException?.value ?? 'unknown',
    type: firstException?.type,
    timestamp: event.timestamp,
  })

  return new NextResponse(null, { status: 204 })
}

// Accept a CORS preflight so the browser doesn't block the POST when
// other origins (e.g. a desktop app webview) need to report errors.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

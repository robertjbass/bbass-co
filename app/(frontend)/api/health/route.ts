import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { createLogger } from '@/lib/logger'

const logger = createLogger('health')

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Liveness probe for the web app's database (Neon). Does the cheapest possible
 * round-trip to Payload/Postgres and returns 503 when it can't reach it.
 *
 * The uptime cron (`.github/workflows/cron-web-db-health.yml`) polls this so a
 * Neon outage or billing freeze pages instead of going silent the way the
 * 2026-05-31 freeze did. Public + unauthenticated on purpose: the probe needs
 * no secret and the response leaks nothing beyond up/down. Marketing/blog pages
 * stay up during a freeze (they don't hit Payload), so this is the signal that
 * tells the difference between "site fine" and "DB layer down".
 */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    // Smallest possible query that forces a real Postgres round-trip.
    await payload.count({ collection: 'user' })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    logger.error('health probe failed: database unreachable', { error })
    return NextResponse.json(
      { ok: false, error: 'database_unreachable' },
      { status: 503 },
    )
  }
}

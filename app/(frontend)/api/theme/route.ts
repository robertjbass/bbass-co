import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { getAuthenticatedUserId } from '@/lib/auth/get-authenticated-user'
import { ThemePreference } from '@/collections/User/constants'
import { getApexDomain } from '@/lib/get-apex-url'
import { createLogger } from '@/lib/logger'

const logger = createLogger('theme-route')

const VALID_THEMES = new Set(Object.values(ThemePreference))

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { theme } = body as { theme?: string }
  if (!theme || !VALID_THEMES.has(theme as ThemePreference)) {
    return NextResponse.json(
      {
        error: `Invalid theme. Must be one of: ${[...VALID_THEMES].join(', ')}`,
      },
      { status: 400 },
    )
  }

  const headerList = await headers()
  const host = headerList.get('host') ?? ''
  const apexDomain = getApexDomain(host)

  const cookieStore = await cookies()

  // Authenticated users: persist to DB first, before mutating cookies
  let userId: string | null = null
  try {
    userId = await getAuthenticatedUserId()
  } catch {
    // Auth check failed  - treat as anonymous
  }
  if (userId) {
    try {
      const payload = await getPayloadClient()
      await payload.update({
        collection: 'user',
        id: Number(userId),
        data: { themePreference: theme as ThemePreference },
        depth: 0,
        select: {},
      })
    } catch (error) {
      logger.error('[Theme] Failed to persist theme to DB:', error)
      return NextResponse.json(
        { error: 'Failed to save theme preference' },
        { status: 500 },
      )
    }

    if (theme === ThemePreference.System) {
      cookieStore.delete('payload-theme')
    } else {
      cookieStore.set('payload-theme', theme, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
  }

  // Cross-subdomain cookie for all users (authenticated and anonymous)
  if (theme === ThemePreference.System) {
    cookieStore.delete('theme-preference')
  } else {
    cookieStore.set('theme-preference', theme, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      ...(apexDomain ? { domain: apexDomain } : {}),
    })
  }

  return NextResponse.json({ success: true })
}

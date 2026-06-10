import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { auth } from '@/lib/auth'
import type { User } from '@/payload-types'

/**
 * Returns the full user object. Checks both Auth.js and Payload sessions.
 * Payload email/password logins only set a Payload session cookie, not an Auth.js one,
 * so checking Auth.js alone would lock out users who signed in via /admin.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const payload = await getPayloadClient()

  let candidate: User | null = null

  try {
    const session = await auth()
    if (session?.user?.id) {
      candidate = await payload.findByID({
        collection: 'user',
        id: Number(session.user.id),
        overrideAccess: true,
      })
    }
  } catch {
    // Auth.js session check failed - fall through to Payload auth
  }

  if (!candidate) {
    try {
      const headerList = await headers()
      const { user } = await payload.auth({ headers: headerList })
      if (user) candidate = user as User
    } catch {
      // Payload auth failed (e.g., DB unreachable)
    }
  }

  // Treat soft-deleted users (Payload trash) as "not authenticated" so
  // they can't use the app until re-enabled. The signIn callback clears
  // deletedAt on OAuth re-login.
  // payload-types.ts will include `deletedAt` once `pnpm prep` runs.
  const deletedAt = (
    candidate as unknown as { deletedAt?: string | null } | null
  )?.deletedAt
  if (candidate && deletedAt) return null

  return candidate
}

/**
 * Returns just the user ID string. Avoids an extra DB round-trip when
 * only the ID is needed (reads it from the JWT).
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await auth()
    if (session?.user?.id) return session.user.id
  } catch {
    // Auth.js session check failed - fall through to Payload auth
  }

  try {
    const payload = await getPayloadClient()
    const headerList = await headers()
    const { user } = await payload.auth({ headers: headerList })
    if (user?.id) return String(user.id)
  } catch {
    // Payload auth failed (e.g., DB unreachable)
  }

  return null
}

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { auth } from '@/lib/auth'
import { UserRole } from '@/collections/User/constants'

type AdminCheckResult =
  | { error: null; status: 200 }
  | { error: string; status: 401 | 403 }

/**
 * Lightweight admin check for API routes. Returns { error, status }
 * instead of redirecting (unlike lib/auth/require-admin.ts which is
 * for server component pages).
 */
export async function requireAdminApi(): Promise<AdminCheckResult> {
  const payload = await getPayloadClient()

  let userId: string | null = null
  const session = await auth()
  if (session?.user?.id) {
    userId = session.user.id
  } else {
    const headerList = await headers()
    const { user } = await payload.auth({ headers: headerList })
    if (user?.id) userId = String(user.id)
  }

  if (!userId) return { error: 'Not authenticated', status: 401 }

  let foundUser: { role?: string } | null
  try {
    foundUser = await payload.findByID({
      collection: 'user',
      id: userId,
      select: { role: true },
    })
  } catch {
    return { error: 'Not authenticated', status: 401 }
  }

  if (!foundUser || foundUser.role !== UserRole.Admin) {
    return { error: 'Admin access required', status: 403 }
  }

  return { error: null, status: 200 }
}

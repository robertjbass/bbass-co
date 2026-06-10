import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { auth } from '@/lib/auth'
import { UserRole } from '@/collections/User/constants'
import type { User } from '@/payload-types'
import { createLogger } from '@/lib/logger'

const logger = createLogger('require-admin')

type AdminUser = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'avatar' | 'githubImageUrl' | 'lastAuthMethod'
>

/**
 * Server-side auth guard for admin-only pages.
 * Checks both Auth.js and Payload sessions (covers OAuth + email/password logins).
 * Redirects to /admin/login if not authenticated or not an admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
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

  if (!userId) {
    redirect('/admin/login?callbackUrl=/admin')
  }

  let user: AdminUser
  try {
    user = await payload.findByID({
      collection: 'user',
      id: userId,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        githubImageUrl: true,
        lastAuthMethod: true,
      },
    })
  } catch (error) {
    logger.error('[RequireAdmin] Failed to fetch user:', error)
    redirect('/admin/login?callbackUrl=/admin')
  }

  if (user.role !== UserRole.Admin) {
    redirect('/')
  }

  return user
}

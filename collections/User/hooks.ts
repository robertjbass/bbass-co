import { UserRole } from '@/collections/User/constants'
import { createLogger } from '@/lib/logger'
import type {
  Access,
  CollectionAfterLoginHook,
  CollectionAfterLogoutHook,
  FieldAccess,
} from 'payload'
import type { User } from '@/payload-types'

const logger = createLogger('user-hooks')

export const anyone = () => true

export const admins = ({
  req: { user },
}: {
  req: { user?: { role?: string } | null }
}) => {
  return user?.role === UserRole.Admin
}

export const selfOrAdmins: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === UserRole.Admin) return true
  return { id: { equals: user.id } }
}

export const selfOrAdminsField: FieldAccess = ({ req: { user }, id }) => {
  if (!user) return false
  if (user.role === UserRole.Admin) return true
  return String(user.id) === String(id)
}

export const adminsOnly: FieldAccess = ({ req: { user } }) => {
  return user?.role === UserRole.Admin
}

export const updateLastLoginAt: CollectionAfterLoginHook<User> = async ({
  user,
  req,
}) => {
  // Fires on Payload's email/password login (admin panel). Auth.js OAuth
  // sign-ins are handled in lib/auth/config.ts's signIn callback.
  try {
    await req.payload.update({
      collection: 'user',
      id: user.id,
      data: {
        lastLoginAt: new Date().toISOString(),
      } as unknown as Record<string, unknown>,
      overrideAccess: true,
      context: { skipTrashHook: true },
    })
  } catch (error) {
    logger.warn('[user.afterLogin] failed to update lastLoginAt', error)
  }
}

export const clearAuthjsCookies: CollectionAfterLogoutHook = async () => {
  try {
    const { cookies } = await import('next/headers')
    const { deleteAuthCookies } = await import('@/lib/auth/cookie-helpers')
    const cookieStore = await cookies()
    deleteAuthCookies(cookieStore)
  } catch {
    // cookies() unavailable outside Next.js request context
  }
}

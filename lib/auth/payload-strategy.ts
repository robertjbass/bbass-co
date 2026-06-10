import { type AuthStrategy } from 'payload'
import { getToken } from '@auth/core/jwt'
import { createLogger } from '@/lib/logger'

const logger = createLogger('payload-strategy')

// The cookie name MUST match what lib/auth/config.ts writes. If these
// get out of sync, Payload-protected routes can't see the NextAuth
// session even though the user is fully signed in - which makes /admin
// and any payload.auth({headers}) call return null and loops the user
// back to login.
const isSecure = process.env.AUTH_URL?.startsWith('https') ?? false
const SECURE_PREFIX = isSecure ? '__Secure-' : ''
const COOKIE_NAME = `${SECURE_PREFIX}authjs.session-token`

export function AuthjsStrategy(): AuthStrategy {
  return {
    name: 'authjs',
    authenticate: async ({ headers, payload }) => {
      try {
        const authSecret = process.env.AUTH_SECRET
        if (!authSecret) {
          logger.error(
            '[AuthjsStrategy] Missing AUTH_SECRET environment variable',
          )
          return { user: null }
        }

        const token = await getToken({
          req: { headers },
          secret: authSecret,
          salt: COOKIE_NAME,
          cookieName: COOKIE_NAME,
          secureCookie: isSecure,
        })

        if (!token?.userId) {
          return { user: null }
        }

        const rawId = token.userId
        const userId =
          typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId)
        if (isNaN(userId)) {
          logger.error('[AuthjsStrategy] Invalid user ID:', rawId)
          return { user: null }
        }

        const user = await payload.findByID({
          collection: 'user',
          id: userId,
          depth: 0,
        })

        if (!user) {
          logger.error('[AuthjsStrategy] User not found for ID:', userId)
          return { user: null }
        }

        return {
          user: {
            ...user,
            _strategy: 'authjs',
            collection: 'user' as const,
          },
        }
      } catch (error) {
        logger.error('[AuthjsStrategy] Error:', error)
        return { user: null }
      }
    },
  }
}

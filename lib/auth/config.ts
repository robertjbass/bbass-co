import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { getPayloadClient } from '@/lib/payload'
import { createLogger } from '@/lib/logger'
import { AuthProvider } from '@/collections/User/constants'
import {
  getProviderIdField,
  getImageFieldForProvider,
  getProviderImageUrl,
} from '@/lib/auth/provider-helpers'
import { isSameEnvironment } from '@/lib/apex-domains'
import { isSuperAdminEmail } from '@/lib/auth/super-admins'
import { UserRole } from '@/collections/User/constants'
import { emailHash } from '@/lib/log-pii'

const logger = createLogger('auth')

const isSecure = process.env.AUTH_URL?.startsWith('https') ?? false
const isLocalhost = process.env.AUTH_URL?.includes('localhost') ?? false

const SECURE_PREFIX = isSecure ? '__Secure-' : ''

function cookieName(suffix: string): string {
  return `${SECURE_PREFIX}authjs.${suffix}`
}

// Localhost shares cookies across *.localhost; production is host-only on
// the bbass.co apex.
const cookieDomain = isLocalhost ? '.localhost' : undefined

function commonCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: isSecure,
    ...(cookieDomain && { domain: cookieDomain }),
  }
}

function isSameApex(urlA: string, urlB: string): boolean {
  try {
    const hostA = new URL(urlA).hostname
    const hostB = new URL(urlB).hostname
    return isSameEnvironment(hostA, hostB)
  } catch {
    return false
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: cookieName('session-token'),
      options: commonCookieOptions(),
    },
    callbackUrl: {
      name: cookieName('callback-url'),
      options: { ...commonCookieOptions(), httpOnly: false },
    },
    csrfToken: {
      name: cookieName('csrf-token'),
      options: commonCookieOptions(),
    },
    pkceCodeVerifier: {
      name: cookieName('pkce.code_verifier'),
      options: { ...commonCookieOptions(), maxAge: 60 * 15 },
    },
    state: {
      name: cookieName('state'),
      options: { ...commonCookieOptions(), maxAge: 60 * 15 },
    },
    nonce: {
      name: cookieName('nonce'),
      options: commonCookieOptions(),
    },
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      try {
        if (account && user?.id) {
          token.userId = user.id
          token.provider = account.provider
        }
        if (profile) {
          const provider = (token.provider as string) ?? ''
          const profileRecord = profile as Record<string, unknown>
          token.name =
            (profile.name as string | undefined) ||
            (profileRecord.login as string | undefined) ||
            token.name
          token.picture =
            getProviderImageUrl(provider, profileRecord) ?? token.picture

          // Persist provider image URL on initial sign-in (covers new
          // users where signIn runs before the row settles).
          if (account && user?.id) {
            const imageField = getImageFieldForProvider(provider)
            const imageUrl = getProviderImageUrl(provider, profileRecord)
            if (imageField && imageUrl) {
              const numericId = parseInt(user.id, 10)
              if (Number.isInteger(numericId)) {
                const payload = await getPayloadClient()
                try {
                  await payload.update({
                    collection: 'user',
                    id: numericId,
                    data: { [imageField]: imageUrl },
                  })
                } catch (error: unknown) {
                  logger.error(
                    '[Auth] jwt: failed to persist image URL:',
                    error,
                  )
                }
              }
            }
          }
        }
        return token
      } catch (error) {
        logger.error('[Auth] jwt callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!account) return true

      if (!user.id || !user.email) {
        logger.error('[Auth] signIn: rejecting, account present but missing', {
          userId: !user.id,
          // eslint-disable-next-line no-restricted-syntax -- presence boolean, not the value
          email: !user.email,
        })
        return false
      }

      // Account-takeover guard. With allowDangerousEmailAccountLinking on,
      // confirm GitHub has the OAuth email marked verified. Reject only on
      // an explicit `verified: false`; treat transient API failures as
      // failure-open (the OAuth handshake already attests account control).
      if (account.provider === AuthProvider.GitHub) {
        const accessToken = account.access_token
        if (!accessToken) {
          logger.warn(
            '[Auth] signIn: GitHub account missing access_token; cannot verify email. Proceeding (failure-open).',
          )
        } else {
          try {
            const res = await fetch('https://api.github.com/user/emails', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'bbass-co-auth',
              },
              signal: AbortSignal.timeout(10_000),
            })
            if (!res.ok) {
              logger.warn(
                `[Auth] signIn: GitHub /user/emails returned ${res.status}. Proceeding (failure-open).`,
              )
            } else {
              const emails = (await res.json()) as Array<{
                email: string
                verified: boolean
                primary: boolean
              }>
              const target = user.email.toLowerCase()
              const matching = emails.find(
                (entry) => entry.email.toLowerCase() === target,
              )
              if (matching && matching.verified === false) {
                logger.warn(
                  '[Auth] signIn: rejecting GitHub account - email explicitly unverified',
                )
                return false
              }
            }
          } catch (error) {
            logger.warn(
              '[Auth] signIn: GitHub email verification failed (likely transient). Proceeding (failure-open).',
              error,
            )
          }
        }
      }

      const idField = getProviderIdField(account.provider)
      const imageField = getImageFieldForProvider(account.provider)

      if (!idField || !imageField) {
        logger.info(
          `[Auth] signIn: skipping, unsupported provider ${account.provider}`,
        )
        return true
      }

      try {
        const payload = await getPayloadClient()
        const normalizedEmail = user.email.toLowerCase()
        const profileRecord = (profile ?? {}) as Record<string, unknown>
        const imageUrl = getProviderImageUrl(account.provider, profileRecord)
        const profileName =
          (profileRecord.name as string) ||
          (profileRecord.login as string) ||
          undefined
        const githubLogin =
          typeof profileRecord.login === 'string' &&
          profileRecord.login.length > 0
            ? (profileRecord.login as string)
            : null

        // Email is the canonical identity. Prefer active rows over trashed
        // ones; fall back to a trash-inclusive query so a soft-deleted user
        // can be reinstated on re-auth.
        const { docs: activeMatches } = await payload.find({
          collection: 'user',
          where: { email: { equals: normalizedEmail } },
          limit: 1,
        })
        const { docs } =
          activeMatches.length > 0
            ? { docs: activeMatches }
            : await payload.find({
                collection: 'user',
                where: { email: { equals: normalizedEmail } },
                limit: 1,
                trash: true,
              })

        const incomingHash = emailHash(normalizedEmail)

        if (docs.length > 0) {
          const existingUser = docs[0]
          const updateData: Record<string, unknown> = {
            [idField]: account.providerAccountId,
            lastAuthMethod: account.provider as AuthProvider,
            lastLoginAt: new Date().toISOString(),
            name: profileName || existingUser.name,
            [imageField]: imageUrl || existingUser[imageField],
            ...(githubLogin && { githubLogin }),
          }
          if (!existingUser.authProvider) {
            updateData.authProvider = account.provider as AuthProvider
          }
          if (
            isSuperAdminEmail(normalizedEmail) &&
            existingUser.role !== UserRole.Admin
          ) {
            updateData.role = UserRole.Admin
          }
          if (
            (existingUser as unknown as { deletedAt?: string | null }).deletedAt
          ) {
            updateData.deletedAt = null
            logger.info(
              `[Auth] signIn: reinstating soft-deleted user ${existingUser.id} on re-authentication`,
            )
          }
          await payload.update({
            collection: 'user',
            id: existingUser.id,
            data: updateData,
            trash: true,
            overrideAccess: true,
          })
          user.id = String(existingUser.id)
          return true
        }

        // Email lookup missed. Check whether the OAuth credential is
        // already linked to an existing user under a different email.
        const { docs: byProviderId } = await payload.find({
          collection: 'user',
          where: { [idField]: { equals: account.providerAccountId } },
          limit: 1,
          trash: true,
          overrideAccess: true,
        })
        if (byProviderId.length > 0) {
          const existing = byProviderId[0]
          const baseUpdate: Record<string, unknown> = {
            lastAuthMethod: account.provider as AuthProvider,
            lastLoginAt: new Date().toISOString(),
            name: profileName || existing.name,
            [imageField]: imageUrl || existing[imageField],
            ...(githubLogin && { githubLogin }),
          }
          if (!existing.authProvider) {
            baseUpdate.authProvider = account.provider as AuthProvider
          }
          if ((existing as unknown as { deletedAt?: string | null }).deletedAt) {
            baseUpdate.deletedAt = null
          }
          if (
            isSuperAdminEmail(normalizedEmail) &&
            existing.role !== UserRole.Admin
          ) {
            baseUpdate.role = UserRole.Admin
          }
          await payload.update({
            collection: 'user',
            id: existing.id,
            data: baseUpdate,
            trash: true,
            overrideAccess: true,
          })
          user.id = String(existing.id)
          return true
        }

        // User was just created by the adapter but the lookup missed due to
        // timing. Re-find and stamp the provider id + first-login metadata.
        try {
          const { docs: retry } = await payload.find({
            collection: 'user',
            where: { email: { equals: normalizedEmail } },
            limit: 1,
            trash: true,
          })
          if (retry.length > 0) {
            await payload.update({
              collection: 'user',
              id: retry[0].id,
              data: {
                [idField]: account.providerAccountId,
                lastAuthMethod: account.provider as AuthProvider,
                lastLoginAt: new Date().toISOString(),
                ...(profileName && { name: profileName }),
                ...(imageUrl && { [imageField]: imageUrl }),
                ...(githubLogin && { githubLogin }),
                authProvider: account.provider as AuthProvider,
                ...(isSuperAdminEmail(normalizedEmail) && {
                  role: UserRole.Admin,
                }),
              },
              trash: true,
              overrideAccess: true,
            })
            user.id = String(retry[0].id)
          }
        } catch (error) {
          logger.warn(
            '[Auth] signIn: post-create user update failed (non-fatal):',
            error,
          )
        }
        void incomingHash
        return true
      } catch (error) {
        logger.error('[Auth] signIn callback error, failing sign-in:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // Don't rewrite error redirects from the signIn callback
      if (url.includes('error=')) {
        if (url.startsWith('/')) return `${baseUrl}${url}`
        if (isSameApex(url, baseUrl)) return url
        return baseUrl
      }

      // OAuth completing against a login page (no explicit callbackUrl)
      // lands on the home page.
      const loginPaths = ['/admin/login', '/auth/login']
      for (const loginPath of loginPaths) {
        if (
          url === `${baseUrl}${loginPath}` ||
          url === loginPath ||
          url.startsWith(`${baseUrl}${loginPath}?`) ||
          url.startsWith(`${loginPath}?`)
        ) {
          return baseUrl
        }
      }

      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (isSameApex(url, baseUrl)) return url
      return baseUrl
    },
  },
}

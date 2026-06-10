import type { Adapter, AdapterUser, AdapterAccount } from '@auth/core/adapters'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { randomBytes, createHmac } from 'crypto'
import { UserRole } from '@/collections/User/constants'
import { getProviderIdField } from '@/lib/auth/provider-helpers'
import { resolveUserImage } from '@/lib/resolve-user-image'
import { createLogger } from '@/lib/logger'

const logger = createLogger('payload-adapter')

type AdapterUserFields = Pick<User, 'id' | 'email'> &
  Partial<
    Pick<User, 'name' | 'avatar' | 'githubImageUrl' | 'lastAuthMethod'>
  >

function toAdapterUser(user: AdapterUserFields): AdapterUser {
  return {
    id: String(user.id),
    email: user.email,
    emailVerified: null,
    name: user.name ?? null,
    image: resolveUserImage(user),
  }
}

function generateRandomPassword(): string {
  return randomBytes(32).toString('base64')
}

const AUTH_SECRET = process.env.AUTH_SECRET
if (!AUTH_SECRET) {
  throw new Error(
    'AUTH_SECRET environment variable is required for token hashing',
  )
}

function hashToken(token: string): string {
  return createHmac('sha256', AUTH_SECRET!).update(token).digest('hex')
}

export function PayloadAdapter(payload: Payload): Adapter {
  return {
    async createUser(data) {
      const created = await payload.create({
        collection: 'user',
        draft: false,
        data: {
          email: data.email.toLowerCase(),
          name: data.name ?? undefined,
          password: generateRandomPassword(),
          role: UserRole.User,
        },
      })
      return toAdapterUser(created)
    },

    async getUser(id) {
      const numericId = parseInt(id, 10)
      if (!Number.isInteger(numericId)) return null

      try {
        const user = await payload.findByID({
          collection: 'user',
          id: numericId,
          depth: 0,
          select: {
            email: true,
            name: true,
            avatar: true,
            githubImageUrl: true,
            lastAuthMethod: true,
          },
        })

        if (!user) return null
        return toAdapterUser(user)
      } catch (error) {
        logger.error('[PayloadAdapter] Error getting user by ID:', error)
        return null
      }
    },

    async getUserByEmail(email) {
      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { email: { equals: email.toLowerCase() } },
          limit: 1,
          depth: 0,
          select: {
            email: true,
            name: true,
            avatar: true,
            githubImageUrl: true,
            lastAuthMethod: true,
          },
        })

        if (docs.length === 0) return null
        return toAdapterUser(docs[0])
      } catch (error) {
        logger.error('[PayloadAdapter] Error getting user by email:', error)
        return null
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const idField = getProviderIdField(provider)
      if (!idField) return null

      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { [idField]: { equals: providerAccountId } },
          limit: 1,
          depth: 0,
          select: {
            email: true,
            name: true,
            avatar: true,
            githubImageUrl: true,
            lastAuthMethod: true,
          },
        })

        if (docs.length > 0) {
          return toAdapterUser(docs[0])
        }

        return null
      } catch (error) {
        logger.error('[PayloadAdapter] Error getting user by account:', error)
        return null
      }
    },

    async updateUser(data) {
      const numericId = parseInt(data.id, 10)
      if (!Number.isInteger(numericId)) {
        throw new Error(`[PayloadAdapter] updateUser: invalid ID "${data.id}"`)
      }

      try {
        const user = await payload.update({
          collection: 'user',
          id: numericId,
          data: {
            ...('name' in data && { name: data.name }),
          },
        })

        return toAdapterUser(user)
      } catch (error) {
        logger.error('[PayloadAdapter] Error updating user:', error)
        throw error
      }
    },

    async linkAccount(account: AdapterAccount) {
      const idField = getProviderIdField(account.provider)
      if (!idField) {
        logger.warn(
          `[PayloadAdapter] linkAccount: no idField for provider "${account.provider}", skipping`,
        )
        return
      }

      const numericId = parseInt(account.userId, 10)
      if (!Number.isInteger(numericId)) {
        logger.warn(
          `[PayloadAdapter] linkAccount: invalid userId "${account.userId}", skipping`,
        )
        return
      }

      // Before mutating user.{idField}, check whether the OAuth credential
      // is already linked to a DIFFERENT user record. The user table has
      // UNIQUE indexes on google_id and github_id, so an update that
      // collides will throw - we want to surface that as a clear error
      // instead of silently swallowing it (the original behavior was a
      // catch that logged and returned undefined, which made NextAuth
      // believe the link succeeded and downstream sign-in flows looked
      // like they had a credential they didn't).
      try {
        const { docs: conflicting } = await payload.find({
          collection: 'user',
          where: { [idField]: { equals: account.providerAccountId } },
          limit: 1,
          overrideAccess: true,
          trash: true,
        })
        const conflict = conflicting[0]
        if (conflict && Number(conflict.id) !== numericId) {
          // Pre-existing OAuth identity owned by another user - refuse
          // to move it silently. NextAuth's caller surfaces this as an
          // AuthError which our /admin/login banner will render.
          const msg = `OAuth ${account.provider} account ${account.providerAccountId} is already linked to user ${conflict.id}; refusing to relink to user ${numericId}`
          logger.error(`[PayloadAdapter] linkAccount: ${msg}`)
          throw new Error(msg)
        }

        const currentUser = await payload.findByID({
          collection: 'user',
          id: numericId,
        })

        const data: Record<string, unknown> = {
          [idField]: account.providerAccountId,
          lastAuthMethod: account.provider,
        }

        // Preserve original signup provider
        if (!currentUser.authProvider) {
          data.authProvider = account.provider
        }

        await payload.update({
          collection: 'user',
          id: numericId,
          data,
        })
        logger.info(
          `[PayloadAdapter] linkAccount: linked ${account.provider} ${account.providerAccountId} to user ${numericId}`,
        )
      } catch (error) {
        // Rethrow so NextAuth surfaces the failure to the user instead
        // of silently believing the link succeeded. We previously
        // swallowed every error which masked unique-index violations.
        logger.error('[PayloadAdapter] linkAccount failed:', error)
        throw error
      }
    },

    async createSession() {
      throw new Error('createSession not implemented - using JWT strategy')
    },

    async getSessionAndUser() {
      throw new Error('getSessionAndUser not implemented - using JWT strategy')
    },

    async updateSession() {
      throw new Error('updateSession not implemented - using JWT strategy')
    },

    async deleteSession() {
      // No-op for JWT strategy
    },

    async createVerificationToken() {
      // GitHub-only sign-in: no email magic-link flow. Token hashing is
      // retained (hashToken) for potential future use but unused here.
      void hashToken
      return null
    },

    async useVerificationToken() {
      // GitHub-only sign-in: no email magic-link flow.
      return null
    },

    async deleteUser(id) {
      const numericId = parseInt(id, 10)
      if (!Number.isInteger(numericId)) return

      try {
        await payload.delete({
          collection: 'user',
          id: numericId,
        })
      } catch (error) {
        logger.error('[PayloadAdapter] Error deleting user:', error)
      }
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const idField = getProviderIdField(provider)
      if (!idField) return

      try {
        const { docs } = await payload.find({
          collection: 'user',
          where: { [idField]: { equals: providerAccountId } },
          limit: 1,
        })

        if (docs.length > 0) {
          await payload.update({
            collection: 'user',
            id: docs[0].id,
            data: {
              [idField]: null,
            },
          })
        }
      } catch (error) {
        logger.error('[PayloadAdapter] Error unlinking account:', error)
      }
    },
  }
}

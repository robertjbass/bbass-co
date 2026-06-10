import NextAuth from 'next-auth'
import type { Session } from 'next-auth'
import { getPayloadClient } from '@/lib/payload'
import { authConfig } from '@/lib/auth/config'
import { PayloadAdapter } from '@/lib/auth/payload-adapter'

type NextAuthReturn = ReturnType<typeof NextAuth>

let cached: NextAuthReturn | null = null
let initPromise: Promise<NextAuthReturn> | null = null

async function getNextAuth(): Promise<NextAuthReturn> {
  if (cached) return cached
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const payload = await getPayloadClient()
      cached = NextAuth({
        ...authConfig,
        adapter: PayloadAdapter(payload),
      })
      return cached
    } catch (error) {
      initPromise = null
      throw error
    }
  })()

  return initPromise
}

export async function auth(): Promise<Session | null> {
  const { auth: authFn } = await getNextAuth()
  return authFn() as Promise<Session | null>
}

export async function signIn(
  provider: string,
  options?: Record<string, unknown>,
) {
  const { signIn: signInFn } = await getNextAuth()
  return signInFn(provider, options)
}

export async function signOut(options?: Record<string, unknown>) {
  const { signOut: signOutFn } = await getNextAuth()
  return signOutFn(options)
}

export async function getHandlers(): Promise<NextAuthReturn['handlers']> {
  const { handlers } = await getNextAuth()
  return handlers
}

'use server'

import { signIn, signOut, auth } from '@/lib/auth'
import { sanitizeCallbackUrl } from '@/lib/apex-domains'

const ALLOWED_PROVIDERS = ['github'] as const

// Clicking "Continue with X" with an active session in place was the
// trigger for the OAuthAccountNotLinked errors we hit on /admin/login:
// NextAuth's default behavior is to LINK a new OAuth credential to the
// current session's user, and if the OAuth result resolves to a
// different user record (or trips a UNIQUE constraint on google_id /
// github_id because the new credential is already linked elsewhere),
// the whole flow aborts with that generic error.
//
// We don't want link semantics on a fresh sign-in click - we want
// switch semantics. So clear the current session cookie before
// initiating OAuth. The user who comes back is whoever the OAuth
// result resolves to, full stop.
export async function signInWithProvider(
  provider: string,
  callbackUrl: string,
) {
  if (
    !ALLOWED_PROVIDERS.includes(provider as (typeof ALLOWED_PROVIDERS)[number])
  ) {
    throw new Error(`Invalid auth provider: ${provider}`)
  }

  // Fall back to the home page when the supplied callbackUrl is empty or
  // fails sanitization.
  const safeCallback = sanitizeCallbackUrl(callbackUrl, '/')

  // We want switch (not link) semantics on a fresh sign-in click: clear
  // any current session before initiating OAuth so the user who comes
  // back is whoever the OAuth result resolves to. Prevents the
  // OAuthAccountNotLinked error when an active session belongs to a
  // different account.
  const existing = await auth().catch(() => null)
  if (existing?.user) {
    await signOut({ redirect: false }).catch(() => null)
  }

  await signIn(provider, { redirectTo: safeCallback })
}

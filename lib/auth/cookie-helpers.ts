import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import type { NextResponse } from 'next/server'

const isSecure = process.env.AUTH_URL?.startsWith('https') ?? false
const isLocalhost = process.env.AUTH_URL?.includes('localhost') ?? false

// Cookie names we attempt to clear on logout. Includes the historical
// unprefixed names alongside the __Secure-/__Host- variants. payload-token
// is included because the Payload admin login sets it independently of
// NextAuth (and host-only, which is why the host-only delete below matters).
const AUTH_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
  'authjs.csrf-token',
  '__Host-authjs.csrf-token',
  '__Secure-authjs.pkce.code_verifier',
  '__Secure-authjs.state',
  '__Secure-authjs.nonce',
  'payload-token',
] as const

type DeleteOptions = {
  name: string
  path: string
  domain?: string
  secure?: boolean
}

// Browsers only honor a Set-Cookie delete when the path/domain/secure
// attributes match the original cookie. This site is a single apex
// (bbass.co) with no auth-bearing subdomains, so cookies are set
// host-only (no Domain attribute). On localhost we additionally emit a
// `.localhost` variant. We write raw Set-Cookie strings via
// response.headers.append (NOT cookies.set) so multiple variants for the
// same name all reach the browser instead of being deduped by name.

function serializeDelete(opts: DeleteOptions): string {
  const parts = [
    `${opts.name}=`,
    'Path=' + opts.path,
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
  ]
  if (opts.domain) parts.push(`Domain=${opts.domain}`)
  if (opts.secure) parts.push('Secure')
  parts.push('SameSite=Lax')
  return parts.join('; ')
}

function variantsFor(name: string): DeleteOptions[] {
  const isSecureCookie =
    name.startsWith('__Secure-') || name.startsWith('__Host-')
  const variants: DeleteOptions[] = [
    { name, path: '/', secure: isSecureCookie && isSecure },
  ]
  if (isLocalhost && !name.startsWith('__Host-')) {
    variants.push({
      name,
      path: '/',
      domain: '.localhost',
      secure: isSecureCookie && isSecure,
    })
  }
  return variants
}

/**
 * Append delete Set-Cookie headers for every known auth cookie name to a
 * NextResponse. Use this from Route Handlers (e.g. /logout).
 */
export function appendAuthCookieDeletes(response: NextResponse): void {
  for (const name of AUTH_COOKIE_NAMES) {
    for (const variant of variantsFor(name)) {
      response.headers.append('Set-Cookie', serializeDelete(variant))
    }
  }
}

/**
 * Legacy entry point that mutates a Next cookie store. Retained for
 * callers using this signature (e.g. the Payload afterLogout hook).
 */
export function deleteAuthCookies(cookieStore: ReadonlyRequestCookies) {
  for (const name of AUTH_COOKIE_NAMES) {
    const isSecureCookie =
      name.startsWith('__Secure-') || name.startsWith('__Host-')
    cookieStore.delete({
      name,
      path: '/',
      ...(isSecureCookie && isSecure && { secure: true }),
    })
    if (isLocalhost && !name.startsWith('__Host-')) {
      cookieStore.delete({
        name,
        path: '/',
        domain: '.localhost',
        ...(isSecureCookie && isSecure && { secure: true }),
      })
    }
  }
}

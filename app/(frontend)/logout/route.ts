import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { appendAuthCookieDeletes } from '@/lib/auth/cookie-helpers'
import { getApexDomain } from '@/lib/apex-domains'

export async function POST(request: Request) {
  const headerList = await headers()
  const host = headerList.get('host') ?? ''
  const apex = getApexDomain(host)
  const hostname = host.split(':')[0]

  let response: NextResponse

  // If on a subdomain, redirect to the apex domain root
  if (apex && hostname !== apex && hostname !== `www.${apex}`) {
    const port = host.split(':')[1]
    const protocol = apex === 'localhost' ? 'http' : 'https'
    const portSuffix = port ? `:${port}` : ''
    response = NextResponse.redirect(`${protocol}://${apex}${portSuffix}/`, 303)
  } else {
    const url = new URL('/', request.url)
    // 303 See Other: redirect as GET regardless of original method
    response = NextResponse.redirect(url, 303)
  }

  // Append Set-Cookie deletes AFTER constructing the redirect response,
  // using header.append (NOT cookies.set / cookieStore.delete) so we can
  // emit multiple Set-Cookie headers for the same cookie NAME. The
  // framework cookie APIs dedupe by name; Payload admin sets
  // `payload-token` host-only, so we must emit a matching host-only
  // delete or the browser leaves it intact and the user stays logged in.
  appendAuthCookieDeletes(response)

  return response
}

// GET kept for the invite-only modal's "Return home" link, which cannot POST
export async function GET(request: Request) {
  return POST(request)
}

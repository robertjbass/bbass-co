import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  const referrer = request.headers.get('referer')
  let target = '/'
  if (referrer) {
    try {
      const parsed = new URL(referrer, request.nextUrl.origin)
      if (parsed.origin === request.nextUrl.origin) {
        target = parsed.pathname + parsed.search
      }
    } catch {
      // malformed referrer, fall back to '/'
    }
  }
  return NextResponse.redirect(new URL(target, request.nextUrl.origin))
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { sanitizeCallbackUrl } from '@/lib/apex-domains'
import { BbassMark } from '@/components/icons/bbass-mark'
import { LoginForm } from '@/app/(frontend)/auth/login/login-form'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: Props) {
  // Resolve the full user, not just the JWT userId. If the JWT decodes
  // to a user that no longer exists in the DB (stale cookie from a
  // different env, deleted user, schema migration), `getAuthenticatedUser`
  // returns null and we fall through to the login form. The earlier
  // `getAuthenticatedUserId`-only path would happily redirect a phantom
  // session straight back to /cloud, which then bounced back here off
  // the failed DB lookup - an infinite redirect loop that surfaced as
  // ERR_TOO_MANY_REDIRECTS in the browser. Stale cookies are overwritten
  // when the user signs in fresh; we don't try to delete them here
  // because `cookies().delete()` throws when called from a Server
  // Component in Next 15.
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>> = null
  try {
    user = await getAuthenticatedUser()
  } catch {
    // Auth check failed (e.g., DB unreachable)  - fall through to login form
  }

  if (user) {
    const params = await searchParams
    const raw = Array.isArray(params.callbackUrl)
      ? params.callbackUrl[0]
      : params.callbackUrl
    redirect(sanitizeCallbackUrl(raw ?? '/'))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-display text-lg font-semibold tracking-tight transition-opacity hover:opacity-80"
      >
        <BbassMark className="size-7 shrink-0" />
        Bob Bass
      </Link>
      <LoginForm />
    </div>
  )
}

import { cookies, headers } from 'next/headers'
import { ThemePreference } from '@/collections/User/constants'

const VALID_THEMES = new Set(Object.values(ThemePreference))

export async function getThemePreference(
  fallback: ThemePreference = ThemePreference.Dark,
): Promise<ThemePreference> {
  const cookieStore = await cookies()
  const cookieTheme = cookieStore.get('theme-preference')?.value as
    | ThemePreference
    | undefined
  const anonymousTheme =
    cookieTheme && VALID_THEMES.has(cookieTheme) ? cookieTheme : fallback

  // A first-time visitor can render without booting Payload or opening Postgres.
  if (
    !cookieStore.getAll().some(({ name }) => name !== 'theme-preference') &&
    !(await headers()).has('authorization')
  )
    return anonymousTheme

  let userId: string | null
  try {
    const { getAuthenticatedUserId } =
      await import('@/lib/auth/get-authenticated-user')
    userId = await getAuthenticatedUserId()
  } catch {
    return anonymousTheme
  }
  if (!userId) return anonymousTheme

  try {
    const { getPayloadClient } = await import('@/lib/payload')
    const payload = await getPayloadClient()
    const user = await payload.findByID({
      collection: 'user',
      id: Number(userId),
      select: { themePreference: true },
      depth: 0,
    })
    return (user.themePreference as ThemePreference) ?? fallback
  } catch {
    return fallback
  }
}

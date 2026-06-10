import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { getAuthenticatedUserId } from '@/lib/auth/get-authenticated-user'
import { ThemePreference } from '@/collections/User/constants'

const VALID_THEMES = new Set(Object.values(ThemePreference))

export async function getThemePreference(
  fallback: ThemePreference = ThemePreference.Dark,
): Promise<ThemePreference> {
  let userId: string | null = null
  try {
    userId = await getAuthenticatedUserId()
  } catch {
    // Auth check failed (e.g., DB unreachable)  - fall through to cookie/fallback
  }

  if (!userId) {
    const cookieStore = await cookies()
    const cookieTheme = cookieStore.get('theme-preference')?.value
    if (cookieTheme && VALID_THEMES.has(cookieTheme as ThemePreference)) {
      return cookieTheme as ThemePreference
    }
    return fallback
  }

  try {
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

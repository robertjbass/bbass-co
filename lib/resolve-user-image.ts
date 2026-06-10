import type { Media, User } from '@/payload-types'

type UserWithImage = Partial<
  Pick<User, 'avatar' | 'githubImageUrl' | 'lastAuthMethod'>
>

function getMediaUrl(avatar: UserWithImage['avatar']): string | null {
  if (typeof avatar === 'object' && avatar !== null) {
    return (avatar as Media).url ?? null
  }
  return null
}

export function resolveUserImage(user: UserWithImage): string | null {
  // 1. User-uploaded avatar (only if populated as object, not a bare ID)
  const avatarUrl = getMediaUrl(user.avatar)
  if (avatarUrl) return avatarUrl

  // 2. GitHub OAuth image
  if (user.githubImageUrl) return user.githubImageUrl

  return null
}

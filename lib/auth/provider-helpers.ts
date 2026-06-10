import { AuthProvider } from '@/collections/User/constants'

export enum ProviderIdField {
  GitHub = 'githubId',
}

export enum ProviderImageField {
  GitHub = 'githubImageUrl',
}

// Exhaustive maps: adding an AuthProvider without updating these causes a type error
const providerIdMap: Record<AuthProvider, ProviderIdField | null> = {
  [AuthProvider.GitHub]: ProviderIdField.GitHub,
  [AuthProvider.Email]: null,
}

const providerImageMap: Record<AuthProvider, ProviderImageField | null> = {
  [AuthProvider.GitHub]: ProviderImageField.GitHub,
  [AuthProvider.Email]: null,
}

export function getProviderIdField(provider: string): ProviderIdField | null {
  return providerIdMap[provider as AuthProvider] ?? null
}

export function getImageFieldForProvider(
  provider: string,
): ProviderImageField | null {
  return providerImageMap[provider as AuthProvider] ?? null
}

const providerProfileImageField: Record<AuthProvider, string | null> = {
  [AuthProvider.GitHub]: 'avatar_url',
  [AuthProvider.Email]: null,
}

export function getProviderImageUrl(
  provider: string,
  profile: Record<string, unknown>,
): string | null {
  const field = providerProfileImageField[provider as AuthProvider]
  return field ? ((profile[field] as string | undefined) ?? null) : null
}

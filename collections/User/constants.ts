import { type Option } from 'payload'

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

const userRoleLabels = {
  [UserRole.Admin]: 'Admin',
  [UserRole.User]: 'User',
} as const

export const userRoleOptions: Option[] = [
  {
    label: userRoleLabels[UserRole.Admin],
    value: UserRole.Admin,
  },
  {
    label: userRoleLabels[UserRole.User],
    value: UserRole.User,
  },
] as const satisfies Option[]

export enum ThemePreference {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

const themePreferenceLabels = {
  [ThemePreference.Light]: 'Light',
  [ThemePreference.Dark]: 'Dark',
  [ThemePreference.System]: 'System',
} as const

export const themePreferenceOptions: Option[] = [
  {
    label: themePreferenceLabels[ThemePreference.Light],
    value: ThemePreference.Light,
  },
  {
    label: themePreferenceLabels[ThemePreference.Dark],
    value: ThemePreference.Dark,
  },
  {
    label: themePreferenceLabels[ThemePreference.System],
    value: ThemePreference.System,
  },
] as const satisfies Option[]

export enum AuthProvider {
  GitHub = 'github',
  Email = 'email',
}

const authProviderLabels = {
  [AuthProvider.GitHub]: 'GitHub',
  [AuthProvider.Email]: 'Email',
} as const

export const authProviderOptions: Option[] = [
  {
    label: authProviderLabels[AuthProvider.GitHub],
    value: AuthProvider.GitHub,
  },
  {
    label: authProviderLabels[AuthProvider.Email],
    value: AuthProvider.Email,
  },
] as const satisfies Option[]

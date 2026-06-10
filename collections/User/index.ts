import {
  admins,
  selfOrAdmins,
  selfOrAdminsField,
  adminsOnly,
  updateLastLoginAt,
  clearAuthjsCookies,
} from '@/collections/User/hooks'
import { AuthjsStrategy } from '@/lib/auth/payload-strategy'
import {
  UserRole,
  userRoleOptions,
  ThemePreference,
  themePreferenceOptions,
  authProviderOptions,
} from '@/collections/User/constants'
import { type CollectionConfig } from 'payload'

const User: CollectionConfig<'user'> = {
  slug: 'user',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  // Soft-delete via Payload's built-in trash.
  trash: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: [
      'email',
      'name',
      'role',
      'authProvider',
      'lastAuthMethod',
      'updatedAt',
      'createdAt',
    ],
    group: 'Admin',
  },
  access: {
    read: selfOrAdmins,
    create: admins,
    update: selfOrAdmins,
    delete: admins,
    admin: admins,
  },
  auth: {
    useSessions: false,
    strategies: [AuthjsStrategy()],
  },
  hooks: {
    afterLogin: [updateLastLoginAt],
    afterLogout: [clearAuthjsCookies],
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      access: {
        read: () => true,
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: UserRole.User,
      required: true,
      options: userRoleOptions,
      access: {
        read: () => true,
        create: admins,
        update: admins,
      },
    },
    {
      name: 'themePreference',
      label: 'Theme Preference',
      type: 'select',
      defaultValue: ThemePreference.System,
      options: themePreferenceOptions,
      access: {
        read: selfOrAdminsField,
        update: selfOrAdminsField,
      },
      admin: {
        position: 'sidebar',
        description: 'Preferred color theme (syncs across devices)',
      },
    },
    {
      name: 'authProvider',
      label: 'Original Auth Provider',
      type: 'select',
      options: authProviderOptions,
      access: {
        read: adminsOnly,
        create: adminsOnly,
        update: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Original signup method',
      },
    },
    {
      name: 'lastAuthMethod',
      label: 'Most Recent Auth Method',
      type: 'select',
      options: authProviderOptions,
      access: {
        read: adminsOnly,
        create: adminsOnly,
        update: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Most recent login method',
      },
    },
    {
      name: 'lastLoginAt',
      label: 'Last Login',
      type: 'date',
      index: true,
      access: {
        read: adminsOnly,
        create: adminsOnly,
        update: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Updated on every successful OAuth sign-in.',
      },
    },
    {
      name: 'avatar',
      label: 'Avatar',
      type: 'upload',
      relationTo: 'media',
      access: {
        read: () => true,
      },
      admin: {
        description: 'User-uploaded avatar image',
      },
    },
    {
      name: 'githubImageUrl',
      label: 'GitHub Image URL',
      type: 'text',
      access: {
        read: () => true,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'githubId',
      label: 'GitHub ID',
      type: 'text',
      unique: true,
      index: true,
      access: {
        read: adminsOnly,
        create: adminsOnly,
        update: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'GitHub OAuth user ID for account linking',
      },
    },
    {
      name: 'githubLogin',
      label: 'GitHub Login',
      type: 'text',
      index: true,
      access: {
        read: adminsOnly,
        create: adminsOnly,
        update: adminsOnly,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'GitHub username captured from OAuth profile.login.',
      },
    },
  ],
}

export default User

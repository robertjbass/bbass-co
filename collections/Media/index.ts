import { anyone, admins } from '@/collections/User/hooks'
import { type CollectionConfig } from 'payload'

const Media: CollectionConfig<'media'> = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    group: 'Assets',
    defaultColumns: [
      'filename',
      'alt',
      'createdAt',
      'filesize',
      'width',
      'height',
    ],
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    disableLocalStorage: true,
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
      required: true,
    },
  ],
}

export default Media

import { anyone, admins } from '@/collections/User/hooks'
import { generateSlug } from '@/collections/Tag/hooks'
import { type CollectionConfig } from 'payload'

const Tag: CollectionConfig<'tag'> = {
  slug: 'tag',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    beforeChange: [generateSlug],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default Tag

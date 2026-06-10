import { admins } from '@/collections/User/hooks'
import { publishedOrAdmins, setPublishedAt } from '@/collections/Blog/hooks'
import { slugField, seoFields } from '@/collections/shared/fields'
import { BlogType, blogTypeOptions } from './constants'
import { type CollectionConfig } from 'payload'

const Blog: CollectionConfig<'blog'> = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'slug', 'publishedAt', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    group: 'Content',
    components: {
      beforeList: [
        '@/components/admin/blog-markdown-import.tsx#BlogMarkdownImport',
      ],
    },
  },
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  access: {
    read: publishedOrAdmins,
    create: admins,
    update: admins,
    delete: admins,
  },
  timestamps: true,
  hooks: {
    beforeChange: [setPublishedAt],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description:
          'Short summary for listings and SEO. Keep under 300 characters - aim for 150-160 for optimal search result display.',
      },
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      defaultValue: BlogType.DeepDive,
      options: blogTypeOptions,
      admin: {
        position: 'sidebar',
      },
    },
    {
      // Upload fields must stay in the main content area - Payload admin
      // crashes when type: 'upload' is placed in admin.position: 'sidebar'.
      // See CLAUDE.md gotchas.
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      maxDepth: 2,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Auto-set when first published.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'contentHash',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    seoFields(),
  ],
}

export default Blog

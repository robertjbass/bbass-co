import { admins } from '@/collections/User/hooks'
import {
  publishedOrAdmins,
  prepareBlogPost,
  selectFeaturedPost,
  invalidateBlogPages,
} from '@/collections/Blog/hooks'
import { slugField, seoFields } from '@/collections/shared/fields'
import { BlogType, blogTypeOptions } from './constants'
import { type CollectionConfig } from 'payload'

const Blog: CollectionConfig<'blog'> = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'published',
      'featured',
      'publishedAt',
      'updatedAt',
    ],
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
    beforeChange: [prepareBlogPost, selectFeaturedPost],
    afterChange: [
      ({ doc, previousDoc }) => invalidateBlogPages(doc, previousDoc),
    ],
    afterDelete: [({ doc }) => invalidateBlogPages(doc)],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField('title', { preserveExplicit: true }),
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
      name: 'markdownBody',
      label: 'Markdown body',
      type: 'textarea',
      admin: {
        components: {
          Field: '@/collections/Blog/components/markdown-field.tsx',
        },
      },
    },
    {
      name: 'author',
      label: 'Public byline',
      type: 'text',
      defaultValue: 'Bob Bass',
    },
    {
      name: 'postTags',
      label: 'Tags',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Feature this post on the homepage and Writing page when public. Selecting it replaces the previous selection.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description:
          'Check and save to publish. A future date schedules this post.',
      },
    },
    {
      name: 'suppressFileFallback',
      type: 'checkbox',
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    // Keep external image URLs when importing file frontmatter into Postgres.
    { name: 'importedCoverUrl', type: 'text', admin: { hidden: true } },
    { name: 'importedShareUrl', type: 'text', admin: { hidden: true } },
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

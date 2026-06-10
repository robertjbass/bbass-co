import type { Field, FieldHook } from 'payload'

// Reserved slugs that overlap with top-level routes, so we prevent
// Blog/Tag posts from colliding with them.
const RESTRICTED_SLUGS = new Set([
  'admin',
  'api',
  'blog',
  'feed',
  'login',
  'logout',
  'robots',
  'sitemap',
  'tag',
])

export function formatSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createSlugHook(sourceField: string): FieldHook {
  return ({ data, value, operation }) => {
    if (operation === 'create' || !value) {
      const sourceValue = data?.[sourceField]
      if (typeof sourceValue === 'string' && sourceValue.length > 0) {
        return formatSlug(sourceValue)
      }
    }
    return typeof value === 'string' ? formatSlug(value) : value
  }
}

export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: `Auto-generated from "${sourceField}". Edit to override.`,
    },
    validate: (value: string | null | undefined) => {
      if (value && RESTRICTED_SLUGS.has(value)) {
        return `"${value}" is a reserved slug and cannot be used`
      }
      return true
    },
    hooks: {
      beforeValidate: [createSlugHook(sourceField)],
    },
  }
}

// Per-post SEO fields. Posts are indexable by default; the noIndex
// checkbox lets individual posts opt out.
export function seoFields(): Field {
  return {
    name: 'seo',
    type: 'group',
    label: 'SEO',
    admin: {
      description: 'Search engine optimization fields',
    },
    fields: [
      {
        name: 'metaTitle',
        label: 'Meta Title',
        type: 'text',
        admin: {
          description:
            'Overrides the page title in search results (50-60 chars ideal)',
        },
      },
      {
        name: 'metaDescription',
        label: 'Meta Description',
        type: 'textarea',
        admin: {
          description: 'Shown in search result snippets (150-160 chars ideal)',
        },
      },
      {
        name: 'ogImage',
        label: 'Social Share Image',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description:
            'Image shown when shared on social media (1200x630 ideal)',
        },
      },
      {
        name: 'noIndex',
        label: 'Hide from Search Engines',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description:
            'When checked, emits robots "noindex, nofollow" and excludes the post from the sitemap.',
        },
      },
    ],
  }
}

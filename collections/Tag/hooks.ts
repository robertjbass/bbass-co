import type { CollectionBeforeChangeHook } from 'payload'

export const generateSlug: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  if (data && !data.slug && data.name && operation === 'create') {
    data.slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  return data
}

import { UserRole } from '@/collections/User/constants'
import type { Access, CollectionBeforeChangeHook } from 'payload'

export const publishedOrAdmins: Access = ({ req: { user } }) => {
  if (user?.role === UserRole.Admin) return true
  return { publishedAt: { exists: true } }
}

export const setPublishedAt: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  if (!data) return data

  // Only auto-set publishedAt if it's truthy but not a real date
  // (e.g. a boolean-like flag). If the caller provides an actual date string,
  // preserve it. If there's already a publishedAt on the doc, keep it.
  if (data.publishedAt && !originalDoc?.publishedAt) {
    const isDateString =
      typeof data.publishedAt === 'string' &&
      /^\d{4}-\d{2}/.test(data.publishedAt)
    if (!isDateString) {
      data.publishedAt = new Date().toISOString()
    }
  }

  return data
}

import { revalidatePath } from 'next/cache'
import type { Blog } from '@/payload-types'
import { UserRole } from '@/collections/User/constants'
import {
  ValidationError,
  type Access,
  type Where,
  type CollectionBeforeChangeHook,
} from 'payload'
import { validateMarkdown } from '@/lib/blog/validate-markdown'

export function publicBlogWhere(now = new Date().toISOString()): Where {
  return {
    or: [
      { published: { equals: true } },
      {
        and: [
          { published: { exists: false } },
          { markdownBody: { exists: false } },
          { suppressFileFallback: { exists: false } },
        ],
      },
    ],
    publishedAt: { less_than_equal: now },
  }
}

export const publishedOrAdmins: Access = ({ req: { user } }) =>
  user?.role === UserRole.Admin || publicBlogWhere()

export function invalidateBlogPages(...posts: (Blog | undefined)[]) {
  const visible = posts.filter((post): post is Blog =>
    Boolean(
      post &&
      (post.suppressFileFallback ||
        (post.publishedAt && post.published !== false)),
    ),
  )
  if (!visible.length) return
  try {
    if (visible.some((post) => post.featured)) revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/rss.xml')
    revalidatePath('/sitemap.xml')
    for (const slug of new Set(visible.map((post) => post.slug))) {
      revalidatePath('/blog/' + slug)
    }
  } catch (error) {
    // Standalone Payload imports have no Next request cache. ISR picks them up.
    if (
      !(
        error instanceof Error &&
        error.message.includes('static generation store missing')
      )
    )
      throw error
  }
}

export const prepareBlogPost: CollectionBeforeChangeHook<Blog> = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation === 'create' || data.published === null) {
    data.published = data.published === true
  }
  const post = { ...originalDoc, ...data }
  const previouslyPublic =
    originalDoc?.published !== false &&
    originalDoc?.publishedAt &&
    Date.parse(originalDoc.publishedAt) <= Date.now()
  if (
    previouslyPublic &&
    (post.published === false ||
      (post.publishedAt && Date.parse(post.publishedAt) > Date.now()))
  ) {
    data.suppressFileFallback = true
  }
  if (post.published) {
    if (!post.publishedAt) data.publishedAt = new Date().toISOString()
    try {
      if (!post.markdownBody?.trim())
        throw new Error('Add a Markdown body before publishing.')
      validateMarkdown(post.markdownBody)
    } catch (error) {
      throw new ValidationError({
        errors: [
          {
            path: 'markdownBody',
            message: error instanceof Error ? error.message : String(error),
          },
        ],
      })
    }
  }
  return data
}

export const selectFeaturedPost: CollectionBeforeChangeHook<Blog> = async ({
  data,
  originalDoc,
  req,
}) => {
  if (data.featured === true && !originalDoc?.featured) {
    await req.payload.update({
      collection: 'blog',
      where: { featured: { equals: true } },
      data: { featured: false },
      req,
      overrideAccess: true,
    })
  }
  return data
}

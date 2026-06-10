import type { Blog, Tag } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import {
  getMarkdownPostBySlug,
  getMarkdownPosts,
  getMarkdownTags,
  type MarkdownPost,
} from '@/lib/blog/markdown-source'
import { IS_MARKDOWN_SOURCE } from '@/lib/blog/source'
import { createLogger } from '@/lib/logger'

const logger = createLogger('blog-resolver')

// Single resolution rule used by every consumer (detail page, listing,
// sitemap, generateStaticParams): if a published DB record exists for a
// slug, it wins. Otherwise - and only when IS_MARKDOWN_SOURCE is true - we
// fall back to a markdown file with the same slug.
export type ResolvedPost = {
  source: 'db' | 'markdown'
  post: Blog
  tags: Tag[]
  markdownBody?: string
  author?: string
}

const DB_DETAIL_SELECT = {
  createdAt: true,
  excerpt: true,
  featuredImage: true,
  publishedAt: true,
  seo: true,
  slug: true,
  title: true,
  type: true,
  updatedAt: true,
} as const

const DB_LISTING_SELECT = {
  excerpt: true,
  publishedAt: true,
  seo: true,
  slug: true,
  title: true,
  type: true,
} as const

function markdownToResolved(post: MarkdownPost): ResolvedPost {
  const { markdownBody, author, tags, ...blog } = post
  return {
    source: 'markdown',
    post: blog as Blog,
    tags,
    markdownBody,
    author,
  }
}

function logDatabaseFallback(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  logger.error(
    `Database blog resolution failed in ${context}; falling back to markdown source`,
    {
      message,
    },
  )
}

export async function resolvePostBySlug(
  slug: string,
): Promise<ResolvedPost | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'blog',
      select: DB_DETAIL_SELECT,
      where: { slug: { equals: slug }, publishedAt: { exists: true } },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })

    const [blog] = docs
    if (blog) {
      // Phase 1: Blog has no tags relationship (removed with blog_tag). Tag
      // rendering for DB posts comes back in Phase 2 via tags: hasMany.
      return { source: 'db', post: blog as Blog, tags: [] }
    }
  } catch (error) {
    if (!IS_MARKDOWN_SOURCE) throw error
    logDatabaseFallback(`resolvePostBySlug(${slug})`, error)
  }

  if (IS_MARKDOWN_SOURCE) {
    const markdownPost = getMarkdownPostBySlug(slug)
    if (markdownPost) return markdownToResolved(markdownPost)
  }

  return null
}

export type ListedPost = {
  source: 'db' | 'markdown'
  post: Blog
  tags: Tag[]
}

// Merged listing with DB-wins deduplication. Any markdown file whose slug
// is already claimed by a published DB record is dropped.
export async function getAllPosts(): Promise<ListedPost[]> {
  let dbPosts: Blog[] = []
  try {
    const payload = await getPayloadClient()
    const { docs: dbDocs } = await payload.find({
      collection: 'blog',
      where: { publishedAt: { exists: true } },
      sort: ['-publishedAt'],
      limit: 0,
      select: DB_LISTING_SELECT,
      depth: 0,
    })
    dbPosts = dbDocs as Blog[]
  } catch (error) {
    if (!IS_MARKDOWN_SOURCE) throw error
    logDatabaseFallback('getAllPosts', error)
  }

  const dbSlugs = new Set(dbPosts.map((p) => p.slug))
  const unclaimedMarkdown = IS_MARKDOWN_SOURCE
    ? getMarkdownPosts().filter((entry) => !dbSlugs.has(entry.post.slug))
    : []

  const combined: ListedPost[] = [
    ...dbPosts.map((post) => ({ source: 'db' as const, post, tags: [] })),
    ...unclaimedMarkdown.map((entry) => ({
      source: 'markdown' as const,
      post: entry.post,
      tags: entry.tags,
    })),
  ]

  combined.sort((a, b) => {
    const ad = a.post.publishedAt ?? ''
    const bd = b.post.publishedAt ?? ''
    return bd.localeCompare(ad)
  })

  return combined
}

export async function getAllTags(): Promise<Tag[]> {
  let dbTags: Tag[] = []
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'tag',
      sort: ['name'],
      limit: 50,
      select: { name: true, slug: true },
    })
    dbTags = docs as Tag[]
  } catch (error) {
    if (!IS_MARKDOWN_SOURCE) throw error
    logDatabaseFallback('getAllTags', error)
  }

  const tagBySlug = new Map<string, Tag>()
  if (IS_MARKDOWN_SOURCE) {
    for (const tag of getMarkdownTags()) tagBySlug.set(tag.slug, tag)
  }
  for (const tag of dbTags) tagBySlug.set(tag.slug, tag)

  return Array.from(tagBySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs = new Set<string>()
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'blog',
      where: { publishedAt: { exists: true } },
      limit: 0,
      select: { slug: true },
    })
    for (const doc of docs as { slug: string }[]) slugs.add(doc.slug)
  } catch (error) {
    if (!IS_MARKDOWN_SOURCE) throw error
    logDatabaseFallback('getAllPostSlugs', error)
  }

  if (IS_MARKDOWN_SOURCE) {
    for (const entry of getMarkdownPosts()) slugs.add(entry.post.slug)
  }
  return Array.from(slugs)
}

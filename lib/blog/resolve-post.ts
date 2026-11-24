import { cache } from 'react'
import type { Where } from 'payload'
import type { Blog, Tag } from '@/payload-types'
import { publicBlogWhere } from '@/collections/Blog/hooks'
import { getPayloadClient } from '@/lib/payload'
import {
  getMarkdownPostBySlug,
  getMarkdownPosts,
  isPublicFile,
  synthesizeMedia,
  synthesizeTag,
} from '@/lib/blog/markdown-source'
import { IS_MARKDOWN_SOURCE } from '@/lib/blog/source'

export type ListedPost = {
  source: 'db' | 'markdown'
  post: Blog
  tags: Tag[]
}
export type ResolvedPost = ListedPost & {
  markdownBody?: string
  author?: string
}

const LISTING_SELECT = {
  slug: true,
  title: true,
  type: true,
  excerpt: true,
  publishedAt: true,
  published: true,
  suppressFileFallback: true,
  createdAt: true,
  updatedAt: true,
  seo: true,
  postTags: true,
  featuredImage: true,
  featured: true,
  importedCoverUrl: true,
  importedShareUrl: true,
  author: true,
} as const

function claimedWhere(now: string): Where {
  return {
    or: [publicBlogWhere(now), { suppressFileFallback: { equals: true } }],
  }
}
function withdrawn(row: Blog, now: string) {
  return (
    row.suppressFileFallback &&
    !(row.published && row.publishedAt && row.publishedAt <= now)
  )
}

export function databasePost(row: Blog): ResolvedPost {
  const { markdownBody, ...post } = row
  if (!post.featuredImage && post.importedCoverUrl) {
    post.featuredImage = synthesizeMedia(
      post.slug,
      'cover',
      post.importedCoverUrl,
    )
  }
  if (!post.seo?.ogImage && post.importedShareUrl) {
    post.seo = {
      ...post.seo,
      ogImage: synthesizeMedia(post.slug, 'share', post.importedShareUrl),
    }
  }
  return {
    source: 'db',
    post,
    tags: (row.postTags ?? []).map(synthesizeTag),
    author: row.author || 'Bob Bass',
    markdownBody: markdownBody ?? undefined,
  }
}

export const resolvePostBySlug = cache(
  async (slug: string): Promise<ResolvedPost | null> => {
    const now = new Date().toISOString()
    const payload = await getPayloadClient()
    const {
      docs: [row],
    } = await payload.find({
      collection: 'blog',
      where: { and: [{ slug: { equals: slug } }, claimedWhere(now)] },
      select: { ...LISTING_SELECT, markdownBody: true },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    })
    if (row && withdrawn(row, now)) return null
    if (row?.markdownBody) return databasePost(row)
    const file = IS_MARKDOWN_SOURCE && getMarkdownPostBySlug(slug)
    if (file && isPublicFile(file, now)) {
      const { tags, author, markdownBody, ...post } = file
      return {
        source: 'markdown',
        post,
        tags,
        author: author ?? 'Bob Bass',
        markdownBody,
      }
    }
    return row ? databasePost(row) : null
  },
)

export const getAllPosts = cache(async (): Promise<ListedPost[]> => {
  const now = new Date().toISOString()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog',
    where: claimedWhere(now),
    pagination: false,
    select: LISTING_SELECT,
    depth: 1,
    overrideAccess: true,
  })
  const posts = new Map<string, ListedPost>()
  if (IS_MARKDOWN_SOURCE) {
    for (const entry of getMarkdownPosts()) {
      if (isPublicFile(entry.post, now))
        posts.set(entry.post.slug, { ...entry, source: 'markdown' })
    }
  }
  for (const row of docs) {
    if (withdrawn(row, now)) posts.delete(row.slug)
    else if (row.featured || row.published === true || !posts.has(row.slug))
      posts.set(row.slug, databasePost(row))
  }
  return [...posts.values()].sort(
    (a, b) =>
      (b.post.publishedAt ?? '').localeCompare(a.post.publishedAt ?? '') ||
      a.post.slug.localeCompare(b.post.slug),
  )
})

export function getAllTags(posts: ListedPost[]): Tag[] {
  const tags = new Map(
    posts.flatMap(({ tags }) => tags.map((tag) => [tag.slug, tag] as const)),
  )
  return [...tags.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export async function getFeaturedPost() {
  const payload = await getPayloadClient()
  const {
    docs: [post],
  } = await payload.find({
    collection: 'blog',
    where: { and: [publicBlogWhere(), { featured: { equals: true } }] },
    select: { title: true, slug: true },
    depth: 0,
    limit: 1,
  })
  return post
}

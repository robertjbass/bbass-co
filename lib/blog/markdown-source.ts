import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { BLOG_CONTENT_DIR } from '@/lib/constants'
import { BlogType } from '@/collections/Blog/constants'
import type { Blog, Media, Tag } from '@/payload-types'

// Frontmatter mirrors the Blog collection 1:1 so both sources produce
// identically-shaped Blog objects downstream consumers can render without
// source-specific branching.
type FrontmatterImage =
  | string
  | { url: string; alt?: string; width?: number; height?: number }

type FrontmatterSeo = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: FrontmatterImage
  noIndex?: boolean
}

type Frontmatter = {
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  author?: string
  type?: BlogType
  featuredImage?: FrontmatterImage
  tags?: { name: string; slug: string }[]
  seo?: FrontmatterSeo
}

// MarkdownPost extends Blog with two render-time extras the DB path doesn't
// provide: the markdown body itself, the legacy author string from
// frontmatter, and a synthesized Tag[] since Phase 1 Blog no longer has a
// tags relationship.
export type MarkdownPost = Blog & {
  markdownBody: string
  author?: string
  tags: Tag[]
}

function getContentDir() {
  return path.resolve(process.cwd(), BLOG_CONTENT_DIR)
}

function deterministicId(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function synthesizeTag(tag: { name: string; slug: string }): Tag {
  return {
    id: deterministicId(tag.slug),
    name: tag.name,
    slug: tag.slug,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  } as Tag
}

function synthesizeMedia(
  slug: string,
  key: string,
  image: FrontmatterImage | undefined,
): Media | null {
  if (!image) return null
  const now = new Date().toISOString()
  if (typeof image === 'string') {
    return {
      id: deterministicId(`${slug}-${key}`),
      alt: '',
      url: image,
      updatedAt: now,
      createdAt: now,
    } as Media
  }
  return {
    id: deterministicId(`${slug}-${key}`),
    alt: image.alt ?? '',
    url: image.url,
    ...(image.width !== undefined && { width: image.width }),
    ...(image.height !== undefined && { height: image.height }),
    updatedAt: now,
    createdAt: now,
  } as Media
}

function synthesizeSeo(
  slug: string,
  seo: FrontmatterSeo | undefined,
): Blog['seo'] {
  return {
    metaTitle: seo?.metaTitle ?? null,
    metaDescription: seo?.metaDescription ?? null,
    ogImage: synthesizeMedia(slug, 'seo-ogImage', seo?.ogImage),
    noIndex: seo?.noIndex ?? false,
  }
}

function synthesizeBlog(frontmatter: Frontmatter): Blog {
  const id = deterministicId(frontmatter.slug)
  const timestamp = frontmatter.publishedAt ?? new Date().toISOString()
  return {
    id,
    title: frontmatter.title,
    slug: frontmatter.slug,
    type: frontmatter.type ?? BlogType.Other,
    excerpt: frontmatter.excerpt ?? null,
    publishedAt: frontmatter.publishedAt ?? null,
    featuredImage: synthesizeMedia(
      frontmatter.slug,
      'featuredImage',
      frontmatter.featuredImage,
    ),
    seo: synthesizeSeo(frontmatter.slug, frontmatter.seo),
    updatedAt: timestamp,
    createdAt: timestamp,
  }
}

function readMarkdownFiles() {
  const contentDir = getContentDir()
  if (!fs.existsSync(contentDir)) return []

  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(contentDir, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      return {
        frontmatter: data as Frontmatter,
        body: content,
        filename,
      }
    })
}

function tagsFromFrontmatter(frontmatter: Frontmatter): Tag[] {
  return (frontmatter.tags ?? []).map(synthesizeTag)
}

export type MarkdownListing = {
  post: Blog
  tags: Tag[]
}

export function getMarkdownPosts(): MarkdownListing[] {
  return readMarkdownFiles()
    .map(({ frontmatter }) => ({
      post: synthesizeBlog(frontmatter),
      tags: tagsFromFrontmatter(frontmatter),
    }))
    .sort((a, b) => {
      const ad = a.post.publishedAt ?? ''
      const bd = b.post.publishedAt ?? ''
      return bd.localeCompare(ad)
    })
}

export function getMarkdownPostBySlug(slug: string): MarkdownPost | null {
  const match = readMarkdownFiles().find((f) => f.frontmatter.slug === slug)
  if (!match) return null

  return {
    ...synthesizeBlog(match.frontmatter),
    markdownBody: match.body,
    author: match.frontmatter.author,
    tags: tagsFromFrontmatter(match.frontmatter),
  }
}

export function getMarkdownTags(): Tag[] {
  const tagMap = new Map<string, { name: string; slug: string }>()

  for (const { frontmatter } of readMarkdownFiles()) {
    for (const tag of frontmatter.tags ?? []) {
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, tag)
      }
    }
  }

  return Array.from(tagMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(synthesizeTag)
}

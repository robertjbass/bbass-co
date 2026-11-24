import type { MetadataRoute } from 'next'

import { getAllPosts } from '@/lib/blog/resolve-post'
import { SITE_URL } from '@/lib/metadata'

export const dynamic = 'force-static'
export const revalidate = 60

// Static pages bump together when the site is meaningfully updated.
const SITE_LAST_UPDATED = new Date('2026-11-24T00:00:00Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const posts = await getAllPosts()
  for (const { post } of posts) {
    if (post.seo?.noIndex === true) continue
    const lastModified = post.updatedAt
      ? new Date(post.updatedAt)
      : post.publishedAt
        ? new Date(post.publishedAt)
        : SITE_LAST_UPDATED
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }
  return entries
}

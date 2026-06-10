import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Per-post indexing is controlled via seo.noIndex on each Blog
        // record. Markdown posts default to noIndex in frontmatter; DB
        // posts are indexable unless the admin flips the toggle.
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

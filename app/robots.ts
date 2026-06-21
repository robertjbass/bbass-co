import type { MetadataRoute } from 'next'
import { SHOULD_NOINDEX_SITE, SITE_URL } from '@/lib/metadata'

export default function robots(): MetadataRoute.Robots {
  // Preview/dev deployments (and any non-public origin) already get a
  // meta-robots noindex on every page via SHOULD_NOINDEX_SITE. Mirror that
  // here so robots.txt doesn't invite crawlers in or advertise a sitemap
  // for a deployment we want hidden.
  if (SHOULD_NOINDEX_SITE) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

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

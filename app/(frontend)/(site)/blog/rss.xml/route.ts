import { getAllPosts } from '@/lib/blog/resolve-post'
import { SITE_URL } from '@/lib/metadata'

// RSS 2.0 feed for the blog. Helps developer aggregators (Hacker News
// /from feeds, Lobsters, dev.to imports, RSS readers like Feedly /
// NetNewsWire) discover new posts faster than waiting on the next
// Google sitemap re-crawl. Atom-self link is included so feed readers
// can detect feed location changes.
//
// Excerpt-only feed (no full post content). Most engineering blog
// feeds publish full content; we publish excerpts so readers come to
// the site for the funnel CTAs (and for the syntax-highlighted code).

export const dynamic = 'force-static'
export const revalidate = false

const FEED_DESCRIPTION =
  'Writing on TypeScript, developer tooling, building products, and lessons from shipping software.'

// Escape XML-special characters in user-supplied text so the feed
// stays well-formed even when post titles or excerpts include
// quotes, angle brackets, or ampersands.
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function rfc822Date(value: string | null | undefined): string {
  if (!value) return new Date().toUTCString()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toUTCString()
  return date.toUTCString()
}

export async function GET() {
  const posts = await getAllPosts()
  const indexable = posts.filter(
    ({ post }) => post.seo?.noIndex !== true && post.slug && post.publishedAt,
  )

  const lastBuildDate = rfc822Date(
    indexable[0]?.post.updatedAt ?? indexable[0]?.post.publishedAt,
  )

  const items = indexable
    .map(({ post, tags }) => {
      const link = `${SITE_URL}/blog/${post.slug}`
      const pubDate = rfc822Date(post.publishedAt)
      const tagXml = tags
        .filter((t) => t.name)
        .map((t) => `      <category>${escapeXml(t.name as string)}</category>`)
        .join('\n')
      const description = post.excerpt
        ? `      <description>${escapeXml(post.excerpt)}</description>\n`
        : ''
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
${description}${tagXml ? tagXml + '\n' : ''}    </item>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bob Bass Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Cache for an hour at the CDN; revalidate after that. Posts
      // publish infrequently enough that one-hour staleness is fine.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

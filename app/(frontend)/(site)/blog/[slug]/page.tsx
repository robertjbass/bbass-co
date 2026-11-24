import { notFound } from 'next/navigation'
import { BlogPost } from '@/components/blog/blog-post'
import { resolvePostBySlug, getAllPosts } from '@/lib/blog/resolve-post'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/structured-data'
import { buildBlogPosting, buildBreadcrumbList } from '@/lib/structured-data'
import { SHOULD_NOINDEX_SITE, SITE_URL } from '@/lib/metadata'
import type { Blog } from '@/payload-types'

type Props = {
  params: Promise<{ slug: Blog['slug'] }>
}

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 60

export async function generateStaticParams() {
  return (await getAllPosts()).map(({ post }) => ({ slug: post.slug }))
}

function shareImage(post: Blog) {
  for (const media of [post.seo?.ogImage, post.featuredImage]) {
    if (typeof media === 'object' && media?.url)
      return new URL(media.url, SITE_URL).href
  }
  return `${SITE_URL}/opengraph-image.png`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolvePostBySlug(slug)

  if (!resolved) return {}

  const { post } = resolved
  const seo = post.seo
  const title = seo?.metaTitle?.trim() || post.title
  const description = seo?.metaDescription?.trim() || post.excerpt || undefined

  // Both sources expose seo.noIndex identically. Posts are indexable by
  // default unless markdown frontmatter or the admin toggle opts out.
  const noIndex = SHOULD_NOINDEX_SITE || seo?.noIndex === true

  return {
    title: seo?.metaTitle?.trim() ? { absolute: title } : title,
    ...(description && { description }),
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      siteName: 'Bob Bass',
      images: [shareImage(post)],
      title,
      ...(description && { description }),
      url: `/blog/${slug}`,
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
      modifiedTime: post.updatedAt,
      authors: resolved.author ? [resolved.author] : undefined,
      tags: resolved.tags.map((tag) => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      images: [shareImage(post)],
      title,
      ...(description && { description }),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const resolved = await resolvePostBySlug(slug)

  if (!resolved) notFound()

  const { source, post, tags, markdownBody, author } = resolved

  const blogPosting = buildBlogPosting({
    headline: post.title,
    slug: post.slug,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author,
    image: shareImage(post),
  })

  const breadcrumbs = buildBreadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  return (
    <>
      <JsonLd data={[blogPosting, breadcrumbs]} />
      <BlogPost
        post={post}
        tags={tags}
        markdown={markdownBody}
        author={author}
        editableId={source === 'db' ? post.id : undefined}
      />
    </>
  )
}

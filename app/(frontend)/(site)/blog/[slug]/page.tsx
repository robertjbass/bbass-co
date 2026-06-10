import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { BlogPost } from '@/components/blog/blog-post'
import { getAuthenticatedUserId } from '@/lib/auth/get-authenticated-user'
import {
  resolvePostBySlug,
  getAllPostSlugs,
  type ResolvedPost,
} from '@/lib/blog/resolve-post'
import { UserRole } from '@/collections/User/constants'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/structured-data'
import { buildBlogPosting, buildBreadcrumbList } from '@/lib/structured-data'
import { SHOULD_NOINDEX_SITE, SITE_URL } from '@/lib/metadata'
import type { Blog } from '@/payload-types'

type Props = {
  params: Promise<{ slug: Blog['slug'] }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

async function getAdminEditUrl(
  source: ResolvedPost['source'],
  postId: number,
): Promise<string | undefined> {
  if (source === 'markdown') return undefined

  try {
    const payload = await getPayloadClient()
    const userId = await getAuthenticatedUserId()
    if (!userId) return undefined

    const user = await payload.findByID({
      collection: 'user',
      id: Number(userId),
      select: { role: true },
      overrideAccess: true,
    })

    if (user?.role !== UserRole.Admin) return undefined

    return `/admin/collections/blog/${postId}`
  } catch {
    return undefined
  }
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
    title,
    ...(description && { description }),
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title,
      ...(description && { description }),
      url: `/blog/${slug}`,
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
    },
    twitter: {
      card: 'summary_large_image',
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
  const adminEditUrl = await getAdminEditUrl(source, post.id)

  const blogPosting = buildBlogPosting({
    headline: post.title,
    slug: post.slug,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author,
    image: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
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
        adminEditUrl={adminEditUrl}
      />
    </>
  )
}

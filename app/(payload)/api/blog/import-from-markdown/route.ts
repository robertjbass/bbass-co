import { type NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { getPayloadClient } from '@/lib/payload'
import { getMarkdownPostBySlug } from '@/lib/blog/markdown-source'

export async function POST(req: NextRequest) {
  const admin = await requireAdminApi()
  if (admin.error)
    return NextResponse.json({ error: admin.error }, { status: admin.status })

  const body = await req.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }
  const file = getMarkdownPostBySlug(slug)
  if (!file)
    return NextResponse.json(
      { error: 'Markdown file not found' },
      { status: 404 },
    )

  const payload = await getPayloadClient()
  const { totalDocs } = await payload.count({
    collection: 'blog',
    where: { slug: { equals: slug } },
  })
  if (totalDocs)
    return NextResponse.json(
      { error: 'This slug is already in the database' },
      { status: 409 },
    )

  const {
    title,
    type,
    excerpt,
    author,
    tags,
    markdownBody,
    seo,
    featuredImage,
    publishedAt,
  } = file
  const post = await payload.create({
    collection: 'blog',
    data: {
      title,
      slug,
      type,
      excerpt,
      author: author || 'Bob Bass',
      markdownBody,
      published: false,
      publishedAt,
      postTags: tags.map(({ name, slug }) => ({ name, slug })),
      importedCoverUrl:
        typeof featuredImage === 'object' ? featuredImage?.url : undefined,
      importedShareUrl:
        typeof seo?.ogImage === 'object' ? seo.ogImage?.url : undefined,
      seo: {
        metaTitle: seo?.metaTitle,
        metaDescription: seo?.metaDescription,
        noIndex: seo?.noIndex,
      },
    },
  })
  return NextResponse.json({ id: post.id, slug: post.slug })
}

import { notFound } from 'next/navigation'
import { BlogPost } from '@/components/blog/blog-post'
import { PreviewRefresh } from '@/components/blog/preview-refresh'
import { requireAdmin } from '@/lib/auth/require-admin'
import { databasePost } from '@/lib/blog/resolve-post'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Post preview',
  robots: { index: false, follow: false },
}

export default async function PreviewPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const admin = await requireAdmin()
  const { slug } = await params
  const payload = await getPayloadClient()
  const {
    docs: [row],
  } = await payload.find({
    collection: 'blog',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    user: admin,
    overrideAccess: false,
  })
  if (!row) notFound()
  const { post, markdownBody, author, tags } = databasePost(row)
  return (
    <>
      <PreviewRefresh />
      <BlogPost
        post={post}
        author={author}
        markdown={markdownBody}
        tags={tags}
        editableId={row.id}
      />
    </>
  )
}

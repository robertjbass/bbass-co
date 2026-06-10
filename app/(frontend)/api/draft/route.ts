import { draftMode } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  const collection = request.nextUrl.searchParams.get('collection')

  if (!slug || collection !== 'blog') {
    return new NextResponse('Invalid parameters', { status: 400 })
  }

  const payload = await getPayloadClient()
  let admin
  try {
    admin = await requireAdmin()
  } catch {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { docs } = await payload.find({
    collection: 'blog',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    select: { slug: true },
    draft: true,
    user: admin,
    overrideAccess: false,
  })

  if (docs.length === 0) {
    return new NextResponse('Post not found', { status: 404 })
  }

  const canonicalSlug = encodeURIComponent(docs[0].slug)

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(
    new URL(`/blog/${canonicalSlug}`, request.nextUrl.origin),
  )
}

import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import matter from 'gray-matter'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { getPayloadClient } from '@/lib/payload'
import { BLOG_CONTENT_DIR } from '@/lib/constants'
import { BlogType } from '@/collections/Blog/constants'

type Frontmatter = {
  title?: string
  slug?: string
  excerpt?: string
  publishedAt?: string
  type?: BlogType
  tags?: { name: string; slug: string }[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    noIndex?: boolean
  }
}

export type MarkdownCandidate = {
  slug: string
  title: string
  excerpt: string | null
  publishedAt: string | null
  type: BlogType
  tagCount: number
  hasSeo: boolean
  filename: string
}

export async function GET(): Promise<NextResponse> {
  const adminCheck = await requireAdminApi()
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status },
    )
  }

  const contentDir = path.resolve(process.cwd(), BLOG_CONTENT_DIR)
  if (!fs.existsSync(contentDir)) {
    return NextResponse.json({ candidates: [] })
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'blog',
    limit: 0,
    select: { slug: true },
    overrideAccess: true,
  })
  const claimedSlugs = new Set(docs.map((d) => d.slug))

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'))
  const candidates: MarkdownCandidate[] = []

  for (const filename of files) {
    const filePath = path.join(contentDir, filename)
    let frontmatter: Frontmatter
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      frontmatter = matter(raw).data as Frontmatter
    } catch {
      continue
    }
    if (!frontmatter.slug) continue
    if (claimedSlugs.has(frontmatter.slug)) continue

    candidates.push({
      slug: frontmatter.slug,
      title: frontmatter.title ?? frontmatter.slug,
      excerpt: frontmatter.excerpt ?? null,
      publishedAt: frontmatter.publishedAt ?? null,
      type: frontmatter.type ?? BlogType.Other,
      tagCount: frontmatter.tags?.length ?? 0,
      hasSeo: Boolean(
        frontmatter.seo?.metaTitle ||
        frontmatter.seo?.metaDescription ||
        frontmatter.seo?.noIndex !== undefined,
      ),
      filename,
    })
  }

  candidates.sort((a, b) => {
    const ad = a.publishedAt ?? ''
    const bd = b.publishedAt ?? ''
    return bd.localeCompare(ad) || a.title.localeCompare(b.title)
  })

  return NextResponse.json({ candidates })
}

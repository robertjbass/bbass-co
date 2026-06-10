import fs from 'node:fs'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'
import matter from 'gray-matter'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { getPayloadClient } from '@/lib/payload'
import { BLOG_CONTENT_DIR } from '@/lib/constants'
import { BlogType, blogTypeOptions } from '@/collections/Blog/constants'
import { createLogger } from '@/lib/logger'

const logger = createLogger('blog-import-route')

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

const VALID_TYPES = new Set(
  blogTypeOptions.map((o) => (typeof o === 'string' ? o : o.value)),
)

function isValidType(value: string | undefined): value is BlogType {
  return value !== undefined && VALID_TYPES.has(value)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const adminCheck = await requireAdminApi()
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status },
    )
  }

  let body: { slug?: string }
  try {
    body = (await req.json()) as { slug?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const slug = body.slug?.trim()
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const contentDir = path.resolve(process.cwd(), BLOG_CONTENT_DIR)
  const filePath = path.join(contentDir, `${slug}.md`)

  // Defensive: the slug must resolve to a file inside contentDir.
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(path.resolve(contentDir) + path.sep)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  let sourcePath: string | null = fs.existsSync(resolved) ? resolved : null
  if (!sourcePath) {
    // Fall back: the slug in frontmatter may not match the filename. Scan.
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'))
    for (const f of files) {
      const p = path.join(contentDir, f)
      try {
        const data = matter(fs.readFileSync(p, 'utf-8')).data as Frontmatter
        if (data.slug === slug) {
          sourcePath = p
          break
        }
      } catch {
        // skip malformed files
      }
    }
    if (!sourcePath) {
      return NextResponse.json(
        { error: 'No markdown file found for that slug' },
        { status: 404 },
      )
    }
  }

  let frontmatter: Frontmatter
  try {
    frontmatter = matter(fs.readFileSync(sourcePath, 'utf-8'))
      .data as Frontmatter
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse markdown frontmatter' },
      { status: 500 },
    )
  }

  if (frontmatter.slug && frontmatter.slug !== slug) {
    return NextResponse.json(
      { error: 'Frontmatter slug does not match requested slug' },
      { status: 400 },
    )
  }

  const payload = await getPayloadClient()

  // Refuse if a DB record already claims this slug.
  const { docs: existing } = await payload.find({
    collection: 'blog',
    where: { slug: { equals: slug } },
    limit: 1,
    select: { slug: true },
    overrideAccess: true,
  })
  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'A blog post with this slug already exists in the database' },
      { status: 409 },
    )
  }

  // Ensure referenced Tag records exist so the admin can re-link later. Phase
  // 1 has no Blog→Tag relation; this is purely to preserve tag slugs on the
  // Tag collection. Skip on failure - import should still succeed.
  if (frontmatter.tags?.length) {
    for (const tag of frontmatter.tags) {
      if (!tag.slug || !tag.name) continue
      try {
        const { docs: existingTags } = await payload.find({
          collection: 'tag',
          where: { slug: { equals: tag.slug } },
          limit: 1,
          select: { slug: true },
          overrideAccess: true,
        })
        if (existingTags.length === 0) {
          await payload.create({
            collection: 'tag',
            data: { name: tag.name, slug: tag.slug },
            overrideAccess: true,
          })
        }
      } catch {
        // Non-fatal
      }
    }
  }

  const title = frontmatter.title ?? slug
  const blogType = isValidType(frontmatter.type)
    ? frontmatter.type
    : BlogType.Other

  try {
    const created = await payload.create({
      collection: 'blog',
      data: {
        title,
        slug,
        type: blogType,
        excerpt: frontmatter.excerpt ?? undefined,
        // publishedAt intentionally omitted: imported posts land as drafts so
        // the admin can review + populate the richText body before publishing.
        seo: {
          metaTitle: frontmatter.seo?.metaTitle ?? undefined,
          metaDescription: frontmatter.seo?.metaDescription ?? undefined,
          noIndex: frontmatter.seo?.noIndex ?? false,
        },
      },
      overrideAccess: true,
    })
    return NextResponse.json({ id: created.id, slug: created.slug })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('[import-from-markdown] Create failed:', error)
    return NextResponse.json(
      { error: `Failed to create blog post: ${message}` },
      { status: 500 },
    )
  }
}

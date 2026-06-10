import { type NextRequest, NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { type CollectionSlug } from 'payload'
import { createLogger } from '@/lib/logger'

const logger = createLogger('payload-query-route')

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body
  try {
    const text = await request.text()
    if (!text.trim()) {
      return NextResponse.json(
        { status: 400, message: 'Empty request body', data: null },
        { status: 400 },
      )
    }
    body = JSON.parse(text)
  } catch {
    return NextResponse.json(
      { status: 400, message: 'Invalid JSON in request body', data: null },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      {
        status: 400,
        message: 'Request body must be a JSON object',
        data: null,
      },
      { status: 400 },
    )
  }

  const {
    collection,
    where,
    limit,
    page,
    sort,
    depth,
    populate,
    select,
    pagination,
  } = body

  if (!collection) {
    return NextResponse.json(
      { status: 400, message: 'Missing collection', data: null },
      { status: 400 },
    )
  }

  const ALLOWED_COLLECTIONS: Set<string> = new Set(['blog', 'media', 'tag'])
  if (!ALLOWED_COLLECTIONS.has(collection)) {
    return NextResponse.json(
      { status: 400, message: 'Invalid collection', data: null },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayloadClient()
    const user = await getAuthenticatedUser()

    const findParams: Parameters<typeof payload.find>[0] = {
      collection: collection as CollectionSlug,
      overrideAccess: false,
      user: user ?? undefined,
    }

    if (
      where &&
      typeof where === 'object' &&
      !Array.isArray(where) &&
      Object.keys(where as object).length > 0
    ) {
      findParams.where = where
    }

    // Cap user-controlled values to avoid unbounded result sizes /
    // expensive deep populates.
    findParams.limit = Math.min(
      typeof limit === 'number' && Number.isFinite(limit) ? limit : 25,
      100,
    )

    if (typeof page === 'number' && Number.isFinite(page)) {
      findParams.page = page
    }

    if (sort && (typeof sort === 'string' || Array.isArray(sort))) {
      findParams.sort = sort
    }

    findParams.depth = Math.min(
      typeof depth === 'number' && Number.isFinite(depth) ? depth : 1,
      2,
    )

    if (populate && typeof populate === 'object') {
      findParams.populate = populate
    }

    if (select && typeof select === 'object') {
      findParams.select = select
    }

    if (pagination !== undefined && typeof pagination === 'boolean') {
      findParams.pagination = pagination
    }

    const data = await payload.find(findParams)

    return NextResponse.json({
      status: 200,
      message: 'Data returned successfully',
      data,
    })
  } catch (error: unknown) {
    logger.error('Payload API error:', error)
    return NextResponse.json(
      { status: 500, message: 'Internal server error', data: null },
      { status: 500 },
    )
  }
}

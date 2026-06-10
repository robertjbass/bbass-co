import type { NextRequest } from 'next/server'
import { getHandlers } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const handlers = await getHandlers()
  return handlers.GET(request)
}

export async function POST(request: NextRequest) {
  const handlers = await getHandlers()
  return handlers.POST(request)
}

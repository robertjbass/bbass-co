import { headers } from 'next/headers'
import { getApexDomain } from '@/lib/apex-domains'

// Re-export pure functions so existing imports don't break
export { getApexDomain, sanitizeCallbackUrl } from '@/lib/apex-domains'

export async function getApexUrl(): Promise<string | null> {
  const headerList = await headers()
  const host = headerList.get('host') ?? ''
  const hostname = host.split(':')[0]
  const port = host.split(':')[1]

  const apex = getApexDomain(host)
  if (!apex) return null

  // Already on apex domain or www
  if (hostname === apex || hostname === `www.${apex}`) return null

  const protocol = apex === 'localhost' ? 'http' : 'https'
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}://${apex}${portSuffix}`
}

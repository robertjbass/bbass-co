// Single-domain helpers for bbass.co. This site is a single apex
// (bbass.co) plus localhost, so there is no cloud-subdomain logic and
// getCloudHostname always returns null.

const PROD_ROOT = 'bbass.co'

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname.endsWith('.localhost')
}

function isProdHost(hostname: string): boolean {
  return hostname === PROD_ROOT || hostname.endsWith(`.${PROD_ROOT}`)
}

/**
 * Returns the canonical apex for a host:
 *   localhost / *.localhost      → 'localhost'
 *   bbass.co / *.bbass.co        → 'bbass.co'
 *   anything else                → null
 */
export function getApexDomain(host: string): string | null {
  const hostname = host.split(':')[0].toLowerCase()
  if (isLocalHost(hostname)) return 'localhost'
  if (isProdHost(hostname)) return PROD_ROOT
  return null
}

/**
 * True when both hostnames belong to the same logical environment.
 * Used by the auth redirect callback to block cross-env open redirects.
 */
export function isSameEnvironment(hostA: string, hostB: string): boolean {
  const a = getApexDomain(hostA)
  const b = getApexDomain(hostB)
  return a !== null && a === b
}

/**
 * No cloud dashboard subdomain on this site. Retained as a no-op so the
 * auth redirect callback keeps a stable shape.
 */
export function getCloudHostname(_hostname: string): string | null {
  return null
}

/**
 * Validates a callback URL: allows relative paths and absolute URLs
 * within the SAME environment as `currentHost`. Anything else falls
 * back to `fallback`.
 */
export function sanitizeCallbackUrl(
  raw: string,
  fallback: string = '/',
  currentHost?: string,
): string {
  // Relative paths are always safe
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw

  try {
    const url = new URL(raw)
    if (currentHost) {
      return isSameEnvironment(url.host, currentHost) ? raw : fallback
    }
    if (getApexDomain(url.host)) return raw
  } catch {
    // Invalid URL
  }

  return fallback
}

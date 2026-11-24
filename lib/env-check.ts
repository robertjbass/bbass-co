/**
 * Boot-time validation of critical environment variables.
 *
 * Some envs are validated where they're used (e.g. PAYLOAD_SECRET in
 * payload.config.ts). Others - AUTH_SECRET, OAuth client IDs/secrets,
 * POLAR_WEBHOOK_SECRET, PROVISION_CALLBACK_SECRET - are only read on
 * the first request that hits a handler. If an env is missing in
 * production, the first user to attempt that flow gets a 500. We'd
 * rather fail loudly at startup so the deploy is rolled back.
 *
 * Called from payload.config.ts which runs at every Next.js boot.
 */

const REQUIRED_IN_PROD = [
  'DATABASE_URL',
  'PAYLOAD_SECRET',
  'AUTH_SECRET',
  'AUTH_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'BLOB_PREFIX',
] as const

const REQUIRED_ALWAYS = [
  'DATABASE_URL',
  'PAYLOAD_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'BLOB_PREFIX',
] as const

function isProd(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.AUTH_URL?.startsWith('https://') === true
  )
}

function isLocalHostname(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
}

// A production deploy whose AUTH_URL is plain http sends GitHub an http
// OAuth callback (GitHub rejects it) and issues auth cookies without Secure.
// Local `next start` on localhost is still allowed.
function assertHttpsAuthUrl(): void {
  const authUrl = process.env.AUTH_URL?.trim()
  if (process.env.NODE_ENV !== 'production' || !authUrl) return
  let url: URL
  try {
    url = new URL(authUrl)
  } catch {
    throw new Error(
      `AUTH_URL is not a valid URL: ${authUrl}. Set it to the public origin, e.g. https://bbass.co.`,
    )
  }
  if (url.protocol === 'https:' || isLocalHostname(url.hostname)) return
  throw new Error(
    `AUTH_URL must use https in production (got ${authUrl}). ` +
      `Set AUTH_URL=https://${url.host} in the app's environment variables and redeploy.`,
  )
}

export function validateRequiredEnv(): void {
  assertHttpsAuthUrl()
  const required = isProd() ? REQUIRED_IN_PROD : REQUIRED_ALWAYS
  const missing: string[] = []
  for (const name of required) {
    if (!process.env[name] || process.env[name]?.trim() === '') {
      missing.push(name)
    }
  }
  if (missing.length > 0) {
    const list = missing.join(', ')
    throw new Error(
      `Missing required environment variable(s): ${list}. ` +
        `In production, all of [${REQUIRED_IN_PROD.join(', ')}] must be set. ` +
        `Check the app's environment variables on Layerbase or your .env file.`,
    )
  }
}

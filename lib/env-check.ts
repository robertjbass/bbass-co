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

export function validateRequiredEnv(): void {
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
        `Check your Vercel project settings or .env file.`,
    )
  }
}

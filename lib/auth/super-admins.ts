// Hard-coded super-admin allowlist.
//
// Some accounts are too important to leave to database state. If a DB
// migration loses the `role` column value, an admin gets demoted by
// accident in the Payload admin, or a stale ENV/seed creates a fresh
// user row for a long-lived email, we want those identities to STILL
// be Admin without ceremony.
//
// The list lives in code (always present) plus an env-var supplement
// (per-environment overrides without a redeploy). Anything in either
// is treated as super-admin: requireAuthenticated forces their role
// to Admin in memory regardless of the DB value, and the OAuth signIn
// callback writes role=Admin to the DB on every login so the row
// catches up too.
//
// Editing the hard-coded list IS a code change - it requires a deploy
// to take effect. Use the env var (SUPER_ADMIN_EMAILS, comma-separated)
// for ad-hoc additions that don't justify a release.

const HARDCODED_SUPER_ADMINS: readonly string[] = ['bob@bbass.co'] as const

function parseEnvList(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
}

const ENV_SUPER_ADMINS = parseEnvList()

const SUPER_ADMIN_SET = new Set<string>(
  [...HARDCODED_SUPER_ADMINS, ...ENV_SUPER_ADMINS].map((s) => s.toLowerCase()),
)

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return SUPER_ADMIN_SET.has(email.toLowerCase())
}

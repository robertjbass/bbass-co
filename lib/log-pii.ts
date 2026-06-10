import { createHash } from 'node:crypto'

/**
 * Short, non-reversible identifier for an email - safe for logs.
 *
 * FW2: logs must never contain raw emails (operator access to logs is
 * broader than operator access to the user DB; minimize PII surface).
 * Use {@link emailHash} when you need a stable "which user is this"
 * tag in a log line. For anything richer, prefer the numeric user ID.
 *
 * One deliberate exception: the GDPR audit trail in
 * `collections/User/hooks.ts` `purgeCloudResourcesAfterDelete` logs the raw
 * email as the compliance artifact. Do not replace it there.
 */
export function emailHash(email: string): string {
  return createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex')
    .slice(0, 8)
}

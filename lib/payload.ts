import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { setServerLogger } from '@/lib/logger'

let cached: Payload | null = null
let initPromise: Promise<Payload> | null = null

export async function getPayloadClient(): Promise<Payload> {
  if (cached) return cached
  if (initPromise) return initPromise

  initPromise = getPayload({ config })
    .then((payload) => {
      cached = payload
      // Inject Payload's pino instance so our createLogger() wrappers
      // emit through the same structured log stream the rest of the app
      // uses (queryable in Better Stack / Axiom).
      setServerLogger(
        payload.logger as unknown as Parameters<typeof setServerLogger>[0],
      )
      return payload
    })
    .catch((error) => {
      initPromise = null
      throw error
    })

  return initPromise
}

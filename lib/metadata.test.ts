import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// Relative .ts import: node --experimental-strip-types doesn't honor path
// aliases or implicit extensions.
import { computeShouldNoindex } from './metadata.ts'

describe('computeShouldNoindex', () => {
  describe('VERCEL_ENV=production', () => {
    it('is indexable on the production domain', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'production',
          siteUrl: 'https://bbass.co',
        }),
        false,
      )
    })

    it('is indexable even when SITE_URL accidentally falls back to a .vercel.app domain (the historical bug)', () => {
      // This is the regression we are guarding against: VERCEL_URL is
      // ALWAYS a .vercel.app URL on Vercel, including production
      // deployments. The previous logic noindexed the entire site
      // because the .vercel.app substring matched. VERCEL_ENV must win.
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'production',
          siteUrl: 'https://bbass-co-abc123.vercel.app',
        }),
        false,
      )
    })

    it('is indexable even with a dev. subdomain SITE_URL (env wins)', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'production',
          siteUrl: 'https://dev.bbass.co',
        }),
        false,
      )
    })
  })

  describe('VERCEL_ENV=preview', () => {
    it('noindexes a preview deployment', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'preview',
          siteUrl: 'https://bbass-co-abc123.vercel.app',
        }),
        true,
      )
    })

    it('noindexes even if SITE_URL was misconfigured to the prod domain', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'preview',
          siteUrl: 'https://bbass.co',
        }),
        true,
      )
    })
  })

  describe('VERCEL_ENV=development', () => {
    it('noindexes the vercel dev command', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'development',
          siteUrl: 'http://localhost:3000',
        }),
        true,
      )
    })
  })

  describe('no Vercel context (local dev or self-hosted)', () => {
    it('noindexes localhost', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: undefined,
          siteUrl: 'http://localhost:3000',
        }),
        true,
      )
    })

    it('noindexes dev. subdomains', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: undefined,
          siteUrl: 'https://dev.bbass.co',
        }),
        true,
      )
    })

    it('noindexes raw .vercel.app domains', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: undefined,
          siteUrl: 'https://bbass-co-abc.vercel.app',
        }),
        true,
      )
    })

    it('indexes a self-hosted production domain', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: undefined,
          siteUrl: 'https://bbass.co',
        }),
        false,
      )
    })

    it('indexes a self-hosted production domain on a custom TLD', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: undefined,
          siteUrl: 'https://example.dev',
        }),
        false,
      )
    })
  })

  describe('edge cases', () => {
    it('treats unknown VERCEL_ENV values as no-context (falls back to URL inspection)', () => {
      // Future-proofing: if Vercel ever adds a new env value, do not
      // silently flip indexing. Fall back to inspecting the URL.
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'staging',
          siteUrl: 'https://bbass.co',
        }),
        false,
      )
      assert.equal(
        computeShouldNoindex({
          vercelEnv: 'staging',
          siteUrl: 'http://localhost:3000',
        }),
        true,
      )
    })

    it('treats empty string VERCEL_ENV as undefined', () => {
      assert.equal(
        computeShouldNoindex({
          vercelEnv: '',
          siteUrl: 'https://bbass.co',
        }),
        false,
      )
    })
  })
})

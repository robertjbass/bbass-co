// Hand-curated featured posts for the /blog hero section.
//
// Pick 3-4 posts with the highest conversion potential or strongest match
// against current search trends. Order matters; index 0 is rendered first.
// Update this list as the editorial mix shifts; the rest of the blog
// listing reorganizes itself automatically.

export const FEATURED_POST_SLUGS: ReadonlyArray<string> = [
  'motherduck-pricing-changes-2026', // News-driven; MotherDuck killed cheap plan
  'cloudant-alternatives', // Owns the managed-CouchDB-with-free-tier category
  'best-database-for-nextjs-vercel', // High search volume after Vercel Postgres wound down
  'payloadcms-database-setup', // Bridges Payload audience to Postgres + FerretDB
]

export function isFeaturedSlug(slug: string): boolean {
  return FEATURED_POST_SLUGS.includes(slug)
}

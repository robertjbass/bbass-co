// Categorize blog posts by their slug pattern.
//
// Engine-name tags (PostgreSQL, MongoDB, etc.) already exist in the CMS, but
// they answer "which engine?" rather than "what kind of post is this?". The
// /blog index needs the second axis to feel organized, so we derive it from
// the slug pattern instead of asking authors to add a second tag manually.
//
// Patterns are checked top-down; the first match wins. Order matters
// (e.g. "docker-compose-vs-spindb" must be caught by the setup-guide rule
// before the "X-vs-Y" rule generalizes to it).

export type BlogCategory =
  | 'featured'
  | 'migration'
  | 'alternative'
  | 'comparison'
  | 'getting-started'
  | 'picker'
  | 'concept'
  | 'setup'
  | 'other'

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  featured: 'Featured',
  migration: 'Switching databases',
  alternative: 'Switching databases',
  comparison: 'Comparing databases',
  'getting-started': 'Getting started by engine',
  picker: 'Pick the right database',
  concept: 'Concepts and deep dives',
  setup: 'Local setup and tooling',
  other: 'Everything else',
}

// Sections in render order. "featured" and "other" are special-cased by the
// listing component; everything else here drives section order. We merge
// migration + alternative into one bucket because users skimming the page
// read both with the same intent ("I want to switch off X").
export const SECTION_ORDER: ReadonlyArray<BlogCategory> = [
  'migration',
  'comparison',
  'getting-started',
  'picker',
  'concept',
  'setup',
  'other',
]

export function categorizePost(slug: string): BlogCategory {
  const s = slug.toLowerCase()

  // Setup-and-tooling guides come BEFORE the X-vs-Y rule because some of
  // them include "vs" in the slug (docker-compose-vs-spindb).
  if (
    s.endsWith('-on-windows-without-docker') ||
    s === 'run-databases-locally-without-docker' ||
    s === 'managing-multiple-databases-locally' ||
    s === 'docker-compose-vs-spindb' ||
    s === 'database-cheat-sheet'
  ) {
    return 'setup'
  }

  if (s.startsWith('getting-started-with-')) return 'getting-started'

  if (s.startsWith('migrating-from-')) return 'migration'

  if (
    s.endsWith('-alternatives') ||
    s.includes('-deprecations-') ||
    s.includes('-pricing-changes-') ||
    s.includes('-after-') // "neon-after-databricks" style news
  ) {
    return 'alternative'
  }

  if (s.startsWith('best-database-for-') || s.startsWith('which-')) {
    return 'picker'
  }

  if (s.startsWith('what-is-a-')) return 'concept'

  // X-vs-Y comparisons: enforce the dash-vs-dash shape so we don't capture
  // unrelated slugs that happen to contain "vs".
  if (/-vs-/.test(s)) return 'comparison'

  // Concept-ish: collections, multi-engine guides, version highlights
  if (
    s === 'embedded-databases' ||
    s === 'fulltext-search-vs-vector-search' || // already caught by vs, but defensive
    s === 'managed-tigerbeetle' ||
    s === 'serverless-couchdb' ||
    s === 'payloadcms-database-setup' ||
    s.startsWith('vector-databases-compared') ||
    s.startsWith('whats-new-in-')
  ) {
    return 'concept'
  }

  return 'other'
}

// Bucket a populated post list into one bucket per category. Caller
// provides the slug extractor because callers store the slug on different
// shapes (nested under .post for the Payload listing entry, etc.).
// Posts in each bucket keep their input order so the listing component
// can sort them (newest first by publishedAt) without re-running this
// helper.
export function bucketByCategory<T>(
  posts: ReadonlyArray<T>,
  getSlug: (post: T) => string,
): Record<BlogCategory, T[]> {
  const buckets: Record<BlogCategory, T[]> = {
    featured: [],
    migration: [],
    alternative: [],
    comparison: [],
    'getting-started': [],
    picker: [],
    concept: [],
    setup: [],
    other: [],
  }
  for (const post of posts) {
    buckets[categorizePost(getSlug(post))].push(post)
  }
  return buckets
}

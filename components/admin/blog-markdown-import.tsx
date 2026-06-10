'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import type { MarkdownCandidate } from '@/app/(payload)/api/blog/markdown-candidates/route'

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; candidates: MarkdownCandidate[] }
  | { kind: 'error'; message: string }

const styles = {
  wrapper: {
    marginTop: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'flex-end',
  } satisfies CSSProperties,
  triggerButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-1000)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  } satisfies CSSProperties,
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  } satisfies CSSProperties,
  dialog: {
    width: '100%',
    maxWidth: '640px',
    maxHeight: '80vh',
    backgroundColor: 'var(--theme-elevation-0)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '6px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
  } satisfies CSSProperties,
  header: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--theme-elevation-150)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  } satisfies CSSProperties,
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--theme-elevation-1000)',
  } satisfies CSSProperties,
  subtitle: {
    margin: '0.25rem 0 0',
    fontSize: '0.8125rem',
    color: 'var(--theme-elevation-600)',
    lineHeight: 1.4,
  } satisfies CSSProperties,
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--theme-elevation-600)',
    fontSize: '1.25rem',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
  } satisfies CSSProperties,
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    backgroundColor: 'var(--theme-elevation-50)',
    color: 'var(--theme-elevation-1000)',
    outline: 'none',
  } satisfies CSSProperties,
  searchRow: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid var(--theme-elevation-150)',
  } satisfies CSSProperties,
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
  } satisfies CSSProperties,
  candidate: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem 0.875rem',
    marginBottom: '0.25rem',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--theme-elevation-1000)',
  } satisfies CSSProperties,
  candidateHover: {
    backgroundColor: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-150)',
  } satisfies CSSProperties,
  candidateTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  } satisfies CSSProperties,
  candidateMeta: {
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-600)',
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  } satisfies CSSProperties,
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--theme-elevation-600)',
    fontSize: '0.875rem',
  } satisfies CSSProperties,
  errorBanner: {
    margin: '0.75rem 1.25rem',
    padding: '0.625rem 0.875rem',
    backgroundColor: 'var(--theme-error-50, rgba(239, 68, 68, 0.1))',
    border: '1px solid var(--theme-error-200, rgba(239, 68, 68, 0.3))',
    color: 'var(--theme-error-700, #b91c1c)',
    fontSize: '0.8125rem',
    borderRadius: '4px',
  } satisfies CSSProperties,
  importingLabel: {
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-600)',
    marginLeft: '0.5rem',
  } satisfies CSSProperties,
} as const

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BlogMarkdownImport() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [state, setState] = useState<LoadState>({ kind: 'idle' })
  const [importingSlug, setImportingSlug] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function loadCandidates() {
      setState({ kind: 'loading' })
      try {
        const res = await fetch('/api/blog/markdown-candidates', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string
          } | null
          throw new Error(body?.error ?? `Failed (${res.status})`)
        }
        const data = (await res.json()) as { candidates: MarkdownCandidate[] }
        if (cancelled) return
        setState({ kind: 'ready', candidates: data.candidates })
      } catch (error) {
        if (cancelled) return
        const message =
          error instanceof Error ? error.message : 'Failed to load candidates'
        setState({ kind: 'error', message })
      }
    }

    loadCandidates()

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleImport(candidate: MarkdownCandidate) {
    setImportingSlug(candidate.slug)
    setImportError(null)
    try {
      const res = await fetch('/api/blog/import-from-markdown', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: candidate.slug }),
      })
      const body = (await res.json().catch(() => null)) as {
        id?: number
        slug?: string
        error?: string
      } | null
      if (!res.ok || !body?.id) {
        throw new Error(body?.error ?? `Import failed (${res.status})`)
      }
      setOpen(false)
      router.push(`/admin/collections/blog/${body.id}`)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to import markdown post'
      setImportError(message)
    } finally {
      setImportingSlug(null)
    }
  }

  const filteredCandidates =
    state.kind === 'ready'
      ? state.candidates.filter((c) => {
          if (!search.trim()) return true
          const q = search.trim().toLowerCase()
          return (
            c.title.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q) ||
            c.filename.toLowerCase().includes(q)
          )
        })
      : []

  return (
    <div style={styles.wrapper}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={styles.triggerButton}
        title="Create a new blog post pre-filled from a content/blog/*.md file"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6" />
          <path d="M9 15l3 3 3-3" />
        </svg>
        Import from Markdown
      </button>

      {open && (
        <div
          style={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-import-title"
        >
          <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div style={styles.header}>
              <div>
                <h2 id="blog-import-title" style={styles.title}>
                  Import from markdown
                </h2>
                <p style={styles.subtitle}>
                  Creates a draft blog post from a{' '}
                  <code>content/blog/*.md</code> file whose slug isn&apos;t
                  already in the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={styles.closeButton}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={styles.searchRow}>
              <input
                type="search"
                placeholder="Search by title, slug, or filename"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
                autoFocus
              />
            </div>

            {importError && <div style={styles.errorBanner}>{importError}</div>}

            <div style={styles.list}>
              {state.kind === 'loading' && (
                <div style={styles.emptyState}>Loading candidates…</div>
              )}
              {state.kind === 'error' && (
                <div style={styles.emptyState}>Failed: {state.message}</div>
              )}
              {state.kind === 'ready' && state.candidates.length === 0 && (
                <div style={styles.emptyState}>
                  No unimported markdown files found. Every{' '}
                  <code>content/blog/*.md</code> slug already has a DB record.
                </div>
              )}
              {state.kind === 'ready' &&
                state.candidates.length > 0 &&
                filteredCandidates.length === 0 && (
                  <div style={styles.emptyState}>
                    No candidates match "{search}".
                  </div>
                )}
              {state.kind === 'ready' &&
                filteredCandidates.map((c) => {
                  const isHovered = hovered === c.slug
                  const isImporting = importingSlug === c.slug
                  const buttonStyle: CSSProperties = {
                    ...styles.candidate,
                    ...(isHovered ? styles.candidateHover : {}),
                    opacity: importingSlug && !isImporting ? 0.5 : 1,
                    cursor:
                      importingSlug && !isImporting ? 'not-allowed' : 'pointer',
                  }
                  const dateLabel = formatDate(c.publishedAt)
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      disabled={importingSlug !== null}
                      onClick={() => handleImport(c)}
                      onMouseEnter={() => setHovered(c.slug)}
                      onMouseLeave={() => setHovered(null)}
                      style={buttonStyle}
                    >
                      <div style={styles.candidateTitle}>
                        {c.title}
                        {isImporting && (
                          <span style={styles.importingLabel}>Importing…</span>
                        )}
                      </div>
                      <div style={styles.candidateMeta}>
                        <span>
                          <code>{c.slug}</code>
                        </span>
                        <span>· {c.type}</span>
                        {dateLabel && <span>· {dateLabel}</span>}
                        {c.tagCount > 0 && (
                          <span>
                            · {c.tagCount} tag{c.tagCount === 1 ? '' : 's'}
                          </span>
                        )}
                        {c.hasSeo && <span>· SEO</span>}
                      </div>
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogMarkdownImport

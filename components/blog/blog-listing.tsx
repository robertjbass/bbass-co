'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Search, X } from 'lucide-react'
import type { Blog, Tag } from '@/payload-types'
import { formatDate } from '@/lib/blog/utils'
import {
  bucketByCategory,
  CATEGORY_LABELS,
  SECTION_ORDER,
  type BlogCategory,
} from '@/lib/blog/categorize'
import { FEATURED_POST_SLUGS, isFeaturedSlug } from '@/lib/blog/featured'
import { cn } from '@/lib/cn'

type ListedPostEntry = {
  post: Pick<Blog, 'id' | 'title' | 'slug' | 'excerpt' | 'publishedAt'>
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[]
}

type BlogListingProps = {
  posts: ListedPostEntry[]
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[]
}

// How many posts to show per topic section before linking out to the full
// tag-filtered view.
const SECTION_PREVIEW_COUNT = 6

function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function entrySlug(entry: ListedPostEntry): string {
  return entry.post.slug ?? ''
}

function sortByPublishedAtDesc(a: ListedPostEntry, b: ListedPostEntry) {
  const at = a.post.publishedAt ? Date.parse(a.post.publishedAt) : 0
  const bt = b.post.publishedAt ? Date.parse(b.post.publishedAt) : 0
  return bt - at
}

export function BlogListing({ posts, tags }: BlogListingProps) {
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') ?? undefined
  const [query, setQuery] = useState('')
  const normalizedQuery = normalizeSearchText(query)

  // When a tag or search is active, fall back to the flat-list mode. The
  // section grouping only really helps when nothing is filtered; once the
  // user has narrowed by tag or query they want a simple list of matches.
  const isFiltered = Boolean(activeTag) || normalizedQuery.length > 0

  const filteredPosts = useMemo(() => {
    const taggedPosts = activeTag
      ? posts.filter((entry) =>
          entry.tags.some((tag) => tag.slug === activeTag),
        )
      : posts

    if (!normalizedQuery) return taggedPosts

    return taggedPosts.filter(({ post, tags: postTags }) => {
      const searchable = normalizeSearchText(
        [
          post.title,
          post.excerpt,
          post.slug,
          ...postTags.map((tag) => tag.name),
          ...postTags.map((tag) => tag.slug),
        ]
          .filter(Boolean)
          .join(' '),
      )

      return searchable.includes(normalizedQuery)
    })
  }, [posts, activeTag, normalizedQuery])

  const resultLabel =
    filteredPosts.length === 1
      ? '1 post'
      : `${filteredPosts.length.toLocaleString()} posts`

  // Group the unfiltered list into category buckets for the section render.
  // Featured posts are pulled out by slug allowlist; everything else falls
  // through the categorizer.
  const grouped = useMemo(() => {
    const featured = FEATURED_POST_SLUGS.map((slug) =>
      posts.find((p) => entrySlug(p) === slug),
    ).filter((p): p is ListedPostEntry => Boolean(p))
    const featuredSlugs = new Set(featured.map(entrySlug))
    const remaining = posts.filter((p) => !featuredSlugs.has(entrySlug(p)))
    return { featured, buckets: bucketByCategory(remaining, entrySlug) }
  }, [posts])

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="site-display text-4xl md:text-5xl">Blog</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Writing on TypeScript, developer tooling, building products, and
          lessons from shipping software.
        </p>
        <div className="mt-7 max-w-2xl">
          <label htmlFor="blog-search" className="sr-only">
            Search blog posts
          </label>
          <div className="site-ring relative rounded-lg border bg-background/80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="blog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts by title or topic"
              className="min-h-11 w-full rounded-lg bg-transparent py-2 pl-10 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isFiltered
              ? `${resultLabel} matching current filters`
              : `${resultLabel} across the blog`}
          </p>
        </div>
      </header>

      <div className="flex gap-12 lg:gap-16">
        {tags.length > 0 && (
          <aside id="blog-sidebar" className="hidden md:block">
            <nav className="sticky top-32 flex flex-col gap-1.5">
              <Link
                href="/blog"
                className={cn(
                  'text-sm transition-colors hover:text-foreground',
                  activeTag
                    ? 'text-muted-foreground'
                    : 'font-medium text-foreground',
                )}
              >
                all posts
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className={cn(
                    'text-sm transition-colors hover:text-foreground',
                    activeTag === tag.slug
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {tag.name.toLowerCase()}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <div id="blog-content" className="min-w-0 flex-1">
          {tags.length > 0 && (
            <div className="relative mb-8 md:hidden">
              <nav
                id="mobile-tag-bar"
                aria-label="Blog tags"
                className="flex gap-3 overflow-x-auto pb-2"
              >
                <Link
                  href="/blog"
                  className={cn(
                    'shrink-0 text-sm transition-colors',
                    activeTag
                      ? 'text-muted-foreground'
                      : 'font-medium text-foreground',
                  )}
                >
                  all posts
                </Link>
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className={cn(
                      'shrink-0 text-sm transition-colors',
                      activeTag === tag.slug
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tag.name.toLowerCase()}
                  </Link>
                ))}
              </nav>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent"
                aria-hidden
              />
            </div>
          )}

          {isFiltered ? (
            <FilteredList
              posts={filteredPosts}
              normalizedQuery={normalizedQuery}
              activeTag={activeTag}
            />
          ) : (
            <SectionedListing grouped={grouped} />
          )}
        </div>
      </div>
    </div>
  )
}

function SectionedListing({
  grouped,
}: {
  grouped: {
    featured: ListedPostEntry[]
    buckets: Record<BlogCategory, ListedPostEntry[]>
  }
}) {
  const { featured, buckets } = grouped

  return (
    <div className="space-y-16">
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading">
          <SectionHeading id="featured-heading" title="Featured" />
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((entry) => (
              <PostCard key={entry.post.id} entry={entry} prominent />
            ))}
          </div>
        </section>
      )}

      {SECTION_ORDER.map((category) => {
        // We render migration + alternative under one heading because
        // readers cross-shop them.
        const items =
          category === 'migration'
            ? [...buckets.migration, ...buckets.alternative].sort(
                sortByPublishedAtDesc,
              )
            : (buckets[category]?.slice().sort(sortByPublishedAtDesc) ?? [])

        if (items.length === 0) return null

        const headingId = `section-${category}`
        const visible = items.slice(0, SECTION_PREVIEW_COUNT)
        const hasMore = items.length > visible.length

        return (
          <section key={category} aria-labelledby={headingId}>
            <SectionHeading
              id={headingId}
              title={CATEGORY_LABELS[category]}
              description={describeSection(category)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {visible.map((entry) => (
                <PostCard key={entry.post.id} entry={entry} />
              ))}
            </div>
            {hasMore && (
              <p className="mt-4 text-sm text-muted-foreground">
                {items.length - visible.length} more in this section. Use the
                search box above or the tag sidebar to find specific posts.
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}

function FilteredList({
  posts,
  normalizedQuery,
  activeTag,
}: {
  posts: ListedPostEntry[]
  normalizedQuery: string
  activeTag?: string
}) {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">
        {normalizedQuery
          ? 'No posts match that search.'
          : activeTag
            ? 'No posts with this tag yet.'
            : 'No posts yet. Check back soon.'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((entry) => (
        <PostListRow key={entry.post.id} entry={entry} />
      ))}
    </div>
  )
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-6">
      <h2 id={id} className="site-subheading text-2xl text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

function PostCard({
  entry,
  prominent = false,
}: {
  entry: ListedPostEntry
  prominent?: boolean
}) {
  const { post, tags: postTags } = entry
  const firstTag = postTags[0]
  const featured = isFeaturedSlug(post.slug ?? '')
  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          'site-card group flex h-full flex-col rounded-lg border px-5 py-5 transition-colors hover:bg-card',
          prominent && 'ring-1 ring-primary/10',
        )}
      >
        <h3
          className={cn(
            'site-subheading text-foreground transition-colors group-hover:text-primary',
            prominent ? 'text-xl' : 'text-lg',
          )}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          {firstTag && (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 font-medium text-primary">
              {firstTag.name.toLowerCase()}
            </span>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          {featured && (
            <span className="ml-auto inline-flex items-center gap-1 text-foreground">
              Read
              <ArrowRight className="size-3" />
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}

function PostListRow({ entry }: { entry: ListedPostEntry }) {
  const { post, tags: postTags } = entry
  const firstTag = postTags[0]
  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className="site-card group block rounded-lg border px-4 py-6 transition-colors hover:bg-card"
      >
        <h2 className="site-subheading text-2xl text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-base text-muted-foreground">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          {firstTag && (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
              {firstTag.name.toLowerCase()}
            </span>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
        </div>
      </Link>
    </article>
  )
}

function describeSection(category: BlogCategory): string | undefined {
  switch (category) {
    case 'migration':
      return 'Migrations, alternatives, and head-to-head comparisons for teams switching off an incumbent.'
    case 'comparison':
      return 'Side-by-side comparisons of overlapping engines.'
    case 'getting-started':
      return 'Tutorials for each engine, with copy-paste code you can run locally.'
    case 'picker':
      return 'Help choosing the right engine for your use case.'
    case 'concept':
      return 'Background reading and category overviews.'
    case 'setup':
      return 'Running databases locally, on Windows, or without Docker.'
    default:
      return undefined
  }
}

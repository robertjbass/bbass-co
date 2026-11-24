'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Blog, Tag } from '@/payload-types'
import { formatDate } from '@/lib/blog/utils'
type ListedPostEntry = {
  post: Pick<
    Blog,
    'id' | 'title' | 'slug' | 'excerpt' | 'publishedAt' | 'featured'
  >
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[]
}

type BlogListingProps = {
  posts: ListedPostEntry[]
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[]
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function TaggedBlogListing(props: BlogListingProps) {
  const searchParams = useSearchParams()
  return (
    <BlogListing {...props} activeTag={searchParams.get('tag') ?? undefined} />
  )
}

export function BlogListing({
  posts,
  tags,
  activeTag,
}: BlogListingProps & { activeTag?: string }) {
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

  const showFilters = posts.length >= 8 || Boolean(activeTag)
  const lead = isFiltered
    ? undefined
    : (posts.find(({ post }) => post.featured) ?? posts[0])
  const archive = filteredPosts.filter(
    ({ post }) => post.slug !== lead?.post.slug,
  )

  return (
    <div>
      <h1 className="site-display mb-10 text-5xl">Writing</h1>
      {lead && (
        <article className="mb-10 border-t border-border pt-7">
          {lead.post.publishedAt && (
            <time
              className="font-mono text-xs text-muted-foreground"
              dateTime={lead.post.publishedAt}
            >
              {formatDate(lead.post.publishedAt)}
            </time>
          )}
          <h2 className="site-heading mt-4 max-w-xl text-3xl leading-tight md:text-5xl">
            <Link className="hover:underline" href={`/blog/${lead.post.slug}`}>
              {lead.post.title}
            </Link>
          </h2>
          {lead.post.excerpt && (
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              {lead.post.excerpt}
            </p>
          )}
        </article>
      )}
      {showFilters && (
        <div className="mb-6 space-y-3">
          <label className="block text-sm">
            Search posts
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 block w-full rounded border border-border p-2"
            />
          </label>
          <nav
            aria-label="Filter by tag"
            className="flex flex-wrap gap-4 text-sm"
          >
            <Link href="/blog">All posts</Link>
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                aria-current={activeTag === tag.slug ? 'page' : undefined}
                href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
              >
                {tag.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
      {archive.map(({ post }) => (
        <article key={post.slug} className="border-t border-border py-5">
          {post.publishedAt && (
            <time
              className="font-mono text-xs text-muted-foreground"
              dateTime={post.publishedAt}
            >
              {formatDate(post.publishedAt)}
            </time>
          )}
          <h2 className="site-heading mt-2 text-2xl">
            <Link className="hover:underline" href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
          )}
        </article>
      ))}
      {!filteredPosts.length && (
        <p>
          {isFiltered
            ? 'No posts match this filter.'
            : 'No posts published yet.'}
        </p>
      )}
    </div>
  )
}

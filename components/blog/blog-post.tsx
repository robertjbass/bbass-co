import Link from 'next/link'
import { BlogEditLink } from './blog-edit-link'
import { ArrowLeft } from 'lucide-react'
import type { Blog, Tag } from '@/payload-types'
import { MarkdownContent } from '@/components/blog/markdown-content'
import { formatDate } from '@/lib/blog/utils'

type BlogPostProps = {
  post: Blog
  tags?: Tag[]
  markdown?: string
  author?: string
  editableId?: number
}

export function BlogPost({
  post,
  tags = [],
  markdown,
  author,
  editableId,
}: BlogPostProps) {
  return (
    <div className="mx-auto max-w-180">
      <nav className="mb-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to blog
        </Link>
      </nav>

      <article>
        <header className="mb-8">
          <h1 className="site-heading mb-4 text-3xl md:text-[2.5rem]">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {author && <span>By {author}</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="site-ring rounded-md border bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary/80"
              >
                {tag.name}
              </span>
            ))}
            {editableId !== undefined && <BlogEditLink id={editableId} />}
          </div>
          <div className="mt-6 border-t border-border" />
        </header>

        <div className="prose md:prose-lg max-w-none prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-[0.875em] prose-code:before:content-none prose-code:after:content-none">
          <MarkdownContent content={markdown ?? ''} />
        </div>

        <footer className="mt-16 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to blog
          </Link>
        </footer>
      </article>
    </div>
  )
}

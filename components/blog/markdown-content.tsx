import {
  markdownInlineCode,
  markdownTableComponents,
} from '@/components/blog/markdown-table'
import { isValidElement } from 'react'
import { MarkdownAsync } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { codeToHtml } from 'shiki'
import { CodeCopyButton } from '@/components/blog/code-copy-button'
import type { Components } from 'react-markdown'
import { blogLinkAttrs } from '@/lib/blog/link-policy'

const THEMES = {
  light: 'github-light',
  dark: 'night-owl',
} as const

async function ShikiCodeBlock({
  code,
  language,
}: {
  code: string
  language: string
}) {
  let html: string
  try {
    html = await codeToHtml(code, {
      lang: language,
      themes: THEMES,
      defaultColor: false,
    })
  } catch {
    html = `<pre><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  }

  return (
    <div className="site-terminal not-prose my-8 overflow-hidden rounded-lg border border-border text-sm dark:border-white/10 dark:bg-neutral-900/95 [&_pre]:rounded-t-none [&_pre]:p-4">
      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5">
        <span>{language}</span>
        <CodeCopyButton code={code} />
      </div>
      <div
        className="overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function extractTextContent(node: unknown): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractTextContent).join('')
  if (
    node &&
    typeof node === 'object' &&
    'props' in node &&
    typeof (node as { props: { children?: unknown } }).props === 'object'
  ) {
    return extractTextContent(
      (node as { props: { children?: unknown } }).props.children,
    )
  }
  return ''
}

// GitHub-style heading slug, matching the `#anchor` targets the posts' own
// "## Contents" tables of contents link to. Without an id on the heading those
// in-post anchors are dead, so we slug every heading the same way the links
// assume.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// The language a fenced block declared, or 'text' when it declared none.
// react-markdown puts the fence's info string on the inner <code> element as
// `language-<lang>`; a bare ``` fence has no class at all.
function fenceLanguage(children: unknown): string {
  const child = Array.isArray(children) ? children[0] : children
  if (!isValidElement<{ className?: string }>(child)) return 'text'
  return child.props.className?.match(/language-([^\s]+)/)?.[1] ?? 'text'
}

const components: Components = {
  // Fenced blocks are handled HERE rather than in `code` below, because the
  // <pre> wrapper is the only reliable signal that a block is a fence at all:
  // markdown compiles both inline code and fenced code to a <code> element,
  // and a fence with no language tag carries no `language-*` class to tell
  // them apart. Handling it in `code` meant every bare ``` fence fell through
  // to the inline branch and rendered as wrapped prose instead of a code
  // block. An untagged fence renders as plain `text` instead.
  pre({ children }) {
    return (
      <ShikiCodeBlock
        code={extractTextContent(children).replace(/\n$/, '')}
        language={fenceLanguage(children)}
      />
    )
  },
  // `scroll-mt` keeps the anchored heading clear of the sticky nav on jump.
  h2({ children }) {
    return (
      <h2 id={slugify(extractTextContent(children))} className="scroll-mt-24">
        {children}
      </h2>
    )
  },
  h3({ children }) {
    return (
      <h3 id={slugify(extractTextContent(children))} className="scroll-mt-24">
        {children}
      </h3>
    )
  },
  h4({ children }) {
    return (
      <h4 id={slugify(extractTextContent(children))} className="scroll-mt-24">
        {children}
      </h4>
    )
  },
  // Inline code only: `pre` above intercepts every fenced block before its
  // child <code> is ever rendered.
  code: markdownInlineCode,
  ...markdownTableComponents,
  // `node` is react-markdown's mdast node. It is not a DOM attribute, so it has
  // to be destructured off before the rest is spread onto the anchor - it was
  // rendering `node="[object Object]"` into the markup of every blog link.
  //
  // href / title / target / rel are decided by lib/blog/link-policy.ts: internal
  // links stay plain, third-party links open in a new tab with nofollow, and a
  // link titled "follow" is the editorial opt-in for a dofollow outbound link.
  a({ href, title, children, node: _node, ...props }) {
    return (
      <a {...props} {...blogLinkAttrs({ href, title })}>
        {children}
      </a>
    )
  },
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <MarkdownAsync remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </MarkdownAsync>
  )
}

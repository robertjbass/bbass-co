import { MarkdownAsync } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { codeToHtml } from 'shiki'
import { CodeCopyButton } from '@/components/blog/code-copy-button'
import type { Components } from 'react-markdown'

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

const components: Components = {
  pre({ children }) {
    return <>{children}</>
  },
  async code({ className, children }) {
    const match = className?.match(/language-([^\s]+)/)
    if (!match) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-[0.875em]">
          {children}
        </code>
      )
    }

    const language = match[1]
    const code = extractTextContent(children).replace(/\n$/, '')
    return <ShikiCodeBlock code={code} language={language} />
  },
  table({ children }) {
    return (
      <div className="not-prose relative my-8">
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full border-collapse text-left text-sm">
            {children}
          </table>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-6 rounded-r-lg bg-linear-to-l from-background to-transparent md:hidden"
          aria-hidden
        />
      </div>
    )
  },
  thead({ children }) {
    return (
      <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
        {children}
      </thead>
    )
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-border">{children}</tbody>
  },
  tr({ children }) {
    return <tr className="transition-colors hover:bg-muted/30">{children}</tr>
  },
  th({ children }) {
    return (
      <th className="px-4 py-2.5 align-middle font-semibold text-foreground">
        {children}
      </th>
    )
  },
  td({ children }) {
    return (
      <td className="px-4 py-2.5 align-top text-foreground [&_code]:whitespace-nowrap">
        {children}
      </td>
    )
  },
  a({ href, children, ...props }) {
    const isExternal = href?.startsWith('http')
    return (
      <a
        {...props}
        href={href}
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        })}
      >
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

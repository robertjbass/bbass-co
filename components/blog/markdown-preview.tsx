import {
  markdownInlineCode,
  markdownTableComponents,
} from '@/components/blog/markdown-table'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogLinkAttrs } from '@/lib/blog/link-policy'

export function MarkdownPreview({ source }: { source: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...markdownTableComponents,
        code: markdownInlineCode,
        a: ({ href, title, children }) => (
          <a {...blogLinkAttrs({ href, title })}>{children}</a>
        ),
      }}
    >
      {source}
    </Markdown>
  )
}

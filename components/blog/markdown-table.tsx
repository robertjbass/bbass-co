import type { Components } from 'react-markdown'

export const markdownTableComponents = {
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
} satisfies Components

export const markdownInlineCode: NonNullable<Components['code']> =
  function MarkdownInlineCode({ children }) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-[0.875em]">
        {children}
      </code>
    )
  }

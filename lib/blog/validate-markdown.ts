import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

const parser = unified().use(remarkParse).use(remarkGfm)
type MarkdownTree = ReturnType<typeof parser.parse>
export function validateMarkdown(body: string) {
  const tree = parser.parse(body)
  function inspect(node: MarkdownTree | MarkdownTree['children'][number]) {
    const position = node.position
    const source = body.slice(position?.start.offset, position?.end.offset)
    const location = ' on body line ' + position?.start.line
    if (node.type === 'code') {
      const lines = source.split(/\r?\n/)
      const fence = /^(`{3,}|~{3,})/.exec(lines[0])?.[1]
      if (
        fence &&
        (lines.length < 2 ||
          !new RegExp(
            '^\\s*(?:>\\s*)*' + fence[0] + '{' + fence.length + ',}\\s*$',
          ).test(lines.at(-1) ?? ''))
      ) {
        throw new Error('Close the code fence opened' + location)
      }
    }
    if (node.type === 'text' && /(?<!\\)\[[^\]\n]+\]\(/.test(source))
      throw new Error('Repair the Markdown link' + location)
    if (
      (node.type === 'link' ||
        node.type === 'image' ||
        node.type === 'definition') &&
      !node.url.trim()
    )
      throw new Error('Add a link or image destination' + location)
    if ('children' in node) for (const child of node.children) inspect(child)
  }
  inspect(tree)
}

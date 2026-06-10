// To revert to database-only blog:
// 1. Set IS_MARKDOWN_SOURCE to false (or remove conditionals entirely)
// 2. Remove `if (IS_MARKDOWN_SOURCE)` branches from blog/page.tsx and blog/[slug]/page.tsx
// 3. Remove `markdown` prop from BlogPost component and MarkdownContent import
// 4. Delete lib/blog/markdown-source.ts, lib/blog/source.ts, components/blog/markdown-content.tsx
// 5. Remove gray-matter, react-markdown, remark-gfm from dependencies
// 6. Delete content/blog/ directory (posts should already be imported into DB)
// 7. Remove BlogSource enum and BLOG_CONTENT_DIR from lib/constants.ts
// 8. Remove outputFileTracingIncludes blog entries from next.config.mjs
// 9. Remove dual-source blog section from CLAUDE.md

export const IS_MARKDOWN_SOURCE = true

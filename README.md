# bbass.co

Personal site + blog for Bob Bass, built on Next.js 16 + Payload CMS.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Payload CMS 3** on **Postgres** (`@payloadcms/db-postgres`)
- **Tailwind CSS v4** + Geist / Inter
- **Auth.js v5** with **GitHub OAuth** (Payload adapter)
- **Vercel Blob** for media uploads

## Blog

Open **Blog Posts → Create New** in `/admin`. Write the article in **Markdown body** and use the editor’s preview or media picker as you work. The title supplies the page’s H1. Start body sections at `##`. Tables, task lists, footnotes, and fenced code blocks are supported.

Save with **Published** unchecked to keep a draft. Check it and save to publish immediately, or enter a future **Published At** date to schedule publication. Posts use the public byline, excerpt, and SEO overrides for their article metadata. Public pages, RSS, and the sitemap revalidate on edits and use a 60-second ISR interval for scheduled changes.

Internal links stay in the same tab. External links open in a new tab and default to `nofollow`. Use a Markdown link title to set its relationship.

| Intent | Markdown |
| --- | --- |
| Editorial follow | `[Project](https://example.com "follow")` |
| Paid placement | `[Sponsor](https://example.com "sponsored")` |
| User-submitted | `[Source](https://example.com "ugc")` |

The Layerbase affiliate redirector stays nofollow. **Import from Markdown** copies a repository post from `content/blog` into a database draft. Its published file stays visible during review. Publishing switches the article to the database version. Unchecking **Published** withdraws that version and hides the corresponding file. Deleting the database record releases the slug back to any matching file.

## Local development

1. Copy `.env.example` to `.env` and fill in the values.
   - `DATABASE_URL` — a Postgres connection string
   - `PAYLOAD_SECRET`, `AUTH_SECRET` — `openssl rand -base64 32`
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from a GitHub OAuth app
     (callback URL `http://localhost:3000/api/auth/callback/github`)
   - `BLOB_READ_WRITE_TOKEN` / `BLOB_PREFIX` — Vercel Blob store
   - Keep `DEV_DB_PUSH=true` to auto-sync the schema in development.
2. `pnpm install`
3. `pnpm dev` → http://localhost:3000

Admin panel is at `/admin` (GitHub sign-in; `bob@bbass.co` is a super-admin).

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm check:types` — TypeScript
- `pnpm lint` / `pnpm format`
- `pnpm generate:types` / `pnpm generate:importmap`
- `pnpm prep` — regenerate types + import map and create a migration

## `/_legacy`

The previous static portfolio site lives in `_legacy/` for reference. It is
excluded from the build, TypeScript, ESLint, and Prettier.

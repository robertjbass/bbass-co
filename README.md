# bbass.co

Personal site + blog for Bob Bass, built on Next.js 16 + Payload CMS.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Payload CMS 3** on **Postgres** (`@payloadcms/db-postgres`)
- **Tailwind CSS v4** + Geist / Inter
- **Auth.js v5** with **GitHub OAuth** (Payload adapter)
- **Vercel Blob** for media uploads

## Blog

Posts are resolved DB-first with a markdown fallback: a published `blog`
record wins, otherwise a markdown file in `content/blog/<slug>.md` renders as
the post. Drafts can live as markdown and be promoted to the CMS later.

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

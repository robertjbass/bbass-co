import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  lexicalEditor,
  FixedToolbarFeature,
  BlocksFeature,
  CodeBlock,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import User from '@/collections/User'
import Media from '@/collections/Media'
import Blog from '@/collections/Blog'
import Tag from '@/collections/Tag'
import { migrations } from '@/migrations'
import { validateRequiredEnv } from '@/lib/env-check'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// DEV_DB_PUSH=true enables push mode (auto-sync schema, no migrations).
const devDbPush = process.env.DEV_DB_PUSH === 'true'
const runMigrations = !devDbPush

validateRequiredEnv()

export default buildConfig({
  serverURL: process.env.AUTH_URL || 'http://localhost:3000',
  admin: {
    user: 'user',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        login: {
          Component: '@/components/admin/custom-login-form.tsx#CustomLoginForm',
        },
      },
    },
    meta: {
      titleSuffix: ' - Bob Bass',
      icons: [{ url: '/icon.svg' }],
    },
    livePreview: {
      url: ({ data }) => {
        const base = process.env.AUTH_URL || 'http://localhost:3000'
        return `${base}/api/draft?slug=${data?.slug || ''}&collection=blog`
      },
      collections: ['blog'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [User, Media, Blog, Tag],
  plugins: [
    vercelBlobStorage({
      collections: {
        media: {
          prefix: process.env.BLOB_PREFIX!,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    }),
  ],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      BlocksFeature({ blocks: [CodeBlock()] }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
    push: devDbPush,
    ...(runMigrations && {
      prodMigrations: migrations,
    }),
  }),
  sharp,
})

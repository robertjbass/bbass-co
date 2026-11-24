import { Suspense } from 'react'
import { pageMetadata, SITE_URL } from '@/lib/metadata'
import { BlogListing, TaggedBlogListing } from '@/components/blog/blog-listing'
import { JsonLd } from '@/components/structured-data'
import { buildCollectionPage, buildBreadcrumbList } from '@/lib/structured-data'
import { getAllPosts, getAllTags } from '@/lib/blog/resolve-post'

export const dynamic = 'force-static'
export const revalidate = 60

export const metadata = {
  ...pageMetadata({
    title: 'Blog',
    description:
      'Writing on TypeScript, developer tooling, building products, and lessons from shipping software.',
    path: '/blog',
  }),
  alternates: {
    canonical: '/blog',
    types: {
      'application/rss+xml': [
        { url: '/blog/rss.xml', title: 'Bob Bass Blog RSS feed' },
      ],
    },
  },
}

export default async function BlogListingPage() {
  const listed = await getAllPosts()
  const tags = getAllTags(listed)

  // Only indexable posts contribute to the CollectionPage JSON-LD. Both
  // sources expose seo.noIndex the same way.
  const indexable = listed.filter((entry) => entry.post.seo?.noIndex !== true)

  const collectionSchema = buildCollectionPage({
    name: 'Bob Bass Blog',
    path: '/blog',
    description:
      'Writing on TypeScript, developer tooling, building products, and lessons from shipping software.',
    items: indexable.map((entry) => ({
      name: entry.post.title,
      url: `${SITE_URL}/blog/${entry.post.slug}`,
    })),
  })

  const breadcrumbs = buildBreadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ])

  return (
    <>
      <JsonLd data={[collectionSchema, breadcrumbs]} />
      <Suspense fallback={<BlogListing posts={listed} tags={tags} />}>
        <TaggedBlogListing posts={listed} tags={tags} />
      </Suspense>
    </>
  )
}

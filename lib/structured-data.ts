import { SITE_URL } from '@/lib/metadata'

type PersonAuthor = { '@type': 'Person'; name: string; url?: string }

export function buildBlogPosting({
  headline,
  slug,
  description,
  datePublished,
  dateModified,
  author,
  image,
}: {
  headline: string
  slug: string
  description?: string
  datePublished?: string
  dateModified?: string
  author?: string
  image?: string
}) {
  const url = `${SITE_URL}/blog/${slug}`
  const authorObj: PersonAuthor | undefined =
    author && author.trim() ? { '@type': 'Person', name: author } : undefined

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline,
    url,
    mainEntityOfPage: url,
    ...(description ? { description } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(authorObj ? { author: authorObj } : {}),
    ...(image ? { image } : {}),
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function buildCollectionPage({
  name,
  path,
  description,
  items,
}: {
  name: string
  path: string
  description?: string
  items: { name: string; url: string }[]
}) {
  const url = `${SITE_URL}${path}`
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    name,
    url,
    ...(description ? { description } : {}),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

export function buildSoftwareApplication({
  name,
  path,
  description,
  operatingSystem,
  applicationCategory,
  offers,
  downloadUrl,
}: {
  name: string
  path: string
  description: string
  operatingSystem?: string
  applicationCategory?: string
  offers?: { price: string; priceCurrency: string }
  downloadUrl?: string
}) {
  const url = `${SITE_URL}${path}`
  return {
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name,
    url,
    description,
    ...(operatingSystem ? { operatingSystem } : {}),
    ...(applicationCategory ? { applicationCategory } : {}),
    ...(downloadUrl ? { downloadUrl } : {}),
    ...(offers
      ? {
          offers: {
            '@type': 'Offer',
            price: offers.price,
            priceCurrency: offers.priceCurrency,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function buildBreadcrumbList(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => {
      const isLast = i === items.length - 1
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        ...(isLast ? {} : { item: `${SITE_URL}${item.path}` }),
      }
    }),
  }
}

export function buildProfessionalService({
  name,
  url,
  description,
  services,
}: {
  name: string
  url: string
  description: string
  services: string[]
}) {
  return {
    '@type': 'ProfessionalService',
    '@id': `${url}#professional-service`,
    name,
    url,
    description,
    knowsAbout: services,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  }
}

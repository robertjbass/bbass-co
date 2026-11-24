export const FOLLOW_LINK_TITLE = 'follow'

const FOLLOW_LOCKED_HOSTS = ['layerbase.link']

export type BlogLinkAttrs = {
  href?: string
  title?: string
  target?: '_blank'
  rel?: string
}

const REL_EXTERNAL = 'noopener noreferrer nofollow'
const REL_EXTERNAL_FOLLOW = 'noopener noreferrer'

export function isExternalHref(
  href: string | undefined,
  siteUrl: string = 'https://bbass.co',
): boolean {
  if (!href) return false
  if (href.startsWith('#')) return false

  let hostname: string
  try {
    const url = new URL(href, siteUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    hostname = url.hostname
  } catch {
    // mailto:, tel:, and anything else unparseable is treated as external so
    // it keeps the safe rel, but those carry no link equity either way.
    return true
  }

  return (
    hostname !== new URL(siteUrl).hostname &&
    hostname !== 'bbass.co' &&
    !hostname.endsWith('.bbass.co')
  )
}

// True when a link may never become dofollow: anything that is not a plain
// http(s) URL (javascript:, mailto:, tel:, unparseable), and the affiliate
// redirector host.
export function isFollowLockedHref(href: string | undefined): boolean {
  if (!href) return true

  let url: URL
  try {
    url = new URL(href)
  } catch {
    return true
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true

  const hostname = url.hostname.toLowerCase()
  return FOLLOW_LOCKED_HOSTS.some(
    (locked) => hostname === locked || hostname.endsWith(`.${locked}`),
  )
}

// The attributes a blog <a> gets, decided in one place for both renderers.
//
// - Internal: no target, no rel. A real title is kept.
// - External: new tab + `noopener noreferrer nofollow`.
// - External + opted in (title `follow`, or a Lexical `follow` flag) and not
//   locked: new tab + `noopener noreferrer`, no nofollow.
// - External + opted in but locked (affiliate redirector, non-http scheme):
//   the default nofollow.
//
// The `follow` title is stripped in every branch so it never becomes a tooltip
// and a locked link cannot leak the sentinel into the markup.
export function blogLinkAttrs(options: {
  href: string | undefined
  title?: string
  follow?: boolean
  siteUrl?: string
}): BlogLinkAttrs {
  const { href, title, siteUrl } = options
  const titleOptsIn = title === FOLLOW_LINK_TITLE
  const follow = options.follow === true || titleOptsIn
  const qualification =
    title === 'sponsored' || title === 'ugc' ? title : undefined
  const keptTitle = titleOptsIn || qualification ? undefined : title

  const attrs: BlogLinkAttrs = {}
  if (href !== undefined) attrs.href = href
  if (keptTitle !== undefined) attrs.title = keptTitle

  if (!isExternalHref(href, siteUrl)) {
    return attrs
  }

  attrs.target = '_blank'
  attrs.rel =
    follow && !isFollowLockedHref(href) ? REL_EXTERNAL_FOLLOW : REL_EXTERNAL
  if (qualification) attrs.rel = REL_EXTERNAL + ' ' + qualification
  return attrs
}

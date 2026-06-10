'use client'

import NextLink, { type LinkProps as NextLinkProps } from 'next/link'

// First-party domains get rel="noopener" without nofollow/sponsored.
// Update this regex if the site moves to a new apex.
const FIRST_PARTY_HOST_RE = /^https?:\/\/([^/]+\.)?bbass\.co(\/|$|:)/
// Treat localhost (any port) as first-party in dev so local test links don't get nofollow.
const LOCALHOST_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/

type BaseProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

export type LinkProps = BaseProps &
  Omit<NextLinkProps, 'href'> & {
    href: string | NextLinkProps['href']
    // When true, rel becomes "noopener nofollow sponsored" and affiliate analytics fires on click.
    isAffiliate?: boolean
    // When true, rel gets "nofollow" (ignored if isAffiliate is true - affiliate already nofollows).
    noFollow?: boolean
    // Send the full referring URL instead of just the origin. Only applied to non-first-party links.
    passReferrerUrl?: boolean
    // Skip nofollow for a trusted external link (e.g. your own social profile).
    followExternal?: boolean
  }

export function Link({
  children,
  href,
  target,
  isAffiliate = false,
  noFollow = true,
  passReferrerUrl = false,
  followExternal = false,
  onClick,
  ...props
}: LinkProps) {
  if (!href) return null

  const hrefString = typeof href === 'string' ? href : ''
  const isAbsoluteUrl = hrefString.startsWith('http')
  const isFirstParty =
    isAbsoluteUrl &&
    (FIRST_PARTY_HOST_RE.test(hrefString) || LOCALHOST_HOST_RE.test(hrefString))
  const referrerPolicy = passReferrerUrl
    ? 'no-referrer-when-downgrade'
    : 'origin'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
  }

  if (isAbsoluteUrl) {
    const { prefetch, scroll, replace, onNavigate, ...htmlProps } =
      props as Record<string, unknown>
    void prefetch
    void scroll
    void replace
    void onNavigate

    // rel is built after htmlProps spread so callers can't override the compliance-critical bits.
    const rel =
      isFirstParty || followExternal
        ? 'noopener'
        : isAffiliate
          ? 'noopener nofollow sponsored'
          : noFollow
            ? 'noopener nofollow'
            : 'noopener'

    return (
      <a
        href={hrefString}
        target={target || '_blank'}
        {...(htmlProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        onClick={handleClick}
        rel={rel}
        {...(!isFirstParty && { referrerPolicy })}
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink
      href={href as NextLinkProps['href']}
      target={target}
      onClick={handleClick}
      {...(props as Omit<NextLinkProps, 'href'>)}
    >
      {children}
    </NextLink>
  )
}

export default Link

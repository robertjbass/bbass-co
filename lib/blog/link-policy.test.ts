import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  blogLinkAttrs,
  isExternalHref,
  isFollowLockedHref,
} from './link-policy.ts'

const SITE = 'https://bbass.co'

describe('blog link classification', () => {
  it('treats our own absolute links as internal', () => {
    for (const href of [
      'https://bbass.co/create/postgresql',
      'https://bbass.co/pricing',
      'https://bbass.co/docs/cli',
      'https://www.bbass.co/desktop',
      'https://cloud.bbass.co/databases',
      'https://bbass.co/blog/the-multi-database-tax#contents',
    ]) {
      assert.equal(
        isExternalHref(href, SITE),
        false,
        `${href} should be internal`,
      )
    }
  })

  it('treats relative and hash links as internal', () => {
    assert.equal(isExternalHref('/db/postgresql', SITE), false)
    assert.equal(isExternalHref('#contents', SITE), false)
    assert.equal(isExternalHref(undefined, SITE), false)
  })

  it('treats third-party links as external', () => {
    for (const href of [
      'https://neon.tech/pricing',
      'https://github.com/robertjbass/spindb',
      'https://news.ycombinator.com/item?id=1',
    ]) {
      assert.equal(
        isExternalHref(href, SITE),
        true,
        `${href} should be external`,
      )
    }
  })

  it('keeps affiliate links external so they retain nofollow', () => {
    // layerbase.link is our redirector, not our content domain. These must
    // keep rel="nofollow" - they are monetized links.
    assert.equal(isExternalHref('https://layerbase.link/neon', SITE), true)
  })

  it('does not leak a lookalike domain in as internal', () => {
    assert.equal(isExternalHref('https://bbass.co.evil.example/x', SITE), true)
    assert.equal(isExternalHref('https://notbbass.co/x', SITE), true)
  })

  it('classifies against the configured site, so staging behaves too', () => {
    const staging = 'https://dev.bbass.co'
    assert.equal(isExternalHref('https://dev.bbass.co/pricing', staging), false)
    assert.equal(isExternalHref('https://neon.tech', staging), true)
  })
})

describe('follow lock', () => {
  it('locks the affiliate redirector and every subdomain of it', () => {
    assert.equal(isFollowLockedHref('https://layerbase.link/neon'), true)
    assert.equal(isFollowLockedHref('https://LAYERBASE.LINK/neon'), true)
    assert.equal(isFollowLockedHref('https://go.layerbase.link/x'), true)
  })

  it('locks anything that is not a plain http(s) URL', () => {
    for (const href of [
      'javascript:alert(1)',
      'mailto:hello@example.com',
      'tel:+15555555555',
      'not a url',
      undefined,
    ]) {
      assert.equal(isFollowLockedHref(href), true, `${href} should be locked`)
    }
  })

  it('does not lock an ordinary third-party site', () => {
    assert.equal(isFollowLockedHref('https://nearbase.dev/'), false)
    assert.equal(isFollowLockedHref('http://nearbase.dev/'), false)
  })
})

describe('blogLinkAttrs', () => {
  it('leaves internal links plain and keeps a real title', () => {
    for (const href of [
      'https://bbass.co/pricing',
      'https://cloud.bbass.co/databases',
      '/db/postgresql',
      '#contents',
    ]) {
      assert.deepEqual(blogLinkAttrs({ href, siteUrl: SITE }), { href })
      assert.deepEqual(
        blogLinkAttrs({ href, title: 'Pricing', siteUrl: SITE }),
        { href, title: 'Pricing' },
      )
    }
  })

  it('strips the follow title from an internal link without changing it', () => {
    assert.deepEqual(
      blogLinkAttrs({
        href: 'https://bbass.co/pricing',
        title: 'follow',
        siteUrl: SITE,
      }),
      { href: 'https://bbass.co/pricing' },
    )
  })

  it('nofollows an external link by default', () => {
    assert.deepEqual(
      blogLinkAttrs({ href: 'https://nearbase.dev/', siteUrl: SITE }),
      {
        href: 'https://nearbase.dev/',
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      },
    )
  })

  it('renders a dofollow link for the follow title and drops the title', () => {
    assert.deepEqual(
      blogLinkAttrs({
        href: 'https://nearbase.dev/',
        title: 'follow',
        siteUrl: SITE,
      }),
      {
        href: 'https://nearbase.dev/',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    )
  })

  it('accepts the Lexical follow flag the same way', () => {
    assert.deepEqual(
      blogLinkAttrs({
        href: 'https://nearbase.dev/',
        follow: true,
        siteUrl: SITE,
      }),
      {
        href: 'https://nearbase.dev/',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    )
  })

  it('matches the sentinel exactly, so any other title still nofollows', () => {
    for (const title of ['Nearbase homepage', 'Follow', 'FOLLOW', ' follow']) {
      assert.deepEqual(
        blogLinkAttrs({ href: 'https://nearbase.dev/', title, siteUrl: SITE }),
        {
          href: 'https://nearbase.dev/',
          title,
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
        `title ${JSON.stringify(title)} must not opt in`,
      )
    }
  })

  it('cannot opt an affiliate link out of nofollow', () => {
    assert.deepEqual(
      blogLinkAttrs({
        href: 'https://layerbase.link/neon',
        title: 'follow',
        siteUrl: SITE,
      }),
      {
        href: 'https://layerbase.link/neon',
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      },
    )
  })

  it('cannot opt a non-http link out of nofollow', () => {
    for (const href of ['javascript:alert(1)', 'mailto:hello@example.com']) {
      const attrs = blogLinkAttrs({ href, title: 'follow', siteUrl: SITE })
      assert.equal(attrs.rel, 'noopener noreferrer nofollow', href)
      assert.equal(attrs.title, undefined, href)
    }
  })

  it('never classifies a lookalike host as internal', () => {
    // It is a third-party host like any other: nofollow by default, and only
    // an explicit opt-in follows it.
    assert.equal(
      blogLinkAttrs({
        href: 'https://bbass.co.evil.example/x',
        siteUrl: SITE,
      }).rel,
      'noopener noreferrer nofollow',
    )
    assert.equal(
      blogLinkAttrs({
        href: 'https://bbass.co.evil.example/x',
        title: 'follow',
        siteUrl: SITE,
      }).rel,
      'noopener noreferrer',
    )
  })

  it('qualifies paid and user-submitted links', () => {
    for (const title of ['sponsored', 'ugc']) {
      const attrs = blogLinkAttrs({
        href: '//example.com/article',
        title,
        siteUrl: SITE,
      })
      assert.equal(attrs.rel, 'noopener noreferrer nofollow ' + title)
      assert.equal(attrs.title, undefined)
    }
  })

  it('returns no href attribute when markdown gave none', () => {
    assert.deepEqual(blogLinkAttrs({ href: undefined, siteUrl: SITE }), {})
  })
})

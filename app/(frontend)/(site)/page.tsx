import { getFeaturedPost } from '@/lib/blog/resolve-post'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Code2, PlayCircle, Terminal } from 'lucide-react'
import { PreviewDeployment } from '@/components/preview-deployment'
import { socialLinks } from '@/lib/data'
import { JsonLd } from '@/components/structured-data'
import { personId } from '@/lib/structured-data'
import { SITE_URL, pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata({
  title: { absolute: 'Bob Bass — Platform engineer & founder' },
  description:
    'Bob Bass builds database platforms and distributed systems in Austin, Texas. Founder and CEO of Layerbase and Head of Engineering at Efficient.app.',
  path: '/',
})

export const dynamic = 'force-static'
export const revalidate = 60

export default async function HomePage() {
  const featured = await getFeaturedPost()
  return (
    <main className="profile-page">
      <JsonLd
        data={{
          '@type': 'ProfilePage',
          '@id': `${SITE_URL}/#profile`,
          url: SITE_URL,
          name: 'Bob Bass — Platform engineer & founder',
          mainEntity: { '@id': personId },
          isPartOf: { '@id': `${SITE_URL}/#website` },
        }}
      />
      <div className="profile-width">
        <section
          className="profile-hero"
          id="hero"
          aria-labelledby="profile-title"
        >
          <div>
            <p className="profile-kicker">
              Platform engineer <span>/</span> Austin, Texas
            </p>
            <h1 id="profile-title">Bob Bass</h1>
            <p className="hero-intro">
              I build the infrastructure developers use to run databases and
              ship apps.
            </p>
            <p className="hero-roles">
              Founder &amp; CEO of <a href={socialLinks.startup}>Layerbase</a>.
              <br />
              Head of Engineering at{' '}
              <a href="https://efficient.app">Efficient.app</a>.
            </p>
            <div className="hero-links">
              <a href="#resources">Explore the platform</a>
              <Link href="/blog">Read my writing</Link>
            </div>
          </div>
          <div className="min-w-0">
            <PreviewDeployment />
            {featured && (
              <Link className="hero-field-note" href={`/blog/${featured.slug}`}>
                <BookOpen size={16} aria-hidden="true" />
                <span>{featured.title}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </section>
        <section
          id="work"
          className="work-section"
          aria-labelledby="work-title"
        >
          <h2 id="work-title">Current work</h2>
          <div className="work-list">
            <article className="work-row">
              <div>
                <h3>
                  <a href={socialLinks.startup}>Layerbase</a>
                </h3>
                <p className="work-role">Founder &amp; CEO</p>
              </div>
              <div className="work-description">
                <p>
                  I’m building Layerbase so developers can bring their
                  open-source database of choice. It’s a serverless database
                  platform with engine-agnostic branching. You can fork
                  Postgres, MySQL, or Redis for a preview through the same API.
                </p>
                <p>
                  Agent sandboxes are live, and we’re piloting Next.js app
                  hosting. I’m building toward one place to develop and host an
                  entire application, from the first experiment to production.
                </p>
              </div>
            </article>
            <article className="work-row">
              <div>
                <h3>
                  <a href="https://efficient.app">Efficient.app</a>
                </h3>
                <p className="work-role">Head of Engineering</p>
              </div>
              <p>
                I lead engineering at Efficient.app, where we test software
                hands-on and help teams decide which tools are worth paying for.
              </p>
            </article>
            <p className="work-aside">
              Apparently, competing with G2 at my day job left just enough time
              to take on Vercel and Supabase.
            </p>
          </div>
        </section>
        <section
          id="resources"
          className="resource-section"
          aria-labelledby="resource-title"
        >
          <h2 id="resource-title">Inside Layerbase</h2>
          <div className="resource-spread">
            <a
              className="resource-film"
              href="https://www.youtube.com/watch?v=fPqD7KCCvPs"
            >
              <Image
                src="/layerbase-launch.webp"
                width={480}
                height={270}
                sizes="(max-width: 670px) 92vw, 440px"
                alt=""
              />
              <span>
                <PlayCircle size={23} /> Watch the product walkthrough
              </span>
            </a>
            <div className="resource-index">
              <a href="https://github.com/robertjbass/spindb">
                <Code2 />
                <div>
                  <h3>SpinDB source</h3>
                  <p>The local database engine behind Layerbase.</p>
                </div>
              </a>
              <a href="https://layerbase.com/docs/cli">
                <Terminal />
                <div>
                  <h3>Layerbase CLI</h3>
                  <p>
                    Create, branch, and back up databases from your terminal.
                  </p>
                </div>
              </a>
              <a href="https://layerbase.com/blog">
                <BookOpen />
                <div>
                  <h3>Engineering notes</h3>
                  <p>Database internals, migration guides, and tutorials.</p>
                </div>
              </a>
            </div>
          </div>
        </section>
        <section
          id="about"
          className="about-section"
          aria-labelledby="about-title"
        >
          <div className="portrait">
            <Image
              src="/headshot.jpg"
              width={700}
              height={933}
              sizes="(max-width: 640px) 82vw, 320px"
              alt="Bob Bass"
            />
          </div>
          <div>
            <h2 id="about-title">A little background</h2>
            <p>
              I’m a lead software engineer with more than a decade of experience
              building companies. My earlier work took me through finance and
              B2B SaaS. Today I spend most of my time on distributed systems and
              infrastructure as code.
            </p>
            <p>
              I’ve lived in Western New York, San Francisco, and now Austin.
              Away from the keyboard, I play guitar.
            </p>
            <details id="tech">
              <summary>Tools I work with</summary>
              <p>TypeScript, Go, Rust, PostgreSQL, Redis, and AWS.</p>
            </details>
            <Link
              className="text-link"
              href={featured ? `/blog/${featured.slug}` : '/blog'}
            >
              {featured?.title ?? 'Read my writing'}
            </Link>
          </div>
        </section>
        <section id="contact" className="contact-section">
          <h2>Get in touch</h2>
          <div>
            <a className="text-link" href={socialLinks.linkedin}>
              Message me on LinkedIn
            </a>
            <nav aria-label="Other profiles">
              <a href={socialLinks.github}>GitHub</a>
              <a href={socialLinks.twitter}>X</a>
              <a href={socialLinks.youtube}>YouTube</a>
              <a href={socialLinks.discord}>Discord</a>
            </nav>
          </div>
        </section>
      </div>
    </main>
  )
}

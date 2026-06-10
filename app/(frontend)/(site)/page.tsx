import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType } from 'react'
import { ArrowRight, Mail, Database } from 'lucide-react'
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaYoutube,
  FaDiscord,
} from 'react-icons/fa6'
import { HiOutlineMail } from 'react-icons/hi'
import { JsonLd } from '@/components/structured-data'
import { SITE_URL } from '@/lib/metadata'
import { RoleRotator } from '@/components/role-rotator'
import { TechStackGrid } from '@/components/agency/tech-stack-grid'
import {
  roles,
  aboutCards,
  contactLinks,
  contactInfo,
  type ContactIcon,
} from '@/lib/data'

const CONTACT_ICONS: Record<
  ContactIcon,
  ComponentType<{ className?: string }>
> = {
  email: HiOutlineMail,
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaXTwitter,
  youtube: FaYoutube,
  discord: FaDiscord,
  startup: Database,
}

export const metadata: Metadata = {
  title: 'Bob Bass — Engineer & Founder',
  description:
    'Bob Bass is a software engineer and founder in Austin, TX. Head of Engineering at Efficient App and founder of Layerbase.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={[
          {
            '@type': 'Person',
            '@id': `${SITE_URL}/#person`,
            name: 'Bob Bass',
            url: SITE_URL,
            jobTitle: 'Head of Engineering',
            description:
              'Software engineer and founder. Head of Engineering at Efficient App and founder of Layerbase.',
            sameAs: [
              'https://github.com/robertjbass',
              'https://linkedin.com/in/bbass9490',
              'https://twitter.com/bobdotjs',
            ],
          },
        ]}
      />

      <section
        id="hero"
        className="relative overflow-hidden px-6 py-20 md:py-28"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div className="animate-fade-in">
              <div className="mb-4 flex items-center gap-4">
                <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
                  Bob <span className="text-gradient">Bass</span>
                </h1>
                <a
                  href="https://github.com/robertjbass"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FaGithub className="h-8 w-8" />
                </a>
              </div>

              <div className="mb-6">
                <RoleRotator roles={roles} />
              </div>

              <div className="max-w-lg space-y-3 text-base text-muted-foreground md:text-lg">
                <p>
                  Lead engineer on the flagship product at{' '}
                  <a
                    href="https://efficient.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Efficient App
                  </a>
                  . Building the ultimate DBaaS platform at{' '}
                  <a
                    href="https://layerbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Layerbase
                  </a>
                  .
                </p>
                <p>
                  Based in Austin. Previously SF and Western NY. Collection
                  agency owner turned software engineer.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-medium text-amber-foreground shadow-xl shadow-amber/25 transition-colors hover:bg-amber/90"
                >
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card"
                >
                  Read the blog
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end animate-fade-in-delayed">
              <div className="relative h-44 w-44 overflow-hidden rounded-full ring-4 ring-white/10 shadow-2xl md:h-56 md:w-56">
                <Image
                  src="/headshot.jpg"
                  alt="Bob Bass"
                  fill
                  sizes="(max-width: 768px) 176px, 224px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-40 top-1/2 h-150 w-150 -translate-y-1/2 rounded-full bg-linear-to-br from-primary/15 via-primary/5 to-transparent blur-3xl" />
      </section>

      <div className="section-divider" />

      <section id="about" className="relative px-6 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aboutCards.map((card) => (
              <div
                key={card.title}
                className="card-glow rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
              >
                <div className="mb-3 text-3xl">{card.emoji}</div>
                <h3 className="mb-2 font-display text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section id="tech" className="relative px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-muted/30 to-transparent" />
        <div className="container relative mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="section-label">Stack</p>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Tools I build with
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Battle-tested technologies I reach for to ship reliable software.
            </p>
          </div>
          <TechStackGrid />
        </div>
      </section>

      <div className="section-divider" />

      <section id="contact" className="px-6 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="section-label">Contact</p>
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Let&apos;s connect
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Always happy to connect with fellow developers and founders.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {contactLinks.map((link) => {
              const Icon = CONTACT_ICONS[link.icon]
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    link.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  className="card-glow group flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/30 to-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {link.label}
                    </div>
                    <div className="truncate font-medium">{link.display}</div>
                  </div>
                </a>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <a
              href={`mailto:${contactInfo.email}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber px-6 py-3 text-sm font-medium text-amber-foreground shadow-xl shadow-amber/25 transition-colors hover:bg-amber/90"
            >
              Email me
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

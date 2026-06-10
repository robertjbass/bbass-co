import Link from 'next/link'
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { HiOutlineMail } from 'react-icons/hi'
import { BbassMark } from '@/components/icons/bbass-mark'
import { contactInfo, socialLinks } from '@/lib/data'

export async function SiteFooter() {
  const year = new Date().getFullYear()

  const socials = [
    { href: socialLinks.github, label: 'GitHub', Icon: FaGithub },
    { href: socialLinks.linkedin, label: 'LinkedIn', Icon: FaLinkedin },
    { href: socialLinks.twitter, label: 'X', Icon: FaXTwitter },
    { href: `mailto:${contactInfo.email}`, label: 'Email', Icon: HiOutlineMail },
  ]

  return (
    <footer className="relative overflow-hidden bg-background px-6 pt-16 pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />
      <div className="container relative mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
            >
              <BbassMark className="size-6 shrink-0" />
              Bob Bass
            </Link>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
              {contactInfo.company.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">
            &copy; {year} {contactInfo.name}
          </p>
          <p className="text-xs text-muted-foreground/60">Built with 🩵 in ATX</p>
        </div>
      </div>
    </footer>
  )
}

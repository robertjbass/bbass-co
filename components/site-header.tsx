import Link from 'next/link'
import { BbassMark } from '@/components/icons/bbass-mark'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader() {
  return (
    <header className="profile-header">
      <div className="profile-width profile-nav">
        <Link href="/" className="profile-brand" aria-label="bbass.co home">
          <BbassMark className="size-8 shrink-0" /> bbass.co
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link href="/blog">Writing</Link>
          <Link className="nav-contact" href="/#contact">
            Contact
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

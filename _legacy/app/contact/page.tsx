import {
  AiOutlineMail,
  AiOutlineLinkedin,
  AiFillGithub,
  AiOutlineYoutube,
  AiOutlineTwitter,
} from 'react-icons/ai'
import { SiSubstack, SiDiscord } from 'react-icons/si'
import { HiCode } from 'react-icons/hi'
import Link from 'next/link'

const contactLinks = [
  {
    icon: AiOutlineMail,
    label: 'Email',
    href: 'mailto:bob@bbass.co',
    display: 'bob@bbass.co',
  },
  {
    icon: AiFillGithub,
    label: 'GitHub',
    href: 'https://github.com/robertjbass',
    display: '@robertjbass',
  },
  {
    icon: AiOutlineLinkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/bbass9490',
    display: 'bbass9490',
  },
  {
    icon: AiOutlineTwitter,
    label: 'Twitter',
    href: 'https://twitter.com/bobdotjs',
    display: '@bobdotjs',
  },
  {
    icon: AiOutlineYoutube,
    label: 'YouTube',
    href: 'https://youtube.com/@bobDotJS',
    display: '@bobDotJS',
  },
  {
    icon: SiDiscord,
    label: 'Discord',
    href: 'https://ourpassion.dev',
    display: 'ourpassion.dev',
  },
  {
    icon: SiSubstack,
    label: 'Substack',
    href: 'https://substack.com/@alternaterealms',
    display: '@alternaterealms',
  },
]

export default function Contact() {
  return (
    <div className="max-w-3xl w-full">
      <h1 className="text-4xl md:text-5xl font-bold mb-3">Get in Touch</h1>
      <p className="text-lg text-white/70 mb-8">
        Always happy to connect with fellow developers and founders
      </p>

      <div className="mb-12 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-3">
          <HiCode className="text-3xl text-blue-400" />
          <div>
            <h2 className="text-xl font-bold">Layerbase</h2>
            <p className="text-sm text-white/70">Developer Tooling</p>
          </div>
        </div>
        <p className="text-white/80 mb-4">
          Building developer tooling to help engineering teams ship faster.
        </p>
        <Link
          href="https://layerbase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all border border-blue-500/30 hover:border-blue-500/50"
        >
          <span>Visit Layerbase</span>
          <span>→</span>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Connect With Me</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.label}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 group"
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={
                link.href.startsWith('http') ? 'noopener noreferrer' : undefined
              }
            >
              <Icon className="text-2xl group-hover:scale-110 transition-transform flex-shrink-0" />
              <div>
                <div className="text-sm text-white/60">{link.label}</div>
                <div className="font-medium">{link.display}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

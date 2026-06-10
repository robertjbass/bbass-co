import Link from 'next/link'
import { AiFillGithub } from 'react-icons/ai'

const companies = [
  {
    name: 'Layerbase',
    role: 'Founder',
    description: 'Custom Software Engineering and Consulting',
    period: 'Current',
    link: 'https://layerbase.com',
  },
  {
    name: 'Efficient App',
    role: 'Head of Engineering',
    description: 'Leading engineering teams, building developer tooling',
    period: 'Current',
    link: 'https://efficient.app',
  },
  {
    name: 'Open Health',
    role: 'Lead Engineer (Products Team)',
    description: 'Building healthcare technology products',
    period: '2020-2025',
    link: null,
  },
  {
    name: 'DebtOS',
    role: 'Founder',
    description:
      'SaaS for Accounts Receivable Management. Won 2020 Pioneer Competition',
    period: '2019-2022',
    link: 'https://coda.io/@narro/debtos-screenshots',
  },
  {
    name: 'Narro Automation',
    role: 'Founder',
    description: 'Custom Business Automation',
    period: '2018-2020',
    link: null,
  },
  {
    name: 'Ashland Development',
    role: 'CEO',
    description: 'Sold in 2019',
    period: '2012-2019',
    link: null,
  },
]

const projects = [
  { name: 'NodePM UI', link: 'https://github.com/robertjbass/nodepm-ui' },
  { name: 'PGP', link: 'https://github.com/robertjbass/pgp' },
  { name: 'Ask Chat', link: 'https://github.com/robertjbass/ask-chat' },
  { name: 'Hey ChatGPT', link: 'https://github.com/robertjbass/hey-chatgpt' },
  {
    name: 'GH Data Scraper',
    link: 'https://github.com/robertjbass/gh-data-scraper',
  },
  {
    name: 'ReactX State Management',
    link: 'https://github.com/robertjbass/reactx-state-management',
  },
]

const contentLinks = [
  {
    emoji: '📝',
    title: 'Writing',
    description: 'Articles on entrepreneurship and SaaS bootstrap experience',
    link: 'https://dev.to/robertjbass',
  },
  {
    emoji: '🎥',
    title: 'YouTube',
    description: '@bobDotJS',
    link: 'https://www.youtube.com/@bobDotJS',
  },
  {
    emoji: '💬',
    title: 'Discord Community',
    description: 'ourpassion.dev',
    link: 'https://ourpassion.dev',
  },
]

export default function Work() {
  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-3">My Work</h1>
      <p className="text-lg text-white/70 mb-12">
        Building products and helping companies scale
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Companies & Roles</h2>
        <div className="space-y-4">
          {companies.map((company) => {
            const content = (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{company.name}</h3>
                    <div className="text-sm text-blue-400">{company.role}</div>
                  </div>
                  <div className="text-sm text-white/50">{company.period}</div>
                </div>
                <p className="text-white/70">{company.description}</p>
              </>
            )

            if (company.link) {
              return (
                <Link
                  key={company.name}
                  href={company.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={company.name}
                className="p-6 rounded-lg bg-white/5 border border-white/10"
              >
                {content}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Open Source & Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {projects.map((project) => (
            <Link
              key={project.name}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
            >
              <div className="font-medium">{project.name}</div>
            </Link>
          ))}
        </div>
        <Link
          href="https://github.com/payloadcms/payload"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <AiFillGithub className="text-2xl" />
            <span className="font-semibold">Contributing to Payload CMS</span>
          </div>
          <p className="text-sm text-white/70">
            Active open source contributor
          </p>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Content & Community</h2>
        <div className="space-y-4">
          {contentLinks.map((item) => (
            <Link
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
            >
              <div className="font-semibold mb-2">
                {item.emoji} {item.title}
              </div>
              <p className="text-sm text-white/70">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { HiHome, HiCode, HiBriefcase, HiMail } from 'react-icons/hi'

const navItems = [
  {
    name: 'home',
    to: '/',
    icon: HiHome,
  },
  {
    name: 'tech',
    to: '/tech',
    icon: HiCode,
  },
  {
    name: 'work',
    to: '/work',
    icon: HiBriefcase,
  },
  {
    name: 'contact',
    to: '/contact',
    icon: HiMail,
  },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background:
          'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.5))',
        backdropFilter: 'blur(10px)',
      }}
      className="fixed top-0 left-0 w-full h-20 z-40 shadow-2xl"
    >
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-8">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              href={item.to !== pathname ? item.to : ''}
              key={item.name}
              className={[
                'flex items-center gap-2 text-white text-base md:text-lg font-medium transition-all hover:scale-110 select-none',
                item.to === pathname
                  ? 'underline decoration-2 underline-offset-4 cursor-default'
                  : 'hover:text-white/80',
              ].join(' ')}
            >
              <Icon className="text-xl" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

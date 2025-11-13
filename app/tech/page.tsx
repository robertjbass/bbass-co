'use client'

import Image from 'next/image'

interface Technology {
  name: string
  badge: string
  category: 'core' | 'exploring'
}

const coreTechnologies: Technology[] = [
  {
    name: 'TypeScript',
    badge:
      'https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white',
    category: 'core',
  },
  {
    name: 'Node.js',
    badge:
      'https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white',
    category: 'core',
  },
  {
    name: 'React',
    badge:
      'https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black',
    category: 'core',
  },
  {
    name: 'Next.js',
    badge:
      'https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white',
    category: 'core',
  },
  {
    name: 'Vue.js',
    badge:
      'https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white',
    category: 'core',
  },
  {
    name: 'Nuxt.js',
    badge:
      'https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white',
    category: 'core',
  },
  {
    name: 'Tailwind CSS',
    badge:
      'https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white',
    category: 'core',
  },
  {
    name: 'PostgreSQL',
    badge:
      'https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white',
    category: 'core',
  },
  {
    name: 'MySQL',
    badge:
      'https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white',
    category: 'core',
  },
  {
    name: 'SQLite',
    badge:
      'https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white',
    category: 'core',
  },
  {
    name: 'AWS',
    badge:
      'https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white',
    category: 'core',
  },
  {
    name: 'Vercel',
    badge:
      'https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white',
    category: 'core',
  },
  {
    name: 'GitHub',
    badge:
      'https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white',
    category: 'core',
  },
  {
    name: 'PayloadCMS',
    badge:
      'https://img.shields.io/badge/PayloadCMS-000000?style=for-the-badge&logo=payloadcms&logoColor=white',
    category: 'core',
  },
  {
    name: 'Docker',
    badge:
      'https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white',
    category: 'core',
  },
  {
    name: 'Linux',
    badge:
      'https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black',
    category: 'core',
  },
  {
    name: 'macOS',
    badge:
      'https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white',
    category: 'core',
  },
  {
    name: 'Zsh',
    badge:
      'https://img.shields.io/badge/Zsh-F15A24?style=for-the-badge&logo=zsh&logoColor=white',
    category: 'core',
  },
]

const exploringTechnologies: Technology[] = [
  {
    name: 'Go',
    badge:
      'https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white',
    category: 'exploring',
  },
  {
    name: 'Rust',
    badge:
      'https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white',
    category: 'exploring',
  },
  {
    name: 'Zig',
    badge:
      'https://img.shields.io/badge/Zig-F7A41D?style=for-the-badge&logo=zig&logoColor=white',
    category: 'exploring',
  },
  {
    name: 'C++',
    badge:
      'https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white',
    category: 'exploring',
  },
  {
    name: 'Svelte',
    badge:
      'https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white',
    category: 'exploring',
  },
  {
    name: 'Elixir',
    badge:
      'https://img.shields.io/badge/Elixir-4B275F?style=for-the-badge&logo=elixir&logoColor=white',
    category: 'exploring',
  },
  {
    name: 'React Native',
    badge:
      'https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black',
    category: 'exploring',
  },
]

export default function Tech() {
  return (
    <div className="w-full max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Tech Stack</h1>
        <p className="text-lg text-white/70">
          Technologies I use to build exceptional digital experiences
        </p>
      </div>

      {/* Core Technologies */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
          Core Technologies
        </h2>
        <div className="flex flex-wrap gap-4">
          {coreTechnologies.map((tech) => (
            <div
              key={tech.name}
              className="group relative hover:scale-105 transition-transform"
            >
              <Image
                src={tech.badge}
                alt={tech.name}
                width={120}
                height={28}
                className="h-7 w-auto"
                unoptimized
              />
            </div>
          ))}
        </div>
      </section>

      {/* Exploring */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
          Currently Exploring
        </h2>
        <div className="flex flex-wrap gap-4">
          {exploringTechnologies.map((tech) => (
            <div
              key={tech.name}
              className="group relative hover:scale-105 transition-transform"
            >
              <Image
                src={tech.badge}
                alt={tech.name}
                width={120}
                height={28}
                className="h-7 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                unoptimized
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

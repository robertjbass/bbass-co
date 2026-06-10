'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    if (animationStage === 6) return
    const timeout = setTimeout(() => {
      setAnimationStage((old) => old + 1)
    }, 1050)

    return () => clearTimeout(timeout)
  }, [animationStage])

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1">
          <div className="text-5xl md:text-6xl font-bold mb-4 flex items-center gap-4">
            Bob Bass
            <Link
              href="https://github.com/bbasscom"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg
                className="w-10 h-10 md:w-12 md:h-12"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
          <div className="flex text-lg md:text-xl mb-6">
            <div className="mr-2">
              <div
                style={{
                  height: `${animationStage * 25}%`,
                  opacity: animationStage === 5 ? '0' : 'auto',
                }}
                className="flex transition-all animate-labels"
              >
                <div className="mt-auto h-6 md:h-7 animate-opacity animate-delay-1000">
                  I'm a
                </div>
              </div>
            </div>

            <div
              className={[
                'transition-all',
                animationStage < 5 ? 'translate-x-0' : '-translate-x-10',
              ].join(' ')}
            >
              <div className="animate-labels flex-grow">
                <div className="animate-opacity animate-delay-1000">
                  Head of Engineering
                </div>
                <div className="animate-opacity animate-delay-2000">
                  TypeScript Enthusiast
                </div>
                <div className="animate-opacity animate-delay-3000">
                  Startup Founder
                </div>
                <div className="animate-opacity animate-delay-4000">
                  Full-Stack Developer
                </div>
              </div>
            </div>
          </div>
          <div className="text-base md:text-lg text-white/80 space-y-2">
            <p>
              Lead engineer on the flagship product at{' '}
              <Link
                href="https://efficient.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Efficient App
              </Link>
              . Building developer tooling at Layerbase.
            </p>
            <p>
              Based in Austin. Previously SF and Western NY. Collection agency
              owner turned software engineer.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
            <Image
              src="/headshot.jpg"
              width={192}
              height={192}
              className="object-cover"
              alt="Bob Bass"
              priority
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl mb-2">🎸</div>
          <div className="font-semibold mb-1">Interests</div>
          <div className="text-sm text-white/70">
            Programming, Skateboarding, Guitar, and Pet Rats
          </div>
        </div>
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl mb-2">🚀</div>
          <div className="font-semibold mb-1">Founder</div>
          <div className="text-sm text-white/70">
            Ashland Development (2011 - Sold 2019), DebtOS (Pioneer 2020),
            Layerbase (2025)
          </div>
        </div>
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl mb-2">💡</div>
          <div className="font-semibold mb-1">Philosophy</div>
          <div className="text-sm text-white/70">
            Passionate about mentorship and helping others grow
          </div>
        </div>
      </div>
    </div>
  )
}

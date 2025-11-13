'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

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
          <div className="text-5xl md:text-6xl font-bold mb-4">Bob Bass</div>
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
              Building developer tooling and leading engineering teams at
              Efficient App.
            </p>
            <p>
              Based in Austin. Previously SF and Western NY. Former debt
              collector turned software engineer.
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
            Skateboarding, guitar, and rat enthusiast (owned 10!)
          </div>
        </div>
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <div className="text-3xl mb-2">🚀</div>
          <div className="font-semibold mb-1">Founder</div>
          <div className="text-sm text-white/70">
            Built Layerbase, DebtOS (Pioneer 2020), and Narro Automation
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

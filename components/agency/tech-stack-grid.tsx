'use client'

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTheme } from 'next-themes'
import { motion, LayoutGroup } from 'motion/react'
import {
  TECH_STACK,
  TECH_CATEGORY_LABELS,
  type TechCategory,
} from '@/lib/tech-stack'
import { cn } from '@/lib/cn'

const categories = Object.entries(TECH_CATEGORY_LABELS) as [
  TechCategory,
  string,
][]

type CachedItem = {
  el: HTMLElement
  brand: string
}

const SPOTLIGHT_FALLBACK = 'oklch(75% 0.1 200)'

function isWashedOut(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // Relative luminance (ITU-R BT.709)
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return l > 200
}

export function TechStackGrid() {
  const { resolvedTheme } = useTheme()
  const [active, setActive] = useState<TechCategory | null>(null)
  const [visible, setVisible] = useState(false)
  const [hiddenByJs, setHiddenByJs] = useState(false)
  const [filterKey, setFilterKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const brandCacheRef = useRef<CachedItem[]>([])
  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light'

  const rebuildBrandCache = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    const items: CachedItem[] = []
    grid.querySelectorAll<HTMLElement>('[data-brand]').forEach((el) => {
      items.push({ el, brand: el.dataset.brand! })
    })
    brandCacheRef.current = items
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }

    setHiddenByJs(true)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHiddenByJs(false)
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = setTimeout(rebuildBrandCache, 100)
    return () => clearTimeout(timer)
  }, [filterKey, rebuildBrandCache])

  const handleSpotlight = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const spot = spotRef.current
    if (!spot) return
    const mx = e.clientX
    const my = e.clientY
    spot.style.left = `${mx}px`
    spot.style.top = `${my}px`
    spot.style.opacity = '1'

    const cache = brandCacheRef.current
    let closestBrand: string | null = null
    let minDist = Infinity
    for (let i = 0; i < cache.length; i++) {
      const item = cache[i]
      const r = item.el.getBoundingClientRect()
      const d = Math.hypot(
        mx - (r.left + r.width / 2),
        my - (r.top + r.height / 2),
      )
      if (d < minDist) {
        minDist = d
        closestBrand = item.brand
      }
    }
    if (closestBrand) {
      spot.style.setProperty(
        '--spot-color',
        isWashedOut(closestBrand) ? SPOTLIGHT_FALLBACK : closestBrand,
      )
    }
  }, [])

  const hideSpotlight = useCallback(() => {
    const spot = spotRef.current
    if (spot) spot.style.opacity = '0'
  }, [])

  function handleFilter(category: TechCategory | null) {
    setActive(category)
    setFilterKey((k) => k + 1)
  }

  const filtered = active
    ? TECH_STACK.filter((t) => t.category === active)
    : TECH_STACK

  return (
    <div ref={ref} className="relative">
      <div
        ref={spotRef}
        className="tech-grid-spotlight pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 max-[25rem]:hidden"
        style={{ opacity: 0 }}
      />
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => handleFilter(null)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
            active === null
              ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground',
          )}
        >
          All
        </button>
        {categories.map(([value, label]) => (
          <button
            key={value}
            onClick={() => handleFilter(value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
              active === value
                ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'border-border/50 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <LayoutGroup id="tech-stack-grid">
        <motion.div
          ref={gridRef}
          layout
          onMouseMove={handleSpotlight}
          onMouseLeave={hideSpotlight}
          className="relative grid grid-cols-3 gap-3 max-[25rem]:mx-auto max-[25rem]:flex max-[25rem]:w-fit max-[25rem]:flex-col max-[25rem]:gap-0 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"
        >
          {filtered.map(({ Icon, name, brandColor }, index) => (
            <motion.div
              key={`${name}-${filterKey}`}
              layout="position"
              initial={false}
              data-brand={mounted ? brandColor[colorMode] : brandColor.light}
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-xl p-3 sm:gap-3 sm:p-5',
                'max-[25rem]:flex-row max-[25rem]:gap-5 max-[25rem]:rounded-none max-[25rem]:border-b max-[25rem]:border-border/20 max-[25rem]:px-3 max-[25rem]:py-5',
                hiddenByJs && 'opacity-0',
                visible && !hiddenByJs && 'animate-fade-in',
              )}
              style={
                visible && !hiddenByJs
                  ? { animationDelay: `${index * 30}ms` }
                  : undefined
              }
            >
              {mounted && (
                <div
                  className="pointer-events-none absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70 max-[25rem]:block"
                  style={{ backgroundColor: brandColor[colorMode] }}
                />
              )}
              <Icon
                className="relative h-8 w-8 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-130 max-[25rem]:h-10 max-[25rem]:w-10"
                style={mounted ? { color: brandColor[colorMode] } : undefined}
              />
              <span className="relative text-xs font-medium text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-foreground max-[25rem]:w-36 max-[25rem]:text-lg">
                {name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}

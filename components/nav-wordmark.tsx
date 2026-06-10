'use client'

import Link from 'next/link'
import type { NavBrand } from '@/lib/nav-config'
import { BbassMark } from '@/components/icons/bbass-mark'
import { cn } from '@/lib/cn'

type NavWordmarkProps = {
  brand: NavBrand
  alternateBrand?: NavBrand
  expanded?: boolean
}

export function NavWordmark({ brand }: NavWordmarkProps) {
  return (
    <Link
      href={brand.href}
      className={cn(
        'flex items-center gap-2 transition-opacity hover:opacity-80',
      )}
    >
      <BbassMark className="size-6 shrink-0" />
      <span className="font-display text-base font-semibold tracking-tight">
        {brand.name}
        {brand.nameHighlight ? ` ${brand.nameHighlight}` : ''}
      </span>
    </Link>
  )
}

import { useId } from 'react'

type BbassMarkProps = {
  className?: string
}

// Bass-clef "b:" mark: a lowercase b with the clef's two dots. Kept in sync
// with app/icon.svg (the favicon).
export function BbassMark({ className = 'h-8 w-8' }: BbassMarkProps) {
  const id = useId()
  const tileId = `${id}-tile`
  const inkId = `${id}-ink`

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={tileId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#132033" />
          <stop offset="1" stopColor="#080d16" />
        </linearGradient>
        <linearGradient
          id={inkId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="10"
          x2="0"
          y2="52"
        >
          <stop offset="0" stopColor="#7ee6f2" />
          <stop offset="1" stopColor="#14aec8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${tileId})`} />
      <g
        fill="none"
        stroke={`url(#${inkId})`}
        strokeWidth="7"
        strokeLinecap="round"
      >
        <path d="M18 12 V40" />
        <circle cx="28" cy="40" r="10" />
      </g>
      <g fill="#f2b632">
        <circle cx="46.5" cy="32" r="3.8" />
        <circle cx="46.5" cy="46" r="3.8" />
      </g>
    </svg>
  )
}

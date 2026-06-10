type BbassMarkProps = {
  className?: string
}

// Stylized "B" (bbass.co) built from receding horizontal layers, filled with
// the brand gradient (#818fc7 -> #00b6ca). The clip-path keeps the slab gaps
// transparent in any theme.
export function BbassMark({ className = 'h-8 w-8' }: BbassMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bbass-mark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#818fc7" />
          <stop offset="1" stopColor="#00b6ca" />
        </linearGradient>
        <clipPath id="bbass-mark-shape">
          <path
            fillRule="evenodd"
            d="M 13 9 H 34 C 43 9 49 14 49 21 C 49 28 45 32 41 32 C 45 32 49 36 49 43 C 49 50 43 55 34 55 H 13 Z M 25 16.5 H 33 Q 37 16.5 37 21 Q 37 25.5 33 25.5 H 25 Z M 25 38 H 34 Q 39 38 39 42.5 Q 39 47 34 47 H 25 Z"
          />
        </clipPath>
      </defs>
      <g clipPath="url(#bbass-mark-shape)" fill="url(#bbass-mark-grad)">
        <rect x="0" y="8" width="64" height="6.6" />
        <rect x="0" y="16" width="64" height="6.6" />
        <rect x="0" y="24" width="64" height="6.6" />
        <rect x="0" y="32" width="64" height="6.6" />
        <rect x="0" y="40" width="64" height="6.6" />
        <rect x="0" y="48" width="64" height="6.6" />
      </g>
    </svg>
  )
}

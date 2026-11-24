import Image from 'next/image'

export function BbassMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <Image
      src="/icon.svg"
      alt=""
      width={32}
      height={32}
      unoptimized
      className={className}
    />
  )
}

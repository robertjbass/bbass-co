import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
      <p className="text-2xl md:text-3xl mb-8 text-white/80">Page not found</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
      >
        Go back home
      </Link>
    </div>
  )
}

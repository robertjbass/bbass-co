'use client'

import { useState, useEffect } from 'react'

const Cursor = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const x = (clientX / window.innerWidth) * 100
      const y = (clientY / window.innerHeight) * 100
      setCursorPosition({ x, y })
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(circle at ${cursorPosition.x}% ${cursorPosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
      }}
    />
  )
}

export default Cursor

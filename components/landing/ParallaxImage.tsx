'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt?: string
  objectPosition?: string
  strength?: number
  priority?: boolean
}

export function ParallaxImage({
  src,
  alt = '',
  objectPosition = 'center',
  strength = 0.2,
  priority = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    let rafId: number
    let lastY = -1

    const tick = () => {
      const y = window.scrollY
      if (y !== lastY) {
        lastY = y
        const { top, height } = container.getBoundingClientRect()
        const vh = window.innerHeight
        const progress = Math.max(0, Math.min(1, (vh - top) / (vh + height)))
        const drift = -((progress * 2 - 1) * strength * height)
        inner.style.transform = `translateY(${drift.toFixed(1)}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [strength])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/*
        Layout set here in JSX — not in useEffect — so next/image fill
        has a positioned parent from the first render, and the transform
        applied by JS actually moves the image.
        top/bottom: -120px oversize so edges never show during drift.
      */}
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          top: '-120px',
          bottom: '-120px',
          left: 0,
          right: 0,
          willChange: 'transform',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
          sizes="100vw"
        />
      </div>
    </div>
  )
}

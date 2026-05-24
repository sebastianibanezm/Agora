'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt?: string
  objectPosition?: string
  /** How many pixels the image drifts per 1px of scroll. 0.2 = clearly visible. */
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

    // Oversize the image vertically by a fixed pixel amount so edges
    // never show through the overflow-hidden container as it drifts.
    const OVERSCAN_PX = 120

    inner.style.position = 'absolute'
    inner.style.left = '0'
    inner.style.right = '0'
    inner.style.top = `-${OVERSCAN_PX}px`
    inner.style.height = `calc(100% + ${OVERSCAN_PX * 2}px)`
    inner.style.willChange = 'transform'

    let rafId: number
    let lastScrollY = -1

    const tick = () => {
      const scrollY = window.scrollY
      if (scrollY !== lastScrollY) {
        lastScrollY = scrollY
        const rect = container.getBoundingClientRect()
        const vh = window.innerHeight
        // progress: 0 when top of element is at bottom of viewport,
        //           1 when bottom of element is at top of viewport
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
        // drift upward as progress increases (classic slow-background parallax)
        const driftPx = -((progress * 2 - 1) * strength * rect.height)
        inner.style.transform = `translateY(${driftPx.toFixed(1)}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [strength])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* inner sized and positioned entirely by the useEffect above */}
      <div ref={innerRef}>
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

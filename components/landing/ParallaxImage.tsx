'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt?: string
  objectPosition?: string
  /** 0.07 = subtle hero, 0.12 = section images, 0.08 = footer */
  strength?: number
  priority?: boolean
}

export function ParallaxImage({
  src,
  alt = '',
  objectPosition = 'center',
  strength = 0.12,
  priority = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    let rafId = 0
    let ticking = false

    const update = () => {
      ticking = false
      const rect = container.getBoundingClientRect()
      const viewportH =
        window.innerHeight || document.documentElement.clientHeight
      const total = rect.height + viewportH
      if (total <= 0) return

      // 0 when container's top edge first enters bottom of viewport,
      // 1 when its bottom edge has just left the top of viewport.
      const raw = (viewportH - rect.top) / total
      const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw

      // Map [0, 1] -> [-1, 1] and scale by strength * height (px).
      // Negate so the image drifts UPWARD as the user scrolls DOWN.
      const drift = -((progress * 2 - 1) * strength * rect.height)
      inner.style.transform = `translate3d(0, ${drift.toFixed(2)}px, 0)`
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      rafId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [strength])

  // Oversize the inner wrapper so the image always fully covers the container
  // regardless of drift position. Max drift = strength * height, so we extend
  // by 2 * strength * height vertically (split top/bottom), plus a small safety
  // margin to avoid sub-pixel edge bleed.
  const overscanPct = Math.max(0, strength) * 200 + 4 // % of container height
  const halfOverscan = overscanPct / 2

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `-${halfOverscan}%`,
          height: `calc(100% + ${overscanPct}%)`,
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
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

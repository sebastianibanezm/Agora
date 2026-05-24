'use client'

import { useEffect, useId, useRef } from 'react'
import Image from 'next/image'

interface BaseProps {
  src: string
  alt?: string
  objectPosition?: string
  /** Drift range as a fraction of container height (0.12 = ±12%). */
  strength?: number
  priority?: boolean
}

interface FillProps extends BaseProps {
  /** Absolute inset-0 — for hero/footer full-bleed backgrounds. */
  variant?: 'fill'
  /** When set, the parent element owns the view timeline (must have .parallax-root). */
  timelineName?: string
  className?: never
  style?: never
}

interface FrameProps extends BaseProps {
  /** In-flow framed image — for section card photos. */
  variant: 'frame'
  className?: string
  style?: React.CSSProperties
}

type Props = FillProps | FrameProps

export function parallaxRootStyle(timelineName: string): React.CSSProperties {
  return {
    viewTimelineName: timelineName,
    viewTimelineAxis: 'block',
  } as React.CSSProperties
}

export function useParallaxTimeline() {
  const timelineId = useId().replace(/:/g, '')
  const timelineName = `--parallax-${timelineId}`
  return { timelineName, rootStyle: parallaxRootStyle(timelineName) }
}

function ParallaxLayers({
  src,
  alt = '',
  objectPosition = 'center',
  strength = 0.12,
  priority = false,
  timelineName,
}: BaseProps & { timelineName: string }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const shift = `${strength * 100}%`

  useEffect(() => {
    if (typeof CSS === 'undefined' || CSS.supports('animation-timeline', 'view()')) return

    const root = layerRef.current?.closest('.parallax-root') as HTMLElement | null
    const layer = layerRef.current
    if (!root || !layer) return

    let rafId = 0

    const tick = () => {
      const { top, height } = root.getBoundingClientRect()
      if (height > 0) {
        const vh = window.innerHeight
        const progress = Math.max(0, Math.min(1, (vh - top) / (vh + height)))
        const drift = -((progress * 2 - 1) * strength * height)
        layer.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [strength])

  return (
    <div
      ref={layerRef}
      className="parallax-layer absolute inset-x-0"
      style={
        {
          '--parallax-shift': shift,
          animationTimeline: timelineName,
          top: `calc(-1 * var(--parallax-shift))`,
          height: `calc(100% + 2 * var(--parallax-shift))`,
        } as React.CSSProperties
      }
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        style={{ objectPosition }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}

export function ParallaxImage(props: Props) {
  const {
    src,
    alt,
    objectPosition,
    strength,
    priority,
  } = props

  const internalTimeline = useParallaxTimeline()
  const isFrame = props.variant === 'frame'
  const externalTimeline = !isFrame ? props.timelineName : undefined
  const timelineName = externalTimeline ?? internalTimeline.timelineName

  const layers = (
    <ParallaxLayers
      src={src}
      alt={alt}
      objectPosition={objectPosition}
      strength={strength}
      priority={priority}
      timelineName={timelineName}
    />
  )

  if (isFrame) {
    return (
      <div
        className={`parallax-root relative w-full overflow-hidden ${props.className ?? ''}`}
        style={{ ...internalTimeline.rootStyle, ...props.style }}
      >
        {layers}
      </div>
    )
  }

  if (externalTimeline) {
    return <div className="absolute inset-0 overflow-hidden">{layers}</div>
  }

  return (
    <div
      className="parallax-root absolute inset-0 overflow-hidden"
      style={internalTimeline.rootStyle}
    >
      {layers}
    </div>
  )
}

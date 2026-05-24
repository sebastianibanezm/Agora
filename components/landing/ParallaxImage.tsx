'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

interface Props {
  src: string
  alt?: string
  objectPosition?: string
  /** 0.06 = very subtle (hero/footer), 0.08 = section images */
  strength?: number
  priority?: boolean
}

export function ParallaxImage({
  src,
  alt = '',
  objectPosition = 'center',
  strength = 0.08,
  priority = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // drift range in % of the (slightly oversized) motion layer
  const range = strength * 100
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`])
  // scale up enough so drifting edges never show through the overflow-hidden parent
  const scale = 1 + strength * 2

  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div style={{ y, scale, position: 'absolute', inset: 0 }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
      </motion.div>
    </div>
  )
}

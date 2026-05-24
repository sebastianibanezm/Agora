'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const range = strength * 100
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`])
  // overscale so drifting edges never show through overflow-hidden parent
  const scale = 1 + strength * 2

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {/* Keep positioning in className — only motion values in style */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
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

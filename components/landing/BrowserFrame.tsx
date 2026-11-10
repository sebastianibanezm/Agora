'use client'

import React from 'react'
import Image from 'next/image'
import type { ReactNode } from 'react'

type FrameProps = {
  src: string
  alt: string
  caption?: string
  priority?: boolean
  /** Text in the address bar. */
  label?: ReactNode
  /** Short note at the right of the address bar, e.g. "example data". */
  note?: ReactNode
  width?: number
  height?: number
  sizes?: string
  /** Deeper shadow, for a frame that sits over the hero photo. */
  raised?: boolean
}

/** Browser chrome around a window: dots, an address bar and an optional note. */
export function FrameChrome({ label, note }: { label?: ReactNode; note?: ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 px-[14px]"
      style={{ height: '40px', background: '#F2EAD9', borderBottom: '1px solid rgba(60,42,22,0.12)' }}
    >
      <span className="flex gap-[6px] flex-shrink-0" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-[10px] h-[10px] rounded-full" style={{ background: '#DCCFB8' }} />
        ))}
      </span>
      <span
        className="flex-1 min-w-0 text-center text-[12px] truncate"
        style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45' }}
      >
        {label}
      </span>
      {note && (
        <span
          className="hidden sm:inline flex-shrink-0 text-[12px]"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45' }}
        >
          {note}
        </span>
      )}
    </div>
  )
}

export const FRAME_STYLE: React.CSSProperties = {
  border: '1px solid rgba(60,42,22,0.12)',
  background: '#FFFBF2',
  boxShadow: '0 24px 64px rgba(43,31,18,0.16), 0 2px 8px rgba(43,31,18,0.06)',
}

const RAISED_SHADOW =
  '0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 60px -20px rgba(34,24,17,0.35), 0 8px 18px -8px rgba(34,24,17,0.18)'

/**
 * Frames a real product screenshot in a minimal browser chrome so it reads
 * as the actual application. Screenshots are 2x captures.
 */
export function BrowserFrame({
  src,
  alt,
  caption,
  priority = false,
  label = 'app.agenteagora.com',
  note,
  width = 1600,
  height = 1000,
  sizes = '(max-width: 768px) 100vw, 720px',
  raised = false,
}: FrameProps) {
  return (
    <figure className="m-0">
      <div
        className="overflow-hidden rounded-[14px]"
        style={raised ? { ...FRAME_STYLE, boxShadow: RAISED_SHADOW } : FRAME_STYLE}
      >
        <FrameChrome label={label} note={note} />
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="block w-full h-auto"
          sizes={sizes}
        />
      </div>
      {caption && (
        <figcaption
          className="mt-3 text-[12.5px] leading-[1.5]"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

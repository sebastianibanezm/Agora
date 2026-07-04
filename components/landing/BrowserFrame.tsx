'use client'

import React from 'react'
import Image from 'next/image'

/**
 * Frames a real product screenshot in a minimal browser chrome so it reads
 * as the actual application. Screenshots are 3200×2000 (2x captures).
 */
export function BrowserFrame({
  src,
  alt,
  caption,
  priority = false,
}: {
  src: string
  alt: string
  caption?: string
  priority?: boolean
}) {
  return (
    <figure className="m-0">
      <div
        className="overflow-hidden rounded-[14px]"
        style={{
          border: '1px solid rgba(60,42,22,0.14)',
          boxShadow: '0 24px 64px rgba(43,31,18,0.16), 0 2px 8px rgba(43,31,18,0.06)',
          background: '#FFFCF1',
        }}
      >
        <div
          className="flex items-center gap-[6px] px-4"
          style={{ height: '34px', background: '#F1E8D5', borderBottom: '1px solid rgba(60,42,22,0.10)' }}
        >
          {['#D9CBB2', '#D9CBB2', '#D9CBB2'].map((c, i) => (
            <span key={i} className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: c }} />
          ))}
          <span
            className="mx-auto px-4 py-[3px] rounded-[6px] text-[10px] tracking-[0.04em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860', background: '#FCF7EA' }}
          >
            app.agenteagora.com
          </span>
        </div>
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          priority={priority}
          className="block w-full h-auto"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
      {caption && (
        <figcaption
          className="mt-3 text-[10px] uppercase tracking-[0.10em] text-center"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

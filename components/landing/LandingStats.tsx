'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useFadeIn } from '@/hooks/useFadeIn'

const STATS = ['stat1', 'stat2', 'stat3'] as const

export function LandingStats() {
  const t = useTranslations('landing')
  const ref = useFadeIn()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ borderTop: '1px solid rgba(60,42,22,0.08)', borderBottom: '1px solid rgba(60,42,22,0.08)', opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.55s ease-out, transform 0.55s ease-out' }}>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {STATS.map((key, i) => (
          <div
            key={key}
            className={`flex flex-col gap-3 ${i < 2 ? 'border-b md:border-b-0 md:border-r' : ''}`}
            style={{
              padding: '64px 40px',
              borderColor: 'rgba(60,42,22,0.08)',
            }}
          >
            <div
              className="font-light italic leading-[0.95]"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(52px, 6vw, 80px)',
                letterSpacing: '-0.02em',
                color: '#2B1F12',
              }}
            >
              {t(`stats.${key}Num`)}
            </div>
            <div className="text-[15px] font-medium leading-[1.4]" style={{ color: '#2B1F12' }}>
              {t(`stats.${key}Label`)}
            </div>
            <p
              className="text-[10.5px] italic leading-[1.55] m-0"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860', maxWidth: '32ch' }}
            >
              {t(`stats.${key}Src`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

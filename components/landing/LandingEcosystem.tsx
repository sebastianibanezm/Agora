'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useFadeIn } from '@/hooks/useFadeIn'

export function LandingEcosystem() {
  const t = useTranslations('landing.ecosystem')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(44px)',
        transition: 'opacity 0.72s cubic-bezier(0.23,1,0.32,1), transform 0.72s cubic-bezier(0.23,1,0.32,1)',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12 py-[80px]">
        <p
          className="italic m-0"
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'clamp(18px, 1.8vw, 24px)',
            lineHeight: 1.25,
            color: '#5A4A38',
            fontWeight: 300,
            maxWidth: '56ch',
          }}
        >
          {t('statement')}
        </p>
      </div>
    </section>
  )
}

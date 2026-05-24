'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useFadeIn } from '@/hooks/useFadeIn'

const STATS = ['stat1', 'stat2', 'stat3'] as const

export function LandingStats() {
  const t = useTranslations('landing')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        borderBottom: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12" style={{ paddingTop: '88px', paddingBottom: '88px' }}>
        {/* Top row: eyebrow + horizontal rule */}
        <div className="flex items-center gap-6 mb-14">
          <span
            className="flex-shrink-0 text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            {t('stats.eyebrow')}
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(60,42,22,0.08)' }} />
        </div>

        {/* Stat columns */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {STATS.map((key, i) => (
            <div
              key={key}
              className={[
                'flex flex-col',
                i < 2 ? 'border-b md:border-b-0 md:border-r pb-11 md:pb-0' : '',
                i > 0 ? 'pt-11 md:pt-0 md:pl-10' : '',
                i < 2 ? 'md:pr-10' : '',
              ].join(' ')}
              style={{ borderColor: 'rgba(60,42,22,0.08)' }}
            >
              <div
                className="italic font-light"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(64px, 7vw, 88px)',
                  letterSpacing: '-0.025em',
                  lineHeight: 0.9,
                  color: '#2B1F12',
                }}
              >
                {t(`stats.${key}Num` as any)}
              </div>
              <div
                className="font-medium mt-4"
                style={{ fontSize: '17px', color: '#2B1F12', lineHeight: 1.4 }}
              >
                {t(`stats.${key}Label` as any)}
              </div>
              <p
                className="italic m-0 mt-2"
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '11px',
                  color: '#8A7860',
                  maxWidth: '32ch',
                  lineHeight: 1.55,
                }}
              >
                {t(`stats.${key}Src` as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

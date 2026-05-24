'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useFadeIn } from '@/hooks/useFadeIn'

const GROUPS = [
  { key: 'groupCarriers', items: ['MSC', 'Hapag-Lloyd', 'CSAV', 'CMA CGM', 'Evergreen'] },
  { key: 'groupTerminals', items: ['Puerto San Antonio', 'Puerto Valparaíso', 'Puerto Mejillones'] },
  { key: 'groupAuthorities', items: ['SAG', 'Aduana Chile', 'SERNAP', 'USDA'] },
] as const

export function LandingEcosystem() {
  const t = useTranslations('landing.ecosystem')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-12 py-[80px]">
        {/* Asymmetric row: eyebrow + statement */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16 items-center">
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            {t('eyebrow')}
          </span>
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

        {/* Ecosystem name rows */}
        <div
          className="mt-10 pt-10 flex flex-col gap-[18px]"
          style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
        >
          {GROUPS.map(({ key, items }) => (
            <div key={key} className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <span
                className="text-[10px] uppercase tracking-[0.14em] flex-shrink-0"
                style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586', minWidth: '108px' }}
              >
                {t(key)}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {items.map((item, i) => (
                  <React.Fragment key={item}>
                    <span
                      className="italic"
                      style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '15px',
                        color: '#8A7860',
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </span>
                    {i < items.length - 1 && (
                      <span style={{ color: 'rgba(60,42,22,0.18)', fontFamily: 'var(--font-family-mono)', fontSize: '11px' }}>
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

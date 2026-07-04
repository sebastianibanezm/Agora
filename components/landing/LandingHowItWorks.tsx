'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'

export function LandingHowItWorks() {
  const t = useTranslations('landing.howItWorks')
  const ref = useReveal<HTMLElement>(0.15)

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="reveal py-[120px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="max-w-[640px] mb-16 stagger-item">
          <span
            className="block mb-3 text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            {t('eyebrow')}
          </span>
          <h2
            className="italic font-normal m-0"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(32px, 3.4vw, 46px)',
              lineHeight: 1.06,
              letterSpacing: '-0.015em',
              color: '#2B1F12',
            }}
          >
            {t('title')}
            <br />
            {t('titleLine2')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {(['1', '2', '3'] as const).map((n, i) => (
            <div
              key={n}
              className={[
                'stagger-item',
                i < 2 ? 'border-b md:border-b-0 md:border-r pb-10 md:pb-0' : '',
                i > 0 ? 'pt-10 md:pt-0 md:pl-10' : '',
                i < 2 ? 'md:pr-10' : '',
              ].join(' ')}
              style={{ borderColor: 'rgba(60,42,22,0.08)' }}
            >
              <div
                className="mb-5"
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  color: '#B5A586',
                }}
              >
                0{n}
              </div>
              <h3
                className="italic font-normal mt-0 mb-3"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(20px, 1.9vw, 25px)',
                  lineHeight: 1.15,
                  color: '#2B1F12',
                }}
              >
                {t(`step${n}Title` as const)}
              </h3>
              <p className="m-0 text-[14px] leading-[1.68]" style={{ color: '#5A4A38', maxWidth: '38ch' }}>
                {t(`step${n}Body` as const)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

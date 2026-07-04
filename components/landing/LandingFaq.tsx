'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const ITEMS = ['1', '2', '3', '4', '5'] as const

export function LandingFaq() {
  const t = useTranslations('landing.faq')
  const ref = useReveal<HTMLElement>(0.1)

  return (
    <section
      ref={ref}
      id="faq"
      className="reveal py-[120px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-20 items-start">
          <div className="stagger-item">
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
                fontSize: 'clamp(28px, 2.8vw, 40px)',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                color: '#2B1F12',
                maxWidth: '16ch',
              }}
            >
              {t('title')}
            </h2>
          </div>

          <div className="stagger-item" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
            {ITEMS.map((n) => (
              <details key={n} className="faq-item group">
                <summary className="faq-summary">
                  <span
                    className="italic"
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: 'clamp(16px, 1.5vw, 19px)',
                      color: '#2B1F12',
                      lineHeight: 1.3,
                    }}
                  >
                    {t(`q${n}` as const)}
                  </span>
                  <Plus
                    size={16}
                    strokeWidth={1.5}
                    className="faq-icon flex-shrink-0"
                    style={{ color: '#8A7860' }}
                    aria-hidden
                  />
                </summary>
                <p
                  className="m-0 pb-6 text-[14.5px] leading-[1.7]"
                  style={{ color: '#5A4A38', maxWidth: '62ch' }}
                >
                  {t(`a${n}` as const)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

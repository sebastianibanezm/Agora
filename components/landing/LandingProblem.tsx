'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'
import { SectionHeading } from './SectionHeading'

const STATS = ['1', '2', '3'] as const

export function LandingProblem() {
  const t = useTranslations('landing.problem')
  const ref = useReveal<HTMLElement>(0.15)

  return (
    <section
      ref={ref}
      id="problem"
      className="reveal py-[120px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} accent={t('titleAccent')} lede={t('lede')} />

        <div className="grid grid-cols-1 md:grid-cols-3 mt-16">
          {STATS.map((n, i) => (
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
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(44px, 4.6vw, 64px)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: '#2B1F12',
                }}
              >
                {t(`stat${n}Num`)}
                {n === '3' && (
                  <span
                    className="ml-2 text-[15px]"
                    style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860', letterSpacing: 0 }}
                  >
                    {t('stat3Unit')}
                  </span>
                )}
              </div>
              <p className="mt-4 mb-0 text-[14px] leading-[1.68]" style={{ color: '#5A4A38', maxWidth: '34ch' }}>
                {t(`stat${n}Label`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

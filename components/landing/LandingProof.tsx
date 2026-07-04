'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'

export function LandingProof() {
  const t = useTranslations('landing.proof')
  const ref = useReveal<HTMLElement>(0.3)

  return (
    <section ref={ref} className="reveal" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12 py-[64px]">
        <div className="flex items-center gap-6 mb-10">
          <span
            className="flex-shrink-0 text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            {t('eyebrow')}
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(60,42,22,0.08)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1px_1fr] gap-8 md:gap-12 items-center">
          {/* Client logo + identity */}
          <div className="flex items-center gap-6 stagger-item">
            <Image
              src="/landing/onizzo-logo.png"
              alt={t('logoAlt')}
              width={164}
              height={58}
              className="proof-logo flex-shrink-0"
            />
            <div>
              <div className="font-medium" style={{ fontSize: '14px', color: '#2B1F12' }}>
                {t('clientName')}
              </div>
              <div className="mt-[2px]" style={{ fontSize: '12.5px', color: '#8A7860' }}>
                {t('clientDetail')}
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-full min-h-[56px]" style={{ background: 'rgba(60,42,22,0.08)' }} />

          {/* Statement + markers */}
          <div className="stagger-item">
            <p
              className="italic m-0"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(17px, 1.6vw, 21px)',
                lineHeight: 1.4,
                color: '#5A4A38',
                fontWeight: 300,
              }}
            >
              {t('statement')}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {(['marker1', 'marker2', 'marker3'] as const).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.10em]"
                  style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{ background: '#4F7A3C' }}
                  />
                  {t(key)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

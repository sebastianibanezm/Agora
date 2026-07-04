'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

export function LandingCtaBand() {
  const t = useTranslations('landing.ctaBand')
  const ref = useReveal<HTMLElement>(0.3)

  return (
    <section ref={ref} className="reveal relative overflow-hidden" style={{ background: '#2B1F12' }}>
      {/* Paper grain — same treatment as hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(248,242,228,0.032) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
          opacity: 0.55,
        }}
      />
      {/* Warm corner wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(70% 90% at 85% 10%, rgba(185,122,31,0.14), transparent 60%)',
        }}
      />

      <div className="relative max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12 py-[96px]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <h2
            className="m-0 stagger-item"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(32px, 3.8vw, 52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.015em',
              fontWeight: 300,
              color: '#F8F2E4',
            }}
          >
            {t('line')}
            <br />
            <span className="italic" style={{ color: '#B97A1F' }}>{t('lineAccent')}</span>
          </h2>
          <a
            href="#contact"
            className="cta-solid inline-flex items-center gap-[8px] font-medium text-[14px] flex-shrink-0 btn-press stagger-item"
            style={{ height: '46px', padding: '0 24px', borderRadius: '999px' }}
          >
            {t('cta')} <ArrowRight size={15} strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </section>
  )
}

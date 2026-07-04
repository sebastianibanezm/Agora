'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const ARTICLE_PATH = '/recursos/ley-21719-proteccion-de-datos-agro'

export function LandingResources() {
  const t = useTranslations('landing.resources')
  const ref = useReveal<HTMLElement>(0.2)

  return (
    <section ref={ref} className="reveal" id="resources" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12 py-[88px]">
        {/* Head row */}
        <div className="flex items-center gap-6 mb-12">
          <span
            className="flex-shrink-0 text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            {t('eyebrow')}
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(60,42,22,0.08)' }} />
          <Link
            href="/recursos"
            className="flex-shrink-0 inline-flex items-center gap-[6px] text-[12px] font-medium"
            style={{ color: '#5A4A38', textDecoration: 'none' }}
          >
            {t('hubCta')} <ArrowRight size={12} strokeWidth={1.8} />
          </Link>
        </div>

        {/* Featured article card */}
        <Link
          href={ARTICLE_PATH}
          className="group grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-14 items-center rounded-[16px] p-6 lg:p-9 stagger-item"
          style={{
            background: '#FCF7EA',
            border: '1px solid rgba(60,42,22,0.10)',
            boxShadow: '0 8px 32px rgba(43,31,18,0.07)',
            textDecoration: 'none',
          }}
        >
          <div
            className="overflow-hidden rounded-[12px]"
            style={{ border: '1px solid rgba(60,42,22,0.10)' }}
          >
            <Image
              src="/recursos/ley-21719-hero.jpg"
              alt={t('heroAlt')}
              width={732}
              height={419}
              className="block w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 460px"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-[7px] px-[10px] py-[4px] rounded-full text-[9.5px] uppercase tracking-[0.10em]"
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  color: '#8B2A1F',
                  background: 'rgba(139,42,31,0.07)',
                  border: '1px solid rgba(139,42,31,0.22)',
                }}
              >
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: '#8B2A1F' }} />
                {t('featuredLabel')}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.10em]"
                style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
              >
                Julio 2026 · 6 min
              </span>
            </div>
            <h3
              className="italic font-normal m-0 mb-3"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(22px, 2.4vw, 30px)',
                lineHeight: 1.15,
                color: '#2B1F12',
              }}
            >
              {t('articleTitle')}
            </h3>
            <p className="m-0 text-[14.5px] leading-[1.68]" style={{ color: '#5A4A38', maxWidth: '54ch' }}>
              {t('articleHook')}
            </p>
            <span
              className="inline-flex items-center gap-[7px] mt-5 text-[13px] font-medium"
              style={{ color: '#2B1F12' }}
            >
              {t('cta')} <ArrowRight size={14} strokeWidth={1.8} />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}

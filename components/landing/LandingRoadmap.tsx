'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'
import { SectionHeading } from './SectionHeading'

const ITEMS = ['1', '2'] as const

export function LandingRoadmap() {
  const t = useTranslations('landing.roadmap')
  const ref = useReveal<HTMLElement>(0.2)

  return (
    <section ref={ref} id="roadmap" className="reveal landing-section" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} accent={t('titleAccent')} lede={t('lede')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {ITEMS.map((n) => (
            <article
              key={n}
              className="stagger-item rounded-[10px] p-6 grid gap-3 content-start"
              style={{ border: '1px dashed rgba(60,42,22,0.22)' }}
            >
              <span
                className="justify-self-start px-[10px] py-[4px] rounded-full text-[10px] uppercase tracking-[0.12em]"
                style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45', background: '#F1E8D5' }}
              >
                {t('tag')}
              </span>
              <h3
                className="italic font-normal m-0"
                style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(20px, 1.9vw, 25px)', lineHeight: 1.15, color: '#2B1F12' }}
              >
                {t(`item${n}Title`)}
              </h3>
              <p className="m-0 text-[14px] leading-[1.68]" style={{ color: '#5A4A38' }}>
                {t(`item${n}Body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

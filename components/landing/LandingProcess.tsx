'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'
import { BrowserFrame } from './BrowserFrame'
import { SectionHeading } from './SectionHeading'

// Production screens on example data, captured at 2x.
const STEPS = [
  { n: '1', src: '/landing/process/proceso-builder.png', width: 2032, height: 1638 },
  { n: '2', src: '/landing/process/shipment-proceso.png', width: 2244, height: 1694 },
  { n: '3', src: '/landing/process/review-booking.png', width: 2880, height: 1800 },
  { n: '4', src: '/landing/process/invoice-review.png', width: 2880, height: 1800 },
  { n: '5', src: '/landing/process/send.png', width: 1480, height: 1480 },
] as const

type Step = (typeof STEPS)[number]

function ProcessStep({ step, index }: { step: Step; index: number }) {
  const t = useTranslations('landing.process')
  // Each step reveals on its own: the section is too tall for one threshold on phones.
  const ref = useReveal<HTMLElement>(0.15)
  const flipped = index % 2 === 1
  const { n } = step

  return (
    <article
      ref={ref}
      className={[
        'reveal grid grid-cols-1 gap-8 lg:gap-14 items-center py-12 lg:py-16',
        flipped ? 'lg:grid-cols-[1.6fr_0.8fr]' : 'lg:grid-cols-[0.8fr_1.6fr]',
      ].join(' ')}
      style={{ borderTop: index > 0 ? '1px solid rgba(60,42,22,0.08)' : undefined }}
    >
      <div className={['stagger-item', flipped ? 'lg:order-2' : ''].join(' ')}>
        <div
          className="mb-5"
          style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', letterSpacing: '0.16em', color: '#B5A586' }}
        >
          0{n}
        </div>
        <h3
          className="italic font-normal mt-0 mb-3"
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'clamp(22px, 2.2vw, 30px)',
            lineHeight: 1.12,
            color: '#2B1F12',
          }}
        >
          {t(`step${n}Title`)}
        </h3>
        <p className="m-0 text-[14.5px] leading-[1.7]" style={{ color: '#5A4A38', maxWidth: '44ch' }}>
          {t(`step${n}Body`)}
        </p>
      </div>
      <div className="stagger-item min-w-0">
        <BrowserFrame
          src={step.src}
          alt={t(`step${n}Alt`)}
          caption={t(`step${n}Caption`)}
          label={`app.agenteagora.com · ${t(`step${n}Bar`)}`}
          width={step.width}
          height={step.height}
          sizes="(max-width: 1024px) 100vw, 720px"
        />
      </div>
    </article>
  )
}

export function LandingProcess() {
  const t = useTranslations('landing.process')
  const ref = useReveal<HTMLDivElement>(0.3)

  return (
    <section id="how-it-works" className="pt-[120px] pb-[72px]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div ref={ref} className="reveal mb-6">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} accent={t('titleAccent')} lede={t('lede')} />
        </div>
        {STEPS.map((step, i) => (
          <ProcessStep key={step.n} step={step} index={i} />
        ))}
        <p
          className="mt-2 mb-0 text-[10px] uppercase tracking-[0.10em] text-center"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
        >
          {t('shotNote')}
        </p>
      </div>
    </section>
  )
}

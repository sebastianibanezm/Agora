'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { captureContactCta } from '@/lib/analytics'
import { SectionHeading } from './SectionHeading'

const STEPS = ['1', '2', '3'] as const
const INCLUDED = ['1', '2', '3'] as const
const LINE = '1px solid rgba(60,42,22,0.08)'

/** Getting started: the three steps from the first call to the first shipment, and what's included. */
export function LandingHowItWorks() {
  const t = useTranslations('landing.howItWorks')
  const ref = useReveal<HTMLElement>(0.15)

  return (
    <section ref={ref} id="getting-started" className="reveal py-[120px]" style={{ borderTop: LINE }}>
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} accent={t('titleLine2')} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 mt-12 items-start">
          <ol className="m-0 p-0 list-none stagger-item">
            {STEPS.map((n, i) => (
              <li
                key={n}
                className="grid grid-cols-[3rem_1fr] gap-4 py-[22px]"
                style={{ borderTop: LINE, borderBottom: i === STEPS.length - 1 ? LINE : undefined }}
              >
                <span
                  className="pt-[6px]"
                  style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', letterSpacing: '0.16em', color: '#B5A586' }}
                >
                  0{n}
                </span>
                <div>
                  <h3
                    className="italic font-normal m-0"
                    style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(20px, 1.9vw, 25px)', lineHeight: 1.15, color: '#2B1F12' }}
                  >
                    {t(`step${n}Title`)}
                  </h3>
                  <p className="mt-[6px] mb-0 text-[14px] leading-[1.68]" style={{ color: '#5A4A38' }}>
                    {t(`step${n}Body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <aside
            className="stagger-item rounded-[10px] p-7 grid gap-[14px]"
            style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.10)' }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
            >
              {t('includedLabel')}
            </span>
            <ul className="m-0 p-0 list-none grid gap-2 text-[15px]" style={{ color: '#2B1F12' }}>
              {INCLUDED.map((n) => (
                <li key={n}>
                  <span aria-hidden className="mr-2" style={{ color: '#B97A1F' }}>—</span>
                  {t(`included${n}`)}
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={() => captureContactCta('getting_started')}
              className="justify-self-start mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-medium btn-press"
              style={{ background: '#2B1F12', color: '#F8F2E4', textDecoration: 'none' }}
            >
              {t('cta')} <ArrowRight size={13} strokeWidth={1.8} />
            </a>
          </aside>
        </div>
      </div>
    </section>
  )
}

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'
import { SectionHeading } from './SectionHeading'

const ROWS = ['1', '2', '3', '4', '5'] as const
const LINE = '1px solid rgba(60,42,22,0.08)'

export function LandingCompare() {
  const t = useTranslations('landing.compare')
  const ref = useReveal<HTMLElement>(0.15)

  return (
    <section ref={ref} id="before-after" className="reveal py-[120px]" style={{ borderTop: LINE }}>
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} accent={t('titleAccent')} />

        <div className="stagger-item mt-14 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14.5px] leading-[1.55]">
            <thead>
              <tr>
                <th scope="col" className="w-[22%]" />
                {(['colToday', 'colAgora'] as const).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="pb-4 pr-6 font-normal text-[10px] uppercase tracking-[0.16em]"
                    style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                  >
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((n) => (
                <tr key={n} style={{ borderTop: LINE }}>
                  <th scope="row" className="py-5 pr-6 align-top font-medium" style={{ color: '#2B1F12' }}>
                    {t(`row${n}Label`)}
                  </th>
                  <td className="py-5 pr-6 align-top w-[39%]" style={{ color: '#8A7860' }}>
                    {t(`row${n}Before`)}
                  </td>
                  <td className="py-5 pr-6 align-top w-[39%]" style={{ color: '#2B1F12' }}>
                    <span className="inline-flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[7px] w-[7px] h-[7px] rounded-full flex-shrink-0"
                        style={{ background: '#4F7A3C' }}
                      />
                      <span>{t(`row${n}After`)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

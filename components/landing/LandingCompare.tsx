'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useReveal } from '@/hooks/useReveal'
import { SectionHeading } from './SectionHeading'

const ROWS = ['1', '2', '3', '4', '5'] as const
const LINE = '1px solid rgba(243,234,216,0.14)'

/** Before / after, as the page's one dark band. */
export function LandingCompare() {
  const t = useTranslations('landing.compare')
  const ref = useReveal<HTMLElement>(0.15)

  return (
    <section ref={ref} id="before-after" className="reveal landing-section" style={{ background: '#221811' }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeading tone="dark" eyebrow={t('eyebrow')} title={t('title')} accent={t('titleAccent')} />

        <div className="stagger-item mt-12">
          <table role="table" className="compare-table w-full border-collapse text-left text-[15.5px] leading-[1.55]">
            <thead>
              <tr role="row">
                <th role="columnheader" scope="col" className="w-[24%]" />
                {(['colToday', 'colAgora'] as const).map((key) => (
                  <th
                    role="columnheader"
                    key={key}
                    scope="col"
                    className="pb-4 pr-6 font-normal text-[12px] uppercase tracking-[0.12em]"
                    style={{ fontFamily: 'var(--font-family-mono)', color: '#C9B9A0' }}
                  >
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((n) => (
                <tr role="row" key={n} style={{ borderTop: LINE }}>
                  <th role="rowheader" scope="row" className="py-[22px] pr-6 align-top font-medium" style={{ color: '#F3EAD8' }}>
                    {t(`row${n}Label`)}
                  </th>
                  <td
                    role="cell"
                    data-label={t('colToday')}
                    className="compare-before py-[22px] pr-6 align-top w-[34%]"
                    style={{ color: '#C9B9A0' }}
                  >
                    <span style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(201,185,160,0.45)' }}>
                      {t(`row${n}Before`)}
                    </span>
                  </td>
                  <td role="cell" className="py-[22px] pr-6 align-top w-[42%]" style={{ color: '#F3EAD8' }}>
                    <span className="inline-flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[9px] w-[7px] h-[7px] rounded-full flex-shrink-0"
                        style={{ background: '#8DBB6E' }}
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

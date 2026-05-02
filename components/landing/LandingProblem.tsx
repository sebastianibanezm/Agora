'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { ThermometerSnowflake, FileWarning, Users } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const CARDS = [
  { key: '1', Icon: ThermometerSnowflake, severity: '#8B2A1F' },
  { key: '2', Icon: FileWarning, severity: '#B97A1F' },
  { key: '3', Icon: Users, severity: '#4F7A3C' },
] as const

export function LandingProblem() {
  const t = useTranslations('landing.problem')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="problem"
      className="py-[120px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)', opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.55s ease-out, transform 0.55s ease-out' }}
    >
      <div className="max-w-[1160px] mx-auto px-12">
        {/* Section head */}
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <span
            className="block mb-[18px] text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            {t('eyebrow')}
          </span>
          <h2
            className="italic font-normal mb-[18px]"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1.06,
              letterSpacing: '-0.015em',
              color: '#2B1F12',
            }}
          >
            {t('title')}
            <br />
            {t('titleLine2')}
          </h2>
          <p className="text-[16px] leading-[1.65] m-0" style={{ color: '#5A4A38' }}>
            {t('lede')}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(({ key, Icon, severity }) => (
            <div
              key={key}
              className="rounded-[14px] p-7 transition-transform duration-150 hover:-translate-y-[2px]"
              style={{
                background: '#FCF7EA',
                border: '1px solid rgba(60,42,22,0.08)',
                borderTop: `2px solid ${severity}`,
              }}
            >
              <div
                className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center mb-4"
                style={{
                  background: '#FFFCF1',
                  border: '1px solid rgba(60,42,22,0.08)',
                  color: '#5A4A38',
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <h3
                className="italic text-[20px] mb-[10px]"
                style={{ fontFamily: 'var(--font-family-display)', color: '#2B1F12', fontWeight: 500 }}
              >
                {t(`card${key}Title` as any)}
              </h3>
              <p className="text-[13.5px] leading-[1.62] m-0" style={{ color: '#5A4A38' }}>
                {t(`card${key}Body` as any)}
              </p>
              <div
                className="mt-[14px] pt-3 italic text-[10px] tracking-[0.04em]"
                style={{
                  borderTop: '1px dashed rgba(60,42,22,0.08)',
                  fontFamily: 'var(--font-family-mono)',
                  color: '#8A7860',
                }}
              >
                {t(`card${key}Cite` as any)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

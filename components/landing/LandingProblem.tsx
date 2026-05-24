'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FileWarning, AlertTriangle, Users } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const CARDS = [
  { key: '1', Icon: FileWarning, severity: '#B97A1F' },
  { key: '2', Icon: AlertTriangle, severity: '#8B2A1F' },
  { key: '3', Icon: Users, severity: '#5A6B85' },
] as const

export function LandingProblem() {
  const t = useTranslations('landing.problem')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="problem"
      className="py-[120px]"
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-12">
        {/* Asymmetric section head */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16 mb-20 items-start">
          {/* Left: eyebrow + h2 */}
          <div>
            <span
              className="block mb-3 text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
            >
              {t('eyebrow')}
            </span>
            <h2
              className="italic font-normal m-0"
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
          </div>

          {/* Right: lede */}
          <div className="lg:pt-[42px]">
            <p
              className="text-[16px] leading-[1.65] m-0"
              style={{ color: '#5A4A38', maxWidth: '52ch' }}
            >
              {t('lede')}
            </p>
          </div>
        </div>

        {/* Problem rows */}
        {CARDS.map(({ key, Icon, severity }, index) => (
          <div
            key={key}
            className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-x-10 gap-y-4"
            style={{
              borderTop: '1px solid rgba(60,42,22,0.08)',
              paddingTop: '44px',
              paddingBottom: '44px',
            }}
          >
            {/* Left column: number + icon */}
            <div className="flex flex-col gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  color: '#B5A586',
                }}
              >
                0{key}
              </span>
              <div
                className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center"
                style={{
                  background: '#FFFCF1',
                  border: '1px solid rgba(60,42,22,0.10)',
                  borderTop: `2px solid ${severity}`,
                  color: severity,
                }}
              >
                <Icon size={15} strokeWidth={1.5} />
              </div>
            </div>

            {/* Right column: title + body + cite */}
            <div>
              <h3
                className="italic font-normal mt-0 mb-3"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(22px, 2.4vw, 28px)',
                  lineHeight: 1.12,
                  color: '#2B1F12',
                }}
              >
                {t(`card${key}Title` as any)}
              </h3>
              <p
                className="mb-4"
                style={{
                  fontSize: '15px',
                  color: '#5A4A38',
                  maxWidth: '54ch',
                  lineHeight: 1.68,
                  margin: '0 0 16px 0',
                }}
              >
                {t(`card${key}Body` as any)}
              </p>
              <div
                className="italic"
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '10.5px',
                  color: '#B5A586',
                }}
              >
                — {t(`card${key}Cite` as any)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

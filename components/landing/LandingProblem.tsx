'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { ParallaxImage } from './ParallaxImage'
import { FileWarning, AlertTriangle, Users } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const CARDS_TOP = [
  { key: '1', Icon: FileWarning, severity: '#B97A1F' },
  { key: '2', Icon: AlertTriangle, severity: '#8B2A1F' },
] as const

const CARD_BOTTOM = { key: '3', Icon: Users, severity: '#5A6B85' } as const

function ProblemCard({
  cardKey,
  Icon,
  severity,
  t,
}: {
  cardKey: string
  Icon: React.ElementType
  severity: string
  t: ReturnType<typeof useTranslations<'landing.problem'>>
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: '#B5A586',
          }}
        >
          0{cardKey}
        </span>
        <div
          className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{
            background: '#FFFCF1',
            border: '1px solid rgba(60,42,22,0.10)',
            borderTop: `2px solid ${severity}`,
            color: severity,
          }}
        >
          <Icon size={14} strokeWidth={1.5} />
        </div>
      </div>
      <h3
        className="italic font-normal mt-0 mb-3"
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(20px, 2vw, 26px)',
          lineHeight: 1.12,
          color: '#2B1F12',
        }}
      >
        {t(`card${cardKey}Title` as any)}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: '#5A4A38',
          lineHeight: 1.68,
          margin: '0 0 14px 0',
        }}
      >
        {t(`card${cardKey}Body` as any)}
      </p>
      <div
        className="italic"
        style={{
          fontFamily: 'var(--font-family-mono)',
          fontSize: '10px',
          color: '#B5A586',
        }}
      >
        — {t(`card${cardKey}Cite` as any)}
      </div>
    </div>
  )
}

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
        transform: 'translateY(44px)',
        transition: 'opacity 0.72s cubic-bezier(0.23,1,0.32,1), transform 0.72s cubic-bezier(0.23,1,0.32,1)',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section head */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Left: eyebrow + title + description */}
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
            <p
              className="text-[16px] leading-[1.65] m-0 mt-8"
              style={{ color: '#5A4A38', maxWidth: '52ch' }}
            >
              {t('lede')}
            </p>
          </div>

          {/* Right: image */}
          <div className="relative w-full">
            <ParallaxImage
              variant="frame"
              src="/landing/problem-bg.png"
              objectPosition="center 20%"
              strength={0.12}
              style={{
                borderRadius: '16px',
                aspectRatio: '4 / 3',
                boxShadow: '0 24px 64px rgba(43,31,18,0.18), 0 0 0 1px rgba(43,31,18,0.06)',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(to bottom, transparent 60%, rgba(43,31,18,0.18) 100%)',
              }}
            />
          </div>
        </div>

        {/* Cards 1 & 2 — side by side */}
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr]"
          style={{ borderTop: '1px solid rgba(60,42,22,0.08)', paddingTop: '44px', paddingBottom: '44px' }}
        >
          <div className="pb-10 md:pb-0 md:pr-16">
            <ProblemCard cardKey="1" Icon={FileWarning} severity="#B97A1F" t={t} />
          </div>
          {/* Divider — horizontal on mobile, vertical on desktop */}
          <div
            className="h-px w-full md:h-auto md:w-px my-0 md:mx-0"
            style={{ background: 'rgba(60,42,22,0.08)' }}
          />
          <div className="pt-10 md:pt-0 md:pl-16">
            <ProblemCard cardKey="2" Icon={AlertTriangle} severity="#8B2A1F" t={t} />
          </div>
        </div>

        {/* Card 3 — full width, editorial treatment */}
        <div
          className="rounded-[14px] p-8 lg:p-12"
          style={{
            background: '#FCF7EA',
            border: '1px solid rgba(60,42,22,0.10)',
            borderLeft: '3px solid #5A6B85',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-start">
            {/* Left: number + icon */}
            <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: '#B5A586',
                }}
              >
                03
              </span>
              <div
                className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: '#FFFCF1',
                  border: '1px solid rgba(60,42,22,0.10)',
                  borderTop: '2px solid #5A6B85',
                  color: '#5A6B85',
                }}
              >
                <Users size={14} strokeWidth={1.5} />
              </div>
            </div>
            {/* Right: copy */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 lg:gap-16 items-start">
              <h3
                className="italic font-normal m-0"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(26px, 2.8vw, 36px)',
                  lineHeight: 1.1,
                  color: '#2B1F12',
                }}
              >
                {t('card3Title')}
              </h3>
              <div>
                <p
                  style={{
                    fontSize: '15px',
                    color: '#5A4A38',
                    lineHeight: 1.70,
                    margin: '0 0 14px 0',
                  }}
                >
                  {t('card3Body')}
                </p>
                <div
                  className="italic"
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '10px',
                    color: '#B5A586',
                  }}
                >
                  — {t('card3Cite')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { FileWarning, AlertTriangle, Users } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useInView } from '@/hooks/useInView'
import { useCountUp } from '@/hooks/useCountUp'

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
          fontSize: '11px',
          color: '#B5A586',
        }}
      >
        — {t(`card${cardKey}Cite` as any)}
      </div>
    </div>
  )
}

const STAT_DEFS = [
  { key: 'stat1', prefix: '', suffix: '%', target: 47 },
  { key: 'stat2', prefix: '$', suffix: '+', target: 420 },
  { key: 'stat3', prefix: '16–', suffix: '', target: 22 },
] as const

function StatNumber({ prefix, suffix, target, enabled }: {
  prefix: string; suffix: string; target: number; enabled: boolean
}) {
  const count = useCountUp(target, 1400, enabled)
  return <>{prefix}{count}{suffix}</>
}

function StatsBand() {
  const t = useTranslations('landing')
  const [bandRef, isVisible] = useInView<HTMLDivElement>(0.2)

  return (
    <div ref={bandRef} data-visible={isVisible ? 'true' : undefined} className="mt-20">
      <div className="flex items-center gap-6 mb-12">
        <span
          className="flex-shrink-0 text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
        >
          {t('stats.eyebrow')}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(60,42,22,0.08)' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {STAT_DEFS.map(({ key, prefix, suffix, target }, i) => (
          <div
            key={key}
            className={[
              'flex flex-col stat-item',
              i < 2 ? 'border-b md:border-b-0 md:border-r pb-10 md:pb-0' : '',
              i > 0 ? 'pt-10 md:pt-0 md:pl-10' : '',
              i < 2 ? 'md:pr-10' : '',
            ].join(' ')}
            style={{ borderColor: 'rgba(60,42,22,0.08)' }}
          >
            <div
              className="italic font-light"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(56px, 6vw, 76px)',
                letterSpacing: '-0.025em',
                lineHeight: 0.9,
                color: '#2B1F12',
              }}
            >
              <StatNumber prefix={prefix} suffix={suffix} target={target} enabled={isVisible} />
            </div>
            <div
              className="font-medium mt-4"
              style={{ fontSize: '16px', color: '#2B1F12', lineHeight: 1.4 }}
            >
              {t(`stats.${key}Label` as any)}
            </div>
            <p
              className="italic m-0 mt-2"
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '11px',
                color: '#8A7860',
                maxWidth: '32ch',
                lineHeight: 1.55,
              }}
            >
              {t(`stats.${key}Src` as any)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LandingProblem() {
  const t = useTranslations('landing.problem')
  const ref = useReveal<HTMLElement>(0.08)

  return (
    <section
      ref={ref}
      id="problem"
      className="reveal py-[120px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section head — editorial two-column text */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-20 items-end mb-20">
          <div className="stagger-item">
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
          <p
            className="text-[16px] leading-[1.65] m-0 stagger-item"
            style={{ color: '#5A4A38', maxWidth: '48ch' }}
          >
            {t('lede')}
          </p>
        </div>

        {/* Cards 1 & 2 — side by side */}
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr]"
          style={{ borderTop: '1px solid rgba(60,42,22,0.08)', paddingTop: '44px', paddingBottom: '44px' }}
        >
          <div className="pb-10 md:pb-0 md:pr-16 stagger-item">
            <ProblemCard cardKey="1" Icon={FileWarning} severity="#B97A1F" t={t} />
          </div>
          <div
            className="h-px w-full md:h-auto md:w-px my-0 md:mx-0"
            style={{ background: 'rgba(60,42,22,0.08)' }}
          />
          <div className="pt-10 md:pt-0 md:pl-16 stagger-item">
            <ProblemCard cardKey="2" Icon={AlertTriangle} severity="#8B2A1F" t={t} />
          </div>
        </div>

        {/* Card 3 — full width, editorial treatment */}
        <div
          className="rounded-[14px] p-8 lg:p-12 stagger-item"
          style={{
            background: '#FCF7EA',
            border: '1px solid rgba(60,42,22,0.10)',
            borderLeft: '3px solid #5A6B85',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-start">
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
                    fontSize: '11px',
                    color: '#B5A586',
                  }}
                >
                  — {t('card3Cite')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The cost of getting it wrong — evidence for the pain above */}
        <StatsBand />
      </div>
    </section>
  )
}

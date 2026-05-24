'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { ParallaxImage } from './ParallaxImage'
import { AlertTriangle, Check, Minus } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'
import { useInView } from '@/hooks/useInView'

type T = ReturnType<typeof useTranslations<'landing.pillars'>>

// ── Pillar visual: Visibility timeline ──────────────────────────
function VisibilityVisual({ t }: { t: T }) {
  const steps: { key: string; done: boolean; active?: boolean }[] = [
    { key: 'vis1Step1', done: true },
    { key: 'vis1Step2', done: true },
    { key: 'vis1Step3', done: true },
    { key: 'vis1Step4', done: false, active: true },
    { key: 'vis1Step5', done: false },
    { key: 'vis1Step6', done: false },
  ]

  const [containerRef, isVisible] = useInView<HTMLDivElement>(0.3)

  return (
    <div
      ref={containerRef}
      className="rounded-[16px] p-6"
      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}
    >
      <p className="text-[10px] uppercase tracking-[0.06em] mb-[14px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
        {t('vis1Status')}
      </p>
      <div className="relative flex items-center justify-between py-5 px-1">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2" style={{ background: 'rgba(60,42,22,0.16)' }} />
        {steps.map((s) => (
          <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className="w-[10px] h-[10px] rounded-full"
              style={{
                background: s.done ? '#4F7A3C' : s.active ? '#B97A1F' : '#F8F2E4',
                border: `1.5px solid ${s.done ? '#4F7A3C' : s.active ? '#B97A1F' : '#B5A586'}`,
                animation: s.active ? 'pulseAmber 2s ease-in-out infinite' : undefined,
              }}
            />
            <span
              className="text-[9px] uppercase tracking-[0.06em] text-center"
              style={{
                fontFamily: 'var(--font-family-mono)',
                color: s.active ? '#2B1F12' : '#8A7860',
                fontWeight: s.active ? 600 : 400,
              }}
            >
              {t(s.key as any)}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-[14px]">
        {[['ETA', '14 ene', '#2B1F12'], ['Temp', '−1.2°C', '#4F7A3C'], ['Docs', '14/18', '#2B1F12']].map(([label, value, color], i) => (
          <div
            key={label}
            className="rounded-[8px] p-[10px]"
            style={{
              background: '#FFFCF1',
              border: '1px solid rgba(60,42,22,0.08)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
              transition: `opacity 500ms cubic-bezier(0.23,1,0.32,1) ${i * 100 + 250}ms, transform 500ms cubic-bezier(0.23,1,0.32,1) ${i * 100 + 250}ms`,
            }}
          >
            <div className="text-[9px] uppercase tracking-[0.06em] mb-1" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>{label}</div>
            <div className="italic text-[16px]" style={{ fontFamily: 'var(--font-family-display)', color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-[12px] pt-[10px] text-[10px] tracking-[0.04em]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)', fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
        {t('vis1ContainerRef')}
      </div>
    </div>
  )
}

// ── Pillar visual: Alert card ────────────────────────────────────
function AlertVisual({ t }: { t: T }) {
  const [containerRef, isVisible] = useInView<HTMLDivElement>(0.3)

  return (
    <div
      ref={containerRef}
      className="rounded-[16px] p-6"
      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}
    >
      <div
        className={`rounded-[10px] p-4 mb-[10px]${isVisible ? ' alert-shake' : ''}`}
        style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={15} strokeWidth={1.5} style={{ color: '#B97A1F', flexShrink: 0 }} />
          <span className="font-semibold text-[13px]" style={{ color: '#2B1F12' }}>{t('vis2AlertTitle')}</span>
        </div>
        <div className="text-[11px] leading-[1.55] p-[8px] rounded-[6px] mb-[10px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#5A4A38', background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)' }}>
          {t('vis2AlertBody')}
        </div>
        <div className="flex gap-[6px]">
          {(['vis2Btn1', 'vis2Btn2', 'vis2Btn3'] as const).map((key, i) => (
            <div key={key} className="h-[26px] px-[10px] rounded-[6px] text-[11px] font-medium inline-flex items-center" style={{ background: i === 0 ? '#2B1F12' : '#FCF7EA', color: i === 0 ? '#F8F2E4' : '#2B1F12', border: `1px solid ${i === 0 ? '#2B1F12' : 'rgba(60,42,22,0.08)'}` }}>
              {t(key)}
            </div>
          ))}
        </div>
      </div>
      <div className="text-[12px] p-[12px] rounded-[8px] flex items-start gap-[8px]" style={{ background: 'rgba(79,122,60,0.06)', border: '1px solid rgba(79,122,60,0.25)' }}>
        <Check size={12} strokeWidth={2} style={{ color: '#4F7A3C', flexShrink: 0, marginTop: '1px' }} />
        <div>
          <span style={{ color: '#4F7A3C', fontWeight: 600 }}>{t('vis2OkLabel')}</span>
          <span style={{ color: '#5A4A38' }}> — {t('vis2OkBody')}</span>
        </div>
      </div>
    </div>
  )
}

// ── Pillar visual: Document matrix ───────────────────────────────
function DocsVisual({ t }: { t: T }) {
  const docs = [
    { nameKey: 'vis3Doc1', metaKey: 'vis3Doc1Meta', status: 'ok' },
    { nameKey: 'vis3Doc2', metaKey: 'vis3Doc2Meta', status: 'ok' },
    { nameKey: 'vis3Doc3', metaKey: 'vis3Doc3Meta', status: 'ok' },
    { nameKey: 'vis3Doc4', metaKey: 'vis3Doc4Meta', status: 'warn' },
    { nameKey: 'vis3Doc5', metaKey: 'vis3Doc5Meta', status: 'warn' },
    { nameKey: 'vis3Doc6', metaKey: 'vis3Doc6Meta', status: 'pending' },
  ] as const

  const [containerRef, isVisible] = useInView<HTMLDivElement>(0.3)

  return (
    <div
      ref={containerRef}
      className="rounded-[16px] p-6"
      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}
    >
      <p className="text-[10px] uppercase tracking-[0.06em] mb-3" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>{t('vis3Title')}</p>
      <div className="flex flex-col gap-[6px]">
        {docs.map((doc, index) => (
          <div
            key={doc.nameKey}
            className="flex items-center gap-2 text-[11px] px-[10px] py-[7px] rounded-[7px]"
            style={{
              fontFamily: 'var(--font-family-mono)',
              color: doc.status === 'warn' ? '#B97A1F' : '#5A4A38',
              background: doc.status === 'warn' ? 'rgba(185,122,31,0.06)' : '#FFFCF1',
              border: `1px solid ${doc.status === 'warn' ? 'rgba(185,122,31,0.28)' : 'rgba(60,42,22,0.08)'}`,
              opacity: isVisible ? (doc.status === 'pending' ? 0.5 : 1) : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 480ms cubic-bezier(0.23,1,0.32,1) ${index * 75}ms, transform 480ms cubic-bezier(0.23,1,0.32,1) ${index * 75}ms`,
            }}
          >
            <div
              className="w-[15px] h-[15px] rounded-[3px] flex items-center justify-center flex-shrink-0"
              style={{ background: doc.status === 'ok' ? '#4F7A3C' : doc.status === 'warn' ? '#B97A1F' : '#B5A586' }}
            >
              {doc.status === 'ok'
                ? <Check size={9} strokeWidth={2.5} color="white" />
                : doc.status === 'warn'
                  ? <AlertTriangle size={9} strokeWidth={2.5} color="white" />
                  : <Minus size={9} strokeWidth={2.5} color="white" />}
            </div>
            <span className="flex-1 truncate">{t(doc.nameKey as any)}</span>
            <span style={{ color: '#8A7860', fontSize: '10px' }}>{t(doc.metaKey as any)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-[10px] flex items-center justify-between" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>{t('vis3Count')}</span>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#B97A1F' }}>⚠ {t('vis3Cutoff')}</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
const PILLARS = [
  { numKey: 'p1Num', titleKey: 'p1Title', bodyKey: 'p1Body', Visual: VisibilityVisual, reverse: false },
  { numKey: 'p2Num', titleKey: 'p2Title', bodyKey: 'p2Body', Visual: AlertVisual,      reverse: true  },
  { numKey: 'p3Num', titleKey: 'p3Title', bodyKey: 'p3Body', Visual: DocsVisual,       reverse: false },
] as const

export function LandingPillars() {
  const t = useTranslations('landing.pillars')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="solutions"
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
            <p className="text-[16px] leading-[1.65] m-0 mt-8" style={{ color: '#5A4A38', maxWidth: '52ch' }}>
              {t('lede')}
            </p>
          </div>

          {/* Right: image */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: '16px',
              aspectRatio: '4 / 3',
              boxShadow: '0 24px 64px rgba(43,31,18,0.18), 0 0 0 1px rgba(43,31,18,0.06)',
            }}
          >
            <ParallaxImage src="/landing/solution-bg.png" objectPosition="center 30%" strength={0.08} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 60%, rgba(43,31,18,0.14) 100%)',
              }}
            />
          </div>
        </div>

        {/* Pillar rows */}
        <div className="flex flex-col">
          {PILLARS.map(({ numKey, titleKey, bodyKey, Visual, reverse }, index) => (
            <div
              key={numKey}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}
              style={index > 0 ? { paddingTop: '80px', borderTop: '1px solid rgba(60,42,22,0.06)' } : { paddingTop: '0' }}
            >
              <div>
                <div
                  className="mb-5"
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#B5A586',
                  }}
                >
                  {t(numKey)}
                </div>
                <h3
                  className="italic font-normal mb-4"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'clamp(26px, 2.4vw, 34px)',
                    lineHeight: 1.1,
                    color: '#2B1F12',
                    margin: '0 0 16px 0',
                  }}
                >
                  {t(titleKey)}
                </h3>
                <p
                  className="m-0"
                  style={{ fontSize: '15px', color: '#5A4A38', maxWidth: '44ch', lineHeight: 1.70 }}
                >
                  {t(bodyKey)}
                </p>
              </div>
              <Visual t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

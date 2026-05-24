'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Check, Minus } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

// ── Pillar visual: Visibility timeline ──────────────────────────
function VisibilityVisual() {
  const steps = [
    { label: 'Booking', done: true },
    { label: 'Carga', done: true },
    { label: 'Zarpe', done: true },
    { label: 'Tránsito', active: true },
    { label: 'Destino', done: false },
    { label: 'Entrega', done: false },
  ]
  return (
    <div className="rounded-[16px] p-6" style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}>
      <p className="text-[10px] uppercase tracking-[0.06em] mb-[14px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
        Estado del embarque
      </p>
      <div className="relative flex items-center justify-between py-5 px-1">
        <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2" style={{ background: 'rgba(60,42,22,0.16)' }} />
        {steps.map((s) => (
          <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className="w-[10px] h-[10px] rounded-full"
              style={{
                background: s.done ? '#4F7A3C' : s.active ? '#B97A1F' : '#F8F2E4',
                border: `1.5px solid ${s.done ? '#4F7A3C' : s.active ? '#B97A1F' : '#B5A586'}`,
                boxShadow: s.active ? '0 0 0 3px rgba(185,122,31,0.22)' : undefined,
              }}
            />
            <span className="text-[9px] uppercase tracking-[0.06em] text-center" style={{ fontFamily: 'var(--font-family-mono)', color: s.active ? '#2B1F12' : '#8A7860', fontWeight: s.active ? 600 : 400 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-[14px]">
        {[['ETA', '14 ene', '#2B1F12'], ['Temp', '−1.2°C', '#4F7A3C'], ['Docs', '14/18', '#2B1F12']].map(([label, value, color]) => (
          <div key={label} className="rounded-[8px] p-[10px]" style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}>
            <div className="text-[9px] uppercase tracking-[0.06em] mb-1" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>{label}</div>
            <div className="italic text-[16px]" style={{ fontFamily: 'var(--font-family-display)', color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-[12px] pt-[10px] text-[10px] tracking-[0.04em]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)', fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
        Contenedor MAEU-9182734 · Ruta San Antonio → Yangshan
      </div>
    </div>
  )
}

// ── Pillar visual: Alert card ────────────────────────────────────
function AlertVisual() {
  return (
    <div className="rounded-[16px] p-6" style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}>
      <div className="rounded-[10px] p-4 mb-[10px]" style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={15} strokeWidth={1.5} style={{ color: '#B97A1F', flexShrink: 0 }} />
          <span className="font-semibold text-[13px]" style={{ color: '#2B1F12' }}>Excursión de temperatura detectada</span>
        </div>
        <div className="text-[11px] leading-[1.55] p-[8px] rounded-[6px] mb-[10px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#5A4A38', background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)' }}>
          Sensor L-02 registró +1.8°C durante 47 min el 2026-01-08 03:14.<br />Umbral máximo: −0.5°C. Acumulado compliant: 13,847 min.
        </div>
        <div className="flex gap-[6px]">
          {['Ver detalles', 'Notificar cliente', 'Descartar'].map((label, i) => (
            <div key={label} className="h-[26px] px-[10px] rounded-[6px] text-[11px] font-medium inline-flex items-center" style={{ background: i === 0 ? '#2B1F12' : '#FCF7EA', color: i === 0 ? '#F8F2E4' : '#2B1F12', border: `1px solid ${i === 0 ? '#2B1F12' : 'rgba(60,42,22,0.08)'}` }}>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="text-[12px] p-[12px] rounded-[8px] flex items-start gap-[8px]" style={{ background: 'rgba(79,122,60,0.06)', border: '1px solid rgba(79,122,60,0.25)' }}>
        <Check size={12} strokeWidth={2} style={{ color: '#4F7A3C', flexShrink: 0, marginTop: '1px' }} />
        <div>
          <span style={{ color: '#4F7A3C', fontWeight: 600 }}>Excursión no crítica</span>
          <span style={{ color: '#5A4A38' }}> — dentro del margen permitido por protocolo USDA.</span>
        </div>
      </div>
    </div>
  )
}

// ── Pillar visual: Document matrix ───────────────────────────────
function DocsVisual() {
  const docs = [
    { name: 'Bill of Lading', status: 'ok', meta: 'Emitido · MSC' },
    { name: 'Factura Comercial', status: 'ok', meta: 'Firmada' },
    { name: 'Certificado Fitosanitario', status: 'ok', meta: 'SAG · válido' },
    { name: 'DUS — Declaración Única', status: 'warn', meta: 'Pendiente' },
    { name: 'Packing List final', status: 'warn', meta: 'En revisión' },
    { name: 'Carta de Crédito', status: 'pending', meta: 'No iniciado' },
  ]
  return (
    <div className="rounded-[16px] p-6" style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}>
      <p className="text-[10px] uppercase tracking-[0.06em] mb-3" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>Matriz documental</p>
      <div className="flex flex-col gap-[6px]">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center gap-2 text-[11px] px-[10px] py-[7px] rounded-[7px]" style={{ fontFamily: 'var(--font-family-mono)', color: doc.status === 'warn' ? '#B97A1F' : '#5A4A38', background: doc.status === 'warn' ? 'rgba(185,122,31,0.06)' : '#FFFCF1', border: `1px solid ${doc.status === 'warn' ? 'rgba(185,122,31,0.28)' : 'rgba(60,42,22,0.08)'}`, opacity: doc.status === 'pending' ? 0.5 : 1 }}>
            <div className="w-[15px] h-[15px] rounded-[3px] flex items-center justify-center flex-shrink-0" style={{ background: doc.status === 'ok' ? '#4F7A3C' : doc.status === 'warn' ? '#B97A1F' : '#B5A586' }}>
              {doc.status === 'ok' ? <Check size={9} strokeWidth={2.5} color="white" /> : doc.status === 'warn' ? <AlertTriangle size={9} strokeWidth={2.5} color="white" /> : <Minus size={9} strokeWidth={2.5} color="white" />}
            </div>
            <span className="flex-1 truncate">{doc.name}</span>
            <span style={{ color: '#8A7860', fontSize: '10px' }}>{doc.meta}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-[10px] flex items-center justify-between" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>14 / 18 documentos</span>
        <span className="text-[10px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#B97A1F' }}>⚠ Cut-off en 18h</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
const PILLARS = [
  { numKey: 'p1Num', titleKey: 'p1Title', bodyKey: 'p1Body', Visual: VisibilityVisual, reverse: false },
  { numKey: 'p2Num', titleKey: 'p2Title', bodyKey: 'p2Body', Visual: AlertVisual, reverse: true },
  { numKey: 'p3Num', titleKey: 'p3Title', bodyKey: 'p3Body', Visual: DocsVisual, reverse: false },
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
              style={{ color: '#5A4A38' }}
            >
              {t('lede')}
            </p>
          </div>
        </div>

        {/* Pillar rows */}
        <div className="flex flex-col">
          {PILLARS.map(({ numKey, titleKey, bodyKey, Visual, reverse }, index) => (
            <div
              key={numKey}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}
              style={
                index > 0
                  ? { paddingTop: '80px', borderTop: '1px solid rgba(60,42,22,0.06)' }
                  : { paddingTop: '0' }
              }
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
                  style={{
                    fontSize: '15px',
                    color: '#5A4A38',
                    maxWidth: '44ch',
                    lineHeight: 1.70,
                  }}
                >
                  {t(bodyKey)}
                </p>
              </div>
              <Visual />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

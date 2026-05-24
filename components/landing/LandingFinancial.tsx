'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Check, TrendingUp, ReceiptText } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

// ── Financial visual: cobranza pipeline + reconciliation ─────────
function FinancialVisual() {
  const pos = [
    {
      ref: 'BK-2024-0841',
      client: 'Frigorífico del Norte S.A.',
      amount: 'USD 48.200',
      status: 'risk' as const,
      statusLabel: 'Cobrar hoy',
      dueLabel: 'Vencido · 3 días',
    },
    {
      ref: 'BK-2024-0867',
      client: 'Exportadora del Sur Ltda.',
      amount: 'USD 31.750',
      status: 'watch' as const,
      statusLabel: 'Próxima',
      dueLabel: 'Vence en 4 días',
    },
    {
      ref: 'BK-2024-0792',
      client: 'Agropecuaria Mendoza S.A.',
      amount: 'USD 62.400',
      status: 'ok' as const,
      statusLabel: 'Cobrado',
      dueLabel: 'Pago recibido',
    },
  ]

  const pill = {
    risk:  { bg: 'rgba(200,60,60,0.10)',    color: '#C83C3C', border: 'rgba(200,60,60,0.22)' },
    watch: { bg: 'rgba(185,122,31,0.12)',   color: '#B97A1F', border: 'rgba(185,122,31,0.22)' },
    ok:    { bg: 'rgba(79,122,60,0.12)',    color: '#4F7A3C', border: 'rgba(60,42,22,0.08)'  },
  }

  return (
    <div
      className="rounded-[16px] p-6"
      style={{
        background: '#FCF7EA',
        border: '1px solid rgba(60,42,22,0.08)',
        boxShadow: '0 8px 32px rgba(43,31,18,0.08)',
      }}
    >
      {/* Cobranza activa */}
      <p
        className="text-[10px] uppercase tracking-[0.06em] mb-4"
        style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
      >
        Cobranza activa
      </p>

      <div className="flex flex-col gap-[6px]">
        {pos.map((po) => {
          const c = pill[po.status]
          return (
            <div
              key={po.ref}
              className="rounded-[10px] px-[12px] py-[10px]"
              style={{ background: '#FFFCF1', border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center justify-between mb-[5px]">
                <span
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '10px',
                    color: '#8A7860',
                    letterSpacing: '0.06em',
                  }}
                >
                  {po.ref}
                </span>
                <span
                  className="inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full"
                  style={{
                    background: c.bg,
                    color: c.color,
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '9px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: c.color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {po.statusLabel}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span style={{ fontSize: '12px', color: '#5A4A38' }}>{po.client}</span>
                <span
                  className="italic"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: '16px',
                    color: '#2B1F12',
                  }}
                >
                  {po.amount}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '9px',
                  color: c.color,
                  marginTop: '2px',
                }}
              >
                {po.dueLabel}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reconciliation footer */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
        <p
          className="text-[10px] uppercase tracking-[0.06em] mb-[10px]"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
        >
          Conciliación automática
        </p>
        <div className="flex items-stretch gap-2">
          <div
            className="flex-1 rounded-[8px] p-[10px]"
            style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '9px',
                color: '#8A7860',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              Recibido
            </div>
            <div
              className="italic"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '18px',
                color: '#2B1F12',
              }}
            >
              USD 48.200
            </div>
          </div>

          <div
            className="flex items-center justify-center px-1"
            style={{
              color: '#B5A586',
              fontFamily: 'var(--font-family-mono)',
              fontSize: '14px',
            }}
          >
            →
          </div>

          <div
            className="flex-1 rounded-[8px] p-[10px]"
            style={{
              background: 'rgba(79,122,60,0.06)',
              border: '1px solid rgba(79,122,60,0.25)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '9px',
                color: '#4F7A3C',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              Cuadra
            </div>
            <div className="flex items-center gap-1">
              <Check size={12} strokeWidth={2.5} style={{ color: '#4F7A3C', flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '11px',
                  color: '#4F7A3C',
                  fontWeight: 600,
                }}
              >
                Cierre automático
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
const FEATURES = [
  { key: 'feature1', Icon: ReceiptText },
  { key: 'feature2', Icon: Check },
  { key: 'feature3', Icon: TrendingUp },
] as const

export function LandingFinancial() {
  const t = useTranslations('landing.financial')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
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
        <div className="mb-20">
          <div className="w-full lg:w-1/2">
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
            className="text-[16px] leading-[1.65] m-0 mt-8"
            style={{ color: '#5A4A38', maxWidth: '52ch' }}
          >
            {t('lede')}
          </p>
        </div>

        {/* 2-col: features left, visual right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Feature list */}
          <div className="flex flex-col">
            {FEATURES.map(({ key, Icon }, index) => (
              <div
                key={key}
                className="flex gap-5 py-7"
                style={
                  index > 0
                    ? { borderTop: '1px solid rgba(60,42,22,0.06)' }
                    : {}
                }
              >
                <div
                  className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center flex-shrink-0 mt-[2px]"
                  style={{
                    background: '#F0E8D8',
                    border: '1px solid rgba(60,42,22,0.10)',
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: '#5A4A38' }} />
                </div>
                <div>
                  <div
                    className="font-medium mb-[6px]"
                    style={{ fontSize: '15px', color: '#2B1F12', lineHeight: 1.3 }}
                  >
                    {t(`${key}Label` as any)}
                  </div>
                  <p
                    className="m-0"
                    style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65 }}
                  >
                    {t(`${key}Body` as any)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <FinancialVisual />
        </div>
      </div>
    </section>
  )
}

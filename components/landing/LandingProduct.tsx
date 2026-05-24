'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ReceiptText, Check, TrendingUp, BarChart2, DollarSign, Activity } from 'lucide-react'
import { ParallaxImage } from './ParallaxImage'
import { useFadeIn } from '@/hooks/useFadeIn'

type Tab = 'comex' | 'finanzas' | 'comercial'

// ── Comex visual: document checklist ─────────────────────────────
function ComexVisual() {
  const docs = [
    { name: 'Instructivo COMEX', status: 'ok' as const,      label: '✓ Enviado'  },
    { name: 'Draft BL',          status: 'warn' as const,    label: '⚠ Revisar'  },
    { name: 'Certificado SAG',   status: 'ok' as const,      label: '✓ Emitido'  },
    { name: 'Certificado de Origen', status: 'pending' as const, label: 'Pendiente' },
    { name: 'Packing List',      status: 'ok' as const,      label: '✓ Listo'    },
  ]

  const statusStyle = {
    ok:      { bg: 'rgba(79,122,60,0.10)',  color: '#4F7A3C', border: 'rgba(60,42,22,0.08)'      },
    warn:    { bg: 'rgba(185,122,31,0.12)', color: '#B97A1F', border: 'rgba(185,122,31,0.22)'    },
    pending: { bg: 'rgba(60,42,22,0.06)',   color: '#8A7860', border: 'rgba(60,42,22,0.08)'      },
  }

  return (
    <div
      className="rounded-[16px] p-6"
      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.06em] mb-4"
        style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
      >
        Embarque BK-2024-0841 · Activo
      </p>
      <div className="flex flex-col gap-[6px]">
        {docs.map((doc) => {
          const s = statusStyle[doc.status]
          return (
            <div
              key={doc.name}
              className="flex items-center justify-between rounded-[8px] px-[12px] py-[10px]"
              style={{ background: '#FFFCF1', border: `1px solid ${s.border}` }}
            >
              <span style={{ fontSize: '12px', color: '#5A4A38' }}>{doc.name}</span>
              <span
                className="inline-flex items-center px-[8px] py-[2px] rounded-full"
                style={{
                  background: s.bg,
                  color: s.color,
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '9px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {doc.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Financial visual: cobranza pipeline + reconciliation ──────────
function FinancialVisual() {
  const pos = [
    { ref: 'BK-2024-0841', client: 'Frigorífico del Norte S.A.',   amount: 'USD 48.200', status: 'risk'  as const, statusLabel: 'Cobrar hoy',   dueLabel: 'Vencido · 3 días' },
    { ref: 'BK-2024-0867', client: 'Exportadora del Sur Ltda.',    amount: 'USD 31.750', status: 'watch' as const, statusLabel: 'Próxima',       dueLabel: 'Vence en 4 días'  },
    { ref: 'BK-2024-0792', client: 'Agropecuaria Mendoza S.A.',    amount: 'USD 62.400', status: 'ok'    as const, statusLabel: 'Cobrado',       dueLabel: 'Pago recibido'    },
  ]

  const pill = {
    risk:  { bg: 'rgba(200,60,60,0.10)',  color: '#C83C3C', border: 'rgba(200,60,60,0.22)'  },
    watch: { bg: 'rgba(185,122,31,0.12)', color: '#B97A1F', border: 'rgba(185,122,31,0.22)' },
    ok:    { bg: 'rgba(79,122,60,0.12)',  color: '#4F7A3C', border: 'rgba(60,42,22,0.08)'   },
  }

  return (
    <div
      className="rounded-[16px] p-6"
      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}
    >
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
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: '#8A7860', letterSpacing: '0.06em' }}>
                  {po.ref}
                </span>
                <span
                  className="inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full"
                  style={{ background: c.bg, color: c.color, fontFamily: 'var(--font-family-mono)', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                  {po.statusLabel}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span style={{ fontSize: '12px', color: '#5A4A38' }}>{po.client}</span>
                <span className="italic" style={{ fontFamily: 'var(--font-family-display)', fontSize: '16px', color: '#2B1F12' }}>
                  {po.amount}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '9px', color: c.color, marginTop: '2px' }}>
                {po.dueLabel}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
        <p
          className="text-[10px] uppercase tracking-[0.06em] mb-[10px]"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
        >
          Conciliación automática
        </p>
        <div className="flex items-stretch gap-2">
          <div className="flex-1 rounded-[8px] p-[10px]" style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '9px', color: '#8A7860', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Recibido
            </div>
            <div className="italic" style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px', color: '#2B1F12' }}>
              USD 48.200
            </div>
          </div>
          <div className="flex items-center justify-center px-1" style={{ color: '#B5A586', fontFamily: 'var(--font-family-mono)', fontSize: '14px' }}>
            →
          </div>
          <div className="flex-1 rounded-[8px] p-[10px]" style={{ background: 'rgba(79,122,60,0.06)', border: '1px solid rgba(79,122,60,0.25)' }}>
            <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '9px', color: '#4F7A3C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '4px' }}>
              Cuadra
            </div>
            <div className="flex items-center gap-1">
              <Check size={12} strokeWidth={2.5} style={{ color: '#4F7A3C', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#4F7A3C', fontWeight: 600 }}>Cierre automático</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Comercial visual: client ranking cards ────────────────────────
function ComercialVisual() {
  const clients = [
    {
      name: 'Pacific Fresh Ltd.',
      market: 'Reino Unido · EU',
      score: 94,
      scoreColor: '#4F7A3C',
      scoreBg: 'rgba(79,122,60,0.10)',
      otif: '94%',
      precio: 'USD 4.20',
      dias: '31 d',
    },
    {
      name: 'Nanjing Import Co.',
      market: 'China · Asia',
      score: 61,
      scoreColor: '#B97A1F',
      scoreBg: 'rgba(185,122,31,0.10)',
      otif: '78%',
      precio: 'USD 3.85',
      dias: '48 d',
    },
  ]

  return (
    <div
      className="rounded-[16px] p-6"
      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', boxShadow: '0 8px 32px rgba(43,31,18,0.08)' }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.06em] mb-4"
        style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
      >
        Ranking de clientes — Temporada 2024
      </p>
      <div className="flex flex-col gap-[8px]">
        {clients.map((c) => (
          <div
            key={c.name}
            className="rounded-[10px] px-[12px] py-[10px]"
            style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}
          >
            <div className="flex items-center justify-between mb-[10px]">
              <div>
                <div style={{ fontSize: '13px', color: '#2B1F12', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: '10px', color: '#8A7860', marginTop: '2px' }}>{c.market}</div>
              </div>
              <div
                className="inline-flex items-center px-[8px] py-[4px] rounded-[6px]"
                style={{ background: c.scoreBg, color: c.scoreColor, fontFamily: 'var(--font-family-mono)', fontSize: '12px', fontWeight: 600 }}
              >
                {c.score} / 100
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([['OTIF', c.otif], ['Precio neto/kg', c.precio], ['Pago prom.', c.dias]] as const).map(([label, value]) => (
                <div key={label} className="rounded-[6px] p-[8px] text-center" style={{ background: '#F8F2E4' }}>
                  <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: '#2B1F12', fontWeight: 600 }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '9px', color: '#8A7860', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Feature lists ─────────────────────────────────────────────────
const TAB_KEY_MAP = {
  comex:     'product.tabComex',
  finanzas:  'product.tabFinanzas',
  comercial: 'product.tabComercial',
} as const

const FINANZAS_FEATURES = [
  { labelKey: 'product.finanzas1Label' as const, bodyKey: 'product.finanzas1Body' as const, Icon: ReceiptText },
  { labelKey: 'product.finanzas2Label' as const, bodyKey: 'product.finanzas2Body' as const, Icon: Check },
  { labelKey: 'product.finanzas3Label' as const, bodyKey: 'product.finanzas3Body' as const, Icon: TrendingUp },
]

const COMERCIAL_FEATURES = [
  { labelKey: 'product.comercial1Label' as const, bodyKey: 'product.comercial1Body' as const, Icon: BarChart2 },
  { labelKey: 'product.comercial2Label' as const, bodyKey: 'product.comercial2Body' as const, Icon: DollarSign },
  { labelKey: 'product.comercial3Label' as const, bodyKey: 'product.comercial3Body' as const, Icon: Activity },
]

// ── Main component ────────────────────────────────────────────────
export function LandingProduct() {
  const t = useTranslations('landing')
  const ref = useFadeIn()
  const [activeTab, setActiveTab] = useState<Tab>('comex')

  return (
    <section
      ref={ref}
      id="product"
      className="py-[120px]"
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(44px)',
        transition: 'opacity 0.72s cubic-bezier(0.23,1,0.32,1), transform 0.72s cubic-bezier(0.23,1,0.32,1)',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Section header: text left, parallax image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          <div>
            <span
              className="block mb-3 text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
            >
              {t('product.eyebrow')}
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
              {t('product.title')}
              <br />
              {t('product.titleLine2')}
            </h2>
            <p
              className="text-[16px] leading-[1.65] m-0 mt-8"
              style={{ color: '#5A4A38', maxWidth: '52ch' }}
            >
              {t('product.lede')}
            </p>
          </div>

          <div className="relative w-full">
            <ParallaxImage
              variant="frame"
              src="/landing/platform-bg.png"
              objectPosition="center 25%"
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
                background: 'linear-gradient(to bottom, transparent 60%, rgba(43,31,18,0.14) 100%)',
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>

          {/* Tab bar */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(60,42,22,0.08)' }}>
            {(['comex', 'finanzas', 'comercial'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '10px',
                  padding: '10px 16px',
                  color: activeTab === tab ? '#2B1F12' : '#8A7860',
                  fontWeight: activeTab === tab ? 500 : 400,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #2B1F12' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.10em',
                  transition: 'color 0.15s',
                }}
              >
                {t(TAB_KEY_MAP[tab])}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start py-14">

            {activeTab === 'comex' && (
              <>
                <div>
                  <h3
                    className="font-semibold mb-[6px]"
                    style={{ fontSize: '15px', color: '#2B1F12' }}
                  >
                    {t('product.comexHed')}
                  </h3>
                  <p
                    className="m-0 mb-6"
                    style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65, maxWidth: '44ch' }}
                  >
                    {t('product.comexLede')}
                  </p>
                  <div style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
                    {(
                      [
                        { num: '01', label: t('product.feature1Label'), body: t('product.feature1Body') },
                        { num: '02', label: t('product.feature2Label'), body: t('product.feature2Body') },
                        { num: '03', label: t('product.feature3Label'), body: t('product.feature3Body') },
                      ] as const
                    ).map((f) => (
                      <div
                        key={f.num}
                        className="grid items-baseline gap-x-8 py-[13px]"
                        style={{ gridTemplateColumns: '36px 1fr 1.6fr', borderBottom: '1px solid rgba(60,42,22,0.08)' }}
                      >
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: '#B5A586', letterSpacing: '0.12em' }}>
                          {f.num}
                        </span>
                        <span className="font-medium" style={{ fontSize: '13.5px', color: '#2B1F12' }}>
                          {f.label}
                        </span>
                        <span style={{ fontSize: '13px', color: '#5A4A38', lineHeight: 1.5 }}>
                          {f.body}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <ComexVisual />
              </>
            )}

            {activeTab === 'finanzas' && (
              <>
                <div>
                  <h3
                    className="font-semibold mb-[6px]"
                    style={{ fontSize: '15px', color: '#2B1F12' }}
                  >
                    {t('product.finanzasHed')}
                  </h3>
                  <p
                    className="m-0 mb-6"
                    style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65, maxWidth: '44ch' }}
                  >
                    {t('product.finanzasLede')}
                  </p>
                  <div className="flex flex-col">
                    {FINANZAS_FEATURES.map(({ labelKey, bodyKey, Icon }, index) => (
                      <div
                        key={labelKey}
                        className="flex gap-5 py-7"
                        style={index > 0 ? { borderTop: '1px solid rgba(60,42,22,0.06)' } : {}}
                      >
                        <div
                          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center flex-shrink-0 mt-[2px]"
                          style={{ background: '#F0E8D8', border: '1px solid rgba(60,42,22,0.10)' }}
                        >
                          <Icon size={16} strokeWidth={1.5} style={{ color: '#5A4A38' }} />
                        </div>
                        <div>
                          <div
                            className="font-medium mb-[6px]"
                            style={{ fontSize: '15px', color: '#2B1F12', lineHeight: 1.3 }}
                          >
                            {t(labelKey)}
                          </div>
                          <p className="m-0" style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65 }}>
                            {t(bodyKey)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <FinancialVisual />
              </>
            )}

            {activeTab === 'comercial' && (
              <>
                <div>
                  <h3
                    className="font-semibold mb-[6px]"
                    style={{ fontSize: '15px', color: '#2B1F12' }}
                  >
                    {t('product.comercialHed')}
                  </h3>
                  <p
                    className="m-0 mb-6"
                    style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65, maxWidth: '44ch' }}
                  >
                    {t('product.comercialLede')}
                  </p>
                  <div className="flex flex-col">
                    {COMERCIAL_FEATURES.map(({ labelKey, bodyKey, Icon }, index) => (
                      <div
                        key={labelKey}
                        className="flex gap-5 py-7"
                        style={index > 0 ? { borderTop: '1px solid rgba(60,42,22,0.06)' } : {}}
                      >
                        <div
                          className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center flex-shrink-0 mt-[2px]"
                          style={{ background: '#F0E8D8', border: '1px solid rgba(60,42,22,0.10)' }}
                        >
                          <Icon size={16} strokeWidth={1.5} style={{ color: '#5A4A38' }} />
                        </div>
                        <div>
                          <div
                            className="font-medium mb-[6px]"
                            style={{ fontSize: '15px', color: '#2B1F12', lineHeight: 1.3 }}
                          >
                            {t(labelKey)}
                          </div>
                          <p className="m-0" style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65 }}>
                            {t(bodyKey)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <ComercialVisual />
              </>
            )}

          </div>
        </div>

      </div>
    </section>
  )
}

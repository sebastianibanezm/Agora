# Platform Section Three-Tab Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current two-component Platform+Financial layout with a single unified `LandingProduct` section containing a tab switcher for Comex, Finanzas, and Comercial.

**Architecture:** `LandingProduct.tsx` is fully rewritten to own all three tab panels and their inline visual sub-components (`ComexVisual`, `FinancialVisual` moved from `LandingFinancial.tsx`, `ComercialVisual` new). Tab state is local `useState`. `LandingFinancial.tsx` is deleted and its translations migrated under `landing.product.*`.

**Tech Stack:** React 18, Next.js (app router), next-intl, Tailwind CSS, Lucide React, Vitest + Testing Library.

---

## File Map

| File | Action |
|------|--------|
| `messages/es.json` | Modify — update `landing.product`, delete `landing.financial` |
| `messages/en.json` | Modify — same |
| `__tests__/landing/LandingProduct.test.tsx` | Modify — replace old tests with tab behavior tests |
| `components/landing/LandingProduct.tsx` | Full rewrite |
| `components/landing/LandingFinancial.tsx` | Delete |
| `app/[locale]/(marketing)/page.tsx` | Modify — remove `LandingFinancial` import and usage |
| `__tests__/landing/LandingPage.test.tsx` | Modify — remove stale LandingFinancial reference, fix section count |

---

## Task 1: Update translation keys in es.json

**Files:**
- Modify: `messages/es.json`

- [ ] **Step 1: Replace the `landing.product` block**

Open `messages/es.json` and replace the entire `"product"` object under `"landing"` with:

```json
"product": {
  "eyebrow": "03 — La plataforma",
  "title": "Coordinación y automatización",
  "titleLine2": "a lo largo de todo el proceso.",
  "lede": "Comex, finanzas y comercial — tres áreas integradas en una sola plataforma.",
  "tabComex": "Comex",
  "tabFinanzas": "Finanzas",
  "tabComercial": "Comercial",
  "comexHed": "Control documental completo",
  "comexLede": "Una vista operacional de todas tus exportaciones: embarques activos, documentos pendientes, excepciones abiertas — con responsable claro, sin coordinación manual.",
  "feature1Label": "Coordinación documental",
  "feature1Body": "Instructivo, BL y certificados en un solo flujo",
  "feature2Label": "Detección de excepciones",
  "feature2Body": "Errores capturados antes de que cuesten dinero",
  "feature3Label": "Visibilidad del equipo",
  "feature3Body": "Quién tiene qué y qué cambió",
  "finanzasHed": "Cierra el loop financiero",
  "finanzasLede": "Agora conecta tus documentos de embarque con la cobranza y la conciliación. Sabe qué hay que cobrar, cuándo, y lo cruza automáticamente con los pagos recibidos.",
  "finanzas1Label": "Cobranza inteligente",
  "finanzas1Body": "El sistema identifica qué POs cobrar y cuándo, priorizando según vencimiento y cliente — sin intervención manual.",
  "finanzas2Label": "Conciliación automática",
  "finanzas2Body": "Cruza los pagos recibidos contra los POs registrados y cierra el caso solo. Cuando no cuadra, identifica la causa para que finanzas actúe de inmediato.",
  "finanzas3Label": "Proyección financiera",
  "finanzas3Body": "Visibilidad del flujo de caja esperado por período y cliente, con separación entre ingresos confirmados y proyectados.",
  "comercialHed": "Inteligencia por cliente",
  "comercialLede": "La data de cada embarque convertida en argumentos para la mesa. OTIF, precio neto efectivo y señales de alerta — para negociar desde hechos, no desde intuición.",
  "comercial1Label": "OTIF por cliente",
  "comercial1Body": "% de embarques que cumplieron fecha y cantidad pactadas. Argumento duro para defender o subir precios en la renegociación.",
  "comercial2Label": "Precio neto efectivo",
  "comercial2Body": "No el FOB nominal — el dinero que realmente llega después de fees, amendments y diferencias de cambio.",
  "comercial3Label": "Score de salud del cliente",
  "comercial3Body": "Un solo número por importador que combina precio neto, OTIF, comportamiento de pago y tendencia de volumen."
}
```

- [ ] **Step 2: Delete the `landing.financial` block**

Remove the entire `"financial"` key and its value from `messages/es.json`. The keys being removed are: `eyebrow`, `title`, `titleLine2`, `lede`, `feature1Label`, `feature1Body`, `feature2Label`, `feature2Body`, `feature3Label`, `feature3Body`.

- [ ] **Step 3: Commit**

```bash
git add messages/es.json
git commit -m "feat(i18n): update es translations for platform tabs, remove financial section"
```

---

## Task 2: Update translation keys in en.json

**Files:**
- Modify: `messages/en.json`

- [ ] **Step 1: Replace the `landing.product` block**

Open `messages/en.json` and replace the entire `"product"` object under `"landing"` with:

```json
"product": {
  "eyebrow": "03 — The platform",
  "title": "Coordination and automation",
  "titleLine2": "across every step of the process.",
  "lede": "Comex, finance and commercial — three integrated areas, one platform.",
  "tabComex": "Comex",
  "tabFinanzas": "Finance",
  "tabComercial": "Commercial",
  "comexHed": "Complete document control",
  "comexLede": "One operational view of all your exports: active shipments, pending documents, open exceptions — clear ownership, no manual chasing.",
  "feature1Label": "Document coordination",
  "feature1Body": "SI, BL, and certificates in one flow",
  "feature2Label": "Exception detection",
  "feature2Body": "Errors caught before they cost money",
  "feature3Label": "Team visibility",
  "feature3Body": "Who has what, and what changed",
  "finanzasHed": "Close the financial loop",
  "finanzasLede": "Agora connects your shipping documents to collections and reconciliation. It knows what to collect, when, and automatically matches it against payments received.",
  "finanzas1Label": "Intelligent collections",
  "finanzas1Body": "The system identifies which POs to collect and when, prioritizing by due date and client — without any manual work.",
  "finanzas2Label": "Automatic reconciliation",
  "finanzas2Body": "Matches payments received against registered POs and closes the case automatically. When it doesn't match, it identifies the cause so finance can act immediately.",
  "finanzas3Label": "Financial projection",
  "finanzas3Body": "Visibility of expected cash flow by period and client, with a clear split between confirmed and projected revenue.",
  "comercialHed": "Client intelligence",
  "comercialLede": "Every shipment's data converted into negotiation arguments. OTIF, net effective price, and early warning signals — to negotiate from facts, not gut feel.",
  "comercial1Label": "OTIF by client",
  "comercial1Body": "% of shipments that met the agreed date and quantity. A hard argument to defend or raise prices when renewing contracts.",
  "comercial2Label": "Net effective price",
  "comercial2Body": "Not the nominal FOB — the money that actually arrives after fees, BL amendments, and exchange rate differences.",
  "comercial3Label": "Client health score",
  "comercial3Body": "A single number per importer combining net price, OTIF, payment behavior, and volume trend."
}
```

- [ ] **Step 2: Delete the `landing.financial` block**

Remove the entire `"financial"` key and its value from `messages/en.json`.

- [ ] **Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat(i18n): update en translations for platform tabs, remove financial section"
```

---

## Task 3: Write failing tests for new LandingProduct

**Files:**
- Modify: `__tests__/landing/LandingProduct.test.tsx`

- [ ] **Step 1: Replace the test file contents**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingProduct } from '@/components/landing/LandingProduct'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))

describe('LandingProduct', () => {
  it('renders the parallax image', () => {
    render(<LandingProduct />)
    // ParallaxImage renders a next/image internally; the mocked next/image renders <img>
    // The section header always shows the image regardless of active tab
    expect(document.querySelector('.parallax-root')).toBeInTheDocument()
  })

  it('renders three tab buttons', () => {
    render(<LandingProduct />)
    expect(screen.getByRole('button', { name: 'product.tabComex' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'product.tabFinanzas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'product.tabComercial' })).toBeInTheDocument()
  })

  it('shows Comex content by default', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.comexHed')).toBeInTheDocument()
    expect(screen.getByText('product.feature1Label')).toBeInTheDocument()
    expect(screen.getByText('product.feature2Label')).toBeInTheDocument()
    expect(screen.getByText('product.feature3Label')).toBeInTheDocument()
  })

  it('switches to Finanzas content when Finanzas tab is clicked', () => {
    render(<LandingProduct />)
    fireEvent.click(screen.getByRole('button', { name: 'product.tabFinanzas' }))
    expect(screen.getByText('product.finanzasHed')).toBeInTheDocument()
    expect(screen.getByText('product.finanzas1Label')).toBeInTheDocument()
    expect(screen.queryByText('product.comexHed')).not.toBeInTheDocument()
  })

  it('switches to Comercial content when Comercial tab is clicked', () => {
    render(<LandingProduct />)
    fireEvent.click(screen.getByRole('button', { name: 'product.tabComercial' }))
    expect(screen.getByText('product.comercialHed')).toBeInTheDocument()
    expect(screen.getByText('product.comercial1Label')).toBeInTheDocument()
    expect(screen.queryByText('product.comexHed')).not.toBeInTheDocument()
  })

  it('does not render the old dashboard image or annotation chips', () => {
    render(<LandingProduct />)
    expect(screen.queryByAltText('product.dashboardAlt')).not.toBeInTheDocument()
    expect(screen.queryByText('product.anno1')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run __tests__/landing/LandingProduct.test.tsx
```

Expected: FAIL — most tests will fail because the current `LandingProduct` renders dashboard/annotations and has no tab buttons.

- [ ] **Step 3: Commit failing tests**

```bash
git add __tests__/landing/LandingProduct.test.tsx
git commit -m "test(landing): write failing tests for tabbed LandingProduct"
```

---

## Task 4: Rewrite LandingProduct.tsx

**Files:**
- Modify: `components/landing/LandingProduct.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
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
const FINANZAS_FEATURES = [
  { key: 'finanzas1', Icon: ReceiptText },
  { key: 'finanzas2', Icon: Check },
  { key: 'finanzas3', Icon: TrendingUp },
] as const

const COMERCIAL_FEATURES = [
  { key: 'comercial1', Icon: BarChart2 },
  { key: 'comercial2', Icon: DollarSign },
  { key: 'comercial3', Icon: Activity },
] as const

// ── Main component ────────────────────────────────────────────────
export function LandingProduct() {
  const t = useTranslations('landing')
  const ref = useFadeIn()
  const [activeTab, setActiveTab] = useState<Tab>('comex')

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
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
            {(['comex', 'finanzas', 'comercial'] as const).map((tab) => {
              const keyMap = { comex: 'product.tabComex', finanzas: 'product.tabFinanzas', comercial: 'product.tabComercial' } as const
              return (
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
                  {t(keyMap[tab])}
                </button>
              )
            })}
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
                    {FINANZAS_FEATURES.map(({ key, Icon }, index) => (
                      <div
                        key={key}
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
                            {t(`product.${key}Label` as any)}
                          </div>
                          <p className="m-0" style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65 }}>
                            {t(`product.${key}Body` as any)}
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
                    {COMERCIAL_FEATURES.map(({ key, Icon }, index) => (
                      <div
                        key={key}
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
                            {t(`product.${key}Label` as any)}
                          </div>
                          <p className="m-0" style={{ fontSize: '14px', color: '#5A4A38', lineHeight: 1.65 }}>
                            {t(`product.${key}Body` as any)}
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
```

- [ ] **Step 2: Run the LandingProduct tests**

```bash
npx vitest run __tests__/landing/LandingProduct.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add components/landing/LandingProduct.tsx
git commit -m "feat(landing): rewrite LandingProduct as tabbed Comex/Finanzas/Comercial section"
```

---

## Task 5: Remove LandingFinancial and update page.tsx

**Files:**
- Delete: `components/landing/LandingFinancial.tsx`
- Modify: `app/[locale]/(marketing)/page.tsx`
- Modify: `__tests__/landing/LandingPage.test.tsx`

- [ ] **Step 1: Delete LandingFinancial.tsx**

```bash
rm components/landing/LandingFinancial.tsx
```

- [ ] **Step 2: Remove LandingFinancial from page.tsx**

In `app/[locale]/(marketing)/page.tsx`, remove the import line and the JSX usage:

```tsx
// Remove this import:
import { LandingFinancial } from '@/components/landing/LandingFinancial'

// Remove this JSX (was between <LandingProduct /> and <LandingStats />):
<LandingFinancial />
```

The file should look like:

```tsx
import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingEcosystem } from '@/components/landing/LandingEcosystem'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingPillars } from '@/components/landing/LandingPillars'
import { LandingProduct } from '@/components/landing/LandingProduct'
import { LandingStats } from '@/components/landing/LandingStats'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Agora — Export Intelligence para Exportadores',
  description:
    'Coordina documentos, detecta excepciones y mantén a tu equipo en contexto. La capa operacional para exportadoras chilenas.',
}

export default function LandingPage() {
  return (
    <>
      <main>
        <LandingHero />
        <LandingEcosystem />
        <LandingProblem />
        <LandingPillars />
        <LandingProduct />
        <LandingStats />
        <LandingContact />
      </main>
      <LandingFooter />
    </>
  )
}
```

- [ ] **Step 3: Update LandingPage.test.tsx**

The existing test mocks 7 components (Hero, Problem, Pillars, Product, Stats, Contact, Footer) but `LandingFinancial` was never mocked — it rendered for real and was not asserted. The test title "renders all 7 landing sections" was already inaccurate (8 sections existed). After removal, no mock changes are needed since `LandingFinancial` was never in the mock list. Update only the test description to match reality:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LandingPage from '@/app/[locale]/(marketing)/page'

vi.mock('@/components/landing/LandingHero',      () => ({ LandingHero:      () => <div data-testid="landing-hero" />      }))
vi.mock('@/components/landing/LandingProblem',   () => ({ LandingProblem:   () => <div data-testid="landing-problem" />   }))
vi.mock('@/components/landing/LandingPillars',   () => ({ LandingPillars:   () => <div data-testid="landing-pillars" />   }))
vi.mock('@/components/landing/LandingProduct',   () => ({ LandingProduct:   () => <div data-testid="landing-product" />   }))
vi.mock('@/components/landing/LandingStats',     () => ({ LandingStats:     () => <div data-testid="landing-stats" />     }))
vi.mock('@/components/landing/LandingContact',   () => ({ LandingContact:   () => <div data-testid="landing-contact" />   }))
vi.mock('@/components/landing/LandingFooter',    () => ({ LandingFooter:    () => <div data-testid="landing-footer" />    }))

describe('LandingPage', () => {
  it('renders all landing sections', async () => {
    render(await LandingPage())
    expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
    expect(screen.getByTestId('landing-problem')).toBeInTheDocument()
    expect(screen.getByTestId('landing-pillars')).toBeInTheDocument()
    expect(screen.getByTestId('landing-product')).toBeInTheDocument()
    expect(screen.getByTestId('landing-stats')).toBeInTheDocument()
    expect(screen.getByTestId('landing-contact')).toBeInTheDocument()
    expect(screen.getByTestId('landing-footer')).toBeInTheDocument()
  })

  it('wraps sections in a main element', async () => {
    const { container } = render(await LandingPage())
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByTestId('landing-hero'))
    expect(main).toContainElement(screen.getByTestId('landing-product'))
    expect(main).toContainElement(screen.getByTestId('landing-stats'))
  })

  it('renders footer outside main', async () => {
    const { container } = render(await LandingPage())
    const main = container.querySelector('main')
    expect(main).not.toContainElement(screen.getByTestId('landing-footer'))
  })
})
```

- [ ] **Step 4: Run all landing tests**

```bash
npx vitest run __tests__/landing/
```

Expected: all tests PASS, no failures.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/\(marketing\)/page.tsx __tests__/landing/LandingPage.test.tsx
git commit -m "feat(landing): remove LandingFinancial section, now merged into LandingProduct tabs"
```

---

## Task 6: Full test suite + type check

**Files:** none

- [ ] **Step 1: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests pass. If any fail, check for stale references to `landing.financial.*` translation keys or `LandingFinancial` imports.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: no errors. Common issues to watch for:
- `t('product.finanzas1Label' as any)` — the `as any` cast is intentional to silence the strict next-intl key inference
- Any remaining reference to deleted keys (`anno1`, `dashboardAlt`, etc.) in other files

- [ ] **Step 3: Final commit if clean**

```bash
git add -p  # review any remaining unstaged changes
git commit -m "chore: verify all tests pass after platform section tabs refactor"
```

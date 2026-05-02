# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public-facing landing page at `/` using the Agora warm-paper design system, moving the existing operations dashboard to `/app`.

**Architecture:** The current `app/[locale]/layout.tsx` wraps everything in `AppShell` (sidebar + header), which must not appear on the landing page. We solve this with Next.js route groups: a `(app)` group gets the AppShell layout, a `(marketing)` group gets a minimal layout. All existing app routes move into `(app)/`. The landing page lives at `(marketing)/page.tsx`. Both groups share the parent `[locale]/layout.tsx` which provides fonts and i18n only.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, next-intl (cookie-based, no URL prefix), Lucide React, Vitest + React Testing Library

---

## File Map

**Create:**
- `agora-app/public/landing/hero-bg.png` — hero background image (asset copy)
- `agora-app/public/landing/dashboard.png` — product screenshot (asset copy)
- `agora-app/app/[locale]/(app)/layout.tsx` — AppShell wrapper for app routes
- `agora-app/app/[locale]/(app)/page.tsx` — dashboard (moved from root)
- `agora-app/app/[locale]/(marketing)/layout.tsx` — minimal layout (no shell)
- `agora-app/app/[locale]/(marketing)/page.tsx` — landing page assembly
- `agora-app/components/landing/LandingNav.tsx` — glassmorphism pill nav
- `agora-app/components/landing/LandingHero.tsx` — full-viewport hero
- `agora-app/components/landing/LandingProblem.tsx` — 3-card friction grid
- `agora-app/components/landing/LandingPillars.tsx` — 3 alternating feature rows
- `agora-app/components/landing/LandingProduct.tsx` — dashboard screenshot + annotations
- `agora-app/components/landing/LandingStats.tsx` — 3-stat strip
- `agora-app/components/landing/LandingContact.tsx` — contact form
- `agora-app/components/landing/LandingFooter.tsx` — footer
- `agora-app/__tests__/landing/LandingNav.test.tsx`
- `agora-app/__tests__/landing/LandingHero.test.tsx`
- `agora-app/__tests__/landing/LandingProblem.test.tsx`
- `agora-app/__tests__/landing/LandingPillars.test.tsx`
- `agora-app/__tests__/landing/LandingProduct.test.tsx`
- `agora-app/__tests__/landing/LandingStats.test.tsx`
- `agora-app/__tests__/landing/LandingContact.test.tsx`
- `agora-app/__tests__/landing/LandingFooter.test.tsx`

**Modify:**
- `agora-app/app/[locale]/layout.tsx` — strip AppShell/CommandPalette out; keep fonts + i18n only
- `agora-app/messages/es.json` — add `landing` namespace
- `agora-app/messages/en.json` — add `landing` namespace

**Move (git mv):**
- `agora-app/app/[locale]/bookings/` → `agora-app/app/[locale]/(app)/bookings/`
- `agora-app/app/[locale]/exporters/` → `agora-app/app/[locale]/(app)/exporters/`
- `agora-app/app/[locale]/navieras/` → `agora-app/app/[locale]/(app)/navieras/`
- `agora-app/app/[locale]/performance/` → `agora-app/app/[locale]/(app)/performance/`
- `agora-app/app/[locale]/settings/` → `agora-app/app/[locale]/(app)/settings/`

---

## Task 1: Copy landing assets to `public/landing/`

**Files:**
- Create: `agora-app/public/landing/hero-bg.png`
- Create: `agora-app/public/landing/dashboard.png`

- [ ] **Step 1: Create the directory and copy assets**

```bash
mkdir -p agora-app/public/landing
cp "/Users/sebastian.ibanez/Downloads/ChatGPT Image May 1, 2026, 06_52_17 PM.png" agora-app/public/landing/hero-bg.png
cp "/Users/sebastian.ibanez/Downloads/ChatGPT Image May 2, 2026 at 04_55_14 PM.png" agora-app/public/landing/dashboard.png
```

- [ ] **Step 2: Verify files exist and are non-empty**

```bash
ls -lh agora-app/public/landing/
```
Expected: both files present, size > 0

- [ ] **Step 3: Commit**

```bash
git add agora-app/public/landing/
git commit -m "assets: add landing page hero bg and dashboard screenshot"
```

---

## Task 2: Add `landing` i18n namespace

**Files:**
- Modify: `agora-app/messages/es.json`
- Modify: `agora-app/messages/en.json`

- [ ] **Step 1: Add `landing` key to `messages/es.json`**

Open `messages/es.json` and add at the top level (after any existing key):

```json
"landing": {
  "nav": {
    "solutions": "Soluciones",
    "howItWorks": "Cómo funciona",
    "company": "Empresa",
    "cta": "Ponte en Contacto"
  },
  "hero": {
    "eyebrow": "Shipment Intelligence",
    "headline": "Tus exportaciones,",
    "headlineAccent": "siempre bajo control",
    "sub": "Detecta desvíos antes de que se vuelvan reclamos. Documentos sincronizados, cadena de frío monitoreada, equipo siempre en contexto.",
    "ctaPrimary": "Ponte en Contacto",
    "ctaSecondary": "Ver Demo",
    "scroll": "Scroll"
  },
  "problem": {
    "eyebrow": "01 — El problema",
    "title": "El caos operativo",
    "titleLine2": "cuesta caro",
    "lede": "Cada envío mueve decenas de documentos, actores y fechas críticas. Sin visibilidad unificada, los problemas llegan cuando ya no hay tiempo para reaccionar.",
    "card1Title": "Desvíos detectados tarde",
    "card1Body": "Los problemas de temperatura o documentación se descubren en destino. A ese punto, el daño ya está hecho — reclamos, rechazos, pérdida de cliente.",
    "card1Cite": "Causa #1 de pérdida en exportación de fruta fresca",
    "card2Title": "Documentos fuera de sincronía",
    "card2Body": "Correos, WhatsApp, portales navieros, Excel. Cada documento vive en un silo. Un solo archivo pendiente puede detener el despacho — o el cobro.",
    "card2Cite": "Promedio: 18 documentos por embarque",
    "card3Title": "Coordinación sin contexto",
    "card3Body": "Agencia, naviera, productor, importador — cada uno tiene su versión del estado. Sin una fuente única de verdad, cada llamada empieza desde cero.",
    "card3Cite": "Horas de coordinación perdidas por embarque"
  },
  "pillars": {
    "eyebrow": "02 — Solución",
    "title": "Un equipo digital",
    "titleLine2": "para cada exportación",
    "lede": "Agora sincroniza visibilidad, alertas y documentación en una sola plataforma — para que tu equipo actúe antes de que los problemas escalen.",
    "p1Num": "01",
    "p1Title": "Visibilidad completa de cada envío",
    "p1Body": "Estado en tiempo real de todos tus contenedores — posición, etapa documental, temperatura — en un solo panel. Sin cambiar de pestaña, sin llamar a la naviera.",
    "p2Num": "02",
    "p2Title": "Alertas con contexto, no solo ruido",
    "p2Body": "Agora filtra la señal del ruido y te entrega alertas accionables — con el contexto exacto que necesitas para decidir rápido: qué pasó, qué implica, qué puedes hacer.",
    "p3Num": "03",
    "p3Title": "Documentación siempre sincronizada",
    "p3Body": "Todos los documentos del embarque — BL, facturas, fitosanitarios, certificados — en una matriz de readiness unificada. Sabes qué falta, quién lo tiene y cuánto tiempo queda."
  },
  "product": {
    "eyebrow": "03 — La plataforma",
    "title": "Diseñado para",
    "titleLine2": "operadores reales",
    "lede": "Un panel de operaciones que condensa todo lo que importa — envíos activos, alertas, documentos pendientes — sin ruido, sin fricciones.",
    "anno1": "3D Globe — rutas activas",
    "anno2": "Cola de acción priorizada",
    "anno3": "KPIs en tiempo real",
    "dashboardAlt": "Agora Operations Dashboard"
  },
  "stats": {
    "stat1Num": "18h",
    "stat1Label": "Antes de que sea tarde",
    "stat1Src": "El tiempo promedio disponible para reaccionar ante un problema documental antes del cut-off naviero.",
    "stat2Num": "94%",
    "stat2Label": "Reducción en tiempo de coordinación",
    "stat2Src": "Operadores con Agora reportan hasta un 94% menos de tiempo dedicado a seguimiento manual por embarque.",
    "stat3Num": "0",
    "stat3Label": "Reclamos por frío fuera de rango",
    "stat3Src": "Temporadas cereza 2025–2026 con Agora. Trazabilidad completa, protocolos verificados, clientes informados."
  },
  "contact": {
    "eyebrow": "04 — Contacto",
    "title": "Hablemos de",
    "titleLine2": "tus operaciones",
    "sub": "Cuéntanos sobre tu empresa y tus embarques. Te respondemos en menos de 24 horas con una propuesta adaptada a tu volumen y mercados.",
    "step1Title": "Nos conocemos",
    "step1Body": "Una llamada de 30 minutos para entender tus operaciones, rutas y dolores actuales.",
    "step2Title": "Demo personalizada",
    "step2Body": "Te mostramos Agora con tus propios datos — tus rutas, tus navieras, tu temporada.",
    "step3Title": "Onboarding en 48h",
    "step3Body": "Si calzamos, tu equipo está operativo antes de que empiece el próximo embarque.",
    "formTitle": "Ponte en Contacto",
    "formSub": "Sin compromisos — te respondemos en menos de un día hábil.",
    "labelFirstName": "Nombre",
    "labelLastName": "Apellido",
    "labelCompany": "Empresa",
    "labelEmail": "Email corporativo",
    "labelVolume": "Contenedores por temporada",
    "labelMessage": "¿Qué quieres resolver?",
    "placeholderFirstName": "María José",
    "placeholderLastName": "Soto",
    "placeholderCompany": "Valle Fresco S.A.",
    "placeholderEmail": "msoto@vallefresco.cl",
    "placeholderMessage": "Ej: tenemos problemas con la trazabilidad de documentos en temporada cereza…",
    "submitBtn": "Enviar mensaje",
    "formNote": "Tu información es confidencial y nunca se comparte con terceros."
  },
  "footer": {
    "tagline": "Shipment intelligence para exportadores de fruta y frutos secos.",
    "colPlatform": "Plataforma",
    "linkVisibility": "Visibilidad",
    "linkAlerts": "Alertas",
    "linkDocs": "Documentación",
    "linkIntegrations": "Integraciones",
    "colCompany": "Empresa",
    "linkAbout": "Nosotros",
    "linkClients": "Clientes",
    "linkBlog": "Blog",
    "linkContact": "Contacto",
    "colLegal": "Legal",
    "linkPrivacy": "Privacidad",
    "linkTerms": "Términos de uso",
    "linkSecurity": "Seguridad",
    "copyright": "© 2027 Agora Technologies SpA · Santiago, Chile"
  }
}
```

- [ ] **Step 2: Add `landing` key to `messages/en.json`** with English equivalents:

```json
"landing": {
  "nav": {
    "solutions": "Solutions",
    "howItWorks": "How it works",
    "company": "Company",
    "cta": "Get in Touch"
  },
  "hero": {
    "eyebrow": "Shipment Intelligence",
    "headline": "Your exports,",
    "headlineAccent": "always under control",
    "sub": "Catch deviations before they become claims. Synchronized documents, monitored cold chain, team always in context.",
    "ctaPrimary": "Get in Touch",
    "ctaSecondary": "See Demo",
    "scroll": "Scroll"
  },
  "problem": {
    "eyebrow": "01 — The problem",
    "title": "Operational chaos",
    "titleLine2": "is expensive",
    "lede": "Every shipment moves dozens of documents, actors, and critical dates. Without unified visibility, problems arrive when there's no time left to react.",
    "card1Title": "Deviations detected too late",
    "card1Body": "Temperature or documentation problems are discovered at destination. By then, the damage is done — claims, rejections, lost customers.",
    "card1Cite": "Top cause of loss in fresh fruit exports",
    "card2Title": "Documents out of sync",
    "card2Body": "Emails, WhatsApp, carrier portals, Excel. Each document lives in a silo. One pending file can stop dispatch — or payment.",
    "card2Cite": "Average: 18 documents per shipment",
    "card3Title": "Coordination without context",
    "card3Body": "Agency, carrier, producer, importer — each has their own version of the status. Without a single source of truth, every call starts from scratch.",
    "card3Cite": "Hours of coordination lost per shipment"
  },
  "pillars": {
    "eyebrow": "02 — Solution",
    "title": "A digital team",
    "titleLine2": "for every export",
    "lede": "Agora synchronizes visibility, alerts, and documentation in a single platform — so your team acts before problems escalate.",
    "p1Num": "01",
    "p1Title": "Complete visibility on every shipment",
    "p1Body": "Real-time status of all your containers — position, document stage, temperature — in one panel. No tab switching, no calling the carrier.",
    "p2Num": "02",
    "p2Title": "Alerts with context, not just noise",
    "p2Body": "Agora filters signal from noise and delivers actionable alerts — with the exact context you need to decide fast: what happened, what it means, what you can do.",
    "p3Num": "03",
    "p3Title": "Documentation always synchronized",
    "p3Body": "All shipment documents — BL, invoices, phytosanitary, certificates — in a unified readiness matrix. Know what's missing, who has it, and how much time is left."
  },
  "product": {
    "eyebrow": "03 — The platform",
    "title": "Designed for",
    "titleLine2": "real operators",
    "lede": "An operations panel that condenses everything that matters — active shipments, alerts, pending documents — without noise, without friction.",
    "anno1": "3D Globe — active routes",
    "anno2": "Prioritized action queue",
    "anno3": "Real-time KPIs",
    "dashboardAlt": "Agora Operations Dashboard"
  },
  "stats": {
    "stat1Num": "18h",
    "stat1Label": "Before it's too late",
    "stat1Src": "The average time available to react to a documentation issue before the carrier cut-off.",
    "stat2Num": "94%",
    "stat2Label": "Reduction in coordination time",
    "stat2Src": "Operators using Agora report up to 94% less time spent on manual tracking per shipment.",
    "stat3Num": "0",
    "stat3Label": "Cold chain claims out of range",
    "stat3Src": "Cherry seasons 2025–2026 with Agora. Full traceability, verified protocols, informed customers."
  },
  "contact": {
    "eyebrow": "04 — Contact",
    "title": "Let's talk about",
    "titleLine2": "your operations",
    "sub": "Tell us about your company and your shipments. We'll respond within 24 hours with a proposal tailored to your volume and markets.",
    "step1Title": "We meet",
    "step1Body": "A 30-minute call to understand your operations, routes, and current pain points.",
    "step2Title": "Personalized demo",
    "step2Body": "We show you Agora with your own data — your routes, your carriers, your season.",
    "step3Title": "Onboarding in 48h",
    "step3Body": "If we're a fit, your team is live before the next shipment begins.",
    "formTitle": "Get in Touch",
    "formSub": "No commitment — we'll respond within one business day.",
    "labelFirstName": "First name",
    "labelLastName": "Last name",
    "labelCompany": "Company",
    "labelEmail": "Work email",
    "labelVolume": "Containers per season",
    "labelMessage": "What do you want to solve?",
    "placeholderFirstName": "María José",
    "placeholderLastName": "Soto",
    "placeholderCompany": "Valle Fresco S.A.",
    "placeholderEmail": "msoto@vallefresco.cl",
    "placeholderMessage": "E.g., we have trouble tracking documents during cherry season…",
    "submitBtn": "Send message",
    "formNote": "Your information is confidential and never shared with third parties."
  },
  "footer": {
    "tagline": "Shipment intelligence for fruit and nut exporters.",
    "colPlatform": "Platform",
    "linkVisibility": "Visibility",
    "linkAlerts": "Alerts",
    "linkDocs": "Documentation",
    "linkIntegrations": "Integrations",
    "colCompany": "Company",
    "linkAbout": "About",
    "linkClients": "Clients",
    "linkBlog": "Blog",
    "linkContact": "Contact",
    "colLegal": "Legal",
    "linkPrivacy": "Privacy",
    "linkTerms": "Terms of use",
    "linkSecurity": "Security",
    "copyright": "© 2027 Agora Technologies SpA · Santiago, Chile"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add agora-app/messages/es.json agora-app/messages/en.json
git commit -m "i18n: add landing page namespace (es + en)"
```

---

## Task 3: Add Old Standard TT font

The hero headline uses Old Standard TT (not currently imported). Add it to the locale layout alongside the existing fonts.

**Files:**
- Modify: `agora-app/app/[locale]/layout.tsx`

- [ ] **Step 1: Add font import**

In `app/[locale]/layout.tsx`, add `Old_Standard_TT` to the existing next/font imports:

```typescript
import { Inter, JetBrains_Mono, Fraunces, Old_Standard_TT } from 'next/font/google'

const oldStandard = Old_Standard_TT({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-old-standard',
  display: 'swap',
})
```

- [ ] **Step 2: Add variable to `<html>` className**

In the return statement, add `oldStandard.variable` to the `className`:

```tsx
<html lang={locale} className={`dark ${inter.variable} ${mono.variable} ${fraunces.variable} ${oldStandard.variable}`}>
```

- [ ] **Step 3: Add CSS utility in `globals.css`**

In `agora-app/app/globals.css`, inside the `@theme` block, add:

```css
--font-family-old-standard: var(--font-old-standard), 'Times New Roman', serif;
```

- [ ] **Step 4: Verify the build compiles**

```bash
cd agora-app && npm run build 2>&1 | tail -20
```
Expected: no TypeScript or compilation errors

- [ ] **Step 5: Commit**

```bash
git add agora-app/app/[locale]/layout.tsx agora-app/app/globals.css
git commit -m "feat(fonts): add Old Standard TT for landing hero headline"
```

---

## Task 4: Route restructure — introduce `(app)` and `(marketing)` groups

This is the most impactful task. Read the AGENTS.md note: this Next.js version may have differences from standard docs. Read `node_modules/next/dist/docs/` if anything is unclear about route groups.

**Files:**
- Modify: `agora-app/app/[locale]/layout.tsx` — strip to minimal (fonts + i18n only)
- Create: `agora-app/app/[locale]/(app)/layout.tsx` — AppShell + CommandPaletteProvider
- Create: `agora-app/app/[locale]/(app)/page.tsx` — dashboard (copy from current root page)
- Create: `agora-app/app/[locale]/(marketing)/layout.tsx` — minimal pass-through
- Move: all existing route dirs into `(app)/`

- [ ] **Step 1: Create `(app)` and `(marketing)` directories**

```bash
mkdir -p agora-app/app/[locale]/\(app\)
mkdir -p agora-app/app/[locale]/\(marketing\)
```

- [ ] **Step 2: Copy current root page to `(app)/page.tsx`**

```bash
cp agora-app/app/\[locale\]/page.tsx agora-app/app/\[locale\]/\(app\)/page.tsx
```

- [ ] **Step 3: Move existing app route directories into `(app)/`**

```bash
cd agora-app && git mv "app/[locale]/bookings" "app/[locale]/(app)/bookings"
cd agora-app && git mv "app/[locale]/exporters" "app/[locale]/(app)/exporters"
cd agora-app && git mv "app/[locale]/navieras" "app/[locale]/(app)/navieras"
cd agora-app && git mv "app/[locale]/performance" "app/[locale]/(app)/performance"
cd agora-app && git mv "app/[locale]/settings" "app/[locale]/(app)/settings"
```

- [ ] **Step 4: Create `(app)/layout.tsx`** — extracts AppShell and CommandPalette from the root layout:

```tsx
// agora-app/app/[locale]/(app)/layout.tsx
import { AppShell } from '@/components/layout/AppShell'
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider'
import { CommandPalette } from '@/components/search/CommandPalette'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
      <CommandPalette />
    </CommandPaletteProvider>
  )
}
```

> **Note:** Check the exact import paths for AppShell, CommandPaletteProvider, CommandPalette, and Toaster by grepping the current `app/[locale]/layout.tsx` — use those exact paths.

- [ ] **Step 5: Strip `app/[locale]/layout.tsx` to fonts + i18n only**

The root layout should now only provide fonts, locale validation, and NextIntlClientProvider — no AppShell:

```tsx
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter, JetBrains_Mono, Fraunces, Old_Standard_TT } from 'next/font/google'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

// (same font declarations as before, including oldStandard)

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className={`dark ${inter.variable} ${mono.variable} ${fraunces.variable} ${oldStandard.variable}`}>
      <body className="bg-bg-0 text-ink-1">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Create `(marketing)/layout.tsx`** — pass-through, no extra providers needed:

```tsx
// agora-app/app/[locale]/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 6b: Delete the original root page** (required — leaving it causes a Next.js route conflict)

```bash
cd agora-app && git rm "app/[locale]/page.tsx"
```

- [ ] **Step 7: Start the dev server and verify the dashboard still loads at `/app`**

```bash
cd agora-app && npm run dev
```

Open `http://localhost:3000/app` — expect the operations dashboard with sidebar. Open `http://localhost:3000/` — expect a 404 (landing page not built yet — that's correct).

- [ ] **Step 8: Commit**

```bash
git add agora-app/app/
git commit -m "refactor(routes): introduce (app) and (marketing) route groups"
```

---

## Task 5: `LandingNav` component

> **Depends on Task 3** — the `--font-family-old-standard` CSS variable must be registered before this component renders correctly.

**Files:**
- Create: `agora-app/components/landing/LandingNav.tsx`
- Create: `agora-app/__tests__/landing/LandingNav.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingNav.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingNav } from '@/components/landing/LandingNav'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}))

// Module-level mock functions so tests can assert on them
const mockReplace = vi.fn()
const mockRefresh = vi.fn()

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  usePathname: () => '/',
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}))

describe('LandingNav', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockRefresh.mockClear()
  })

  it('renders the Agora wordmark', () => {
    render(<LandingNav />)
    expect(screen.getByText('Agora')).toBeInTheDocument()
  })

  it('renders the primary CTA', () => {
    render(<LandingNav />)
    expect(screen.getByText('nav.cta')).toBeInTheDocument()
  })

  it('renders language toggle with ES and EN', () => {
    render(<LandingNav />)
    expect(screen.getByText('ES')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('calls router.replace and router.refresh when locale toggle is clicked', () => {
    render(<LandingNav />)
    const toggleBtn = screen.getByRole('button')
    fireEvent.click(toggleBtn)
    expect(mockReplace).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingNav.test.tsx
```
Expected: FAIL — "Cannot find module '@/components/landing/LandingNav'"

- [ ] **Step 3: Implement `LandingNav`**

```tsx
// agora-app/components/landing/LandingNav.tsx
'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export function LandingNav() {
  const t = useTranslations('landing.nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    // AGORA_LOCALE is the project-configured cookie name in i18n/routing.ts
    // (localeCookie: { name: 'AGORA_LOCALE', sameSite: 'lax' })
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    router.replace(pathname)
    router.refresh()
  }

  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-1 p-[5px] rounded-full"
      style={{
        background: 'rgba(43,31,18,0.38)',
        backdropFilter: 'blur(24px) saturate(180%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(1.05)',
        border: '1px solid rgba(248,242,228,0.22)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Brand */}
      <div className="inline-flex items-center gap-[9px] pr-[14px] pl-1">
        <div
          className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            background: 'rgba(248,242,228,0.13)',
            border: '1px solid rgba(248,242,228,0.20)',
          }}
        >
          <Image
            src="/agora-logo.png"
            alt="Agora"
            width={22}
            height={22}
            className="object-contain"
            style={{ filter: 'invert(1) brightness(10)' }}
          />
        </div>
        <span
          className="text-[19px] italic"
          style={{ fontFamily: 'var(--font-family-old-standard)', color: '#F8F2E4', letterSpacing: '0.01em' }}
        >
          Agora
        </span>
      </div>

      {/* Nav links — hidden on mobile */}
      {/* 'solutions' → #solutions (LandingPillars), 'howItWorks' → #solutions, 'company' → #contact */}
      <div className="hidden md:flex gap-[1px]">
        {(['solutions', 'howItWorks', 'company'] as const).map((key) => (
          <a
            key={key}
            href={key === 'company' ? '#contact' : '#solutions'}
            className="px-[13px] py-2 rounded-full text-[12px] transition-colors duration-150 cursor-pointer"
            style={{ color: 'rgba(248,242,228,0.70)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F2E4')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,242,228,0.70)')}
          >
            {t(key)}
          </a>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 mx-1" style={{ background: 'rgba(248,242,228,0.14)' }} />

      {/* Primary CTA */}
      <a
        href="#contact"
        className="ml-1 px-[18px] py-[9px] rounded-full text-[12px] font-medium inline-flex items-center gap-[6px] transition-colors duration-150 cursor-pointer"
        style={{
          background: '#F8F2E4',
          color: '#2B1F12',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#F8F2E4')}
      >
        {t('cta')} <span>→</span>
      </a>

      {/* Language toggle */}
      <button
        onClick={toggleLocale}
        className="inline-flex items-center gap-[3px] px-[10px] py-2 ml-[2px] rounded-full cursor-pointer transition-colors duration-150"
        style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10.5px' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(248,242,228,0.08)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <span style={{ color: locale === 'es' ? '#F8F2E4' : 'rgba(248,242,228,0.50)', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
        <span style={{ color: 'rgba(248,242,228,0.25)', margin: '0 1px' }}>/</span>
        <span style={{ color: locale === 'en' ? '#F8F2E4' : 'rgba(248,242,228,0.50)', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
      </button>
    </nav>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingNav.test.tsx
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingNav.tsx agora-app/__tests__/landing/LandingNav.test.tsx
git commit -m "feat(landing): add LandingNav glassmorphism pill nav"
```

---

## Task 6: `LandingHero` component

**Files:**
- Create: `agora-app/components/landing/LandingHero.tsx`
- Create: `agora-app/__tests__/landing/LandingHero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingHero.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingHero } from '@/components/landing/LandingHero'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))
vi.mock('@/components/landing/LandingNav', () => ({ LandingNav: () => <nav data-testid="nav" /> }))

describe('LandingHero', () => {
  it('renders the nav', () => {
    render(<LandingHero />)
    expect(screen.getByTestId('nav')).toBeInTheDocument()
  })

  it('renders headline copy keys', () => {
    render(<LandingHero />)
    expect(screen.getByText('hero.headline')).toBeInTheDocument()
    expect(screen.getByText('hero.headlineAccent')).toBeInTheDocument()
  })

  it('renders both CTA buttons', () => {
    render(<LandingHero />)
    expect(screen.getByText('hero.ctaPrimary')).toBeInTheDocument()
    expect(screen.getByText('hero.ctaSecondary')).toBeInTheDocument()
  })

  it('renders the scroll cue', () => {
    render(<LandingHero />)
    expect(screen.getByText('hero.scroll')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingHero.test.tsx
```

- [ ] **Step 3: Implement `LandingHero`**

```tsx
// agora-app/components/landing/LandingHero.tsx
'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LandingNav } from './LandingNav'

export function LandingHero() {
  const t = useTranslations('landing')

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh', background: '#2B1F12' }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          style={{ objectPosition: 'center 38%' }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, rgba(43,31,18,0.62) 0%, rgba(43,31,18,0.15) 55%, rgba(43,31,18,0.30) 100%),
              linear-gradient(to top, rgba(43,31,18,0.70) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Paper grain */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(248,242,228,0.032) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
          opacity: 0.55,
        }}
      />

      {/* Nav */}
      <LandingNav />

      {/* Glass card — bottom-left */}
      <div
        className="absolute z-10"
        style={{
          left: '48px',
          bottom: '48px',
          width: 'min(560px, calc(100vw - 96px))',
        }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: 'rgba(43,31,18,0.28)',
            backdropFilter: 'blur(36px) saturate(180%)',
            WebkitBackdropFilter: 'blur(36px) saturate(180%)',
            border: '1px solid rgba(248,242,228,0.20)',
            borderRadius: '22px',
            padding: '30px 30px 26px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.09)',
          }}
        >
          {/* Inner highlight sheen */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(248,242,228,0.35) 40%, rgba(248,242,228,0.15) 70%, transparent 100%)',
            }}
          />

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-[9px] mb-[18px]"
            style={{
              padding: '4px 12px 4px 8px',
              background: 'rgba(248,242,228,0.08)',
              border: '1px solid rgba(248,242,228,0.16)',
              borderRadius: '999px',
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{
                background: '#4F7A3C',
                boxShadow: '0 0 0 3px rgba(79,122,60,0.30)',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            />
            <span
              className="text-[10.5px] uppercase tracking-[0.10em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: 'rgba(248,242,228,0.80)' }}
            >
              {t('hero.eyebrow')}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="m-0"
            style={{
              fontFamily: 'var(--font-family-old-standard)',
              fontSize: 'clamp(30px, 2.8vw, 44px)',
              lineHeight: 1.06,
              fontWeight: 400,
              letterSpacing: '-0.015em',
              color: '#F8F2E4',
            }}
          >
            {t('hero.headline')}
            <br />
            <span style={{ fontStyle: 'italic', color: '#B97A1F' }}>
              {t('hero.headlineAccent')}
            </span>
          </h1>

          {/* Sub */}
          <p
            className="mt-[14px] text-[14px] leading-[1.60] font-normal"
            style={{ color: 'rgba(248,242,228,0.78)' }}
          >
            {t('hero.sub')}
          </p>

          {/* CTAs */}
          <div className="mt-5 flex items-center gap-[10px] flex-wrap">
            <a
              href="#contact"
              className="inline-flex items-center gap-[7px] font-medium text-[13px] transition-colors duration-150 cursor-pointer"
              style={{
                height: '40px',
                padding: '0 20px',
                borderRadius: '999px',
                background: '#F8F2E4',
                color: '#2B1F12',
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.30)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#F8F2E4')}
            >
              {t('hero.ctaPrimary')} <span>→</span>
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-[7px] text-[13px] font-normal transition-colors duration-150 cursor-pointer"
              style={{
                height: '40px',
                padding: '0 20px',
                borderRadius: '999px',
                background: 'rgba(248,242,228,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#F8F2E4',
                border: '1px solid rgba(248,242,228,0.28)',
                textDecoration: 'none',
              }}
            >
              {t('hero.ctaSecondary')}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute z-10 flex flex-col items-center gap-[6px]"
        style={{
          bottom: '24px',
          right: '40px',
          fontFamily: 'var(--font-family-mono)',
          fontSize: '9.5px',
          color: 'rgba(248,242,228,0.35)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <div
          className="w-px h-6"
          style={{ background: 'linear-gradient(180deg, rgba(248,242,228,0.38), transparent)' }}
        />
        {t('hero.scroll')}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingHero.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingHero.tsx agora-app/__tests__/landing/LandingHero.test.tsx
git commit -m "feat(landing): add LandingHero with glass card and full-viewport bg"
```

---

## Task 7: `LandingProblem` component

**Files:**
- Create: `agora-app/components/landing/LandingProblem.tsx`
- Create: `agora-app/__tests__/landing/LandingProblem.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingProblem.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingProblem } from '@/components/landing/LandingProblem'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingProblem', () => {
  it('renders all 3 friction card titles', () => {
    render(<LandingProblem />)
    expect(screen.getByText('problem.card1Title')).toBeInTheDocument()
    expect(screen.getByText('problem.card2Title')).toBeInTheDocument()
    expect(screen.getByText('problem.card3Title')).toBeInTheDocument()
  })

  it('renders the section title', () => {
    render(<LandingProblem />)
    expect(screen.getByText('problem.title')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingProblem.test.tsx
```

- [ ] **Step 3: Implement `LandingProblem`**

```tsx
// agora-app/components/landing/LandingProblem.tsx
'use client'

import { useTranslations } from 'next-intl'
import { ThermometerSnowflake, FileWarning, Users } from 'lucide-react'

const CARDS = [
  { key: '1', Icon: ThermometerSnowflake, severity: '#8B2A1F' },
  { key: '2', Icon: FileWarning, severity: '#B97A1F' },
  { key: '3', Icon: Users, severity: '#4F7A3C' },
] as const

export function LandingProblem() {
  const t = useTranslations('landing.problem')

  return (
    <section
      id="problem"
      className="py-[120px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingProblem.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingProblem.tsx agora-app/__tests__/landing/LandingProblem.test.tsx
git commit -m "feat(landing): add LandingProblem friction cards section"
```

---

## Task 8: `LandingPillars` component

**Files:**
- Create: `agora-app/components/landing/LandingPillars.tsx`
- Create: `agora-app/__tests__/landing/LandingPillars.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingPillars.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingPillars } from '@/components/landing/LandingPillars'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingPillars', () => {
  it('renders all 3 pillar titles', () => {
    render(<LandingPillars />)
    expect(screen.getByText('pillars.p1Title')).toBeInTheDocument()
    expect(screen.getByText('pillars.p2Title')).toBeInTheDocument()
    expect(screen.getByText('pillars.p3Title')).toBeInTheDocument()
  })

  it('renders pillar number badges', () => {
    render(<LandingPillars />)
    expect(screen.getByText('pillars.p1Num')).toBeInTheDocument()
    expect(screen.getByText('pillars.p2Num')).toBeInTheDocument()
    expect(screen.getByText('pillars.p3Num')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingPillars.test.tsx
```

- [ ] **Step 3: Implement `LandingPillars`**

The visual panels are inline JSX components as described in the spec. See full visual descriptions in spec §3. Implement each as a named sub-component within this file:

```tsx
// agora-app/components/landing/LandingPillars.tsx
'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle, CheckSquare } from 'lucide-react'

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
      <div className="text-[12px] p-[12px] rounded-[8px]" style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.08)', borderLeft: '2px solid #4F7A3C' }}>
        <span style={{ color: '#4F7A3C', fontWeight: 600 }}>✓ Excursión no crítica</span>
        <span style={{ color: '#5A4A38' }}> — dentro del margen permitido por protocolo USDA.</span>
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
          <div key={doc.name} className="flex items-center gap-2 text-[11px] px-[10px] py-[7px] rounded-[7px]" style={{ fontFamily: 'var(--font-family-mono)', color: doc.status === 'warn' ? '#B97A1F' : '#5A4A38', background: '#FFFCF1', border: `1px solid ${doc.status === 'warn' ? 'rgba(185,122,31,0.20)' : 'rgba(60,42,22,0.08)'}`, borderLeft: doc.status === 'warn' ? '2px solid #B97A1F' : undefined, opacity: doc.status === 'pending' ? 0.5 : 1 }}>
            <div className="w-[15px] h-[15px] rounded-[3px] flex items-center justify-center text-[9px] text-white flex-shrink-0" style={{ background: doc.status === 'ok' ? '#4F7A3C' : doc.status === 'warn' ? '#B97A1F' : '#B5A586' }}>
              {doc.status === 'ok' ? '✓' : doc.status === 'warn' ? '!' : '○'}
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

  return (
    <section id="solutions" className="py-[120px]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-12">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <span className="block mb-[18px] text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
            {t('eyebrow')}
          </span>
          <h2 className="italic font-normal mb-[18px]" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1.06, letterSpacing: '-0.015em', color: '#2B1F12' }}>
            {t('title')}<br />{t('titleLine2')}
          </h2>
          <p className="text-[16px] leading-[1.65] m-0" style={{ color: '#5A4A38' }}>{t('lede')}</p>
        </div>

        <div className="flex flex-col gap-24">
          {PILLARS.map(({ numKey, titleKey, bodyKey, Visual, reverse }) => (
            <div key={numKey} className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
              <div>
                <div className="inline-block text-[10px] uppercase tracking-[0.18em] px-2 py-[3px] rounded-[4px] mb-4" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860', border: '1px solid rgba(60,42,22,0.08)', background: '#FFFCF1' }}>
                  {t(numKey)}
                </div>
                <h3 className="italic font-normal mb-4" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(26px, 2.4vw, 36px)', lineHeight: 1.14, color: '#2B1F12' }}>
                  {t(titleKey)}
                </h3>
                <p className="text-[15px] leading-[1.68] m-0" style={{ color: '#5A4A38', maxWidth: '44ch' }}>
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingPillars.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingPillars.tsx agora-app/__tests__/landing/LandingPillars.test.tsx
git commit -m "feat(landing): add LandingPillars with 3 alternating feature rows"
```

---

## Task 9: `LandingProduct` component

**Files:**
- Create: `agora-app/components/landing/LandingProduct.tsx`
- Create: `agora-app/__tests__/landing/LandingProduct.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingProduct.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingProduct } from '@/components/landing/LandingProduct'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))

describe('LandingProduct', () => {
  it('renders the dashboard image', () => {
    render(<LandingProduct />)
    expect(screen.getByAltText('product.dashboardAlt')).toBeInTheDocument()
  })

  it('renders annotation chips', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.anno1')).toBeInTheDocument()
    expect(screen.getByText('product.anno2')).toBeInTheDocument()
    expect(screen.getByText('product.anno3')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingProduct.test.tsx
```

- [ ] **Step 3: Implement `LandingProduct`**

```tsx
// agora-app/components/landing/LandingProduct.tsx
'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function LandingProduct() {
  const t = useTranslations('landing.product')

  return (
    <section id="product" className="py-[120px]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-12">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <span className="block mb-[18px] text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
            {t('eyebrow')}
          </span>
          <h2 className="italic font-normal mb-[18px]" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1.06, letterSpacing: '-0.015em', color: '#2B1F12' }}>
            {t('title')}<br />{t('titleLine2')}
          </h2>
          <p className="text-[16px] leading-[1.65] m-0" style={{ color: '#5A4A38' }}>{t('lede')}</p>
        </div>

        {/* Screenshot with annotations */}
        <div className="relative mx-auto" style={{ maxWidth: '100%' }}>
          {/* Annotation chips — hidden on mobile */}
          <div className="hidden lg:block">
            <Annotation label={t('anno1')} style={{ top: '12%', left: '-2%', transform: 'translateX(-100%) translateX(-8px)' }} amber={false} />
            <Annotation label={t('anno2')} style={{ top: '50%', right: '-2%', transform: 'translateX(100%) translateX(8px)' }} amber={true} />
            <Annotation label={t('anno3')} style={{ bottom: '18%', left: '-2%', transform: 'translateX(-100%) translateX(-8px)' }} amber={false} />
          </div>

          <div
            className="overflow-hidden w-full"
            style={{
              border: '1px solid rgba(60,42,22,0.16)',
              borderRadius: '16px',
              boxShadow: '0 40px 80px rgba(43,31,18,0.18), 0 0 0 1px rgba(43,31,18,0.06)',
            }}
          >
            <Image
              src="/landing/dashboard.png"
              alt={t('dashboardAlt')}
              width={1200}
              height={750}
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Annotation({ label, style, amber }: { label: string; style: React.CSSProperties; amber: boolean }) {
  return (
    <div
      className="absolute inline-flex items-center gap-[6px]"
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: '10px',
        letterSpacing: '0.04em',
        color: '#2B1F12',
        background: '#F8F2E4',
        border: '1px solid rgba(60,42,22,0.16)',
        padding: '5px 10px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(43,31,18,0.10)',
        ...style,
      }}
    >
      <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: amber ? '#B97A1F' : '#4F7A3C' }} />
      {label}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingProduct.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingProduct.tsx agora-app/__tests__/landing/LandingProduct.test.tsx
git commit -m "feat(landing): add LandingProduct dashboard screenshot with annotations"
```

---

## Task 10: `LandingStats` component

**Files:**
- Create: `agora-app/components/landing/LandingStats.tsx`
- Create: `agora-app/__tests__/landing/LandingStats.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingStats.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingStats } from '@/components/landing/LandingStats'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingStats', () => {
  it('renders all 3 stat numbers', () => {
    render(<LandingStats />)
    expect(screen.getByText('stats.stat1Num')).toBeInTheDocument()
    expect(screen.getByText('stats.stat2Num')).toBeInTheDocument()
    expect(screen.getByText('stats.stat3Num')).toBeInTheDocument()
  })

  it('renders all 3 stat labels', () => {
    render(<LandingStats />)
    expect(screen.getByText('stats.stat1Label')).toBeInTheDocument()
    expect(screen.getByText('stats.stat2Label')).toBeInTheDocument()
    expect(screen.getByText('stats.stat3Label')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingStats.test.tsx
```

- [ ] **Step 3: Implement `LandingStats`**

```tsx
// agora-app/components/landing/LandingStats.tsx
'use client'

import { useTranslations } from 'next-intl'

const STATS = ['stat1', 'stat2', 'stat3'] as const

export function LandingStats() {
  const t = useTranslations('landing.stats')

  return (
    <section style={{ borderTop: '1px solid rgba(60,42,22,0.08)', borderBottom: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {STATS.map((key, i) => (
          <div
            key={key}
            className={`flex flex-col gap-3 ${i < 2 ? 'border-b md:border-b-0 md:border-r' : ''}`}
            style={{
              padding: '64px 40px',
              borderColor: 'rgba(60,42,22,0.08)',
            }}
          >
            <div
              className="font-light italic leading-[0.95]"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(52px, 6vw, 80px)',
                letterSpacing: '-0.02em',
                color: '#2B1F12',
              }}
            >
              {t(`${key}Num`)}
            </div>
            <div className="text-[15px] font-medium leading-[1.4]" style={{ color: '#2B1F12' }}>
              {t(`${key}Label`)}
            </div>
            <p
              className="text-[10.5px] italic leading-[1.55] m-0"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860', maxWidth: '32ch' }}
            >
              {t(`${key}Src`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingStats.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingStats.tsx agora-app/__tests__/landing/LandingStats.test.tsx
git commit -m "feat(landing): add LandingStats outcomes strip"
```

---

## Task 11: `LandingContact` component

**Files:**
- Create: `agora-app/components/landing/LandingContact.tsx`
- Create: `agora-app/__tests__/landing/LandingContact.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingContact.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingContact } from '@/components/landing/LandingContact'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingContact', () => {
  it('renders the form title', () => {
    render(<LandingContact />)
    expect(screen.getByText('contact.formTitle')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<LandingContact />)
    expect(screen.getByRole('button', { name: /contact\.submitBtn/i })).toBeInTheDocument()
  })

  it('volume selector marks clicked option as active', () => {
    render(<LandingContact />)
    const option = screen.getByText('20–100')
    fireEvent.click(option)
    expect(option).toHaveAttribute('data-active', 'true')
  })

  it('renders all 3 process steps', () => {
    render(<LandingContact />)
    expect(screen.getByText('contact.step1Title')).toBeInTheDocument()
    expect(screen.getByText('contact.step2Title')).toBeInTheDocument()
    expect(screen.getByText('contact.step3Title')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingContact.test.tsx
```

- [ ] **Step 3: Implement `LandingContact`**

```tsx
// agora-app/components/landing/LandingContact.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const VOLUME_OPTIONS = ['1–20', '20–100', '100–500', '500+'] as const

export function LandingContact() {
  const t = useTranslations('landing.contact')
  const [volume, setVolume] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Contact form submitted')
  }

  return (
    <section id="contact" className="py-[140px]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
      <div className="max-w-[1160px] mx-auto px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* Left: copy + steps */}
          <div>
            <span className="block mb-[18px] text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
              {t('eyebrow')}
            </span>
            <h2 className="italic mb-[22px]" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(38px, 4vw, 56px)', lineHeight: 1.06, letterSpacing: '-0.02em', color: '#2B1F12', fontWeight: 300 }}>
              {t('title')}<br />{t('titleLine2')}
            </h2>
            <p className="text-[16px] leading-[1.65] mb-10" style={{ color: '#5A4A38', maxWidth: '42ch' }}>
              {t('sub')}
            </p>
            <div className="flex flex-col gap-[18px]">
              {(['1', '2', '3'] as const).map((n) => (
                <div key={n} className="flex gap-4 items-start pt-[18px]" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
                  <div className="text-[10px] uppercase tracking-[0.18em] pt-[2px] min-w-[32px] flex-shrink-0" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                    0{n}
                  </div>
                  <div>
                    <strong className="italic text-[16px] font-medium block mb-[2px]" style={{ fontFamily: 'var(--font-family-display)', color: '#2B1F12' }}>
                      {t(`step${n}Title` as any)}
                    </strong>
                    <p className="text-[13.5px] leading-[1.55] m-0" style={{ color: '#5A4A38' }}>
                      {t(`step${n}Body` as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div className="rounded-[16px] p-9" style={{ background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.16)', boxShadow: '0 8px 32px rgba(43,31,18,0.07)' }}>
            <h3 className="italic text-[20px] mb-[6px]" style={{ fontFamily: 'var(--font-family-display)', color: '#2B1F12' }}>
              {t('formTitle')}
            </h3>
            <p className="text-[13px] mb-7" style={{ color: '#8A7860' }}>{t('formSub')}</p>

            <form onSubmit={handleSubmit}>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['FirstName', 'LastName'] as const).map((f) => (
                  <div key={f} className="flex flex-col gap-[6px]">
                    <label className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                      {t(`label${f}`)} <span style={{ color: '#8B2A1F' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t(`placeholder${f}`)}
                      className="h-[42px] px-[14px] rounded-[8px] text-[14px] outline-none w-full transition-shadow duration-150"
                      style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.14)', color: '#2B1F12' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#5A4A38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,31,18,0.07)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(60,42,22,0.14)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                  </div>
                ))}
              </div>

              {/* Single-field rows */}
              {(['Company', 'Email'] as const).map((f) => (
                <div key={f} className="flex flex-col gap-[6px] mb-4">
                  <label className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                    {t(`label${f}`)} <span style={{ color: '#8B2A1F' }}>*</span>
                  </label>
                  <input
                    type={f === 'Email' ? 'email' : 'text'}
                    placeholder={t(`placeholder${f}`)}
                    className="h-[42px] px-[14px] rounded-[8px] text-[14px] outline-none w-full"
                    style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.14)', color: '#2B1F12' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#5A4A38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,31,18,0.07)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(60,42,22,0.14)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>
              ))}

              {/* Volume selector */}
              <div className="mb-4">
                <span className="block text-[10px] uppercase tracking-[0.12em] font-medium mb-[6px]" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                  {t('labelVolume')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[6px]">
                  {VOLUME_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      data-active={volume === opt ? 'true' : undefined}
                      onClick={() => setVolume(opt)}
                      className="h-[38px] flex items-center justify-center rounded-[7px] text-[11.5px] transition-colors duration-150 cursor-pointer"
                      style={{
                        fontFamily: 'var(--font-family-mono)',
                        background: volume === opt ? '#2B1F12' : '#FCF7EA',
                        color: volume === opt ? '#F8F2E4' : '#5A4A38',
                        border: `1px solid ${volume === opt ? '#2B1F12' : 'rgba(60,42,22,0.14)'}`,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-[6px] mb-4">
                <label className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                  {t('labelMessage')} <span style={{ color: '#8B2A1F' }}>*</span>
                </label>
                <textarea
                  placeholder={t('placeholderMessage')}
                  rows={4}
                  className="px-[14px] py-3 rounded-[8px] text-[14px] outline-none w-full resize-y"
                  style={{ background: '#FCF7EA', border: '1px solid rgba(60,42,22,0.14)', color: '#2B1F12', minHeight: '88px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#5A4A38'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,31,18,0.07)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(60,42,22,0.14)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-[46px] rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer mt-[6px]"
                style={{ background: '#2B1F12', color: '#F8F2E4', border: 'none' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#1F1609')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#2B1F12')}
              >
                {t('submitBtn')} <span>→</span>
              </button>

              <p className="text-center mt-[14px] text-[10px] tracking-[0.04em]" style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}>
                {t('formNote')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingContact.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingContact.tsx agora-app/__tests__/landing/LandingContact.test.tsx
git commit -m "feat(landing): add LandingContact form with volume selector"
```

---

## Task 12: `LandingFooter` component

> **Depends on Task 3** — the `--font-family-old-standard` CSS variable must be registered before this component renders correctly.

**Files:**
- Create: `agora-app/components/landing/LandingFooter.tsx`
- Create: `agora-app/__tests__/landing/LandingFooter.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// agora-app/__tests__/landing/LandingFooter.test.tsx
import { render, screen } from '@testing-library/react'
import { LandingFooter } from '@/components/landing/LandingFooter'

// Module-level mock functions so tests can assert on them
const mockReplace = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  usePathname: () => '/',
}))

describe('LandingFooter', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockRefresh.mockClear()
  })

  it('renders the Agora wordmark', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Agora')).toBeInTheDocument()
  })

  it('renders footer column headings', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.colPlatform')).toBeInTheDocument()
    expect(screen.getByText('footer.colCompany')).toBeInTheDocument()
    expect(screen.getByText('footer.colLegal')).toBeInTheDocument()
  })

  it('renders copyright', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.copyright')).toBeInTheDocument()
  })

  it('calls router.replace and router.refresh when locale toggle is clicked', () => {
    render(<LandingFooter />)
    const toggleBtn = screen.getByRole('button')
    fireEvent.click(toggleBtn)
    expect(mockReplace).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingFooter.test.tsx
```

- [ ] **Step 3: Implement `LandingFooter`**

```tsx
// agora-app/components/landing/LandingFooter.tsx
'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const PLATFORM_LINKS = ['linkVisibility', 'linkAlerts', 'linkDocs', 'linkIntegrations'] as const
const COMPANY_LINKS = ['linkAbout', 'linkClients', 'linkBlog', 'linkContact'] as const
const LEGAL_LINKS = ['linkPrivacy', 'linkTerms', 'linkSecurity'] as const

export function LandingFooter() {
  const t = useTranslations('landing.footer')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    router.replace(pathname)
    router.refresh()
  }

  return (
    <footer style={{ background: '#FCF7EA', borderTop: '1px solid rgba(60,42,22,0.08)', padding: '72px 0 36px' }}>
      <div className="max-w-[1160px] mx-auto px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-14">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-[10px] mb-3">
              <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center overflow-hidden" style={{ background: '#2B1F12' }}>
                <Image src="/agora-logo.png" alt="Agora" width={18} height={18} className="object-contain" style={{ filter: 'invert(1) brightness(10)' }} />
              </div>
              <span className="italic text-[20px]" style={{ fontFamily: 'var(--font-family-old-standard)', color: '#2B1F12' }}>Agora</span>
            </div>
            <p className="text-[13px] leading-[1.6] m-0" style={{ color: '#8A7860', maxWidth: '30ch' }}>{t('tagline')}</p>
          </div>

          {/* Link columns */}
          {[
            { heading: 'colPlatform', links: PLATFORM_LINKS },
            { heading: 'colCompany', links: COMPANY_LINKS },
            { heading: 'colLegal', links: LEGAL_LINKS },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h5 className="text-[10px] uppercase tracking-[0.18em] font-medium mb-[14px] m-0" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                {t(heading as any)}
              </h5>
              <ul className="list-none p-0 m-0 flex flex-col gap-[9px]">
                {links.map((link) => (
                  <li key={link}>
                    <a className="text-[13.5px] transition-colors duration-150 cursor-pointer" style={{ color: '#5A4A38', textDecoration: 'none' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2B1F12')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#5A4A38')}
                    >
                      {t(link as any)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
          <span className="text-[10.5px] tracking-[0.06em]" style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}>
            {t('copyright')}
          </span>
          <button
            onClick={toggleLocale}
            className="inline-flex items-center gap-[4px] px-[9px] py-1 rounded-[6px] cursor-pointer"
            style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10.5px', letterSpacing: '0.06em', background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}
          >
            <span style={{ color: locale === 'es' ? '#2B1F12' : '#8A7860', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
            <span style={{ color: '#B5A586', margin: '0 2px' }}>/</span>
            <span style={{ color: locale === 'en' ? '#2B1F12' : '#8A7860', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd agora-app && npx vitest run __tests__/landing/LandingFooter.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/landing/LandingFooter.tsx agora-app/__tests__/landing/LandingFooter.test.tsx
git commit -m "feat(landing): add LandingFooter with 4-column grid and locale toggle"
```

---

## Task 13: Assemble the landing page

**Files:**
- Create: `agora-app/app/[locale]/(marketing)/page.tsx`

- [ ] **Step 1: Create the landing page**

```tsx
// agora-app/app/[locale]/(marketing)/page.tsx
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingPillars } from '@/components/landing/LandingPillars'
import { LandingProduct } from '@/components/landing/LandingProduct'
import { LandingStats } from '@/components/landing/LandingStats'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Agora — Shipment Intelligence para exportadores',
  description: 'Visibilidad en tiempo real, alertas con contexto y documentación sincronizada para exportadores de fruta y frutos secos.',
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main style={{ background: '#F8F2E4', position: 'relative', overflowX: 'hidden' }}>
      {/* Ambient warm glows */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(60% 40% at 90% 0%, rgba(178,80,40,0.05), transparent 60%),
            radial-gradient(50% 40% at 10% 100%, rgba(120,85,50,0.045), transparent 60%)
          `,
        }}
      />
      {/* Paper grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(90,60,30,0.045) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'multiply',
          opacity: 0.7,
        }}
      />
      <div className="relative z-[1]">
        <LandingHero />
        <LandingProblem />
        <LandingPillars />
        <LandingProduct />
        <LandingStats />
        <LandingContact />
        <LandingFooter />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Start dev server and verify the landing page renders at `/`**

```bash
cd agora-app && npm run dev
```

Open `http://localhost:3000/` — expect landing page with hero, problem, pillars, product, stats, contact form, footer. No sidebar.

Open `http://localhost:3000/app` — expect operations dashboard with sidebar.

- [ ] **Step 3: Run the full test suite**

```bash
cd agora-app && npx vitest run
```
Expected: all tests pass

- [ ] **Step 4: Run TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add agora-app/app/
git commit -m "feat(landing): assemble landing page at root route"
```

---

## Task 14: Fix internal links and final cleanup

Any existing internal links within the app that point to `/` (e.g., the logo in the sidebar) need to update to `/app`.

- [ ] **Step 1: Find all internal `href="/"` references in the app components**

```bash
grep -r 'href="/"' agora-app/components/ agora-app/app/
```

- [ ] **Step 2: Update each occurrence to `href="/app"`**

For each match, change `href="/"` to `href="/app"`. Only change references inside `(app)` layout components (sidebar logo, header links) — not in the landing page itself.

- [ ] **Step 3: Run a production build to catch any remaining issues**

```bash
cd agora-app && npm run build 2>&1 | tail -30
```
Expected: build completes with no errors. Warnings about `any` types are acceptable.

- [ ] **Step 4: Commit**

```bash
git add agora-app/
git commit -m "fix(nav): update internal / links to /app after route restructure"
```

---

## Task 15: Commit spec and plan docs

- [ ] **Step 1: Commit the plan document**

```bash
git add docs/superpowers/plans/2026-05-02-landing-page.md
git commit -m "docs(plans): add landing page implementation plan"
```

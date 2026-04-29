# Agora Phase 1 — Foundation + Container Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Agora prototype with all types, mock data, i18n wiring, layout chrome, and a fully-populated Container Detail page for both hero containers.

**Architecture:** Next.js 14 App Router with strict TypeScript. All domain data lives in `/lib/mock-data` as static TS files; `computeLaneProfile()` composes runtime lane behavior from product, market, and commercial profile files with zero hardcoded conditionals. Every UI string is sourced from `messages/{locale}.json` via next-intl with cookie-based locale resolution (`AGORA_LOCALE`). Cold-chain UI is gated by `container.coldChain?.required === true` so dry containers transparently skip every cold-chain element.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Tailwind CSS + shadcn/ui · next-intl (cookie-based) · Recharts · Framer Motion · date-fns

---

## Conventions for every task

- **Working directory:** `/Users/sebastian.ibanez/Documents/Agora/agora-app` (created in Task 1; all paths below are relative to this root unless absolute).
- **Test runner:** Vitest (`pnpm test` runs once; `pnpm test:watch` for TDD loop).
- **TDD loop:** Write a failing test → run it → confirm it fails for the *right* reason → implement minimal code → run the test → confirm it passes → commit.
- **Commit style:** Conventional commits, present-tense, scoped to the task. Example: `feat(types): add LaneProfile and Patch 01 enums`.
- **No emojis** in code, copy, commits, or filenames.
- **Numbers/IDs/codes** always wrapped in the `font-mono` Tailwind class (which maps to JetBrains Mono).
- **No hardcoded UI strings.** If a string is user-visible, it lives in `messages/es.json` (and `messages/en.json`).
- **Demo today:** `getTodayDemo()` returns `new Date('2027-01-09T10:00:00-04:00')`. All time math is relative to this.

---

## Task 1 — Project Init

**Goal:** Scaffold Next.js 14 App Router project with strict TypeScript and pnpm.

**Files created:**
- `/Users/sebastian.ibanez/Documents/Agora/agora-app/` (project root)
- `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`, `.eslintrc.json`

### Steps

- [ ] Verify parent dir exists: `ls /Users/sebastian.ibanez/Documents/Agora`
- [ ] From `/Users/sebastian.ibanez/Documents/Agora`, run:
  ```bash
  pnpm create next-app@latest agora-app \
    --typescript --tailwind --eslint --app --src-dir=false \
    --import-alias "@/*" --use-pnpm --no-turbo
  ```
  Expected: `Success! Created agora-app at ...`
- [ ] `cd agora-app && pnpm install`
- [ ] Open `tsconfig.json` and set `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`.
- [ ] Run `pnpm build` to confirm a clean baseline. Expected: `Compiled successfully`.
- [ ] Initialize git, set `.gitignore` to include `.next`, `node_modules`, `.env*`, `coverage`, `*.tsbuildinfo`.
- [ ] Install runtime deps:
  ```bash
  pnpm add next-intl date-fns recharts framer-motion lucide-react clsx class-variance-authority tailwind-merge
  ```
- [ ] Install dev deps:
  ```bash
  pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
  ```
- [ ] Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.
- [ ] Create `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';
  import path from 'node:path';
  export default defineConfig({
    plugins: [react()],
    test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  });
  ```
- [ ] `pnpm add -D @vitejs/plugin-react`
- [ ] Create `vitest.setup.ts` with `import '@testing-library/jest-dom';`.
- [ ] Run `pnpm test` (no tests yet). Expected: `No test files found` exit 0 OR `passed (0)` — both acceptable; loop must not error.
- [ ] Run `pnpm typecheck`. Expected: no errors.
- [ ] Initialize shadcn/ui: `pnpm dlx shadcn@latest init -d` then accept defaults (style: default, base color: slate, CSS variables: yes).
- [ ] Add a few primitives now to confirm install: `pnpm dlx shadcn@latest add button card tabs dropdown-menu separator badge tooltip`.
- [ ] Commit: `chore: bootstrap Next.js 14 app with strict TS, vitest, shadcn`.

---

## Task 2 — Tailwind + Design Tokens

**Goal:** Wire all design tokens (surfaces, mint, severity, trace, fonts) into Tailwind plus body ambient glows.

**Files modified:**
- `tailwind.config.ts`
- `app/globals.css`
- `app/layout.tsx` (font wiring)

### Steps

- [ ] Write a failing test `__tests__/tokens.test.tsx`:
  ```tsx
  import { render } from '@testing-library/react';
  import { describe, it, expect } from 'vitest';
  describe('design tokens', () => {
    it('exposes mint-500 as a Tailwind class', () => {
      const { container } = render(<div className="bg-mint-500" data-testid="t" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('bg-mint-500');
    });
    it('exposes severity utilities', () => {
      const { container } = render(<div className="text-severity-crit" />);
      expect((container.firstChild as HTMLElement).className).toContain('text-severity-crit');
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: both pass already (Tailwind compiles classnames lazily; this test only asserts class presence — it's a smoke test). The *real* failing test comes next:
- [ ] Add a CSS-variable test by reading `globals.css`. Replace the test with:
  ```ts
  import { readFileSync } from 'node:fs';
  import { describe, it, expect } from 'vitest';
  const css = readFileSync('app/globals.css', 'utf8');
  const cfg = readFileSync('tailwind.config.ts', 'utf8');
  describe('design tokens', () => {
    it('defines surface bg-0..bg-3 CSS variables', () => {
      expect(css).toMatch(/--bg-0:\s*#070A12/);
      expect(css).toMatch(/--bg-1:\s*#0E1320/);
      expect(css).toMatch(/--bg-2:\s*#141A29/);
      expect(css).toMatch(/--bg-3:\s*#1B2235/);
    });
    it('defines ink-1..ink-4 CSS variables', () => {
      expect(css).toMatch(/--ink-1:\s*#F4F6FA/);
      expect(css).toMatch(/--ink-4:\s*#475063/);
    });
    it('defines mint scale and severity in tailwind config', () => {
      expect(cfg).toMatch(/mint:\s*\{[^}]*500:\s*['"]#00E696/);
      expect(cfg).toMatch(/severity:\s*\{[^}]*crit:\s*['"]#EF4444/);
      expect(cfg).toMatch(/trace:\s*['"]#7DD3FC/);
    });
    it('registers JetBrains Mono as fontFamily.mono', () => {
      expect(cfg).toMatch(/mono:\s*\[\s*['"]JetBrains Mono/);
    });
    it('body ambient glows present', () => {
      expect(css).toMatch(/body::before/);
      expect(css).toMatch(/body::after/);
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: 5 failures.
- [ ] Edit `app/globals.css`. Replace contents with:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :root {
    --bg-0: #070A12;
    --bg-1: #0E1320;
    --bg-2: #141A29;
    --bg-3: #1B2235;
    --ink-1: #F4F6FA;
    --ink-2: #A8B3C7;
    --ink-3: #6B7689;
    --ink-4: #475063;
    --line-soft: rgba(255,255,255,0.07);
    --line-mid:  rgba(255,255,255,0.14);
    --line-mint: rgba(0,230,150,0.32);
    --glass: rgba(17,24,39,0.55);
  }

  html, body { background: var(--bg-0); color: var(--ink-1); }
  body { font-family: var(--font-inter), Inter, system-ui, sans-serif; font-size: 13px; }

  body::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(60% 40% at 90% 0%, rgba(0,230,150,0.05), transparent 60%),
      radial-gradient(50% 40% at 10% 100%, rgba(125,211,252,0.05), transparent 60%);
  }
  body::after {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 3px 3px;
    mix-blend-mode: screen;
  }

  .glass { background: var(--glass); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  ```
- [ ] Edit `tailwind.config.ts`:
  ```ts
  import type { Config } from 'tailwindcss';
  const config: Config = {
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
      extend: {
        colors: {
          'bg-0': 'var(--bg-0)',
          'bg-1': 'var(--bg-1)',
          'bg-2': 'var(--bg-2)',
          'bg-3': 'var(--bg-3)',
          'ink-1': 'var(--ink-1)',
          'ink-2': 'var(--ink-2)',
          'ink-3': 'var(--ink-3)',
          'ink-4': 'var(--ink-4)',
          mint: { 300: '#4DFFB8', 500: '#00E696', 600: '#00B377', 700: '#008055' },
          severity: { ok: '#00E696', info: '#3B82F6', watch: '#F59E0B', risk: '#F97316', crit: '#EF4444' },
          trace: '#7DD3FC',
        },
        fontFamily: {
          sans:  ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
          mono:  ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        },
        keyframes: {
          'pulse-crit': { '0%,100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.6)' }, '50%': { boxShadow: '0 0 0 6px rgba(239,68,68,0)' } },
          'arc-draw':   { '0%': { strokeDashoffset: '300' }, '100%': { strokeDashoffset: '0' } },
        },
        animation: {
          'pulse-crit': 'pulse-crit 1.5s ease-in-out infinite',
          'arc-draw':   'arc-draw 2.5s ease-out forwards',
        },
      },
    },
    plugins: [],
  };
  export default config;
  ```
- [ ] Edit `app/layout.tsx`:
  ```tsx
  import type { Metadata } from 'next';
  import { Inter, JetBrains_Mono } from 'next/font/google';
  import './globals.css';
  const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
  const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
  export const metadata: Metadata = { title: 'Agora', description: 'Export operations platform' };
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="es" className={`${inter.variable} ${mono.variable}`}>
        <body>{children}</body>
      </html>
    );
  }
  ```
- [ ] Run `pnpm test`. Expected: all 5 pass.
- [ ] Run `pnpm typecheck`. Expected: clean.
- [ ] Commit: `feat(design): wire all design tokens, fonts, ambient glows`.

---

## Task 3 — TypeScript Types (`types/index.ts`)

**Goal:** Single source of truth for all interfaces from spec + Patch 01.

**Files created:**
- `types/index.ts`
- `__tests__/types.test.ts`

### Steps

- [ ] Write `__tests__/types.test.ts`:
  ```ts
  import { describe, it, expect, expectTypeOf } from 'vitest';
  import type {
    Container, ColdChainTrace, LaneProfile, ProductId, IncotermPaymentId,
    ProductProfile, MarketProfileExtended, CommercialProfile, DocumentRequirement,
    Agent, Alert, Validation, PurchaseOrder, Importer, Producer, KPI, PenaltyEvent,
    DataLogger, CaReading, ExcursionEvent, PreCoolingRecord, ReeferPtiRecord, ColdTreatmentProtocol,
  } from '@/types';

  describe('types', () => {
    it('ProductId union has all 7 product values', () => {
      const ids: ProductId[] = [
        'walnuts_in_shell','walnut_kernels','almonds_in_shell',
        'fresh_cherries','fresh_blueberries','table_grapes_red','table_grapes_white',
      ];
      expect(ids.length).toBe(7);
    });
    it('IncotermPaymentId union has all 6 commercial profile values', () => {
      const ids: IncotermPaymentId[] = [
        'cif_cad_at_sight','cif_lc_at_sight','cif_lc_60',
        'cif_open_account_30','fob_open_account_30','dap_open_account',
      ];
      expect(ids.length).toBe(6);
    });
    it('Container has Patch 01 fields', () => {
      expectTypeOf<Container['productId']>().toEqualTypeOf<ProductId>();
      expectTypeOf<Container['commercialId']>().toEqualTypeOf<IncotermPaymentId>();
      expectTypeOf<Container['laneProfileId']>().toEqualTypeOf<string>();
      expectTypeOf<Container['coldChain']>().toEqualTypeOf<ColdChainTrace | undefined>();
    });
    it('ColdChainTrace.status is the documented union', () => {
      expectTypeOf<ColdChainTrace['status']>().toEqualTypeOf<'pre_load' | 'in_treatment' | 'completed' | 'breached'>();
    });
    it('LaneProfile has documentSet array and composed fields', () => {
      expectTypeOf<LaneProfile['documentSet']>().toEqualTypeOf<DocumentRequirement[]>();
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: import errors / file-not-found.
- [ ] Create `types/index.ts` with the full interface set. Include (complete code):
  ```ts
  // ===== Enums =====
  export type Market = 'US' | 'EU' | 'IN' | 'CN' | 'MENA';

  export type ProductId =
    | 'walnuts_in_shell' | 'walnut_kernels' | 'almonds_in_shell'
    | 'fresh_cherries' | 'fresh_blueberries'
    | 'table_grapes_red' | 'table_grapes_white';

  export type IncotermPaymentId =
    | 'cif_cad_at_sight' | 'cif_lc_at_sight' | 'cif_lc_60'
    | 'cif_open_account_30' | 'fob_open_account_30' | 'dap_open_account';

  export type DocumentType =
    | 'commercial_invoice' | 'packing_list' | 'bill_of_lading' | 'certificate_of_origin'
    | 'phyto_certificate' | 'fumigation_cert' | 'cold_treatment_cert' | 'health_cert'
    | 'gacc_registration' | 'lc_compliance_letter' | 'insurance_certificate'
    | 'dus' | 'sag_export_auth' | 'transport_document' | 'pti_certificate'
    | 'pre_cooling_log' | 'logger_report' | 'ca_atmosphere_log';

  export type DocStatus = 'missing' | 'draft' | 'pending_review' | 'approved' | 'rejected' | 'in_transit' | 'delivered';

  export type Severity = 'ok' | 'info' | 'watch' | 'risk' | 'crit';

  // ===== Document Requirement =====
  export interface DocumentRequirement {
    type: DocumentType;
    label: string;             // i18n key, e.g. 'docs.commercialInvoice'
    requiredBy: string;        // T-day expression, e.g. 'T-3'
    issuingAuthority?: string;
    notes?: string;
  }

  // ===== Validation =====
  export interface ValidationSummary {
    passed: number;
    failed: number;
    warnings: number;
  }

  export interface Validation {
    id: string;
    containerId: string;
    documentType?: DocumentType;
    checkId: string;          // e.g. 'INV.AMOUNT.MATCHES.PO'
    severity: Severity;
    status: 'passed' | 'failed' | 'warning';
    message: string;          // i18n key
    detectedAt: string;       // ISO
  }

  // ===== Cold chain =====
  export interface DataLogger {
    id: string;
    position: 'top' | 'middle' | 'bottom';
    serial: string;
    readings: Array<{ t: string; tempC: number }>;  // ISO timestamp + temp
  }

  export interface CaReading {
    t: string;
    o2Pct: number;
    co2Pct: number;
    n2Pct: number;
  }

  export interface ExcursionEvent {
    id: string;
    startAt: string;
    endAt: string;
    durationMin: number;
    loggerId: string;
    peakTempC: number;
    severity: Severity;
    brokeCompliance: boolean;
  }

  export interface PreCoolingRecord {
    facility: string;
    startedAt: string;
    completedAt: string;
    targetTempC: number;
    pulpTempCurve: Array<{ t: string; tempC: number }>;
  }

  export interface ReeferPtiRecord {
    performedAt: string;
    technician: string;
    passed: boolean;
    notes?: string;
  }

  export interface ColdTreatmentProtocol {
    id: string;                // 'china_15d_0_5c'
    label: string;             // i18n key
    market: Market;
    durationDays: number;
    setpointC: number;
    toleranceC: number;
    description: string;       // i18n key
  }

  export interface ColdChainTrace {
    required: boolean;
    protocol: string | null;
    setpointC: number;
    toleranceC: number;
    caGasMix?: { o2Pct: number; co2Pct: number; n2Pct: number };
    rhTargetPct: [number, number];
    preCooling?: PreCoolingRecord;
    reeferPti?: ReeferPtiRecord;
    loggers: DataLogger[];
    caReadings?: CaReading[];
    treatmentRequiredMinutes: number;
    treatmentMinutesCompliant: number;
    treatmentMinutesViolation: number;
    excursionEvents: ExcursionEvent[];
    status: 'pre_load' | 'in_treatment' | 'completed' | 'breached';
    lastReadingAt: string;
    loggerDownloadReportUrl?: string;
    arrivalTransferStatus?: 'pending' | 'in_progress' | 'completed';
  }

  // ===== Profiles =====
  export interface ProductProfile {
    id: ProductId;
    label: string;             // i18n key
    requiresColdChain: boolean;
    defaultProtocols: string[]; // ColdTreatmentProtocol ids
    seasonality?: string;
    hsCode: string;
    requiredDocs: DocumentType[];
    activeAgents: AgentId[];
  }

  export interface MarketProfile {
    id: Market;
    label: string;             // i18n key
    inspectionAuthority: string;
  }

  export interface MarketProfileExtended extends MarketProfile {
    coldTreatmentOptions?: ColdTreatmentProtocol[];
    registrationsRequired: string[];
    labelLanguageRequired: string[];
    digitalPhytoSystem?: string;
    activeAgents: AgentId[];
    requiredDocs: DocumentType[];
  }

  export interface CommercialProfile {
    id: IncotermPaymentId;
    label: string;             // i18n key
    incoterm: 'CIF' | 'FOB' | 'DAP';
    paymentMethod: 'CAD' | 'L/C' | 'open_account';
    paymentTerms: string;      // 'at sight', '60 days', '30 days net'
    requiredDocs: DocumentType[];
    validationChecks: string[];
    activeAgents: AgentId[];
  }

  // ===== Lane profile (composed) =====
  export interface LaneTimelineEvent {
    tDay: string;              // 'T-3', 'T+0', 'T+10'
    label: string;             // i18n key
    actor: 'producer' | 'exporter' | 'importer' | 'agent' | 'authority';
  }

  export interface LaneProfile {
    id: string;                // '{productId}.{marketId}.{commercialId}'
    product: ProductProfile;
    market: MarketProfileExtended;
    commercial: CommercialProfile;
    documentSet: DocumentRequirement[];
    agentsActive: AgentId[];
    validationChecks: string[];
    timeline: LaneTimelineEvent[];
  }

  // ===== Container =====
  export interface Container {
    id: string;                // 'MSCU-7842156'
    productId: ProductId;
    productLabel: string;      // human-readable, e.g. 'Walnuts in shell'
    commercialId: IncotermPaymentId;
    laneProfileId: string;
    market: Market;
    polCode: string; polLabel: string;     // 'San Antonio'
    podCode: string; podLabel: string;     // 'Nhava Sheva'
    importerId: string;
    producerId: string;
    purchaseOrderId: string;
    weightKg: number;
    valueUsd: number;
    etd: string;               // ISO
    eta: string;               // ISO
    cutoffAt?: string;         // ISO if applicable
    status: 'planning' | 'docs_in_progress' | 'in_treatment' | 'at_sea' | 'arrived' | 'cleared';
    coldChain?: ColdChainTrace;
    costAtRiskUsd?: number;
  }

  // ===== Other entities =====
  export type AgentId = string;

  export interface Agent {
    id: AgentId;
    label: string;             // i18n key
    description: string;       // i18n key
    category: 'collect' | 'validate' | 'monitor' | 'orchestrate' | 'reconcile';
    tags: string[];            // includes 'cold_chain' for cold-chain sentinels
    activeOnLanes: string[];   // laneProfileId list
  }

  export interface Alert {
    id: string;
    containerId?: string;
    severity: Severity;
    titleKey: string;          // i18n key
    bodyKey: string;           // i18n key
    raisedAt: string;
    raisedBy: AgentId;
    actionLabelKey?: string;
    dismissed?: boolean;
  }

  export interface PurchaseOrder {
    id: string;
    importerId: string;
    productId: ProductId;
    quantityKg: number;
    incotermPaymentId: IncotermPaymentId;
    valueUsd: number;
    issuedAt: string;
    deliveryWindow: { from: string; to: string };
    containerIds: string[];
  }

  export interface Importer {
    id: string;
    name: string;
    country: string;
    market: Market;
    activeContainers: number;
    annualVolumeKg: number;
    creditRating?: string;
  }

  export interface Producer {
    id: string;
    name: string;
    region: string;            // 'Maule', 'Curicó', etc.
    products: ProductId[];
    sagId: string;             // SAG export registration
    activeContainers: number;
  }

  export interface KPI {
    id: string;
    labelKey: string;
    value: number;
    unit: 'usd' | 'pct' | 'count' | 'days' | 'minutes';
    deltaPct?: number;
    severity?: Severity;
  }

  export interface PenaltyEvent {
    id: string;
    containerId: string;
    week: string;              // ISO week, '2027-W01'
    amountUsd: number;
    reason: string;            // i18n key
  }

  export interface DocumentInstance {
    id: string;
    type: DocumentType;
    containerId: string;
    status: DocStatus;
    issuedAt?: string;
    fileUrl?: string;
    issuer?: string;
    number?: string;
  }
  ```
- [ ] Run `pnpm test`. Expected: all type tests pass.
- [ ] Run `pnpm typecheck`. Expected: clean.
- [ ] Commit: `feat(types): add full domain model including Patch 01 types`.

---

## Task 4 — next-intl Wiring

**Goal:** Cookie-based locale resolution (`AGORA_LOCALE`), `es` default, scaffold both message files, wire provider into root layout.

**Files created/modified:**
- `i18n/routing.ts`
- `i18n/request.ts`
- `middleware.ts`
- `messages/es.json`
- `messages/en.json`
- `app/layout.tsx` (wrap children in `NextIntlClientProvider`)
- `next.config.mjs` (add next-intl plugin)

### Steps

- [ ] Write `__tests__/i18n.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { readFileSync } from 'node:fs';
  describe('i18n', () => {
    const es = JSON.parse(readFileSync('messages/es.json', 'utf8'));
    const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
    const requiredNamespaces = ['nav','dashboard','containers','coldChain','agents','settings','common','docs','validations','tabs'];
    it('both locales have all required namespaces', () => {
      for (const ns of requiredNamespaces) { expect(es).toHaveProperty(ns); expect(en).toHaveProperty(ns); }
    });
    it('es and en have identical key shapes', () => {
      const shape = (o: any): any => Array.isArray(o) ? '[]' : (o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).sort().map(k => [k, shape(o[k])])) : '_');
      expect(shape(es)).toEqual(shape(en));
    });
    it('routing config exports defaultLocale=es and locales=[es,en]', async () => {
      const mod = await import('@/i18n/routing');
      expect(mod.routing.defaultLocale).toBe('es');
      expect(mod.routing.locales).toEqual(['es','en']);
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: 3 failures.
- [ ] Create `i18n/routing.ts`:
  ```ts
  import { defineRouting } from 'next-intl/routing';
  export const routing = defineRouting({
    locales: ['es', 'en'] as const,
    defaultLocale: 'es',
    localePrefix: 'never',
    localeCookie: { name: 'AGORA_LOCALE' },
  });
  export type AppLocale = (typeof routing.locales)[number];
  ```
- [ ] Create `i18n/request.ts`:
  ```ts
  import { getRequestConfig } from 'next-intl/server';
  import { cookies } from 'next/headers';
  import { routing } from './routing';
  export default getRequestConfig(async () => {
    const cookieLocale = cookies().get('AGORA_LOCALE')?.value;
    const locale = (routing.locales as readonly string[]).includes(cookieLocale ?? '')
      ? (cookieLocale as 'es'|'en')
      : routing.defaultLocale;
    return { locale, messages: (await import(`../messages/${locale}.json`)).default };
  });
  ```
- [ ] Create `middleware.ts` (root):
  ```ts
  import createMiddleware from 'next-intl/middleware';
  import { routing } from './i18n/routing';
  export default createMiddleware(routing);
  export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
  ```
- [ ] Update `next.config.mjs`:
  ```js
  import createNextIntlPlugin from 'next-intl/plugin';
  const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
  /** @type {import('next').NextConfig} */
  const config = { reactStrictMode: true };
  export default withNextIntl(config);
  ```
- [ ] Create `messages/es.json` (full scaffold — every key the app will use; values may be filled progressively but all keys must exist):
  ```json
  {
    "nav": {
      "operations": "Operaciones",
      "containers": "Contenedores",
      "purchaseOrders": "Órdenes de Compra",
      "importers": "Importadores",
      "producers": "Productores",
      "compliance": "Cumplimiento",
      "performance": "Rendimiento",
      "approvalQueue": "Cola de Aprobación",
      "approvalQueueSoon": "Disponible en V3"
    },
    "common": {
      "costAtRisk": "Costo en riesgo",
      "dueIn": "Vence en",
      "viewAll": "Ver todos",
      "search": "Buscar",
      "filter": "Filtrar",
      "loading": "Cargando",
      "empty": "Sin datos",
      "save": "Guardar",
      "cancel": "Cancelar",
      "back": "Volver"
    },
    "tabs": {
      "overview": "Resumen",
      "documents": "Documentos",
      "readiness": "Preparación",
      "coldChain": "Cadena de frío",
      "validations": "Validaciones",
      "financial": "Financiero",
      "reconciliation": "Conciliación",
      "history": "Historial"
    },
    "containers": {
      "title": "Contenedores",
      "id": "ID",
      "product": "Producto",
      "route": "Ruta",
      "etd": "ETD",
      "eta": "ETA",
      "status": "Estado",
      "value": "Valor",
      "cutoff": "Cierre",
      "buyer": "Comprador",
      "producer": "Productor",
      "weight": "Peso",
      "incoterm": "Incoterm",
      "paymentTerms": "Términos de pago",
      "statuses": {
        "planning": "Planificación",
        "docs_in_progress": "Documentos en curso",
        "in_treatment": "En tratamiento",
        "at_sea": "En tránsito",
        "arrived": "Arribado",
        "cleared": "Liberado"
      }
    },
    "dashboard": {
      "title": "Operaciones",
      "kpiActiveContainers": "Contenedores activos",
      "kpiCostAtRisk": "Costo en riesgo",
      "kpiOnTimeDocs": "Documentos a tiempo",
      "kpiAlertsOpen": "Alertas abiertas",
      "kpiCutoffNext24h": "Cortes próximos 24h",
      "kpiColdTreatmentCompliance": "Cumplimiento de tratamiento en frío",
      "actionQueue": "Cola de acción",
      "alertsRail": "Alertas",
      "coldChainStatus": "Estado de cadena de frío",
      "weekReadiness": "Preparación de la semana",
      "closedLastWeek": "Cerrados la semana pasada",
      "penaltyHeatmap": "Penalizaciones"
    },
    "coldChain": {
      "title": "Cadena de frío",
      "statusBanner": "Estado del tratamiento",
      "telemetry": "Telemetría",
      "ca": "Atmósfera CA",
      "lifecycle": "Ciclo de vida",
      "preCooling": "Pre-enfriamiento",
      "excursions": "Excursiones",
      "compliance": "Proyección de cumplimiento",
      "loggerTop": "Sensor superior",
      "loggerMiddle": "Sensor medio",
      "loggerBottom": "Sensor inferior",
      "minutesCompliant": "Minutos cumplidos",
      "minutesRequired": "Minutos requeridos",
      "setpoint": "Setpoint",
      "tolerance": "Tolerancia",
      "satisfiesAt": "Cumple en",
      "breached": "Incumplido",
      "noExcursions": "Sin excursiones",
      "protocols": {
        "china_15d_0_5c": "China 15 días a 0.5°C",
        "us_jh_24d_neg_1c": "EE.UU. JH 24 días a -1.1°C",
        "in_cold_disinfestation": "India desinfestación en frío"
      }
    },
    "agents": {
      "categoryCollect": "Recolección",
      "categoryValidate": "Validación",
      "categoryMonitor": "Monitoreo",
      "categoryOrchestrate": "Orquestación",
      "categoryReconcile": "Conciliación",
      "tagColdChain": "Cadena de frío"
    },
    "docs": {
      "commercial_invoice": "Factura comercial",
      "packing_list": "Packing list",
      "bill_of_lading": "Conocimiento de embarque",
      "certificate_of_origin": "Certificado de origen",
      "phyto_certificate": "Certificado fitosanitario",
      "fumigation_cert": "Certificado de fumigación",
      "cold_treatment_cert": "Certificado de tratamiento en frío",
      "health_cert": "Certificado sanitario",
      "gacc_registration": "Registro GACC",
      "lc_compliance_letter": "Carta de cumplimiento L/C",
      "insurance_certificate": "Certificado de seguro",
      "dus": "DUS",
      "sag_export_auth": "Autorización SAG",
      "transport_document": "Documento de transporte",
      "pti_certificate": "Certificado PTI",
      "pre_cooling_log": "Bitácora de pre-enfriamiento",
      "logger_report": "Reporte de loggers",
      "ca_atmosphere_log": "Bitácora atmósfera CA"
    },
    "validations": {
      "passed": "Aprobado",
      "failed": "Falló",
      "warning": "Advertencia",
      "feedTitle": "Validaciones recientes"
    },
    "settings": {
      "title": "Configuración",
      "language": "Idioma",
      "languageEs": "Español",
      "languageEn": "English",
      "moreSoon": "Más ajustes próximamente"
    }
  }
  ```
- [ ] Create `messages/en.json` with the *same key shape*, English values:
  ```json
  {
    "nav": { "operations": "Operations", "containers": "Containers", "purchaseOrders": "Purchase Orders", "importers": "Importers", "producers": "Producers", "compliance": "Compliance", "performance": "Performance", "approvalQueue": "Approval Queue", "approvalQueueSoon": "Available in V3" },
    "common": { "costAtRisk": "Cost at risk", "dueIn": "Due in", "viewAll": "View all", "search": "Search", "filter": "Filter", "loading": "Loading", "empty": "No data", "save": "Save", "cancel": "Cancel", "back": "Back" },
    "tabs": { "overview": "Overview", "documents": "Documents", "readiness": "Readiness", "coldChain": "Cold Chain", "validations": "Validations", "financial": "Financial", "reconciliation": "Reconciliation", "history": "History" },
    "containers": { "title": "Containers", "id": "ID", "product": "Product", "route": "Route", "etd": "ETD", "eta": "ETA", "status": "Status", "value": "Value", "cutoff": "Cutoff", "buyer": "Buyer", "producer": "Producer", "weight": "Weight", "incoterm": "Incoterm", "paymentTerms": "Payment Terms",
      "statuses": { "planning": "Planning", "docs_in_progress": "Documents in progress", "in_treatment": "In treatment", "at_sea": "In transit", "arrived": "Arrived", "cleared": "Cleared" } },
    "dashboard": { "title": "Operations", "kpiActiveContainers": "Active containers", "kpiCostAtRisk": "Cost at risk", "kpiOnTimeDocs": "On-time documents", "kpiAlertsOpen": "Open alerts", "kpiCutoffNext24h": "Cutoffs next 24h", "kpiColdTreatmentCompliance": "Cold treatment compliance", "actionQueue": "Action queue", "alertsRail": "Alerts", "coldChainStatus": "Cold chain status", "weekReadiness": "This week readiness", "closedLastWeek": "Closed last week", "penaltyHeatmap": "Penalties" },
    "coldChain": { "title": "Cold chain", "statusBanner": "Treatment status", "telemetry": "Telemetry", "ca": "CA atmosphere", "lifecycle": "Lifecycle", "preCooling": "Pre-cooling", "excursions": "Excursions", "compliance": "Compliance projection", "loggerTop": "Top logger", "loggerMiddle": "Middle logger", "loggerBottom": "Bottom logger", "minutesCompliant": "Minutes compliant", "minutesRequired": "Minutes required", "setpoint": "Setpoint", "tolerance": "Tolerance", "satisfiesAt": "Satisfies at", "breached": "Breached", "noExcursions": "No excursions",
      "protocols": { "china_15d_0_5c": "China 15-day at 0.5°C", "us_jh_24d_neg_1c": "US JH 24-day at -1.1°C", "in_cold_disinfestation": "India cold disinfestation" } },
    "agents": { "categoryCollect": "Collect", "categoryValidate": "Validate", "categoryMonitor": "Monitor", "categoryOrchestrate": "Orchestrate", "categoryReconcile": "Reconcile", "tagColdChain": "Cold chain" },
    "docs": { "commercial_invoice": "Commercial invoice", "packing_list": "Packing list", "bill_of_lading": "Bill of lading", "certificate_of_origin": "Certificate of origin", "phyto_certificate": "Phytosanitary certificate", "fumigation_cert": "Fumigation certificate", "cold_treatment_cert": "Cold treatment certificate", "health_cert": "Health certificate", "gacc_registration": "GACC registration", "lc_compliance_letter": "L/C compliance letter", "insurance_certificate": "Insurance certificate", "dus": "DUS", "sag_export_auth": "SAG export authorization", "transport_document": "Transport document", "pti_certificate": "PTI certificate", "pre_cooling_log": "Pre-cooling log", "logger_report": "Logger report", "ca_atmosphere_log": "CA atmosphere log" },
    "validations": { "passed": "Passed", "failed": "Failed", "warning": "Warning", "feedTitle": "Recent validations" },
    "settings": { "title": "Settings", "language": "Language", "languageEs": "Español", "languageEn": "English", "moreSoon": "More settings coming soon" }
  }
  ```
- [ ] Update `app/layout.tsx`:
  ```tsx
  import type { Metadata } from 'next';
  import { Inter, JetBrains_Mono } from 'next/font/google';
  import { NextIntlClientProvider } from 'next-intl';
  import { getLocale, getMessages } from 'next-intl/server';
  import './globals.css';
  const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
  const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
  export const metadata: Metadata = { title: 'Agora', description: 'Export operations platform' };
  export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();
    return (
      <html lang={locale} className={`${inter.variable} ${mono.variable}`}>
        <body>
          <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
        </body>
      </html>
    );
  }
  ```
- [ ] Run `pnpm test`. Expected: all i18n tests pass.
- [ ] Run `pnpm build`. Expected: clean compile.
- [ ] Commit: `feat(i18n): wire next-intl with cookie-based locale and full message scaffold`.

---

## Task 5 — Utility Functions

**Goal:** `dates.ts`, `currency.ts`, `risk.ts` with locale awareness and full tests.

**Files created:**
- `lib/utils/dates.ts`, `lib/utils/currency.ts`, `lib/utils/risk.ts`
- `__tests__/dates.test.ts`, `__tests__/currency.test.ts`, `__tests__/risk.test.ts`

### Steps

- [ ] Write `__tests__/dates.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { getTodayDemo, tDayFrom, formatDate, hoursUntil } from '@/lib/utils/dates';
  describe('dates', () => {
    it('getTodayDemo is anchored to 2027-01-09T10:00:00-04:00', () => {
      expect(getTodayDemo().toISOString()).toBe('2027-01-09T14:00:00.000Z');
    });
    it('tDayFrom returns T-2 for ETD 2027-01-11', () => {
      expect(tDayFrom('2027-01-11T00:00:00-04:00')).toBe('T-2');
    });
    it('tDayFrom returns T+10 for ETD 2026-12-30', () => {
      expect(tDayFrom('2026-12-30T00:00:00-04:00')).toBe('T+10');
    });
    it('formatDate honors es vs en', () => {
      const d = '2027-01-09T10:00:00-04:00';
      expect(formatDate(d, 'es')).toMatch(/09\/01\/2027/);
      expect(formatDate(d, 'en')).toMatch(/01\/09\/2027/);
    });
    it('hoursUntil computes positive hours', () => {
      // cutoff 18h after demo today
      const cutoff = new Date(getTodayDemo().getTime() + 18*3600*1000).toISOString();
      expect(hoursUntil(cutoff)).toBeCloseTo(18, 0);
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures.
- [ ] Create `lib/utils/dates.ts`:
  ```ts
  import { differenceInCalendarDays } from 'date-fns';
  export const getTodayDemo = (): Date => new Date('2027-01-09T10:00:00-04:00');
  export function tDayFrom(etdIso: string): string {
    const today = getTodayDemo();
    const etd = new Date(etdIso);
    const diff = differenceInCalendarDays(etd, today);
    if (diff === 0) return 'T+0';
    return diff > 0 ? `T-${diff}` : `T+${Math.abs(diff)}`;
  }
  export function formatDate(iso: string, locale: 'es' | 'en'): string {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(iso));
  }
  export function hoursUntil(iso: string, now: Date = getTodayDemo()): number {
    return (new Date(iso).getTime() - now.getTime()) / 3_600_000;
  }
  ```
- [ ] Run `pnpm test`. Expected: pass.
- [ ] Commit: `feat(utils): add date utilities anchored to demo today`.

- [ ] Write `__tests__/currency.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { formatUsd } from '@/lib/utils/currency';
  describe('currency', () => {
    it('formats USD with es-CL conventions', () => {
      // es: thousands separator '.', decimal ','
      expect(formatUsd(1234567.5, 'es')).toMatch(/1\.234\.567,5\d?\s?US\$|US\$\s?1\.234\.567,5/);
    });
    it('formats USD with en-US conventions', () => {
      expect(formatUsd(1234567.5, 'en')).toMatch(/\$1,234,567\.5/);
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures.
- [ ] Create `lib/utils/currency.ts`:
  ```ts
  export function formatUsd(amount: number, locale: 'es' | 'en'): string {
    return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency', currency: 'USD', currencyDisplay: 'symbol',
      minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(amount);
  }
  export function formatNumber(n: number, locale: 'es' | 'en', maxFrac = 2): string {
    return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
      maximumFractionDigits: maxFrac,
    }).format(n);
  }
  ```
- [ ] Run `pnpm test`. Expected: pass. Commit: `feat(utils): add locale-aware currency formatting`.

- [ ] Write `__tests__/risk.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { severityFromHoursToCutoff, severityFromColdChain } from '@/lib/utils/risk';
  describe('risk', () => {
    it('severity scales with hours-to-cutoff', () => {
      expect(severityFromHoursToCutoff(72)).toBe('ok');
      expect(severityFromHoursToCutoff(36)).toBe('info');
      expect(severityFromHoursToCutoff(20)).toBe('watch');
      expect(severityFromHoursToCutoff(8)).toBe('risk');
      expect(severityFromHoursToCutoff(2)).toBe('crit');
    });
    it('severity from cold chain status', () => {
      expect(severityFromColdChain({ status: 'completed' } as any)).toBe('ok');
      expect(severityFromColdChain({ status: 'breached' } as any)).toBe('crit');
      expect(severityFromColdChain({ status: 'in_treatment', excursionEvents: [] } as any)).toBe('ok');
      expect(severityFromColdChain({ status: 'in_treatment', excursionEvents: [{ brokeCompliance: false }] } as any)).toBe('watch');
      expect(severityFromColdChain({ status: 'in_treatment', excursionEvents: [{ brokeCompliance: true }] } as any)).toBe('crit');
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures.
- [ ] Create `lib/utils/risk.ts`:
  ```ts
  import type { ColdChainTrace, Severity } from '@/types';
  export function severityFromHoursToCutoff(hours: number): Severity {
    if (hours > 48) return 'ok';
    if (hours > 24) return 'info';
    if (hours > 12) return 'watch';
    if (hours > 4)  return 'risk';
    return 'crit';
  }
  export function severityFromColdChain(c: ColdChainTrace): Severity {
    if (c.status === 'breached') return 'crit';
    if (c.status === 'completed') return 'ok';
    const broke = c.excursionEvents.some(e => e.brokeCompliance);
    if (broke) return 'crit';
    if (c.excursionEvents.length > 0) return 'watch';
    return 'ok';
  }
  ```
- [ ] Run `pnpm test`. Expected: pass.
- [ ] Commit: `feat(utils): add risk severity helpers`.

---

## Task 6 — Mock Data: Core Entities

**Goal:** Create the static data files that don't depend on lane profiles. Three hero containers (`MSCU-7842156`, `MAEU-9182734`, `CMAU-9281744`) with `coldChain` left as `undefined` for now (cold-chain data attached in Task 8).

**Files created:**
- `lib/mock-data/importers.ts`, `producers.ts`, `purchase-orders.ts`, `containers.ts`, `documents.ts`, `alerts.ts`, `validations.ts`, `agents.ts`, `kpis.ts`, `penalty-events.ts`
- `__tests__/mock-data.core.test.ts`

### Steps

- [ ] Write `__tests__/mock-data.core.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { containers } from '@/lib/mock-data/containers';
  import { agents } from '@/lib/mock-data/agents';
  import { importers } from '@/lib/mock-data/importers';
  import { producers } from '@/lib/mock-data/producers';
  import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
  describe('core mock data', () => {
    it('has 3 hero containers with required IDs', () => {
      const ids = containers.map(c => c.id);
      expect(ids).toEqual(expect.arrayContaining(['MSCU-7842156','MAEU-9182734','CMAU-9281744']));
    });
    it('walnuts hero MSCU-7842156 is dry, CAD at sight, IN', () => {
      const c = containers.find(x => x.id === 'MSCU-7842156')!;
      expect(c.productId).toBe('walnuts_in_shell');
      expect(c.commercialId).toBe('cif_cad_at_sight');
      expect(c.market).toBe('IN');
      expect(c.coldChain).toBeUndefined();
    });
    it('cherries hero MAEU-9182734 is reefer, L/C at sight, CN', () => {
      const c = containers.find(x => x.id === 'MAEU-9182734')!;
      expect(c.productId).toBe('fresh_cherries');
      expect(c.commercialId).toBe('cif_lc_at_sight');
      expect(c.market).toBe('CN');
    });
    it('agents catalog has exactly 25 agents', () => {
      expect(agents.length).toBe(25);
    });
    it('agents catalog includes 6 cold-chain sentinels', () => {
      expect(agents.filter(a => a.tags.includes('cold_chain')).length).toBeGreaterThanOrEqual(6);
    });
    it('importers, producers, POs are referentially intact', () => {
      const impIds = new Set(importers.map(i => i.id));
      const prodIds = new Set(producers.map(p => p.id));
      const poIds = new Set(purchaseOrders.map(p => p.id));
      for (const c of containers) {
        expect(impIds.has(c.importerId)).toBe(true);
        expect(prodIds.has(c.producerId)).toBe(true);
        expect(poIds.has(c.purchaseOrderId)).toBe(true);
      }
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures (modules missing).
- [ ] Create `lib/mock-data/importers.ts` with at least 3 importers (China, India, plus extras), each with `id`, `name`, `country`, `market`, `activeContainers`, `annualVolumeKg`. Include `IMP-CN-DRAGON`, `IMP-IN-MUMBAI`, `IMP-CN-EAST`.
- [ ] Create `lib/mock-data/producers.ts` with at least 3 producers in Maule/Curicó/O'Higgins. Include `PRD-VF-MAULE`, `PRD-VF-CURICO`, `PRD-VF-OHIGGINS`.
- [ ] Create `lib/mock-data/purchase-orders.ts` with one PO per container (3 minimum). IDs `PO-2026-0142`, `PO-2026-0157`, `PO-2026-0163`.
- [ ] Create `lib/mock-data/containers.ts`. Three containers; `coldChain` left undefined here, attached via spread in Task 8:
  ```ts
  import type { Container } from '@/types';
  export const containers: Container[] = [
    {
      id: 'MSCU-7842156',
      productId: 'walnuts_in_shell',
      productLabel: 'Walnuts in shell',
      commercialId: 'cif_cad_at_sight',
      laneProfileId: 'walnuts_in_shell.IN.cif_cad_at_sight',
      market: 'IN',
      polCode: 'CLSAI', polLabel: 'San Antonio',
      podCode: 'INNSA', podLabel: 'Nhava Sheva',
      importerId: 'IMP-IN-MUMBAI',
      producerId: 'PRD-VF-MAULE',
      purchaseOrderId: 'PO-2026-0142',
      weightKg: 24_500,
      valueUsd: 142_500,
      etd: '2027-01-11T18:00:00-04:00',
      eta: '2027-02-08T08:00:00+05:30',
      cutoffAt: '2027-01-10T04:00:00-04:00',  // ~18h after demo today
      status: 'docs_in_progress',
      costAtRiskUsd: 8_500,
    },
    {
      id: 'MAEU-9182734',
      productId: 'fresh_cherries',
      productLabel: 'Fresh cherries',
      commercialId: 'cif_lc_at_sight',
      laneProfileId: 'fresh_cherries.CN.cif_lc_at_sight',
      market: 'CN',
      polCode: 'CLSAI', polLabel: 'San Antonio',
      podCode: 'CNYAN', podLabel: 'Yangshan',
      importerId: 'IMP-CN-DRAGON',
      producerId: 'PRD-VF-CURICO',
      purchaseOrderId: 'PO-2026-0157',
      weightKg: 22_800,
      valueUsd: 215_000,
      etd: '2026-12-30T22:00:00-04:00',
      eta: '2027-01-25T08:00:00+08:00',
      status: 'in_treatment',
      costAtRiskUsd: 0,
    },
    {
      id: 'CMAU-9281744',
      productId: 'table_grapes_red',
      productLabel: 'Table grapes (red)',
      commercialId: 'cif_lc_60',
      laneProfileId: 'table_grapes_red.CN.cif_lc_60',
      market: 'CN',
      polCode: 'CLSAI', polLabel: 'San Antonio',
      podCode: 'CNYAN', podLabel: 'Yangshan',
      importerId: 'IMP-CN-EAST',
      producerId: 'PRD-VF-OHIGGINS',
      purchaseOrderId: 'PO-2026-0163',
      weightKg: 23_400,
      valueUsd: 168_000,
      etd: '2027-01-08T20:00:00-04:00',
      eta: '2027-02-02T08:00:00+08:00',
      status: 'at_sea',
      costAtRiskUsd: 0,
    },
  ];
  ```
- [ ] Create `lib/mock-data/documents.ts` — `DocumentInstance[]` with at least the docs needed for the walnuts hero (15) and cherries hero (18). Statuses populated: walnuts has DUS `missing`, others a mix; cherries mostly `pending_review` / `approved`.
- [ ] Create `lib/mock-data/alerts.ts` — at minimum: critical alert for walnuts hero ("DUS not filed, 18h to cutoff"), info for cherries treatment day 10, watch for one excursion already inside tolerance. Use i18n keys for `titleKey`/`bodyKey`; add the keys to both message files.
- [ ] Create `lib/mock-data/validations.ts` — sample validation entries per container (≥10 for walnuts, ≥10 for cherries, 5 for grapes). Use stable `checkId` strings.
- [ ] Create `lib/mock-data/agents.ts` with 25 agents. The 6 cold-chain sentinels with `tags: ['cold_chain']` and `category: 'monitor'`: `pre_cooling_tracker`, `cold_storage_monitor`, `reefer_pti_validator`, `in_transit_telemetry_watcher`, `cold_treatment_auditor`, `arrival_cold_chain_coordinator`. Plus `lc_discrepancy_catcher` (validate), `lunar_new_year_window_watcher` (monitor). 17 originals: invent stable kebab IDs covering collect/validate/monitor/orchestrate/reconcile categories.
- [ ] Create `lib/mock-data/kpis.ts` with the 5 baseline KPIs + 1 conditional cold-chain KPI (used in Phase 2 but data needed now).
- [ ] Create `lib/mock-data/penalty-events.ts` with sample weekly penalty entries for the heatmap.
- [ ] Run `pnpm test`. Expected: all core mock-data tests pass.
- [ ] Run `pnpm typecheck`. Expected: clean.
- [ ] Commit: `feat(mock-data): add core entities, 25 agents, 3 hero containers`.

---

## Task 7 — Mock Data: Lane Profiles

**Goal:** `product-profiles.ts` (7 products), `commercial-profiles.ts` (6 profiles), `market-rules.ts` (5 markets), `cold-treatment-protocols.ts` (3 protocols), and the canonical `lane-profiles.ts` with `computeLaneProfile()` — composing only from data files, zero hardcoded conditionals.

**Files created:**
- `lib/mock-data/product-profiles.ts`, `commercial-profiles.ts`, `market-rules.ts`, `cold-treatment-protocols.ts`, `lane-profiles.ts`
- `__tests__/lane-profiles.test.ts`

### Steps

- [ ] Write `__tests__/lane-profiles.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { computeLaneProfile, getLaneProfile } from '@/lib/mock-data/lane-profiles';
  describe('computeLaneProfile', () => {
    it('walnuts → IN → CAD at sight produces 15 docs', () => {
      const lp = computeLaneProfile('walnuts_in_shell','IN','cif_cad_at_sight');
      expect(lp.id).toBe('walnuts_in_shell.IN.cif_cad_at_sight');
      expect(lp.documentSet.length).toBe(15);
    });
    it('cherries → CN → L/C at sight produces 18 docs', () => {
      const lp = computeLaneProfile('fresh_cherries','CN','cif_lc_at_sight');
      expect(lp.id).toBe('fresh_cherries.CN.cif_lc_at_sight');
      expect(lp.documentSet.length).toBe(18);
    });
    it('agentsActive is the union of agents from product, market, commercial', () => {
      const lp = computeLaneProfile('fresh_cherries','CN','cif_lc_at_sight');
      const set = new Set(lp.agentsActive);
      expect(set.has('lc_discrepancy_catcher')).toBe(true);                  // commercial
      expect(set.has('in_transit_telemetry_watcher')).toBe(true);            // product (cold)
      expect(set.has('lunar_new_year_window_watcher')).toBe(true);           // market (CN seasonal)
    });
    it('getLaneProfile returns the cached profile by id', () => {
      const lp = getLaneProfile('walnuts_in_shell.IN.cif_cad_at_sight');
      expect(lp.documentSet.length).toBe(15);
    });
    it('zero hardcoded per-product conditionals (smoke check via source scan)', async () => {
      const fs = await import('node:fs');
      const src = fs.readFileSync('lib/mock-data/lane-profiles.ts', 'utf8');
      expect(src).not.toMatch(/if\s*\(\s*productId\s*===\s*'/);
      expect(src).not.toMatch(/if\s*\(\s*marketId\s*===\s*'/);
      expect(src).not.toMatch(/switch\s*\(\s*productId\s*\)/);
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures.
- [ ] Create `lib/mock-data/cold-treatment-protocols.ts`:
  ```ts
  import type { ColdTreatmentProtocol } from '@/types';
  export const coldTreatmentProtocols: ColdTreatmentProtocol[] = [
    { id: 'china_15d_0_5c', label: 'coldChain.protocols.china_15d_0_5c', market: 'CN', durationDays: 15, setpointC: 0.5, toleranceC: 0.3, description: 'coldChain.protocols.china_15d_0_5c' },
    { id: 'us_jh_24d_neg_1c', label: 'coldChain.protocols.us_jh_24d_neg_1c', market: 'US', durationDays: 24, setpointC: -1.1, toleranceC: 0.4, description: 'coldChain.protocols.us_jh_24d_neg_1c' },
    { id: 'in_cold_disinfestation', label: 'coldChain.protocols.in_cold_disinfestation', market: 'IN', durationDays: 18, setpointC: 1.5, toleranceC: 0.5, description: 'coldChain.protocols.in_cold_disinfestation' },
  ];
  ```
- [ ] Create `lib/mock-data/market-rules.ts` with 5 `MarketProfileExtended` entries (`US`, `EU`, `IN`, `CN`, `MENA`). Each has `requiredDocs`, `activeAgents`, `registrationsRequired`, `labelLanguageRequired`, `inspectionAuthority`, `coldTreatmentOptions` (where applicable), `digitalPhytoSystem` (CN only). CN includes `lunar_new_year_window_watcher` in `activeAgents`.
- [ ] Create `lib/mock-data/product-profiles.ts` with 7 product profiles. Cherries/blueberries/grapes have `requiresColdChain: true` and `defaultProtocols` set; walnuts/almonds dry. Each has `requiredDocs` and `activeAgents` lists. Cherries activeAgents includes the 6 cold-chain sentinels.
- [ ] Create `lib/mock-data/commercial-profiles.ts` with 6 entries. `cif_lc_at_sight` and `cif_lc_60` include `lc_discrepancy_catcher` in `activeAgents` and L/C-specific `validationChecks`. Each profile lists its `requiredDocs` (e.g. CAD adds nothing extra; L/C adds `lc_compliance_letter`; open_account adds `insurance_certificate`).
- [ ] Carefully tune `requiredDocs` arrays so the union for the two hero lanes lands at exactly the documented counts:
  - walnuts × IN × cif_cad_at_sight → **15** unique doc types after union+dedup
  - cherries × CN × cif_lc_at_sight → **18** unique doc types after union+dedup
  Document the per-source doc counts inline as comments so future edits don't drift.
- [ ] Create `lib/mock-data/lane-profiles.ts`:
  ```ts
  import type {
    LaneProfile, ProductId, IncotermPaymentId, Market, DocumentRequirement,
    DocumentType, AgentId, LaneTimelineEvent,
  } from '@/types';
  import { productProfiles } from './product-profiles';
  import { marketProfiles }  from './market-rules';
  import { commercialProfiles } from './commercial-profiles';

  function uniq<T>(xs: T[]): T[] { return Array.from(new Set(xs)); }

  function buildDocumentRequirement(type: DocumentType): DocumentRequirement {
    return { type, label: `docs.${type}`, requiredBy: 'T-3' };  // requiredBy refined per data overrides if needed
  }

  function composeTimeline(): LaneTimelineEvent[] {
    return [
      { tDay: 'T-7', label: 'lane.timeline.bookingConfirmed',  actor: 'exporter' },
      { tDay: 'T-5', label: 'lane.timeline.docsCollected',     actor: 'agent' },
      { tDay: 'T-3', label: 'lane.timeline.dusFiled',          actor: 'exporter' },
      { tDay: 'T-2', label: 'lane.timeline.cutoff',            actor: 'exporter' },
      { tDay: 'T+0', label: 'lane.timeline.etd',               actor: 'exporter' },
      { tDay: 'T+10',label: 'lane.timeline.midTransit',        actor: 'agent' },
      { tDay: 'T+25',label: 'lane.timeline.eta',               actor: 'importer' },
    ];
  }

  export function computeLaneProfile(
    productId: ProductId, marketId: Market, commercialId: IncotermPaymentId,
  ): LaneProfile {
    const product = productProfiles.find(p => p.id === productId);
    const market = marketProfiles.find(m => m.id === marketId);
    const commercial = commercialProfiles.find(c => c.id === commercialId);
    if (!product || !market || !commercial) {
      throw new Error(`Unknown lane: ${productId}.${marketId}.${commercialId}`);
    }
    const docTypes = uniq<DocumentType>([
      ...product.requiredDocs,
      ...market.requiredDocs,
      ...commercial.requiredDocs,
    ]);
    return {
      id: `${productId}.${marketId}.${commercialId}`,
      product, market, commercial,
      documentSet: docTypes.map(buildDocumentRequirement),
      agentsActive: uniq<AgentId>([...product.activeAgents, ...market.activeAgents, ...commercial.activeAgents]),
      validationChecks: uniq<string>([...commercial.validationChecks]),
      timeline: composeTimeline(),
    };
  }

  // Pre-compute lanes used by hero containers
  const laneIds = [
    ['walnuts_in_shell','IN','cif_cad_at_sight'] as const,
    ['fresh_cherries','CN','cif_lc_at_sight']    as const,
    ['table_grapes_red','CN','cif_lc_60']        as const,
  ];
  const cache = new Map<string, LaneProfile>(
    laneIds.map(([p,m,c]) => [`${p}.${m}.${c}`, computeLaneProfile(p,m,c)]),
  );
  export function getLaneProfile(id: string): LaneProfile {
    const cached = cache.get(id);
    if (cached) return cached;
    const [p,m,c] = id.split('.') as [ProductId, Market, IncotermPaymentId];
    return computeLaneProfile(p, m, c);
  }
  ```
- [ ] Run `pnpm test`. Expected: pass. Tune `requiredDocs` in the three profile files until the 15 and 18 counts are exact.
- [ ] Run `pnpm typecheck`. Expected: clean.
- [ ] Commit: `feat(lane-profiles): compose lane behavior from product/market/commercial data`.

---

## Task 8 — Mock Data: Cold Chain Traces

**Goal:** Full 2,880-reading trace for `MAEU-9182734` (3 loggers × 15-min × 10 days), sampled trace for `CMAU-9281744`, attach to containers.

**Files created/modified:**
- `lib/mock-data/cold-chain-traces.ts`
- `lib/mock-data/containers.ts` (attach `coldChain` for the two reefers)
- `__tests__/cold-chain.test.ts`

### Steps

- [ ] Write `__tests__/cold-chain.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { containers } from '@/lib/mock-data/containers';
  describe('cold chain', () => {
    const cherries = containers.find(c => c.id === 'MAEU-9182734')!;
    const grapes   = containers.find(c => c.id === 'CMAU-9281744')!;
    const walnuts  = containers.find(c => c.id === 'MSCU-7842156')!;
    it('walnuts has no coldChain', () => {
      expect(walnuts.coldChain).toBeUndefined();
    });
    it('cherries has 3 loggers', () => {
      expect(cherries.coldChain?.loggers.length).toBe(3);
    });
    it('cherries has 2880 readings per logger (15-min × 10 days)', () => {
      for (const l of cherries.coldChain!.loggers) expect(l.readings.length).toBe(2880);
    });
    it('cherries has exactly 1 excursion (within tolerance, 18 min, top logger)', () => {
      expect(cherries.coldChain!.excursionEvents.length).toBe(1);
      const e = cherries.coldChain!.excursionEvents[0];
      expect(e.durationMin).toBe(18);
      expect(e.brokeCompliance).toBe(false);
      expect(e.peakTempC).toBeCloseTo(0.9, 1); // setpoint 0.5 + 0.4
    });
    it('cherries treatmentMinutesCompliant is around 13800', () => {
      expect(cherries.coldChain!.treatmentMinutesCompliant).toBeGreaterThanOrEqual(13_700);
      expect(cherries.coldChain!.treatmentMinutesCompliant).toBeLessThanOrEqual(13_900);
    });
    it('cherries status is in_treatment', () => {
      expect(cherries.coldChain!.status).toBe('in_treatment');
    });
    it('grapes has refrigerated cold chain (sampled)', () => {
      expect(grapes.coldChain?.required).toBe(true);
      expect(grapes.coldChain?.status).toBe('in_treatment');
      expect(grapes.coldChain!.loggers[0].readings.length).toBeLessThanOrEqual(60);
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures.
- [ ] Create `lib/mock-data/cold-chain-traces.ts`:
  ```ts
  import type { ColdChainTrace, DataLogger, ExcursionEvent } from '@/types';

  // ===== Cherries: 3 loggers × 2880 readings (15-min interval × 24h × 10 days) =====
  const CHERRIES_LOAD_AT = new Date('2026-12-30T18:00:00-04:00').getTime(); // T+0 minus 22:00 ETD; load completes earlier
  const FIFTEEN_MIN = 15 * 60_000;
  const SETPOINT = 0.5;
  const TOLERANCE = 0.3;

  function genCherryLogger(position: 'top'|'middle'|'bottom', baseOffset: number): DataLogger {
    const readings: { t: string; tempC: number }[] = [];
    for (let i = 0; i < 2880; i++) {
      const t = new Date(CHERRIES_LOAD_AT + i * FIFTEEN_MIN).toISOString();
      // Steady oscillation 0.45 ± 0.10 with logger-specific offset
      let tempC = SETPOINT + baseOffset + 0.08 * Math.sin(i / 23) + 0.04 * Math.sin(i / 7);
      // Top logger excursion at T+6 14:32 UTC, 18 minutes (~1.2 readings — span across 2 readings)
      // Compute index of the excursion start relative to load
      tempC = Number(tempC.toFixed(3));
      readings.push({ t, tempC });
    }
    // Inject excursion: top logger only — readings at indices ix, ix+1 spike to setpoint+0.4 = 0.9°C
    if (position === 'top') {
      const excursionStart = new Date('2027-01-05T14:32:00Z').getTime();
      const ix = Math.round((excursionStart - CHERRIES_LOAD_AT) / FIFTEEN_MIN);
      if (readings[ix])    readings[ix].tempC    = 0.9;
      if (readings[ix + 1]) readings[ix + 1].tempC = 0.9;
    }
    return { id: `LOG-${position.toUpperCase()}-9182734`, position, serial: `EM4-${position[0].toUpperCase()}-${Math.floor(Math.random()*9000+1000)}`, readings };
  }

  const cherryLoggers: DataLogger[] = [
    genCherryLogger('top', -0.05),
    genCherryLogger('middle', 0.00),
    genCherryLogger('bottom', 0.05),
  ];

  const cherryExcursion: ExcursionEvent = {
    id: 'EXC-9182734-001',
    startAt: '2027-01-05T14:32:00Z',
    endAt:   '2027-01-05T14:50:00Z',
    durationMin: 18,
    loggerId: 'LOG-TOP-9182734',
    peakTempC: 0.9,
    severity: 'watch',
    brokeCompliance: false,
  };

  // 10 days elapsed × 24h × 60m = 14,400 minutes; 18 min in tolerance still counts as compliant; minor settling
  const TREATMENT_MIN_COMPLIANT = 13_800;
  const TREATMENT_REQUIRED_MIN  = 15 * 24 * 60; // 21,600

  export const cherriesTrace: ColdChainTrace = {
    required: true,
    protocol: 'china_15d_0_5c',
    setpointC: SETPOINT,
    toleranceC: TOLERANCE,
    caGasMix: { o2Pct: 5, co2Pct: 12, n2Pct: 83 },
    rhTargetPct: [88, 95],
    preCooling: {
      facility: 'Curicó Pre-cool Hub',
      startedAt: '2026-12-29T08:00:00-04:00',
      completedAt: '2026-12-30T06:00:00-04:00',
      targetTempC: 0,
      pulpTempCurve: Array.from({ length: 22 }, (_, i) => ({
        t: new Date(new Date('2026-12-29T08:00:00-04:00').getTime() + i * 3600_000).toISOString(),
        tempC: Number((18 - (18 / 21) * i).toFixed(2)),
      })),
    },
    reeferPti: { performedAt: '2026-12-29T18:00:00-04:00', technician: 'Maersk PTI Bay 4', passed: true },
    loggers: cherryLoggers,
    caReadings: Array.from({ length: 240 }, (_, i) => ({  // hourly × 10 days
      t: new Date(CHERRIES_LOAD_AT + i * 3_600_000).toISOString(),
      o2Pct: 5 + 0.2 * Math.sin(i / 7),
      co2Pct: 12 + 0.4 * Math.sin(i / 11),
      n2Pct: 83,
    })),
    treatmentRequiredMinutes: TREATMENT_REQUIRED_MIN,
    treatmentMinutesCompliant: TREATMENT_MIN_COMPLIANT,
    treatmentMinutesViolation: 0,
    excursionEvents: [cherryExcursion],
    status: 'in_treatment',
    lastReadingAt: new Date(CHERRIES_LOAD_AT + 2879 * FIFTEEN_MIN).toISOString(),
  };

  // ===== Grapes: ~50 sampled readings, single logger =====
  const GRAPES_LOAD_AT = new Date('2027-01-08T08:00:00-04:00').getTime();
  const grapesLogger: DataLogger = {
    id: 'LOG-MID-9281744', position: 'middle', serial: 'EM4-M-7321',
    readings: Array.from({ length: 50 }, (_, i) => ({
      t: new Date(GRAPES_LOAD_AT + i * 30 * 60_000).toISOString(),  // every 30 min
      tempC: Number((-0.3 + 0.1 * Math.sin(i / 5)).toFixed(2)),
    })),
  };
  export const grapesTrace: ColdChainTrace = {
    required: true,
    protocol: null,                                 // grapes don't require formal cold treatment for CN
    setpointC: -0.5,
    toleranceC: 0.4,
    rhTargetPct: [90, 95],
    loggers: [grapesLogger],
    treatmentRequiredMinutes: 0,
    treatmentMinutesCompliant: 0,
    treatmentMinutesViolation: 0,
    excursionEvents: [],
    status: 'in_treatment',
    lastReadingAt: new Date(GRAPES_LOAD_AT + 49 * 30 * 60_000).toISOString(),
  };
  ```
- [ ] Edit `lib/mock-data/containers.ts` to attach traces:
  ```ts
  import { cherriesTrace, grapesTrace } from './cold-chain-traces';
  // After the array literal, mutate the two reefer entries to include coldChain.
  // Cleaner: rewrite the literal so MAEU-9182734.coldChain = cherriesTrace, CMAU-9281744.coldChain = grapesTrace.
  ```
  Update the literal directly so reefer entries include the trace fields.
- [ ] Run `pnpm test`. Expected: all cold-chain tests pass. If excursion index is off-by-one because of the load-time anchor, adjust `CHERRIES_LOAD_AT` so reading indices for the excursion timestamp are valid (within `[0, 2879]`).
- [ ] Commit: `feat(cold-chain): generate full traces for both reefer hero containers`.

---

## Task 9 — Layout Chrome (Sidebar + Header)

**Goal:** Hover-to-expand sidebar with all 7 primary nav links + greyed Approval Queue; header with avatar dropdown containing Settings link.

**Files created:**
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`
- `components/layout/AppShell.tsx`
- `app/layout.tsx` (wrap children in AppShell)
- `__tests__/layout.test.tsx`

### Steps

- [ ] Write `__tests__/layout.test.tsx`:
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { describe, it, expect } from 'vitest';
  import userEvent from '@testing-library/user-event';
  import { NextIntlClientProvider } from 'next-intl';
  import es from '../messages/es.json';
  import { Sidebar } from '@/components/layout/Sidebar';
  import { Header } from '@/components/layout/Header';
  const wrap = (ui: React.ReactNode) =>
    <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>;

  describe('Sidebar', () => {
    it('renders 7 primary nav items + Approval Queue (disabled)', () => {
      render(wrap(<Sidebar />));
      expect(screen.getByRole('link', { name: /Operaciones/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Contenedores/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Órdenes de Compra/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Importadores/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Productores/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Cumplimiento/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Rendimiento/i })).toBeInTheDocument();
      const approvalEl = screen.getByText(/Cola de Aprobación/i);
      expect(approvalEl.closest('[aria-disabled="true"]')).toBeTruthy();
    });
  });
  describe('Header avatar dropdown', () => {
    it('opens menu containing Settings link', async () => {
      const user = userEvent.setup();
      render(wrap(<Header />));
      await user.click(screen.getByRole('button', { name: /usuario|user/i }));
      expect(await screen.findByRole('menuitem', { name: /Configuración/i })).toBeInTheDocument();
    });
  });
  ```
- [ ] Run `pnpm test`. Expected: failures.
- [ ] Create `components/layout/Sidebar.tsx`:
  ```tsx
  'use client';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { useTranslations } from 'next-intl';
  import { LayoutDashboard, Boxes, FileText, Building2, Sprout, ShieldCheck, BarChart3, Inbox } from 'lucide-react';
  import { useState } from 'react';
  import clsx from 'clsx';

  const NAV = [
    { href: '/',                key: 'operations',     Icon: LayoutDashboard },
    { href: '/containers',      key: 'containers',     Icon: Boxes },
    { href: '/purchase-orders', key: 'purchaseOrders', Icon: FileText },
    { href: '/importers',       key: 'importers',      Icon: Building2 },
    { href: '/producers',       key: 'producers',      Icon: Sprout },
    { href: '/compliance',      key: 'compliance',     Icon: ShieldCheck },
    { href: '/performance',     key: 'performance',    Icon: BarChart3 },
  ] as const;

  export function Sidebar() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);
    return (
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={clsx(
          'fixed left-0 top-0 bottom-0 z-40 glass border-r border-white/10 transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          expanded ? 'w-56' : 'w-14',
        )}
      >
        <div className="flex h-14 items-center px-4 font-mono text-mint-500">AGORA</div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV.map(({ href, key, Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={key} href={href}
                className={clsx('flex items-center gap-3 rounded-md px-2 py-2 text-ink-2 hover:text-ink-1 hover:bg-white/5',
                  active && 'text-ink-1 bg-white/5 border-l-2 border-mint-500')}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className={clsx('truncate', !expanded && 'sr-only')}>{t(key)}</span>
              </Link>
            );
          })}
          <div aria-disabled="true"
               className="flex items-center gap-3 rounded-md px-2 py-2 text-ink-4 cursor-not-allowed"
               title={t('approvalQueueSoon')}>
            <Inbox className="h-4 w-4 shrink-0" />
            <span className={clsx('truncate', !expanded && 'sr-only')}>{t('approvalQueue')}</span>
          </div>
        </nav>
      </aside>
    );
  }
  ```
- [ ] Create `components/layout/Header.tsx`:
  ```tsx
  'use client';
  import Link from 'next/link';
  import { useTranslations } from 'next-intl';
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel }
    from '@/components/ui/dropdown-menu';
  import { User } from 'lucide-react';

  export function Header() {
    const t = useTranslations();
    return (
      <header className="fixed top-0 left-14 right-0 h-14 z-30 glass border-b border-white/10 flex items-center justify-end px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label={t('common.search') /* placeholder, override below */} className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-white/5">
              <User className="h-4 w-4" />
              <span className="text-sm">María José Soto</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass">
            <DropdownMenuLabel>
              <div className="font-mono text-xs text-ink-3">Valle Fresco S.A.</div>
              <div className="text-sm">María José Soto</div>
              <div className="text-xs text-ink-3">Logistics Manager</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">{t('settings.title')}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }
  ```
  Note: replace the `aria-label` placeholder above with a proper key — add `nav.userMenu: "Menú de usuario"` / `User menu` to both message files and use `t('nav.userMenu')`. Adjust the test query to match.
- [ ] Create `components/layout/AppShell.tsx`:
  ```tsx
  import { Sidebar } from './Sidebar';
  import { Header } from './Header';
  export function AppShell({ children }: { children: React.ReactNode }) {
    return (
      <>
        <Sidebar /><Header />
        <main className="ml-14 mt-14 p-6 relative z-10">{children}</main>
      </>
    );
  }
  ```
- [ ] Edit `app/layout.tsx` to render `<AppShell>{children}</AppShell>` inside the provider.
- [ ] Run `pnpm test`. Expected: layout tests pass.
- [ ] Commit: `feat(layout): add sidebar with hover-expand and header avatar dropdown`.

---

## Task 10 — Container List Page Stub

**Goal:** Minimal `/containers` page with search/filter shell and a table listing the three hero containers. Real interactions can come in Phase 3, but the route must exist now so detail pages have a parent.

**Files created:**
- `app/containers/page.tsx`
- `components/containers/ContainerListTable.tsx`
- `__tests__/containers-list.test.tsx`

### Steps

- [ ] Write a smoke test that the page renders all 3 container IDs. Run, fail, implement, pass, commit.
- [ ] `app/containers/page.tsx`:
  ```tsx
  import { containers } from '@/lib/mock-data/containers';
  import { ContainerListTable } from '@/components/containers/ContainerListTable';
  import { getTranslations } from 'next-intl/server';
  export default async function Page() {
    const t = await getTranslations('containers');
    return (
      <section>
        <h1 className="text-xl mb-4">{t('title')}</h1>
        <ContainerListTable containers={containers} />
      </section>
    );
  }
  ```
- [ ] `components/containers/ContainerListTable.tsx`: simple table with columns ID (font-mono), Product, Route, Status (i18n), Value (formatUsd via `useFormatter` or wrapper). Each row links to `/containers/{id}`. Search input is a stub (no behavior).
- [ ] Commit: `feat(containers): add list page stub with all hero containers`.

---

## Task 11 — Container Detail Shell

**Goal:** `/containers/[id]/page.tsx` resolves the container, computes its lane profile, and renders the correct tab set (8 tabs if `coldChain?.required === true`, otherwise 7).

**Files created:**
- `app/containers/[id]/page.tsx`
- `components/containers/ContainerTabs.tsx`
- `__tests__/container-detail.test.tsx`

### Steps

- [ ] Write `__tests__/container-detail.test.tsx`:
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { describe, it, expect } from 'vitest';
  import { NextIntlClientProvider } from 'next-intl';
  import es from '../messages/es.json';
  import { containers } from '@/lib/mock-data/containers';
  import { ContainerTabs } from '@/components/containers/ContainerTabs';
  const wrap = (ui: React.ReactNode) =>
    <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>;
  describe('ContainerTabs', () => {
    it('walnuts MSCU-7842156 renders 7 tabs (no Cold Chain)', () => {
      const c = containers.find(x => x.id === 'MSCU-7842156')!;
      render(wrap(<ContainerTabs container={c} />));
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(7);
      expect(screen.queryByRole('tab', { name: /Cadena de frío/i })).toBeNull();
    });
    it('cherries MAEU-9182734 renders 8 tabs including Cold Chain', () => {
      const c = containers.find(x => x.id === 'MAEU-9182734')!;
      render(wrap(<ContainerTabs container={c} />));
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(8);
      expect(screen.getByRole('tab', { name: /Cadena de frío/i })).toBeInTheDocument();
    });
  });
  ```
- [ ] Run, fail. Implement `components/containers/ContainerTabs.tsx` using shadcn Tabs. Tab order: Overview, Documents, Readiness, [Cold Chain if `container.coldChain?.required`], Validations, Financial, Reconciliation, History. Each tab content is initially a stub `<div>` keyed by tab name; subsequent tasks fill them in.
- [ ] `app/containers/[id]/page.tsx`:
  ```tsx
  import { notFound } from 'next/navigation';
  import { containers } from '@/lib/mock-data/containers';
  import { ContainerTabs } from '@/components/containers/ContainerTabs';
  export default function Page({ params }: { params: { id: string } }) {
    const container = containers.find(c => c.id === params.id);
    if (!container) return notFound();
    return (
      <section>
        <header className="mb-6">
          <div className="font-mono text-mint-500 text-sm">{container.id}</div>
          <h1 className="text-2xl">{container.productLabel} · {container.polLabel} → {container.podLabel}</h1>
        </header>
        <ContainerTabs container={container} />
      </section>
    );
  }
  ```
- [ ] Run `pnpm test`. Pass. Commit: `feat(container-detail): tab shell with conditional Cold Chain tab`.

---

## Task 12 — Overview Tab

**Goal:** ContainerTimeline + route summary + status block.

**Files created:**
- `components/containers/ContainerTimeline.tsx`
- `components/containers/OverviewTab.tsx`
- `__tests__/container-timeline.test.tsx`

### Steps

- [ ] Test: timeline renders all events from lane profile timeline (7 events for the standard composer), highlights the current T-day (`T-2` for walnuts, `T+10` for cherries). Run, fail, implement, pass.
- [ ] `ContainerTimeline.tsx`: horizontal stepper, T-day labels in `font-mono`, current point highlighted mint. Take props: `events: LaneTimelineEvent[]`, `currentTDay: string`.
- [ ] `OverviewTab.tsx`: renders timeline + route line (POL → POD), key facts grid (importer, producer, weight, value, cutoff with `hoursUntil` color severity).
- [ ] Wire into `ContainerTabs` Overview content.
- [ ] Commit: `feat(container-detail): overview tab with timeline and route summary`.

---

## Task 13 — Documents Tab

**Goal:** List of `DocumentInstance` for the container with `DocumentStatusPill`.

**Files created:**
- `components/containers/DocumentStatusPill.tsx`
- `components/containers/DocumentsTab.tsx`
- `__tests__/document-pill.test.tsx`

### Steps

- [ ] Test: pill renders correct severity color and i18n label per status (`missing` → crit-red, `approved` → mint, etc.).
- [ ] Implement `DocumentStatusPill` (props `status: DocStatus`).
- [ ] Implement `DocumentsTab` (props `container: Container`): filter `documents.ts` by `containerId`, render rows with type label, doc number (mono), issuer, status pill, issuedAt (formatDate).
- [ ] Wire into `ContainerTabs`.
- [ ] Commit: `feat(container-detail): documents tab with status pills`.

---

## Task 14 — Readiness Tab (dynamic matrix)

**Goal:** ReadinessMatrix renders N rows from `laneProfile.documentSet`. Walnuts → 15 rows, cherries → 18 rows.

**Files created:**
- `components/containers/ReadinessMatrix.tsx`
- `components/containers/ReadinessTab.tsx`
- `__tests__/readiness-matrix.test.tsx`

### Steps

- [ ] Test: pass walnuts lane profile → table has 15 rows; pass cherries lane profile → 18 rows. Each row shows label + 3 cells (Status, Validations, Last update).
- [ ] Run, fail. Implement matrix as a pure function of props (`documents`, `documentStates`, `validationResults`). No internal data lookup.
- [ ] `ReadinessTab.tsx` derives the lane profile via `getLaneProfile(container.laneProfileId)`, builds `documentStates` from `documents.ts`, builds `validationResults` from `validations.ts`, then passes everything to `ReadinessMatrix`.
- [ ] Wire into `ContainerTabs`.
- [ ] Commit: `feat(container-detail): dynamic readiness matrix driven by lane profile`.

---

## Task 15 — Cold Chain Tab + Timeline (conditional)

**Goal:** Full cold-chain UI for `MAEU-9182734`. ColdChainTab renders only when `container.coldChain?.required === true`.

**Files created:**
- `components/cold-chain/ColdChainTab.tsx`
- `components/cold-chain/ColdChainTimeline.tsx`
- `components/cold-chain/ColdChainSummaryCard.tsx`
- `__tests__/cold-chain-ui.test.tsx`

### Steps

- [ ] Test:
  - Rendering `ColdChainTab` for a dry container throws / returns null (use the helper guard inside `ContainerTabs` so the tab isn't rendered at all).
  - Rendering for cherries: 3 logger lines visible (data-testid), excursion marker present, compliance counter shows roughly `9d 14h` (13800 min).
  - `ColdChainTimeline` accepts `loggers` and renders one Recharts `<Line>` per logger.
- [ ] Run, fail.
- [ ] Implement `ColdChainTimeline.tsx` as a Recharts `LineChart`:
  ```tsx
  'use client';
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';
  import type { ColdChainTrace } from '@/types';
  export function ColdChainTimeline({ trace, height = 320 }: { trace: ColdChainTrace; height?: number }) {
    // Merge readings by timestamp into a single dataset for Recharts
    // Each row: { t, top?, middle?, bottom? }
    const map = new Map<string, any>();
    for (const lg of trace.loggers) for (const r of lg.readings) {
      const row = map.get(r.t) ?? { t: r.t };
      row[lg.position] = r.tempC; map.set(r.t, row);
    }
    const data = Array.from(map.values()).sort((a,b) => a.t.localeCompare(b.t));
    const upper = trace.setpointC + trace.toleranceC;
    return (
      <LineChart width={900} height={height} data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" />
        <XAxis dataKey="t" tick={{ fill: '#A8B3C7', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
        <YAxis tick={{ fill: '#A8B3C7', fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={['auto','auto']} />
        <ReferenceArea y1={upper} y2={5} fill="#EF4444" fillOpacity={0.06} />
        <ReferenceLine y={trace.setpointC} stroke="#A8B3C7" strokeDasharray="2 2" />
        <Tooltip />
        <Line type="monotone" dataKey="top"    stroke="#00E696" dot={false} strokeWidth={1.4} data-testid="line-top" />
        <Line type="monotone" dataKey="middle" stroke="#7DD3FC" dot={false} strokeWidth={1.4} data-testid="line-middle" />
        <Line type="monotone" dataKey="bottom" stroke="#3B82F6" dot={false} strokeWidth={1.4} data-testid="line-bottom" />
      </LineChart>
    );
  }
  ```
- [ ] Implement `ColdChainSummaryCard.tsx` — compact status banner (status pill, compliance progress bar mint fill, last reading strip with three logger temps in mono).
- [ ] Implement `ColdChainTab.tsx` with the seven sections from spec §6:
  1. Status banner (uses ColdChainSummaryCard)
  2. Telemetry chart (ColdChainTimeline)
  3. CA atmosphere mini-chart (stacked area O₂/CO₂/N₂ if `caReadings`)
  4. Lifecycle stepper (Pre-cooling → PTI → Loading → Treatment → Arrival → Transfer)
  5. Pre-cooling section (pulp temp curve as small Recharts line)
  6. Excursion events table
  7. Compliance projection (`treatmentMinutesCompliant + remaining → satisfies at`)
- [ ] Add a count-up animation hook for the compliance counter (use Framer Motion `motion.span` with `useMotionValue` + `animate`, 1.5s ease-out, formatted as `Xd Yh Zm`).
- [ ] Wire conditionally into `ContainerTabs`.
- [ ] Run `pnpm test`. Pass.
- [ ] Commit: `feat(cold-chain): full ColdChainTab with telemetry, lifecycle, excursions`.

---

## Task 16 — Remaining Tabs (Validations, Financial, Reconciliation, History)

**Goal:** Fill the remaining four tabs with real-feeling content for both heroes.

**Files created:**
- `components/alerts/ValidationFeed.tsx`
- `components/containers/FinancialTab.tsx`, `ReconciliationTab.tsx`, `HistoryTab.tsx`
- `__tests__/validation-feed.test.tsx`

### Steps

- [ ] Validations tab: `ValidationFeed` props `validations: Validation[]`. Renders a chronological list, severity-colored left border, mono timestamp, status pill, message via i18n. Test with a small fixture.
- [ ] Financial tab: simple grid showing PO value (mono USD), incoterm, payment terms, payment status, cost-at-risk, projected margin. All labels via i18n.
- [ ] Reconciliation tab: stub with three rows (PO ↔ Invoice ↔ Packing List) showing match/mismatch counts. Use small mock fixture inside the component for now.
- [ ] History tab: chronological event log derived from validations + alerts + status changes for the container. Render as time-prefixed list (mono timestamps).
- [ ] Wire all four into `ContainerTabs`.
- [ ] Run `pnpm test`. Pass.
- [ ] Commit: `feat(container-detail): validations/financial/reconciliation/history tabs`.

---

## Task 17 — Settings Page

**Goal:** `/settings` with language toggle that writes the `AGORA_LOCALE` cookie and refreshes locale context.

**Files created:**
- `app/settings/page.tsx`
- `components/settings/LanguageToggle.tsx`
- `app/api/locale/route.ts` (server action endpoint to set cookie)
- `__tests__/settings.test.tsx`

### Steps

- [ ] Test: settings page renders title, language section, "More settings coming soon" placeholder. Toggle has both `Español` and `English` options. Clicking `English` triggers a fetch to the locale endpoint with `locale=en`.
- [ ] Run, fail.
- [ ] Implement `app/api/locale/route.ts`:
  ```ts
  import { NextResponse } from 'next/server';
  import { cookies } from 'next/headers';
  export async function POST(req: Request) {
    const { locale } = await req.json();
    if (!['es','en'].includes(locale)) return NextResponse.json({ ok: false }, { status: 400 });
    cookies().set('AGORA_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return NextResponse.json({ ok: true });
  }
  ```
- [ ] Implement `LanguageToggle.tsx` (client) with two buttons that POST to `/api/locale` then `router.refresh()` to re-render the tree with the new locale (next-intl reads cookie on each request).
- [ ] Implement `app/settings/page.tsx` with the language section + "More settings coming soon" message. All text via `t('settings.*')`.
- [ ] Run `pnpm test`. Pass.
- [ ] Smoke test manually: `pnpm dev`, navigate to `/`, open avatar menu → Settings, switch to English → header and sidebar re-render in English. Switch back to Spanish.
- [ ] Commit: `feat(settings): language toggle with cookie persistence and live locale refresh`.

---

## Final verification

- [ ] Run `pnpm typecheck`. Expected: clean.
- [ ] Run `pnpm test`. Expected: all suites pass.
- [ ] Run `pnpm build`. Expected: build succeeds.
- [ ] Manual smoke checklist:
  - [ ] `/containers/MSCU-7842156` shows 7 tabs (no Cold Chain), Readiness has 15 rows
  - [ ] `/containers/MAEU-9182734` shows 8 tabs including Cold Chain, Readiness has 18 rows, telemetry chart renders 3 lines, compliance counter animates to ~9d 14h, 1 excursion shown
  - [ ] `/settings` toggles between es and en; sidebar nav re-renders
  - [ ] Body has the radial mint glow + dot-grid overlay
  - [ ] All numbers/IDs/timestamps in JetBrains Mono
- [ ] Commit any final fixes; phase complete.

---

## Phase 1 done when

1. Both hero containers fully populated at their detail pages with all required tabs.
2. `MAEU-9182734` Cold Chain tab shows live telemetry (3 loggers × 2,880 readings), animated compliance counter, 1 excursion row.
3. `MSCU-7842156` shows 7 tabs (no Cold Chain) and exactly 15 docs in Readiness Matrix.
4. `/settings` switches locale via cookie; both `es.json` and `en.json` cover every UI string.
5. `computeLaneProfile()` is the only place lane behavior is composed and contains zero hardcoded per-product/market conditionals (verified by source-scan test).
6. All 25 agents present in `agents.ts`, with 6 cold-chain sentinels tagged `cold_chain`.
7. `pnpm typecheck`, `pnpm test`, and `pnpm build` are all green.

# Agora Platform — Design Document

**Date:** 2026-04-28  
**Sources:** `AGORA_PLATFORM_BUILD_SPEC.md` + `AGORA_PATCH_01_LANE_PROFILES_COLD_CHAIN.md`  
**Status:** Approved — ready for implementation planning

---

## 0. What We Are Building

A clickable, fully-populated **maqueta** (sales prototype) of Agora — a B2B SaaS platform for Chilean fruit/nut exporters providing an "AI digital team" for export operations. No real backend, no real auth, no real connectors. All data is static TypeScript mock data.

**Demo customer:** Valle Fresco S.A. (Santiago, Chile)  
**Demo user:** María José Soto, Logistics Manager  
**Demo "today":** `2027-01-09T10:00:00-04:00` (peak cherry season, per Patch 01)

---

## 1. Tech Stack (locked)

| Concern | Choice |
|---|---|
| Framework | Next.js 14+ App Router |
| Language | TypeScript strict mode |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Charts | Recharts |
| Map | **react-simple-maps + Natural Earth TopoJSON** (2D SVG flat map — not react-globe.gl; matches design handoff visual direction) |
| Animations | Framer Motion (sparingly) |
| State | React state + URL params. No Redux/Zustand. |
| Dates | date-fns |
| i18n | **next-intl** (cookie-based locale, no URL prefix) |

**Globe decision rationale:** The design handoff shows a 2D equirectangular SVG map with animated arcs. The spec originally called for react-globe.gl but the design handoff supersedes it as the high-fidelity visual reference. react-simple-maps with Natural Earth TopoJSON gives proper coastlines with full control over design tokens, no API key required, and SVG arc animations matching the design.

**i18n decision rationale:** Cookie-based locale (no URL prefix) keeps URLs clean and is appropriate for a sales prototype. Language preference persists in a cookie (`AGORA_LOCALE`). next-intl is the canonical i18n library for Next.js 14 App Router — it supports both route-based and cookie-based locale resolution; we use cookie-based.

---

## 2. Design System

### Color tokens (CSS variables in Tailwind config)

```
Surfaces:   --bg-0 #070A12 / --bg-1 #0E1320 / --bg-2 #141A29 / --bg-3 #1B2235
Glass:      rgba(17, 24, 39, 0.55) + backdrop-blur
Lines:      rgba(255,255,255,0.07) / 0.14 / mint@0.32
Text:       --ink-1 #F4F6FA / --ink-2 #A8B3C7 / --ink-3 #6B7689 / --ink-4 #475063
Mint:       #00E696 (500) / #4DFFB8 (300) / #00B377 (600) / #008055 (700)
Severity:   ok #00E696 / info #3B82F6 / watch #F59E0B / risk #F97316 / crit #EF4444
Trace:      #7DD3FC
```

### Typography
- **UI:** Inter 400/500/600/700, 13px base
- **Numbers/IDs/codes:** JetBrains Mono — ALL numbers, container IDs, USD values, timestamps, document numbers

### Ambient chrome
- `body::before`: two radial gradient glows (mint top-right, sky bottom-left, ~5% opacity)
- `body::after`: 3px micro-dot grid overlay (terminal texture)

### Motion
- Sidebar collapse: 0.22s cubic-bezier
- Alert critical border: 1.5s pulse
- Arc draw: SVG dasharray animation 2–4s
- Cold treatment counter: smooth count-up on first render (most visually arresting element per patch §17)
- Page transitions: 200ms fade + Y translation

---

## 3. Information Architecture

7 primary surfaces + 1 settings page + 1 reserved slot:

| # | Route | Surface |
|---|---|---|
| 1 | `/` | Operations Dashboard |
| 2 | `/containers` | Container list + `[id]` detail |
| 3 | `/purchase-orders` | PO list + `[id]` detail |
| 4 | `/importers` | Importer list + `[id]` fiche |
| 5 | `/producers` | Producer list + `[id]` fiche |
| 6 | `/compliance` | Compliance & Master Data |
| 7 | `/performance` | Performance & ROI |
| 8 | `/settings` | Settings — language toggle + future preferences |
| — | (greyed, no route) | Approval Queue — disabled sidebar link only, tooltip "Available in V3", no stub page |

**Settings page access:** User avatar dropdown in the header contains a "Settings" link → `/settings`. The settings page is not listed in the primary sidebar nav (it's a user-level preference, not an operational surface).

**Core principle:** Container is the primary unit. Every path leads to container detail.

---

## 4. Data Model

### Hero containers (two — from spec + patch)

| Container | Product | Route | Payment | Today's T-day | Active state |
|---|---|---|---|---|---|
| `MSCU-7842156` | Walnuts in shell | San Antonio → Nhava Sheva (IN) | CAD at sight | T-2 | DUS not yet filed, 18h to cut-off |
| `MAEU-9182734` | Fresh cherries | San Antonio → Yangshan (CN) | L/C at sight | T+10 | Cold treatment day 10 of 15 in progress |

### Lane Profile architecture (Patch 01 addition)

Platform behavior is derived from `Product × Market × CommercialTerms` at runtime via `computeLaneProfile(productId, marketId, commercialId): LaneProfile`. This function lives in **`/lib/mock-data/lane-profiles.ts`** (canonical home — no second implementation file). It pulls from `product-profiles.ts`, `market-rules.ts`, and `commercial-profiles.ts` and composes:

```typescript
// LaneProfile — return type of computeLaneProfile()
export interface LaneProfile {
  id: string;                        // dot-delimited key: '{productId}.{marketId}.{commercialId}'
                                     // e.g. 'fresh_cherries.CN.cif_lc_at_sight'
                                     // marketId uses Market type: 'US'|'EU'|'IN'|'CN'|'MENA'
  product: ProductProfile;
  market: MarketProfileExtended;
  commercial: CommercialProfile;
  documentSet: DocumentRequirement[];  // ordered, required docs for this lane
  agentsActive: AgentId[];             // union of agents from all three sub-profiles
  validationChecks: string[];          // identifiers of L2 checks that apply
  timeline: LaneTimelineEvent[];       // composed T-day calendar for this lane
}
```

**`laneProfileId` key format:** `'{productId}.{marketId}.{commercialId}'` — e.g. `'fresh_cherries.CN.cif_lc_at_sight'`. Built by joining the three string values with `.`.

**Hard constraint:** `computeLaneProfile()` must contain zero hardcoded conditionals per product/market combination. It must compose from data files only.

### Key enum values (Patch 01 additions)

```typescript
export type ProductId =
  | 'walnuts_in_shell' | 'walnut_kernels' | 'almonds_in_shell'
  | 'fresh_cherries' | 'fresh_blueberries'
  | 'table_grapes_red' | 'table_grapes_white';

export type IncotermPaymentId =
  | 'cif_cad_at_sight' | 'cif_lc_at_sight' | 'cif_lc_60'
  | 'cif_open_account_30' | 'fob_open_account_30' | 'dap_open_account';
```

### MarketProfileExtended (extends existing MarketProfile)

```typescript
export interface MarketProfileExtended extends MarketProfile {
  coldTreatmentOptions?: ColdTreatmentProtocol[];
  registrationsRequired: string[];     // e.g. ['GACC Decree 280 facility', 'orchard reg']
  labelLanguageRequired: string[];     // e.g. ['Mandarin', 'English']
  inspectionAuthority: string;         // 'GACC + CIQ', 'FDA + USDA APHIS', 'BIP', 'PQ India'
  digitalPhytoSystem?: string;         // 'SAG-GACC' for China, null for others
}
```

### Container interface additions (Patch 01)

```typescript
// Added to existing Container interface:
productId: ProductId;
commercialId: IncotermPaymentId;
laneProfileId: string;               // '{productId}.{marketId}.{commercialId}'
coldChain?: ColdChainTrace;          // undefined for dry cargo; present + required=true for reefers
```

### ColdChainTrace interface

```typescript
export interface ColdChainTrace {
  required: boolean;                  // true for reefers; dry containers omit coldChain entirely
  protocol: string | null;            // ColdTreatmentProtocol.id, e.g. 'china_15d_0_5c'
  setpointC: number;
  toleranceC: number;
  caGasMix?: { o2Pct: number; co2Pct: number; n2Pct: number };
  rhTargetPct: [number, number];

  // Pre-vessel
  preCooling?: PreCoolingRecord;
  reeferPti?: ReeferPtiRecord;

  // In-transit
  loggers: DataLogger[];              // 3 for cherries; 1-2 for grapes/blueberries
  caReadings?: CaReading[];           // CA gas mix telemetry — source for CA atmosphere mini-chart

  // Computed live
  treatmentRequiredMinutes: number;   // e.g. 21600 for 15 days
  treatmentMinutesCompliant: number;  // minutes where all loggers ≤ setpointC+tolerance
  treatmentMinutesViolation: number;
  excursionEvents: ExcursionEvent[];
  status: 'pre_load' | 'in_treatment' | 'completed' | 'breached';
  lastReadingAt: string;              // ISO

  // Post-arrival
  loggerDownloadReportUrl?: string;
  arrivalTransferStatus?: 'pending' | 'in_progress' | 'completed';
}
```

### Cold chain data (Patch 01)

For `MAEU-9182734`: 3 loggers × 2,880 readings (15-min interval × 24h × 10 days = T+1 to TODAY T+10). One minor excursion at T+6 day 14:32 UTC: top logger spiked to +0.4°C for 18 min — within tolerance, did not break compliance. `treatmentMinutesCompliant ≈ 13,800` (≈9d 14h), `status: 'in_treatment'`.

For `CMAU-9281744` (table grapes → CN, in transit at T+1): refrigerated, `coldChain.required = true`, ~50 sampled readings, `status: 'in_treatment'`. This is the second refrigerated container needed by the dashboard DoD (≥2 in Cold Chain Status section).

For dry containers (walnuts, almonds): `coldChain` field is **absent** (`undefined`). The condition `container.coldChain?.required === true` evaluates to false and all cold-chain UI is suppressed.

### Anchor date

```typescript
export const getTodayDemo = () => new Date('2027-01-09T10:00:00-04:00');
```

All container ETDs re-anchored per Patch 01 §1 table to preserve T-day positions.

---

## 5. Internationalization (i18n)

### Overview

- **Library:** next-intl
- **Supported locales:** `es` (Spanish, default) + `en` (English)
- **Locale resolution:** Cookie `AGORA_LOCALE`. If absent, default to `es`. No URL prefix.
- **Extensibility:** Adding a new locale requires only a new `messages/{locale}.json` file and registering the locale in next-intl config — zero code changes.

### Rules

- **No hardcoded UI strings anywhere.** Every label, heading, placeholder, tooltip, error message, status pill text, agent description, alert message, and microcopy string must come from translation keys.
- **Document content is exempt.** The bodies of mock documents (invoices, phyto certificates, etc.) are data, not UI — they stay in their source language.
- **Numbers and dates are locale-formatted.** Use `Intl.NumberFormat` and `Intl.DateTimeFormat` with the active locale. The `currency.ts` and `dates.ts` utils accept a `locale` param.
  - ES: thousands separator `.`, decimal `,`, date format DD/MM/AAAA
  - EN: thousands separator `,`, decimal `.`, date format MM/DD/YYYY
  - JetBrains Mono still applies to all numeric output regardless of locale.

### Translation file structure

```
/messages
  es.json    # Spanish (default)
  en.json    # English
```

Keys are namespaced by surface/component:

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
  "dashboard": { ... },
  "containers": { ... },
  "coldChain": { ... },
  "agents": { ... },
  "settings": {
    "title": "Configuración",
    "language": "Idioma",
    "languageEs": "Español",
    "languageEn": "English"
  },
  "common": {
    "costAtRisk": "Costo en riesgo",
    "dueIn": "Vence en",
    "viewAll": "Ver todos",
    ...
  }
}
```

### Settings page (`/settings`)

Minimal page. Initial content is the language selector only — designed so new settings rows can be added later without restructuring.

Layout:
- Page header: "Configuración" / "Settings"
- Section: "Idioma / Language"
  - Toggle/select between Español and English
  - On change: sets `AGORA_LOCALE` cookie, triggers locale context update (no full page reload — next-intl supports live switching via context)
- Section placeholder text: "Más ajustes próximamente" / "More settings coming soon" — shows the page has room to grow

The settings page **does not** appear in the sidebar nav. It is reachable only from the user avatar dropdown ("Configuración" / "Settings" link).

### Header user avatar dropdown

The avatar dropdown (currently just user info) expands to include:
- User name + role
- Divider
- "Configuración" / "Settings" → `/settings`
- (future: "Cerrar sesión" / "Log out" — stub, no action)

### next-intl wiring

```
/i18n
  request.ts          # next-intl locale resolution from AGORA_LOCALE cookie
  routing.ts          # locales: ['es', 'en'], defaultLocale: 'es'
/middleware.ts         # next-intl middleware for cookie-based resolution
```

`useTranslations('nav')`, `useTranslations('dashboard')` etc. used in components. `useFormatter()` for locale-aware number/date formatting.

---

## 6. File Structure

```
/messages
  es.json                         # Spanish translations (default)
  en.json                         # English translations

/i18n
  request.ts                      # next-intl locale resolution from AGORA_LOCALE cookie
  routing.ts                      # locales config: ['es', 'en'], defaultLocale: 'es'

/middleware.ts                     # next-intl cookie-based locale middleware

/app
  /layout.tsx                     # Root layout: Sidebar + Header + NextIntlClientProvider
  /page.tsx                       # Operations Dashboard
  /containers/page.tsx            # Container list
  /containers/[id]/page.tsx       # Container detail (7 or 8 tabs)
  /purchase-orders/page.tsx
  /purchase-orders/[id]/page.tsx
  /importers/page.tsx + /[id]/page.tsx
  /producers/page.tsx + /[id]/page.tsx
  /compliance/page.tsx
  /performance/page.tsx
  /settings/page.tsx              # Language toggle + future preferences

/components
  /ui                             # shadcn primitives
  /layout/Sidebar.tsx + Header.tsx
  /containers/ContainerCard.tsx + ContainerTimeline.tsx
                ReadinessMatrix.tsx + DocumentStatusPill.tsx
  /alerts/AlertCard.tsx + AlertFeed.tsx + ValidationFeed.tsx
  /map/ShipmentMap.tsx            # react-simple-maps 2D flat map
  /kpi/KPITile.tsx + KPIStrip.tsx
  /entity/EntityFiche.tsx
  /cold-chain/ColdChainTab.tsx    # (Patch 01)
              ColdChainTimeline.tsx
              ColdChainSummaryCard.tsx
  /compliance/ProductProfileCard.tsx   # (Patch 01)
              CommercialProfileCard.tsx

/lib/mock-data
  containers.ts                   # 8 containers (7 original + cherries hero)
  purchase-orders.ts
  importers.ts
  producers.ts
  documents.ts
  alerts.ts
  validations.ts
  agents.ts                       # 25 agents (17 original + 8 patch additions)
  market-rules.ts
  penalty-events.ts
  kpis.ts
  product-profiles.ts             # (Patch 01) 7 products
  commercial-profiles.ts          # (Patch 01) 6 commercial profiles
  cold-treatment-protocols.ts     # (Patch 01) 3 protocols
  lane-profiles.ts                # (Patch 01) computeLaneProfile() + pre-computed cache (ONLY home for this function)
  cold-chain-traces.ts            # (Patch 01) full trace for cherries hero + light for others

/lib/utils
  dates.ts                        # getTodayDemo(), T-day calculations
  currency.ts
  risk.ts

/types/index.ts                   # All TypeScript interfaces (original + Patch 01 additions)
```

---

## 6. Component Specifications

### ShipmentMap (replaces globe)

react-simple-maps equirectangular projection + Natural Earth TopoJSON 110m. Layers back-to-front:
1. Background gradient radial
2. Graticule lines (every 20°, dashed, low opacity)
3. Country polygons (dark navy fill `#0F1A2E`, 1px sky-tinted stroke)
4. Shipping arcs: quadratic Bezier POL→POD, colored by severity, SVG dasharray draw animation on mount
5. Dry arcs: 1.6px stroke; Refrigerated arcs (Patch 01): thicker + subtle pulse, colored by cold-chain status (mint=compliant, amber=watch, red=breach)
6. Origin pins: filled circle + pulsing halo
7. Destination markers: 8×8 rotated diamond
8. In-transit pips: animateMotion along arc path (in-transit only)
9. Hover tooltip: container ID, buyer, product, POL→POD, ETA, cost-at-risk

### ReadinessMatrix (dynamic — Patch 01 update)

Props: `documents: DocumentRequirement[]`, `documentStates: Record<DocumentType, DocStatus>`, `validationResults: Record<DocumentType, ValidationSummary>`. Renders N×3 cells where N = `documents.length`. The matrix is purely driven by props — the caller passes the lane profile's `documentSet`. Expected outputs to verify: walnuts hero → 15 rows, cherries hero → 18 rows.

### ColdChainTab (Patch 01 — conditional)

Only renders when `container.coldChain?.required === true`. Seven sections:
1. **Status banner** — compliance progress bar (mint fill, day tick marks, animated glow in treatment), current logger readings strip (top/middle/bottom temps in mono), USD-at-risk if breached
2. **Telemetry chart** (ColdChainTimeline) — Recharts LineChart, 3 logger lines (mint/cyan/blue), threshold band at 0.5°C (light red fill above), excursion markers (vertical dashed lines), setpoint reference line (-0.5°C faint dotted)
3. **CA atmosphere mini-chart** — stacked area O₂/CO₂/N₂ over time with target bands
4. **Lifecycle stepper** — Pre-cooling → PTI → Loading → Cold Treatment → Arrival → Transfer, with status + timestamps + doc links
5. **Pre-cooling section** — pulp temp curve from harvest to loading, annotated milestones
6. **Excursion events table** — timestamp, logger, peak temp, duration, severity, broke compliance?
7. **Compliance projection** — "Treatment satisfies at T+16" or "BREACHED — fallback recommended"

The cold treatment counter is the primary demo showpiece — smooth count-up animation on render. Count-up runs from 0 to `treatmentMinutesCompliant`, formatted as `"Xd Yh Zm"`, 1.5s duration, ease-out easing.

### Container Detail — tab order (Patch 01 update)

Overview → Documents → Readiness → **Cold Chain** (conditional) → Validations → Financial → Reconciliation → History

Cold Chain tab inserts between Readiness and Validations. For dry containers, the tab is entirely absent (not disabled — not rendered).

### Operations Dashboard — section order

Hero globe → KPI strip (5 tiles + conditional 6th "Cold treatment compliance") → Action queue + Alerts rail → **Cold Chain Status** (ColdChainSummaryCard — conditional) → This week readiness strip → Closed last week → Penalty heatmap mini

### Compliance page — 4-section layout (Patch 01 update)

Section 1: Market Rule Packs (5 cards, uses MarketProfileExtended fields for cold treatment options, registration requirements, label languages)  
Section 2: Product Profiles (7 ProductProfileCard, NEW — Patch 01)  
Section 3: Commercial Profiles (6 CommercialProfileCard, NEW — Patch 01)  
Section 4: Master Data Sentinel Queue (unchanged)

### Agent catalog — 25 agents total

Original 17 + 8 from Patch 01:
- 6 Cold Chain Sentinels (category: monitor, tag: cold_chain): `pre_cooling_tracker`, `cold_storage_monitor`, `reefer_pti_validator`, `in_transit_telemetry_watcher`, `cold_treatment_auditor`, `arrival_cold_chain_coordinator`
- `lc_discrepancy_catcher` (category: validate) — L/C lanes only
- `lunar_new_year_window_watcher` (category: monitor) — China cherries/grapes seasonal

Cold-chain agents appear with a `Cold Chain` badge in the Performance grid. No L0/L1/L2/L3/L4 labels anywhere in the UI.

---

## 7. Implementation Phases

### Phase 1 — Foundation + Container Detail
- Next.js init, Tailwind config (all design tokens), shadcn/ui
- **next-intl setup**: middleware, `i18n/request.ts`, `i18n/routing.ts`, `messages/es.json` + `messages/en.json` scaffolded with all keys (values filled as surfaces are built)
- `types/index.ts` — all interfaces including Patch 01 additions
- All mock data files (both hero containers, all 25 agents, all new lane profile files)
- `getTodayDemo()` utility anchored to `2027-01-09`; `currency.ts` and `dates.ts` locale-aware
- Layout chrome: Sidebar + Header (avatar dropdown with Settings link)
- Container Detail — all 7+1 tabs for both hero containers:
  - `MSCU-7842156`: 7 tabs, no Cold Chain tab (dry cargo)
  - `MAEU-9182734`: 8 tabs including fully populated Cold Chain tab with live telemetry chart
- Components: ContainerTimeline, ReadinessMatrix (dynamic), AlertCard, ValidationFeed, DocumentStatusPill, ColdChainTab, ColdChainTimeline

### Phase 2 — Operations Dashboard
- ShipmentMap (react-simple-maps, Natural Earth TopoJSON, styled to design tokens)
- KPIStrip with conditional cold-chain tile
- Action queue (ContainerCard with mini timelines) + Alerts rail
- ColdChainSummaryCard + Cold Chain Status section
- Readiness strip, closed last week table, penalty heatmap mini

### Phase 3 — Remaining surfaces
- Containers list (filterable table, URL params)
- Purchase Orders list + detail
- Importers + Producers (EntityFiche template)
- Compliance page (3 new sections: ProductProfileCard, CommercialProfileCard, existing Market Rule Packs updated to MarketProfileExtended)

### Phase 4 — Performance + Polish
- Performance page (25 agents, cold-chain heatmap rows, cold-chain insights, cold incidents KPI)
- Settings page (`/settings`) — language toggle, cookie persistence, live locale switch
- Cmd+K command palette
- Framer Motion transitions, count-up animations, alert pulses
- Conditional rendering audit: pure-walnuts mode must look identical to original spec
- i18n audit: verify no hardcoded strings remain in any component; both locales render without layout breaks

---

## 8. Key Constraints

- **No cold-chain UI without refrigerated containers.** Every cold-chain element (tab, KPI tile, dashboard section, heatmap rows) must render conditionally. A pure-walnuts demo shows nothing cold-chain-related.
- **`computeLaneProfile()` must be data-only.** No hardcoded per-product/market conditionals. Failure here means the Lane Profile abstraction failed.
- **Walnuts hero is the regression test.** After any patch work, `MSCU-7842156` must work exactly as before (7 tabs, no Cold Chain tab, 15 docs in Readiness Matrix).
- **Numbers are sacred.** USD values, weights, temps, IDs always in JetBrains Mono with thousand separators and currency codes.
- **No AI tone.** Agents are infrastructure. Users see outcomes (alerts, validations, KPIs), not "AI is thinking."
- **Bilingual UI: Spanish (default) + English.** The original spec said "English UI only" — this is superseded. All UI strings are in translation files (`messages/es.json`, `messages/en.json`). Document content (invoices, certificates, etc.) stays in source language regardless of UI locale. Adding a third language requires only a new `messages/{locale}.json` file.
- **No emojis.** Anywhere.

---

## 9. Definition of Done

Original spec §17 + Patch 01 §16:

1. Both hero containers richly populated at their respective detail pages
2. `MAEU-9182734` Cold Chain tab: live telemetry chart (3 loggers, 10 days), compliance counter animated, 1 excursion event shown
3. `MSCU-7842156` unchanged: 7 tabs, no Cold Chain tab, 15-document Readiness Matrix
4. Operations Dashboard: globe with ≥7 arcs (refrigerated arcs styled distinctly), KPI strip, action queue ≥5 cards, Cold Chain Status section with ≥2 refrigerated containers
5. Compliance page: 3 sections (Market Rules, Product Profiles ≥7 cards, Commercial Profiles ≥6 cards)
6. Performance page: 25 agents in Digital Team grid with cold-chain badge, cold-chain penalty rows, 3 cold-chain insights
7. Readiness Matrix dynamic: walnuts hero = 15 rows, cherries hero = 18 rows
8. Cmd+K opens command palette
9. Visual design matches tokens: dark navy + mint, glassmorphism, mono numbers
10. No L0/L1/L2/L3/L4 layer language anywhere in UI copy
11. Lighthouse Performance ≥80 on home page

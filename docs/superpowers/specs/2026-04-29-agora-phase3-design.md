# Agora Phase 3 — Design Spec

**Date:** 2026-04-29  
**Status:** Approved  
**Surfaces:** Containers list, Purchase Orders list + detail, Importer/Producer EntityFiche, Compliance page

---

## 1. Tech Stack (unchanged from Phase 1/2)

- Next.js 16.x App Router, React 19, TypeScript strict mode (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- Tailwind CSS v4 via `@theme {}` in `app/globals.css` — no `tailwind.config.ts`
- `@base-ui/react` for all interactive primitives
- `next-intl v4.11.0` — cookie-based locale (`AGORA_LOCALE`), `localePrefix: 'never'`
- Recharts for charts (all chart components must be `'use client'`)
- pnpm, Vitest + `@testing-library/react`, jsdom
- Demo date anchor: `getTodayDemo()` → `new Date('2027-01-09T10:00:00-04:00')`

---

## 2. Data Model Changes

### 2.1 ContainerStatus

Export a named type replacing the existing inline union in `types/index.ts`:

```ts
export type ContainerStatus =
  | 'planning'
  | 'preparation'
  | 'documentation'
  | 'in_transit'
  | 'customs_release'
  | 'delivery_payment'
  | 'closed'
```

**Stage definitions (handoff-of-responsibility):**

| Stage | Color | T-day range | Handoff |
|---|---|---|---|
| Planning | Violet (`#8B5CF6`) | T-30 to T-15 | Exporter internal |
| Preparation | Mint (`#00E696`) | T-14 to T-8 | Exporter → SAG/packing |
| Documentation | Amber (`#F59E0B`) | T-7 to T-1 | Exporter → forwarder |
| In Transit | Sky (`#7DD3FC`) | T+0 to T+arrival | Carrier |
| Customs & Release | Orange (`#F97316`) | T+arrival to clearance | Customs agent |
| Delivery & Payment | Blue (`#3B82F6`) | Post-clearance to payment | Importer |
| Closed | Slate (muted) | Settled | — |

**"Active container" predicate** (replaces the old `status !== 'arrived'` check in `ActionQueue.tsx`):

```ts
const ACTIVE_STATUSES: ContainerStatus[] = [
  'planning', 'preparation', 'documentation',
  'in_transit', 'customs_release', 'delivery_payment',
]
const isActiveContainer = (c: Container) => ACTIVE_STATUSES.includes(c.status)
```

**i18n key changes** — update `messages/en.json` and `es.json`. Replace the existing 6 keys under `containers.statuses` with:

```json
"containers": {
  "statuses": {
    "planning": "Planning",
    "preparation": "Preparation",
    "documentation": "Documentation",
    "in_transit": "In Transit",
    "customs_release": "Customs & Release",
    "delivery_payment": "Delivery & Payment",
    "closed": "Closed"
  }
}
```

(Spanish equivalents: Planificación, Preparación, Documentación, En Tránsito, Aduana y Liberación, Entrega y Pago, Cerrado)

### 2.2 PurchaseOrder enrichment

```ts
export type POStatus = 'draft' | 'confirmed' | 'in_fulfillment' | 'delivered' | 'cancelled'

export type POEvent = {
  date: string   // ISO
  type: 'confirmed' | 'container_assigned' | 'bl_issued' | 'docs_submitted' | 'delivered' | 'payment_received'
  note?: string
}

// Add to PurchaseOrder type:
status: POStatus
events: POEvent[]
producerId: string   // single-producer assumption for mock data; one PO → one producer
market: Market       // explicit field; drives the market pill in PO detail header
```

`market` is added explicitly (not derived) because importers can operate in multiple markets and a single PO targets one specific market.

### 2.3 New shared types

```ts
export type VolumeHistoryEntry = {
  season: string    // e.g. '2023/24'
  volumeKg: number
}

export type CertifiedProduct = {
  productId: string
  name: string
  hsCode: string
  seasonStart: string   // month abbreviation, e.g. 'Nov'
  seasonEnd: string
  requiresColdChain: boolean
  coldProtocol?: string  // e.g. '15d @ -0.5°C'
  enabledMarkets: Market[]
}

export type SAGCertification = {
  id: string            // e.g. 'SAG-CUR-00288'
  name: string
  expiryDate: string    // ISO date
  daysUntilExpiry: number  // computed at mock-data level relative to getTodayDemo()
}
```

### 2.4 Importer type additions

```ts
// Add to Importer:
avgPaymentDays: number
volumeHistory: VolumeHistoryEntry[]
paymentHistory: Array<{
  poId: string
  method: string         // e.g. 'L/C a la vista'
  bank: string
  amount: number
  daysToCollect?: number // undefined = pending
  status: 'paid' | 'pending'
}>
marketProfile: {
  inspectionAuthority: string[]
  digitalSystem: string
  requiredRegistrations: string[]
  labelLanguages: string[]
  coldTreatmentOptions?: string[]
}
```

### 2.5 Producer type additions

```ts
// Add to Producer:
avgPaymentDays?: number
volumeHistory: VolumeHistoryEntry[]
certifiedProducts: CertifiedProduct[]
sagCertifications: SAGCertification[]
```

---

## 3. Routes

| Route | Component |
|---|---|
| `/containers` | Containers list (kanban + table) |
| `/containers/[id]` | Container detail (existing) |
| `/purchase-orders` | PO list |
| `/purchase-orders/[id]` | PO detail |
| `/importers` | Importers list |
| `/importers/[id]` | Importer EntityFiche |
| `/producers` | Producers list |
| `/producers/[id]` | Producer EntityFiche |
| `/compliance` | Compliance page |

---

## 4. Surface: Containers List (`/containers`)

### Layout

Full-width page with:
1. **Smart search bar** — filters container cards as user types (matches container ID, product, importer)
2. **Product multiselect dropdown** — filter by one or more products
3. **Destination multiselect dropdown** — filter by one or more destination markets
4. **Toggle button** — switches between Kanban and Table views; both views reflect active filters simultaneously

### Kanban View

7 columns, one per stage. Each column has a header showing stage name, color accent, and container count badge. The Closed column is auto-collapsed by default.

**Container card** (per kanban column):
- Container ID (JetBrains Mono, mint)
- Product name + cold chain badge (reefer icon + `--trace` color) if `coldChain.required === true`
- Destination market tag
- T-day indicator: colored by proximity (ok/watch/risk/crit)
- Importer name (dimmed)

No drag-and-drop.

### Table View (grouped by stage)

Rows grouped under collapsible stage headers. Columns: Container ID, Product, Destination, T-Day, Stage, Cold Chain, Importer.

---

## 5. Surface: Purchase Orders (`/purchase-orders` + `/purchase-orders/[id]`)

### PO List

Standard filterable table. Columns: PO ID, Product, Importer, Status, Value USD, Date.

### PO Detail

**Header:**
- PO number (large, JetBrains Mono)
- Pills row: status (blue), importer (violet), product (mint), market (orange — from `po.market`), incoterm (amber), payment (sky), date (grey)
- Single "Exportar" action button

**KPI Strip** (5 tiles): Total value USD, Quantity kg, Container count, Days to delivery (computed as `deliveryWindow.to` − demo date), Payment status

**Resumen Ejecutivo:**
- Verdict line (one sentence summary)
- Quick-scan chips (key data points as colored tags)
- 2×2 grid of 4 items, each with SVG icon: status summary, cold chain status, documentation status, financial status

**Lifecycle Timeline:**
- Single horizontal rail with mint progress fill covering completed portion
- Milestone nodes: Confirmada → Contenedor asignado → BL emitido → Docs presentados → Entregada → Pago recibido (derived from `events[]`)
- No broken connectors — single `tl-rail` background + `tl-progress` overlay approach

**Documents Section:**
- Cards grouped by status: **Listo** (mint top border), **En Revisión** (blue top border), **Pendiente** (amber top border)
- 4-column card grid; each card: SVG icon + document name + date + action
- No emoji icons — all icons use inline SVG styled to design tokens

**Fulfillment & Contraparte:**
- Linked containers table
- Importer mini-card (name, credit rating, country, `avgPaymentDays`)

**Activity Feed:** chronological event log from `events[]`

---

## 6. Surface: EntityFiche (Importers + Producers)

### Shell (shared)

The `EntityFiche` component provides the structural frame; entity-specific sections are injected as `children`:

```
EntityFiche
├── Header (avatar initials + name + pills)
├── KPI Strip (4 tiles — entity-specific metrics)
├── Relationship History (2-col grid: POs table + Containers table)
└── {children}   ← entity-specific sections injected here
```

**Header pills:**
- Importer: country, market, credit rating (JetBrains Mono, mint), authority registrations
- Producer: region, SAG ID (JetBrains Mono, trace), product pills

**KPI Strip — Importer:** Annual volume kg, Total PO value USD, Active containers, `avgPaymentDays`
**KPI Strip — Producer:** Active containers, Season volume kg, Shipped value USD, Certifications (n/n)

**Relationship History tables:**
- PO table — Importer fiche: ID, Product, Status, Value USD
- PO table — Producer fiche: ID, Importer, Status, Value USD
- Container table — Importer fiche: ID, Product, Stage, T-Day
- Container table — Producer fiche: ID, Destination, Stage, T-Day

### Importer-specific sections

1. **Market flags card** — inspection authority, digital system, required registrations, label languages, cold treatment options (from `importer.marketProfile`)
2. **Payment history card** — per-PO: PO ID, payment method, days to collect, amount, paid/pending status (from `importer.paymentHistory`)

### Producer-specific sections

1. **Certified products grid** (2 cols) — per `CertifiedProduct`: name, HS code, season window (mini bar), cold chain requirements, enabled markets
2. **SAG certifications list** — per `SAGCertification`: icon (ok if `daysUntilExpiry > 60`, warn otherwise), name, cert ID, expiry date, status pill (Vigente / Vence en Xd)

### Volume time series (both fiches)

SVG line chart rendered inside a `div` with `height: 180px; width: 100%`:
- Data source: `entity.volumeHistory` (type `VolumeHistoryEntry[]`)
- X axis: one point per season entry
- Y axis: tightly scaled to data range (min/max of `volumeKg` with 10% padding; does not start at 0)
- Mint line (`stroke="#00E696"`, `strokeWidth=1.8`) + gradient area fill
- Glowing composite dot on the most recent season
- Past dots: outlined circle, semi-transparent

---

## 7. Surface: Compliance Page (`/compliance`)

Four sections on a single scrollable page.

### 7.1 Market Rule Packs

Grid (3 cols). One card per market (CN, EU, US; extensible to UK/MENA). Each card:
- Top accent bar (market color)
- Flag + market name + status tag
- Rows: inspection authority chips, digital registration system, cold treatment chips, required doc chips, label languages
- Footer: enabled products + alert tag (cert expiry warning if `daysUntilExpiry < 60`)

### 7.2 Product Profiles

Grid (4 cols). One `ProductProfileCard` per product (7 cards). Each card:
- Product name + HS code
- Season (text), cold chain required (yes/no + color), cold protocol per market
- Enabled markets row (market tags, active = mint)
- Mini season bar (`MiniSeasonBar` component — 12-month track with mint fill for season window)
- Active/Inactive status tag

### 7.3 Commercial Profiles

Grid (3 cols). One `CommercialProfileCard` per commercial arrangement (6 cards, one in draft). Each card:
- Profile name + ID
- Rows: Incoterm (bold), payment terms, bank, avg collection days (ok if ≤ 7d for L/C, ≤ 45d for T/T; warn otherwise), currency
- Footer: applicable market tags + active PO count
- Draft/incomplete profiles: dashed border + `opacity: 0.55`

### 7.4 Master Data Sentinel Queue

Consumes the existing `Alert` type from `lib/alerts.ts`. Vertical list; each item:
- Severity icon (warn/crit/info) with matching background
- Title + description (entity ID, what's missing/expiring)
- Right: entity ID tag + action button

Alert types and thresholds:
- **Cert expiry** — warn if `daysUntilExpiry < 60`; crit if `daysUntilExpiry < 14`
- **Missing cold protocol** — crit if a product has a market enabled but no cold treatment option defined for that market
- **Unconfigured commercial profile** — warn if a market has active containers but no commercial profile
- **High payment risk** — info if `avgPaymentDays > 30` on a consignment/open-account arrangement

---

## 8. Component Architecture

```
app/
├── containers/
│   └── page.tsx                  ← ContainersPage (kanban + table toggle)
├── purchase-orders/
│   ├── page.tsx                  ← POListPage
│   └── [id]/page.tsx             ← PODetailPage
├── importers/
│   ├── page.tsx
│   └── [id]/page.tsx             ← ImporterFichePage
├── producers/
│   ├── page.tsx
│   └── [id]/page.tsx             ← ProducerFichePage
└── compliance/
    └── page.tsx                  ← CompliancePage

components/
├── containers/
│   ├── ContainerKanban.tsx       ← 7-column kanban
│   ├── KanbanColumn.tsx
│   ├── ContainerCard.tsx         ← kanban card
│   └── ContainerListTable.tsx    ← grouped table view (update existing)
├── purchase-orders/
│   ├── POListTable.tsx
│   ├── PODetail.tsx
│   ├── POKpiStrip.tsx
│   ├── POResumenEjecutivo.tsx
│   ├── POLifecycleTimeline.tsx
│   └── PODocumentSection.tsx
├── entity-fiche/
│   ├── EntityFiche.tsx           ← shell (header + KPI + rel. history + children)
│   ├── EntityKpiStrip.tsx
│   ├── RelationshipHistory.tsx
│   ├── ImporterSpecificSections.tsx
│   └── ProducerSpecificSections.tsx
├── compliance/
│   ├── MarketRulePackCard.tsx
│   ├── ProductProfileCard.tsx
│   ├── CommercialProfileCard.tsx
│   └── SentinelQueue.tsx
└── shared/
    ├── VolumeTimeSeries.tsx      ← SVG line chart, props: { data: VolumeHistoryEntry[] }
    └── MiniSeasonBar.tsx         ← 12-month track, props: { start: string; end: string }
```

---

## 9. Mock Data Requirements

All surfaces use mock data from `lib/mock-data/`. Required additions/updates:

| File | Change |
|---|---|
| `containers.ts` | Update all `status` values to new 7-stage enum; distribute 8 containers across all 7 stages |
| `purchase-orders.ts` | Add `status`, `events[]`, `producerId`, `market` to each PO |
| `importers.ts` | Add `avgPaymentDays`, `volumeHistory[]`, `paymentHistory[]`, `marketProfile` to each importer |
| `producers.ts` | Add `volumeHistory[]`, `certifiedProducts[]`, `sagCertifications[]` to each producer |
| `types/index.ts` | Export `ContainerStatus`, `POStatus`, `POEvent`, `VolumeHistoryEntry`, `CertifiedProduct`, `SAGCertification` |
| `messages/en.json` + `es.json` | Replace 6-key `containers.statuses` block with 7 new keys |

---

## 10. Testing

- Unit test for `isActiveContainer` predicate with all 7 stages (expect false only for `'closed'`)
- Unit test for a `stageLabelKey(status: ContainerStatus): string` utility that returns the i18n key — guards against missing keys
- Component tests for `ContainerCard` (cold chain badge gating on `coldChain.required`), `POLifecycleTimeline` (correct mint fill width per event count), `SentinelQueue` (renders warn/crit/info variants)
- Integration test for `EntityFiche` shell: renders with importer children and with producer children without errors
- All existing tests must remain green after `ContainerStatus` enum change (no existing test asserts on specific status string values)

# Operations Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Operations Dashboard at `/` — the root route — replacing the current Next.js placeholder with a full 6-section dashboard driven by mock data.

**Architecture:** Server component `app/page.tsx` imports mock data and passes it as props to each dashboard section. `ShipmentMap`, `ContainerCard`, `KPITile`, and `ColdChainDashboardSection` are `'use client'` (they call `useTranslations` or have hover/animation). `KPIStrip` is RSC — it calls `getTranslations` server-side, maps each KPI to a translated label string, and passes that to `KPITile`. Data flows down; no shared state between sections.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (`@theme {}` tokens in `globals.css`), next-intl v4, react-simple-maps, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-04-28-agora-phase2-design.md`

**Demo date anchor:** `getTodayDemo()` → `2027-01-09T10:00:00-04:00`. All ETD values for the 8 active containers must be set relative to this date.

**Key token reference (globals.css `@theme {}`):**
- `bg-0` = `#070A12`, `bg-1` = `#0E1320`, `bg-2` = `#141A29`, `bg-3` = `#1B2235`
- `ink-1..4`, `mint-500` = `#00E696`, `severity-ok/info/watch/risk/crit`
- CSS vars (not Tailwind utilities): `--line-soft`, `--line-mid`, `--line-mint`, `--glass`
- Use Tailwind utilities everywhere: `bg-bg-0`, `text-ink-2`, `text-severity-crit`, `text-mint-500`, `border-line-soft` (Tailwind v4 auto-generates these from `@theme {}`)

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `components/map/ShipmentMap.tsx` | `'use client'` — world map SVG with animated arcs and hover tooltips |
| `components/kpi/KPITile.tsx` | `'use client'` — single KPI tile (label, value, delta, sparkline) |
| `components/kpi/KPIStrip.tsx` | Async RSC — translates labels server-side, renders 5-column grid of KPITiles |
| `components/dashboard/ContainerCard.tsx` | `'use client'` — 3-column card for action queue row |
| `components/dashboard/ActionQueue.tsx` | Ordered list of ContainerCards + section header + footer |
| `components/dashboard/AlertsRail.tsx` | Vertical list of alert rows |
| `components/cold-chain/ColdChainDashboardSection.tsx` | `'use client'` — wraps existing `ColdChainSummaryCard` for 2 reefer containers |
| `components/dashboard/ReadinessStrip.tsx` | Horizontal strip of readiness mini-cards |
| `components/dashboard/ClosedTable.tsx` | Last-week closed shipments table |
| `components/dashboard/PenaltyHeatmap.tsx` | Buyer × event-type avoidance heatmap |
| `__tests__/mock-data.ops.test.ts` | Validates all new mock data shapes |
| `__tests__/shipment-map.test.tsx` | Arc severity derivation + basic render |
| `__tests__/kpi-strip.test.tsx` | KPITile rendering + strip layout |
| `__tests__/container-card.test.tsx` | ContainerCard column content + severity bar |
| `__tests__/action-queue.test.tsx` | Ordering, card count, footer |
| `__tests__/alerts-rail.test.tsx` | Alert rows, severity pills |
| `__tests__/readiness-strip.test.tsx` | Cell count, color assignment, readiness % |
| `__tests__/bottom-sections.test.tsx` | ClosedTable coloring + PenaltyHeatmap cell density |
| `__tests__/ops-dashboard.test.tsx` | Integration: all sections render on page |

### Modified files
| File | Change |
|---|---|
| `types/index.ts` | Add `carrier`, `polCoords`, `podCoords`, `timelineNodes` to `Container`; `sparkline` to `KPI`; `AlertCategory`, `category`, `amountUsd` to `Alert`; add `ClosedContainer`, `PenaltyEventType`, `PenaltyAvoidedRow` |
| `lib/mock-data/containers.ts` | Add 5 containers, update 3 existing with coords/carrier/ETD, add `closedContainers` export |
| `lib/mock-data/kpis.ts` | Replace all 6 KPIs with 5 new ones |
| `lib/mock-data/importers.ts` | Rename 2 importers, add 4 new ones |
| `lib/mock-data/alerts.ts` | Add `category` + `amountUsd` to all existing; add 7 new alert records |
| `lib/mock-data/penalty-events.ts` | Add `penaltyAvoidedMatrix` export |
| `lib/mock-data/documents.ts` | Add ~13 doc entries per new container (5×13 = 65 new rows) |
| `components/layout/Header.tsx` | Add breadcrumb (left), search icon + bell (right) |
| `messages/en.json` | Add/replace `dashboard.*` and `nav.todaysQueue` keys |
| `messages/es.json` | Same in Spanish |
| `__tests__/mock-data.core.test.ts` | Update 3→8 container count assertion |
| `__tests__/layout.test.tsx` | Add bell + breadcrumb assertions |
| `app/page.tsx` | Full replacement — compose all dashboard sections |

---

## Task 1: Extend types

**Files:**
- Modify: `types/index.ts`
- Modify: `__tests__/types.test.ts`

- [ ] **Step 1: Write failing type tests**

Add to `__tests__/types.test.ts`:

```typescript
import type { Container, KPI, Alert, AlertCategory, ClosedContainer, PenaltyAvoidedRow, PenaltyEventType } from '@/types';

// Add inside the existing describe('types') block:

it('Container has Phase 2 map fields', () => {
  expectTypeOf<Container['carrier']>().toEqualTypeOf<string>();
  expectTypeOf<Container['polCoords']>().toEqualTypeOf<[number, number]>();
  expectTypeOf<Container['podCoords']>().toEqualTypeOf<[number, number]>();
});

it('Container has optional timelineNodes', () => {
  expectTypeOf<Container['timelineNodes']>().toEqualTypeOf<
    Array<{ tDay: number; status: 'done' | 'crit' | 'warn' | 'future' }> | undefined
  >();
});

it('KPI has sparkline field', () => {
  expectTypeOf<KPI['sparkline']>().toEqualTypeOf<number[]>();
});

it('Alert has category and optional amountUsd', () => {
  expectTypeOf<Alert['category']>().toEqualTypeOf<AlertCategory>();
  expectTypeOf<Alert['amountUsd']>().toEqualTypeOf<number | undefined>();
});

it('ClosedContainer has all required fields', () => {
  expectTypeOf<ClosedContainer['id']>().toEqualTypeOf<string>();
  expectTypeOf<ClosedContainer['cycledays']>().toEqualTypeOf<number>();
  expectTypeOf<ClosedContainer['deltaAvgDays']>().toEqualTypeOf<number>();
  expectTypeOf<ClosedContainer['penaltyUsd']>().toEqualTypeOf<number>();
});

it('PenaltyAvoidedRow has buyerName and counts map', () => {
  expectTypeOf<PenaltyAvoidedRow['buyerName']>().toEqualTypeOf<string>();
  expectTypeOf<PenaltyAvoidedRow['counts']>().toEqualTypeOf<Record<PenaltyEventType, number>>();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd agora-app && pnpm test -- --run types.test
```
Expected: TypeScript errors — `carrier`, `polCoords`, etc. not on `Container`.

- [ ] **Step 3: Add types to `types/index.ts`**

In the `Container` interface add:
```typescript
carrier: string;
polCoords: [number, number];
podCoords: [number, number];
timelineNodes?: Array<{ tDay: number; status: 'done' | 'crit' | 'warn' | 'future' }>;
```

In the `KPI` interface add:
```typescript
sparkline: number[];
```

Add `AlertCategory` type before `Alert`:
```typescript
export type AlertCategory =
  | 'shipment_doc' | 'market_compliance' | 'bl_switch_window'
  | 'payment_aging' | 'free_time_tracker';
```

In the `Alert` interface add:
```typescript
category: AlertCategory;
amountUsd?: number;
```

Add after `PenaltyEvent`:
```typescript
export interface ClosedContainer {
  id: string;
  buyerName: string;
  cycledays: number;
  deltaAvgDays: number;
  penaltyUsd: number;
}

export type PenaltyEventType =
  | 'refumigation' | 'phyto_reissue' | 'vgm_late' | 'dus_error'
  | 'bl_correction' | 'demurrage' | 'detention' | 'bank_discrepancy';

export interface PenaltyAvoidedRow {
  buyerName: string;
  counts: Record<PenaltyEventType, number>;
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test -- --run types.test
```
Expected: all 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add types/index.ts __tests__/types.test.ts
git commit -m "feat(types): add Phase 2 dashboard types"
```

---

## Task 2: Update container mock data

**Files:**
- Modify: `lib/mock-data/containers.ts`
- Modify: `__tests__/mock-data.core.test.ts`
- Create: `__tests__/mock-data.ops.test.ts`

- [ ] **Step 1: Write failing test for container count**

In `__tests__/mock-data.core.test.ts`, update the first two tests:

```typescript
it('has 8 active containers', () => {
  expect(containers.length).toBe(8);
});

it('all active containers have carrier, polCoords, podCoords', () => {
  for (const c of containers) {
    expect(typeof c.carrier).toBe('string');
    expect(Array.isArray(c.polCoords)).toBe(true);
    expect(c.polCoords.length).toBe(2);
    expect(Array.isArray(c.podCoords)).toBe(true);
  }
});
```

Also update the existing importer-referential-integrity test — it will fail until we add importers in Task 3. For now, disable it with `it.skip(...)` and restore in Task 3.

Create `__tests__/mock-data.ops.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { containers, closedContainers } from '@/lib/mock-data/containers';
import { kpis } from '@/lib/mock-data/kpis';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';

describe('containers — Phase 2 data', () => {
  it('closedContainers has 6 items', () => {
    expect(closedContainers.length).toBe(6);
  });

  it('closedContainers items have required shape', () => {
    for (const c of closedContainers) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.buyerName).toBe('string');
      expect(typeof c.cycledays).toBe('number');
      expect(typeof c.deltaAvgDays).toBe('number');
      expect(typeof c.penaltyUsd).toBe('number');
    }
  });

  it('MSCU-9920183 in closedContainers has penaltyUsd 1320', () => {
    const c = closedContainers.find(x => x.id === 'MSCU-9920183')!;
    expect(c).toBeDefined();
    expect(c.penaltyUsd).toBe(1320);
  });
});

describe('kpis — Phase 2', () => {
  it('has exactly 5 KPIs', () => {
    expect(kpis.length).toBe(5);
  });

  it('all KPIs have sparkline arrays', () => {
    for (const k of kpis) {
      expect(Array.isArray(k.sparkline)).toBe(true);
      expect(k.sparkline.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('avoided_penalties KPI has value 14200', () => {
    const k = kpis.find(x => x.id === 'avoided_penalties')!;
    expect(k.value).toBe(14_200);
  });
});

describe('penaltyAvoidedMatrix', () => {
  it('has 6 buyer rows', () => {
    expect(penaltyAvoidedMatrix.length).toBe(6);
  });

  it('each row has all 8 event types', () => {
    const events: string[] = [
      'refumigation','phyto_reissue','vgm_late','dus_error',
      'bl_correction','demurrage','detention','bank_discrepancy',
    ];
    for (const row of penaltyAvoidedMatrix) {
      for (const ev of events) {
        expect(typeof row.counts[ev as any]).toBe('number');
      }
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run mock-data
```
Expected: failures on container count, closedContainers, kpis, penaltyAvoidedMatrix.

- [ ] **Step 3: Update `lib/mock-data/containers.ts`**

Add `carrier`, `polCoords`, `podCoords`, and `timelineNodes` to the 3 existing containers. Then add 5 new containers. Use `getTodayDemo()` = `2027-01-09` as anchor.

**Coordinate reference:**
- San Antonio CL: `[-71.61, -33.59]`  
- Valparaíso CL: `[-71.62, -33.05]`
- Nhava Sheva IN: `[72.95, 18.95]`
- Yangshan CN: `[122.05, 30.63]`
- Shanghai CN: `[121.47, 31.23]`
- Shenzhen CN: `[114.06, 22.55]`
- Valencia ES: `[-0.38, 39.46]`
- Rotterdam NL: `[4.48, 51.92]`
- Jebel Ali AE: `[55.13, 25.02]`
- Los Angeles US: `[-118.27, 33.74]`

**Updates to existing 3 containers (add these fields):**

`MSCU-7842156`: `carrier: 'MSC'`, `polCoords: [-71.61, -33.59]`, `podCoords: [72.95, 18.95]`, `timelineNodes: [{tDay:-15,status:'done'},{tDay:-10,status:'done'},{tDay:-7,status:'done'},{tDay:-5,status:'done'},{tDay:-2,status:'crit'},{tDay:0,status:'future'}]`. ETD stays `2027-01-11` (T-2).

`MAEU-9182734`: `carrier: 'MAERSK'`, `polCoords: [-71.61, -33.59]`, `podCoords: [122.05, 30.63]`. Update `etd` to `'2027-01-14T22:00:00-04:00'` (T-5), `eta` to `'2027-02-08T08:00:00+08:00'`, `timelineNodes: [{tDay:-15,status:'done'},{tDay:-10,status:'done'},{tDay:-5,status:'done'},{tDay:0,status:'future'},{tDay:18,status:'future'}]`.

`CMAU-9281744`: `carrier: 'CMA CGM'`, `polCoords: [-71.61, -33.59]`, `podCoords: [114.06, 22.55]`. Update `etd` to `'2027-01-10T20:00:00-04:00'` (T-1), `status: 'docs_in_progress'`, `timelineNodes: [{tDay:-15,status:'done'},{tDay:-10,status:'done'},{tDay:-5,status:'done'},{tDay:-1,status:'crit'},{tDay:0,status:'future'}]`.

**5 new containers to add:**

```typescript
{
  id: 'OOLU-7710443',
  productId: 'table_grapes_red',
  productLabel: 'Table grapes (red)',
  commercialId: 'cif_open_account_30',
  laneProfileId: 'table_grapes_red.CN.cif_open_account_30',
  market: 'CN',
  polCode: 'CLSAI', polLabel: 'San Antonio',
  podCode: 'CNSHA', podLabel: 'Shanghai',
  importerId: 'IMP-CN-SUNYANG',
  producerId: 'PRD-VF-OHIGGINS',
  purchaseOrderId: 'PO-2026-0928',
  weightKg: 22_000,
  valueUsd: 94_600,
  carrier: 'OOCL',
  polCoords: [-71.61, -33.59], podCoords: [121.47, 31.23],
  etd: '2026-12-02T00:00:00-04:00',  // T+38
  eta: '2027-01-01T00:00:00+08:00',
  status: 'arrived',
  costAtRiskUsd: 1_080,
  timelineNodes: [{tDay:0,status:'done'},{tDay:18,status:'done'},{tDay:25,status:'crit'},{tDay:32,status:'crit'},{tDay:38,status:'crit'}],
},
{
  id: 'MSKU-3401827',
  productId: 'fresh_cherries',
  productLabel: 'Fresh cherries',
  commercialId: 'cif_lc_at_sight',
  laneProfileId: 'fresh_cherries.EU.cif_lc_at_sight',
  market: 'EU',
  polCode: 'CLVAP', polLabel: 'Valparaíso',
  podCode: 'ESVLC', podLabel: 'Valencia',
  importerId: 'IMP-EU-FRUTIMAR',
  producerId: 'PRD-VF-CURICO',
  purchaseOrderId: 'PO-2026-0941',
  weightKg: 20_000,
  valueUsd: 142_800,
  carrier: 'MAERSK',
  polCoords: [-71.62, -33.05], podCoords: [-0.38, 39.46],
  etd: '2027-01-13T18:00:00-04:00',  // T-4
  eta: '2027-02-06T08:00:00+01:00',
  status: 'docs_in_progress',
  costAtRiskUsd: 8_000,
  timelineNodes: [{tDay:-15,status:'done'},{tDay:-12,status:'warn'},{tDay:-10,status:'done'},{tDay:-8,status:'done'},{tDay:-4,status:'future'},{tDay:0,status:'future'}],
},
{
  id: 'HLXU-4427109',
  productId: 'almonds_in_shell',
  productLabel: 'Almonds in shell',
  commercialId: 'cif_open_account_30',
  laneProfileId: 'almonds_in_shell.MENA.cif_open_account_30',
  market: 'MENA',
  polCode: 'CLSAI', polLabel: 'San Antonio',
  podCode: 'AEJEA', podLabel: 'Jebel Ali',
  importerId: 'IMP-MENA-ALMADINA',
  producerId: 'PRD-VF-MAULE',
  purchaseOrderId: 'PO-2026-0935',
  weightKg: 23_000,
  valueUsd: 121_000,
  carrier: 'HAPAG-LLOYD',
  polCoords: [-71.61, -33.59], podCoords: [55.13, 25.02],
  etd: '2027-01-16T00:00:00-04:00',  // T-7 — in readiness window, alert is pre-departure
  eta: '2027-02-04T08:00:00+04:00',
  status: 'docs_in_progress',
  costAtRiskUsd: 540,
  timelineNodes: [{tDay:-15,status:'done'},{tDay:-10,status:'done'},{tDay:-7,status:'warn'},{tDay:0,status:'future'},{tDay:18,status:'future'}],
},
{
  id: 'MSCU-6128390',
  productId: 'walnut_kernels',
  productLabel: 'Walnut kernels',
  commercialId: 'cif_cad_at_sight',
  laneProfileId: 'walnut_kernels.US.cif_cad_at_sight',
  market: 'US',
  polCode: 'CLSAI', polLabel: 'San Antonio',
  podCode: 'USLAX', podLabel: 'Los Angeles',
  importerId: 'IMP-US-PACIFIC',   // renamed to 'Pacific Produce Inc.' in Task 3
  producerId: 'PRD-VF-MAULE',
  purchaseOrderId: 'PO-2026-0938',
  weightKg: 24_000,
  valueUsd: 184_500,
  carrier: 'COSCO',
  polCoords: [-71.61, -33.59], podCoords: [-118.27, 33.74],
  etd: '2026-12-18T00:00:00-04:00',  // T+22 (arrived)
  eta: '2027-01-07T08:00:00-08:00',
  status: 'arrived',
  costAtRiskUsd: 0,
  timelineNodes: [{tDay:-15,status:'done'},{tDay:-5,status:'done'},{tDay:0,status:'done'},{tDay:18,status:'done'},{tDay:22,status:'crit'},{tDay:25,status:'future'}],
},
{
  id: 'MSCU-2873561',
  productId: 'fresh_blueberries',
  productLabel: 'Fresh blueberries',
  commercialId: 'cif_lc_at_sight',
  laneProfileId: 'fresh_blueberries.EU.cif_lc_at_sight',
  market: 'EU',
  polCode: 'CLVAP', polLabel: 'Valparaíso',
  podCode: 'NLRTM', podLabel: 'Rotterdam',
  importerId: 'IMP-EU-HERITAGE',
  producerId: 'PRD-VF-BIOBIO',
  purchaseOrderId: 'PO-2026-0931',
  weightKg: 18_500,
  valueUsd: 156_200,
  carrier: 'MSC',
  polCoords: [-71.62, -33.05], podCoords: [4.48, 51.92],
  etd: '2027-01-15T18:00:00-04:00',  // T-6
  eta: '2027-02-10T08:00:00+01:00',
  status: 'docs_in_progress',
  costAtRiskUsd: 0,
  timelineNodes: [{tDay:-15,status:'done'},{tDay:-10,status:'done'},{tDay:-6,status:'done'},{tDay:0,status:'future'},{tDay:18,status:'future'}],
},
```

Also add `producerId: 'PRD-VF-BIOBIO'` — you will need to add this producer in `lib/mock-data/producers.ts` (copy the structure of `PRD-VF-MAULE`, region = 'Bío-Bío', products include `'fresh_blueberries'`).

**Add `closedContainers` export** at the bottom of `containers.ts`:

```typescript
import type { ClosedContainer } from '@/types';

export const closedContainers: ClosedContainer[] = [
  { id: 'MSCU-1102934', buyerName: 'Pacific Produce Inc.',          cycledays: 54, deltaAvgDays: -4, penaltyUsd: 0 },
  { id: 'CMAU-7741209', buyerName: 'Heritage European Fruits BV',   cycledays: 61, deltaAvgDays:  3, penaltyUsd: 0 },
  { id: 'MAEU-3398172', buyerName: 'Costco FreshCo',                cycledays: 58, deltaAvgDays:  0, penaltyUsd: 0 },
  { id: 'HLXU-2298110', buyerName: 'Mumbai Dry Fruits Pvt. Ltd.',   cycledays: 55, deltaAvgDays: -3, penaltyUsd: 0 },
  { id: 'MSCU-9920183', buyerName: 'Frutimar SL',                   cycledays: 67, deltaAvgDays:  9, penaltyUsd: 1_320 },
  { id: 'OOLU-4419220', buyerName: 'Shenzhen Imports Ltd.',         cycledays: 59, deltaAvgDays:  1, penaltyUsd: 0 },
];
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test -- --run mock-data
```
Expected: passes. Note: `mock-data.core.test.ts` may still fail on importer referential integrity (SKIP'd in step 1). The `mock-data.ops.test.ts` closedContainers + kpis tests will fail until Task 3 is done. That's OK — run only the container-count tests for now.

- [ ] **Step 5: Commit**

```bash
git add types/index.ts lib/mock-data/containers.ts __tests__/mock-data.core.test.ts __tests__/mock-data.ops.test.ts lib/mock-data/producers.ts
git commit -m "feat(data): add 5 active containers, coords, carrier, closedContainers"
```

---

## Task 3: Update supporting mock data

**Files:**
- Modify: `lib/mock-data/kpis.ts`
- Modify: `lib/mock-data/importers.ts`
- Modify: `lib/mock-data/alerts.ts`
- Modify: `lib/mock-data/penalty-events.ts`
- Modify: `lib/mock-data/documents.ts`

The tests from Task 2 (`mock-data.ops.test.ts`) cover KPIs and penalty matrix. No new test files needed here — just make the existing tests pass and restore the skipped integrity test.

- [ ] **Step 1: Replace `lib/mock-data/kpis.ts`**

```typescript
import type { KPI } from '@/types';

export const kpis: KPI[] = [
  { id: 'active_shipments',   labelKey: 'dashboard.kpiActiveShipments',   value: 12,     unit: 'count', deltaPct:  2,  sparkline: [4,6,5,8,7,9,10,12] },  // 12 matches design handoff (not spec's early placeholder value of 3)
  { id: 'avoided_penalties',  labelKey: 'dashboard.kpiAvoidedPenalties',  value: 14_200, unit: 'usd',   deltaPct:  18, sparkline: [3,5,4,7,6,9,8,14] },
  { id: 'demurrage_incurred', labelKey: 'dashboard.kpiDemurrageIncurred', value: 1_080,  unit: 'usd',   deltaPct: -55, sparkline: [9,8,7,6,5,4,3,1] },
  { id: 'avg_cycle_time',     labelKey: 'dashboard.kpiAvgCycleTime',      value: 58,     unit: 'days',  deltaPct: -5,  sparkline: [62,61,60,61,60,59,58,58] },
  { id: 'doc_auto_gen_rate',  labelKey: 'dashboard.kpiDocAutoGenRate',     value: 87,     unit: 'pct',   deltaPct:  5,  sparkline: [78,80,79,82,84,85,86,87] },
];
```

- [ ] **Step 2: Update `lib/mock-data/importers.ts`**

Rename the three existing importers and add 4 new ones:

```typescript
// Rename IMP-IN-MUMBAI:
{ id: 'IMP-IN-MUMBAI', name: 'Mumbai Dry Fruits Pvt. Ltd.', country: 'India', market: 'IN', activeContainers: 2, annualVolumeKg: 480_000, creditRating: 'A' },

// Rename IMP-CN-EAST:
{ id: 'IMP-CN-EAST', name: 'Shenzhen Imports Ltd.', country: 'China', market: 'CN', activeContainers: 1, annualVolumeKg: 310_000, creditRating: 'B+' },

// Rename IMP-US-PACIFIC (was 'Pacific Fresh Imports LLC'):
{ id: 'IMP-US-PACIFIC', name: 'Pacific Produce Inc.', country: 'United States', market: 'US', activeContainers: 1, annualVolumeKg: 250_000, creditRating: 'A' },

// New importers:
{ id: 'IMP-CN-SUNYANG',    name: 'Sun Yang Foods Co.',           country: 'China',        market: 'CN',   activeContainers: 1, annualVolumeKg: 280_000 },
{ id: 'IMP-EU-FRUTIMAR',   name: 'Frutimar SL',                  country: 'Spain',        market: 'EU',   activeContainers: 2, annualVolumeKg: 220_000, creditRating: 'A' },
{ id: 'IMP-MENA-ALMADINA', name: 'Al Madina Trading LLC',        country: 'UAE',          market: 'MENA', activeContainers: 1, annualVolumeKg: 180_000 },
{ id: 'IMP-EU-HERITAGE',   name: 'Heritage European Fruits BV',  country: 'Netherlands',  market: 'EU',   activeContainers: 1, annualVolumeKg: 160_000 },
```

After Task 3, the referential integrity test in `mock-data.core.test.ts` (restored in Step 6) must find `IMP-US-PACIFIC` in the importers list for `MSCU-6128390`. Since the ID is unchanged (only the name changed), the existing integrity check `impIds.has(c.importerId)` will still pass as long as `IMP-US-PACIFIC` remains in the importers array.

- [ ] **Step 3: Update `lib/mock-data/alerts.ts`**

Add `category` and `amountUsd` to the 4 existing alerts. Also mark ALT-002, ALT-003, and ALT-004 as `dismissed: true` — the alerts rail must show exactly 7 rows, and these 3 informational/resolved alerts from Phase 1 are treated as already-acknowledged:
```typescript
// ALT-001: category: 'shipment_doc', amountUsd: 1_200        (active — shown in rail)
// ALT-002: category: 'market_compliance', dismissed: true     (acknowledged cold-treatment info)
// ALT-003: category: 'market_compliance', dismissed: true     (excursion resolved)
// ALT-004: category: 'bl_switch_window', dismissed: true      (LC discrepancy already flagged)
```

Add 7 new alerts (one per container action queue row shown in the spec):
```typescript
{
  id: 'ALT-005', containerId: 'CMAU-9281744', severity: 'risk',
  titleKey: 'alerts.blMismatchTitle', bodyKey: 'alerts.blMismatchBody',
  raisedAt: '2027-01-09T06:00:00-04:00', raisedBy: 'bl_tracker',
  category: 'bl_switch_window', amountUsd: 1_500,
},
{
  id: 'ALT-006', containerId: 'OOLU-7710443', severity: 'crit',
  titleKey: 'alerts.demurrageAccruingTitle', bodyKey: 'alerts.demurrageAccruingBody',
  raisedAt: '2027-01-05T08:00:00-04:00', raisedBy: 'in_transit_telemetry_watcher',
  category: 'free_time_tracker', amountUsd: 1_080,
},
{
  id: 'ALT-007', containerId: 'MSKU-3401827', severity: 'risk',
  titleKey: 'alerts.aflatoxinRetestTitle', bodyKey: 'alerts.aflatoxinRetestBody',
  raisedAt: '2027-01-08T12:00:00-04:00', raisedBy: 'phyto_validator',
  category: 'market_compliance', amountUsd: 8_000,
},
{
  id: 'ALT-008', containerId: 'HLXU-4427109', severity: 'watch',
  titleKey: 'alerts.freeTimeEndingTitle', bodyKey: 'alerts.freeTimeEndingBody',
  raisedAt: '2027-01-07T08:00:00-04:00', raisedBy: 'in_transit_telemetry_watcher',
  category: 'free_time_tracker', amountUsd: 540,
},
{
  id: 'ALT-009', containerId: 'MSCU-6128390', severity: 'info',
  titleKey: 'alerts.paymentExpectedTitle', bodyKey: 'alerts.paymentExpectedBody',
  raisedAt: '2027-01-09T08:00:00-04:00', raisedBy: 'bl_tracker',
  category: 'payment_aging', amountUsd: undefined,
},
{
  id: 'ALT-010', containerId: 'MSCU-2873561', severity: 'info',
  titleKey: 'alerts.tracesNtPendingTitle', bodyKey: 'alerts.tracesNtPendingBody',
  raisedAt: '2027-01-08T14:00:00-04:00', raisedBy: 'phyto_validator',
  category: 'market_compliance', amountUsd: undefined,
},
```

Also add the missing i18n keys for these alert titles to `messages/en.json` and `messages/es.json` under the `"alerts"` section (done together in Task 13 — leave placeholders for now, the tests don't render alert strings directly).

- [ ] **Step 4: Update `lib/mock-data/penalty-events.ts`**

Add `penaltyAvoidedMatrix` export:

```typescript
import type { PenaltyAvoidedRow } from '@/types';

export const penaltyAvoidedMatrix: PenaltyAvoidedRow[] = [
  { buyerName: 'Mumbai Dry Fruits',  counts: { refumigation:3, phyto_reissue:2, vgm_late:1, dus_error:2, bl_correction:2, demurrage:1, detention:1, bank_discrepancy:3 } },
  { buyerName: 'Frutimar SL',        counts: { refumigation:1, phyto_reissue:2, vgm_late:2, dus_error:1, bl_correction:3, demurrage:2, detention:1, bank_discrepancy:2 } },
  { buyerName: 'Sun Yang Foods',     counts: { refumigation:2, phyto_reissue:1, vgm_late:1, dus_error:1, bl_correction:1, demurrage:4, detention:3, bank_discrepancy:1 } },
  { buyerName: 'Al Madina Trading',  counts: { refumigation:1, phyto_reissue:1, vgm_late:1, dus_error:2, bl_correction:2, demurrage:3, detention:2, bank_discrepancy:1 } },
  { buyerName: 'Pacific Produce',    counts: { refumigation:2, phyto_reissue:2, vgm_late:3, dus_error:2, bl_correction:1, demurrage:1, detention:1, bank_discrepancy:2 } },
  { buyerName: 'Costco FreshCo',     counts: { refumigation:1, phyto_reissue:1, vgm_late:2, dus_error:1, bl_correction:1, demurrage:1, detention:1, bank_discrepancy:2 } },
];
```

- [ ] **Step 5: Add documents for 5 new containers in `lib/mock-data/documents.ts`**

Append ~13 document records per new container. Use IDs `DOC-045` through `DOC-109`. Follow the existing pattern. Each new container needs at minimum: `commercial_invoice`, `packing_list`, `bill_of_lading`, `certificate_of_origin`, `phyto_certificate`, `fumigation_cert`, `health_cert`, `sag_export_auth`, `transport_document`, `insurance_certificate`, and a mix of `pending_review`/`missing` statuses to produce realistic readiness percentages.

Target readiness %:
- `MSKU-3401827`: ~86% (12/14 approved)
- `MSCU-2873561`: ~80% (10/13 approved, some missing)
- `MSCU-7842156`: already ~80% (existing)

For the 3 arrived containers (`OOLU-7710443`, `HLXU-4427109`, `MSCU-6128390`), all docs can be `approved` or `in_transit`.

- [ ] **Step 6: Restore skipped integrity test and run all mock-data tests**

```bash
pnpm test -- --run mock-data
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add lib/mock-data/ __tests__/mock-data.ops.test.ts __tests__/mock-data.core.test.ts
git commit -m "feat(data): update KPIs, importers, alerts, penalty matrix, documents for Phase 2"
```

---

## Task 4: Update Header

**Files:**
- Modify: `components/layout/Header.tsx`
- Modify: `__tests__/layout.test.tsx`

- [ ] **Step 1: Write failing tests for new header slots**

Add to the `describe('Header')` block in `__tests__/layout.test.tsx`:

```typescript
it('renders breadcrumb with Operations text', () => {
  render(wrap(<Header />));
  expect(screen.getByText('Operaciones')).toBeInTheDocument();
});

it('renders search icon button', () => {
  render(wrap(<Header />));
  expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
});

it('renders notification bell button', () => {
  render(wrap(<Header />));
  expect(screen.getByRole('button', { name: /notificaciones/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run layout.test
```

- [ ] **Step 3: Rewrite `components/layout/Header.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Bell, User } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  breadcrumb?: { parent: string; current: string };
}

export function Header({ breadcrumb }: HeaderProps) {
  const t = useTranslations();
  return (
    <header className="fixed top-0 left-14 right-0 h-14 z-30 glass border-b border-white/10 flex items-center px-4 gap-4">
      {/* Left: breadcrumb */}
      {breadcrumb && (
        <div className="flex items-center gap-1.5 font-mono text-xs tracking-wider mr-auto">
          <span className="text-ink-3 uppercase">{breadcrumb.parent}</span>
          <span className="text-ink-4">/</span>
          <span className="text-ink-2">{breadcrumb.current}</span>
        </div>
      )}
      {!breadcrumb && <div className="mr-auto" />}

      {/* Right cluster */}
      <button
        aria-label={t('common.search')}
        className="flex items-center justify-center h-7 w-7 rounded-md text-ink-3 hover:text-ink-1 hover:bg-white/5 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>

      <button
        aria-label={t('nav.notifications')}
        className="relative flex items-center justify-center h-[30px] w-[30px] rounded-md border border-white/10 text-ink-2 hover:text-ink-1 hover:border-white/20 transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('nav.userMenu')}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-white/5 transition-colors text-ink-2 hover:text-ink-1"
        >
          <div className="h-[30px] w-[30px] rounded-full bg-bg-2 border border-white/10 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-ink-2" />
          </div>
          <span className="text-sm">María José</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass border border-white/10">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="font-mono text-xs text-ink-3 mb-0.5">Valle Fresco S.A.</div>
              <div className="text-sm text-ink-1">María José Soto</div>
              <div className="text-xs text-ink-3">Logistics Manager</div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer">
            {t('settings.title')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

You'll need to add `"notifications": "Notificaciones"` (ES) and `"notifications": "Notifications"` (EN) to `messages/*/json` under `"nav"`. Do this now since the test needs it.

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run layout.test
```
Expected: all 4 Header tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/layout/Header.tsx __tests__/layout.test.tsx messages/
git commit -m "feat(header): add breadcrumb, search icon, notification bell"
```

---

## Task 5: Install packages + ShipmentMap

**Files:**
- Create: `components/map/ShipmentMap.tsx`
- Create: `__tests__/shipment-map.test.tsx`

- [ ] **Step 1: Install react-simple-maps**

```bash
cd agora-app && pnpm add react-simple-maps && pnpm add -D @types/react-simple-maps
```

- [ ] **Step 2: Write failing tests**

Create `__tests__/shipment-map.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { alerts } from '@/lib/mock-data/alerts';
import { containerSeverity } from '@/lib/utils/severity';

// We test the severity utility in isolation — the SVG map itself is hard to test in jsdom.

describe('containerSeverity', () => {
  it('returns crit when container has a crit alert', () => {
    const sev = containerSeverity('MSCU-7842156', alerts);
    expect(sev).toBe('crit');
  });

  it('returns ok when container has no alerts', () => {
    const sev = containerSeverity('NONEXISTENT-ID', alerts);
    expect(sev).toBe('ok');
  });

  it('returns worst severity across multiple alerts (watch + crit = crit)', () => {
    // MSCU-7842156 has ALT-001 (crit) and ALT-004 (watch)
    const sev = containerSeverity('MSCU-7842156', alerts);
    expect(sev).toBe('crit');
  });

  it('returns info when only info alert exists', () => {
    const sev = containerSeverity('MSCU-6128390', alerts);
    expect(sev).toBe('info');
  });
});

describe('ShipmentMap', () => {
  it('renders without crashing with container data', async () => {
    const { ShipmentMap } = await import('@/components/map/ShipmentMap');
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en as any}>
        <ShipmentMap containers={containers} alerts={alerts} />
      </NextIntlClientProvider>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run to verify failure**

```bash
pnpm test -- --run shipment-map.test
```

- [ ] **Step 4: Create `lib/utils/severity.ts`**

```typescript
import type { Severity, Alert } from '@/types';

const SEV_ORDER: Severity[] = ['ok', 'info', 'watch', 'risk', 'crit'];

export function worstSeverity(severities: Severity[]): Severity {
  return severities.reduce<Severity>((worst, s) =>
    SEV_ORDER.indexOf(s) > SEV_ORDER.indexOf(worst) ? s : worst,
    'ok'
  );
}

export function containerSeverity(containerId: string, alerts: Alert[]): Severity {
  const active = alerts.filter(a => a.containerId === containerId && !a.dismissed);
  if (!active.length) return 'ok';
  return worstSeverity(active.map(a => a.severity));
}
```

- [ ] **Step 5: Create `components/map/ShipmentMap.tsx`**

This is a `'use client'` component. Key implementation notes:

- Use `ComposableMap` + `Geographies` + `Geography` from `react-simple-maps`.
- `geography` prop = `"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"` (CDN — no local download needed).
- Projection: `"geoMercator"` with `projectionConfig={{ scale: 140, center: [20, 10] }}`.
- Map panel height: `380px`, `background: #080E1A`, `position: relative`, `overflow: hidden`.
- Overlay grid div: `position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none;`
- Arc paths: use SVG `<path>` elements rendered inside the `ComposableMap`'s `<svg>` via a custom `<Annotation>` or direct coordinate conversion. Use `useGeographies` hook or derive arc coordinates by projecting `polCoords`/`podCoords` through the same `geoMercator` projection.
  - Simpler approach: render arcs as absolutely-positioned SVG overlaid on the map using the same projection math: `x = ((lng + 180) / 360) * width`, `y = ((85 - lat) / 170) * height` (equirectangular). Match the `react-simple-maps` viewport dimensions.
  - For arcs, use a `<path>` with quadratic Bézier: `M x1,y1 Q mx,my x2,y2` where `my = min(y1,y2) - |x2-x1|*0.18 - 30`.
  - Animate with `stroke-dasharray` + `stroke-dashoffset` CSS animation on mount.
- Severity-to-arc-color: use `containerSeverity` from `lib/utils/severity.ts`. Map: `crit→#EF4444`, `risk→#F97316`, `watch→#F59E0B`, `info|ok→#00E696`.

Render the header bar (label + status counters) as a `<div>` overlay at the top of the panel.

Accept props: `containers: Container[]`, `alerts: Alert[]`.

- [ ] **Step 6: Run tests**

```bash
pnpm test -- --run shipment-map.test
```
Expected: all 5 tests pass.

- [ ] **Step 7: Commit**

```bash
git add components/map/ShipmentMap.tsx lib/utils/severity.ts __tests__/shipment-map.test.tsx
git commit -m "feat(map): add ShipmentMap with animated severity arcs"
```

---

## Task 6: KPIStrip + KPITile

**Files:**
- Create: `components/kpi/KPITile.tsx`
- Create: `components/kpi/KPIStrip.tsx`
- Create: `__tests__/kpi-strip.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/kpi-strip.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { KPITile } from '@/components/kpi/KPITile';
import { KPIStrip } from '@/components/kpi/KPIStrip';
import { kpis } from '@/lib/mock-data/kpis';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

// KPITile accepts a pre-translated `label` string — no i18n wrapper needed in tests.
describe('KPITile', () => {
  it('renders the KPI value', () => {
    render(<KPITile kpi={kpis[0]!} label="Active Shipments" />);
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('12');
  });

  it('renders unit label', () => {
    render(<KPITile kpi={kpis[0]!} label="Active Shipments" />);
    expect(screen.getByTestId('kpi-unit')).toBeInTheDocument();
  });

  it('renders sparkline svg', () => {
    render(<KPITile kpi={kpis[0]!} label="Active Shipments" />);
    expect(screen.getByTestId('kpi-sparkline')).toBeInTheDocument();
  });

  it('renders positive delta in mint color class', () => {
    const kpi = kpis.find(k => (k.deltaPct ?? 0) > 0)!;
    render(<KPITile kpi={kpi} label="Test KPI" />);
    const delta = screen.getByTestId('kpi-delta');
    expect(delta.className).toMatch(/mint|ok/);
  });
});

describe('KPIStrip', () => {
  it('renders exactly 5 tiles', () => {
    render(wrap(<KPIStrip kpis={kpis} />));
    expect(screen.getAllByTestId('kpi-value').length).toBe(5);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run kpi-strip.test
```

- [ ] **Step 3: Create `components/kpi/KPITile.tsx`**

`KPITile` is `'use client'` because it calls `useTranslations`. However, the label has already been translated by the parent `KPIStrip` (async RSC) and passed as a `label: string` prop — so `KPITile` does NOT call `useTranslations` directly. The `'use client'` directive is needed only if you add client-side interactivity (e.g., hover tooltip). For a static tile, it can be a pure RSC accepting pre-translated props.

Use this interface instead:
```tsx
'use client';  // include only if adding hover state; omit if fully static
import type { KPI } from '@/types';

interface Props { kpi: KPI; label: string }

function Sparkline({ points, id }: { points: number[]; id: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const W = 80, H = 24;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map(v => H - ((v - min) / range) * (H - 2) - 1);
  const gradId = `sg-${id}`;
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i] ?? 0}`).join(' ');
  const fill = `${d} L ${W},${H} L 0,${H} Z`;
  return (
    <svg
      data-testid="kpi-sparkline"
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', right: 12, bottom: 10, opacity: 0.7 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E696" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00E696" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradId})`} />
      <polyline
        points={xs.map((x, i) => `${x},${ys[i] ?? 0}`).join(' ')}
        fill="none" stroke="#00E696" strokeWidth="1.5"
      />
    </svg>
  );
}

export function KPITile({ kpi, label }: Props) {
  const deltaPos = (kpi.deltaPct ?? 0) > 0;
  const deltaNeg = (kpi.deltaPct ?? 0) < 0;
  const unitLabels: Record<string, string> = { usd: 'USD', pct: '%', count: 'FCL', days: 'DAYS', minutes: 'MIN' };
  const valueDisplay = kpi.unit === 'usd' ? kpi.value.toLocaleString() : String(kpi.value);

  return (
    <div
      className="relative overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-bg-1 px-4 py-3.5 cursor-pointer hover:border-[var(--line-mid)] transition-colors"
    >
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3 mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span data-testid="kpi-value" className="font-mono font-semibold text-[30px] leading-none text-ink-1">
          {valueDisplay}
        </span>
        <span data-testid="kpi-unit" className="font-mono text-[12px] text-ink-3 tracking-[0.1em]">
          {unitLabels[kpi.unit] ?? kpi.unit.toUpperCase()}
        </span>
      </div>
      {kpi.deltaPct !== undefined && (
        <div
          data-testid="kpi-delta"
          className={`mt-2 font-mono text-[11px] flex items-center gap-1.5 ${
            deltaPos ? 'text-mint-500' : deltaNeg ? 'text-severity-risk' : 'text-ink-3'
          }`}
        >
          <span>{kpi.deltaPct > 0 ? '↑' : '↓'} {Math.abs(kpi.deltaPct)}%</span>
        </div>
      )}
      <Sparkline points={kpi.sparkline} id={kpi.id} />
    </div>
  );
}
```

- [ ] **Step 4: Create `components/kpi/KPIStrip.tsx`**

`KPIStrip` is an async server component — it calls `getTranslations` and resolves each KPI's label server-side before passing it to the client `KPITile`.

```tsx
import { getTranslations } from 'next-intl/server';
import type { KPI } from '@/types';
import { KPITile } from './KPITile';

export async function KPIStrip({ kpis }: { kpis: KPI[] }) {
  const t = await getTranslations();
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpis.map(k => <KPITile key={k.id} kpi={k} label={t(k.labelKey)} />)}
    </div>
  );
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm test -- --run kpi-strip.test
```
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add components/kpi/ __tests__/kpi-strip.test.tsx
git commit -m "feat(kpi): add KPITile and KPIStrip with sparklines"
```

---

## Task 7: ContainerCard

**Files:**
- Create: `components/dashboard/ContainerCard.tsx`
- Create: `__tests__/container-card.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/container-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';
import { alerts } from '@/lib/mock-data/alerts';
import { ContainerCard } from '@/components/dashboard/ContainerCard';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

const walnuts = containers.find(c => c.id === 'MSCU-7842156')!;
const alertForWalnuts = alerts.filter(a => a.containerId === 'MSCU-7842156');

describe('ContainerCard', () => {
  it('renders container ID', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByText('MSCU-7842156')).toBeInTheDocument();
  });

  it('renders buyer name from importers lookup', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByText('Mumbai Dry Fruits Pvt. Ltd.')).toBeInTheDocument();
  });

  it('renders carrier and route', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByTestId('card-route')).toHaveTextContent('CLSAI → INNSA · MSC');
  });

  it('renders timeline', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByTestId('timeline-mini')).toBeInTheDocument();
  });

  it('severity left bar has crit color class for critical container', () => {
    const { container } = render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    const bar = container.querySelector('[data-testid="sev-bar"]');
    expect(bar?.className).toMatch(/crit/);
  });

  it('renders cost at risk amount', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByTestId('cost-at-risk')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run container-card.test
```

- [ ] **Step 3: Create `components/dashboard/ContainerCard.tsx`**

This is a `'use client'` component (hover state for row highlight).

Props: `container: Container`, `alerts: Alert[]`, `importers: Importer[]`.

Structure:
```
<div class="ccard relative"> 
  <div data-testid="sev-bar" class="absolute left-0 top-3 bottom-3 w-[3px] rounded-sm bg-severity-{sev}" />
  <div class="grid grid-cols-[200px_1fr_220px] gap-4 items-stretch pl-3 py-3.5 pr-4">
    <!-- LEFT: container ID, buyer, market chip, route -->
    <!-- CENTER: timeline, alert row -->
    <!-- RIGHT: cost at risk, alert title, due badge -->
  </div>
</div>
```

**Left column:**
- Container ID: `font-mono font-semibold text-[14px] text-ink-1`
- Buyer name: resolved via `importers.find(i => i.id === container.importerId)?.name ?? '—'`. 12px, `text-ink-2`, truncated.
- Market chip: small pill with market-specific colors (IN=amber-tint, EU=blue-tint, CN=red-tint, MENA=amber-tint, US=purple-tint).
- Route: `data-testid="card-route"`, `{polCode} → {podCode} · {carrier}`, 10px mono `text-ink-4`.

**Center column:**
Mini timeline `data-testid="timeline-mini"`. Height 38px. Render:
- Base line: full-width 2px `bg-[var(--line-soft)]`
- Progress fill: mint gradient from `tDay = -15` to `now` (clamp currentDay to axis bounds). Width = `((nowDayPosition + 15) / 60) * 100%`.
- Circle nodes from `container.timelineNodes`: position each at `((tDay + 15) / 60) * 100%`. Color by status: `done=mint-500`, `crit=severity-crit`, `warn=severity-watch`, `future=ink-4 border`.
- Now circle: 12px, `bg-mint-500`, with `box-shadow: 0 0 0 2px var(--bg-2), 0 0 12px #00E696`.
- Top labels: ETD label (left), ETA label (right), 9px mono `text-ink-4`.

Current day from ETD: `differenceInCalendarDays(getTodayDemo(), new Date(container.etd))`. Negative = not yet departed.

Alert row below timeline: severity dot (6px circle, severity color) + first alert's title key (translated, 12px) + agent label right-aligned (9.5px mono `text-ink-4`).

**Right column** (right-aligned, left border `1px var(--line-soft)`):
- `COST AT RISK` label: 9px mono `text-ink-4`.
- USD amount: 22px mono bold, colored by worst severity. If `costAtRiskUsd === 0` or no amount, show `—`.
- Alert title text: 12px `text-ink-1`, right-aligned.
- Due badge: from first alert's due. Check `amountUsd` field and construct due string in component. "Due NOW" pulses `text-severity-crit`; other times use `text-severity-risk` / `text-severity-watch`.

Use `tDayFrom` from `lib/utils/dates.ts` and `containerSeverity` from `lib/utils/severity.ts`.

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run container-card.test
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ContainerCard.tsx __tests__/container-card.test.tsx
git commit -m "feat(dashboard): add ContainerCard with timeline and severity bar"
```

---

## Task 8: ActionQueue

**Files:**
- Create: `components/dashboard/ActionQueue.tsx`
- Create: `__tests__/action-queue.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/action-queue.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';
import { alerts } from '@/lib/mock-data/alerts';
import { ActionQueue } from '@/components/dashboard/ActionQueue';

// ActionQueue filters to active (non-arrived) containers and sorts by urgency.
const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ActionQueue', () => {
  it('renders 5 container cards', () => {
    render(wrap(<ActionQueue containers={containers} alerts={alerts} importers={importers} />));
    // 5 cards = the 5 containers spec'd for the action queue
    expect(screen.getAllByTestId('timeline-mini').length).toBe(5);
  });

  it('renders section header "Needs action"', () => {
    render(wrap(<ActionQueue containers={containers} alerts={alerts} importers={importers} />));
    expect(screen.getByText(/Needs action/i)).toBeInTheDocument();
  });

  it('renders footer with "View all containers" link', () => {
    render(wrap(<ActionQueue containers={containers} alerts={alerts} importers={importers} />));
    expect(screen.getByRole('link', { name: /View all containers/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run action-queue.test
```

- [ ] **Step 3: Create `components/dashboard/ActionQueue.tsx`**

Props: `containers: Container[]`, `alerts: Alert[]`, `importers: Importer[]`.

Ordering logic: the action queue shows exactly these 5 containers in this order (hardcoded by urgency, not dynamically sorted — the spec defines the fixed order):
1. `OOLU-7710443` (Due NOW / critical)
2. `MSCU-7842156` (Due in 18h / critical)
3. `MSKU-3401827` (action / no due)
4. `CMAU-9281744` (Due in 36h / action)
5. `HLXU-4427109` (Due in 3d / watch)

Filter to those 5 IDs from `containers`, preserve that order. Pass each container's alerts (filtered by `containerId`) and importers to `ContainerCard`.

Section header: left = `"Needs action"` (bold) + `"now"` (muted); right = severity counts computed from `alerts.filter(a => a.containerId in queueIds)`.

Card wrapper: `div.queue` flex column, gap 10px, padding 12px.

Footer: show `"SHOWING 5 OF {total} ACTIVE"` (left, 11px mono `text-ink-4`) + `<Link href="/containers">View all containers →</Link>` (right, mint).

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run action-queue.test
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ActionQueue.tsx __tests__/action-queue.test.tsx
git commit -m "feat(dashboard): add ActionQueue with ordered ContainerCards"
```

---

## Task 9: AlertsRail

**Files:**
- Create: `components/dashboard/AlertsRail.tsx`
- Create: `__tests__/alerts-rail.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/alerts-rail.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { alerts } from '@/lib/mock-data/alerts';
import { AlertsRail } from '@/components/dashboard/AlertsRail';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('AlertsRail', () => {
  it('renders 7 alert rows', () => {
    render(wrap(<AlertsRail alerts={alerts} />));
    // 7 non-dismissed alerts from the 10 total
    expect(screen.getAllByTestId('alert-row').length).toBe(7);
  });

  it('renders section header with "Live alerts"', () => {
    render(wrap(<AlertsRail alerts={alerts} />));
    expect(screen.getByText(/Live alerts/i)).toBeInTheDocument();
  });

  it('renders CRITICAL severity pill for crit alert', () => {
    render(wrap(<AlertsRail alerts={alerts} />));
    const pills = screen.getAllByTestId('sev-pill');
    expect(pills.some(p => p.textContent?.match(/CRITICAL/i))).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run alerts-rail.test
```

- [ ] **Step 3: Create `components/dashboard/AlertsRail.tsx`**

Props: `alerts: Alert[]`.

Show only the 7 alerts spec'd (filter to `!alert.dismissed`, sort: crit first, then by `raisedAt` desc — match the 7-row order from the spec).

Each row `data-testid="alert-row"`:
```
[category label 9px mono text-ink-3]   [sev-pill data-testid="sev-pill"]
[container ID mono · description 12px]
[due string 10px mono]                 [USD amount if present 10px mono text-ink-3]
```

Severity pill colors (background + border + text):
- `crit`: `rgba(239,68,68,0.08)` bg, `rgba(239,68,68,0.4)` border, `text-severity-crit`
- `risk`: `rgba(249,115,22,0.08)` bg, `rgba(249,115,22,0.4)` border, `text-severity-risk`
- `watch`: `rgba(245,158,11,0.08)` bg, `rgba(245,158,11,0.4)` border, `text-severity-watch`
- `info`: `rgba(59,130,246,0.08)` bg, `rgba(59,130,246,0.4)` border, `text-severity-info`

Section header: left = `"Live alerts"`; right = `"{n} OPEN"` mono `text-ink-3`.

Row separator: `border-b border-[var(--line-soft)]`; last row has no border.

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run alerts-rail.test
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/AlertsRail.tsx __tests__/alerts-rail.test.tsx
git commit -m "feat(dashboard): add AlertsRail with severity pills"
```

---

## Task 10: ColdChainDashboardSection

**Files:**
- Create: `components/cold-chain/ColdChainDashboardSection.tsx`
- Modify: `__tests__/cold-chain-ui.test.tsx`

- [ ] **Step 1: Write failing test**

Add to `__tests__/cold-chain-ui.test.tsx`:

```typescript
import { ColdChainDashboardSection } from '@/components/cold-chain/ColdChainDashboardSection';

describe('ColdChainDashboardSection', () => {
  it('renders 2 reefer cards from the active containers', () => {
    const reeferContainers = containers.filter(c => c.coldChain?.required === true);
    render(wrap(<ColdChainDashboardSection containers={reeferContainers} />));
    // Cherries (MAEU-9182734) and Grapes (CMAU-9281744) both have coldChain.required = true
    expect(screen.getAllByTestId('cold-chain-summary').length).toBe(2);
  });

  it('renders section header with snowflake label', () => {
    const reeferContainers = containers.filter(c => c.coldChain?.required === true);
    render(wrap(<ColdChainDashboardSection containers={reeferContainers} />));
    expect(screen.getByText(/Cold Chain Status/i)).toBeInTheDocument();
  });

  it('renders nothing when no reefer containers', () => {
    const { container } = render(wrap(<ColdChainDashboardSection containers={[]} />));
    expect(container.firstChild).toBeNull();
  });
});
```

Note: `CMAU-9281744` in Phase 1 data had `coldChain: grapesTrace`. After Task 2 we changed its ETD but kept `coldChain`. Verify this container still has `coldChain` after your edits in Task 2.

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run cold-chain-ui.test
```

- [ ] **Step 3: Create `components/cold-chain/ColdChainDashboardSection.tsx`**

```tsx
'use client';
import { Snowflake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { ColdChainSummaryCard } from './ColdChainSummaryCard';

export function ColdChainDashboardSection({ containers }: { containers: Container[] }) {
  const t = useTranslations('dashboard');
  if (!containers.length) return null;

  return (
    <section className="rounded-xl border border-[rgba(0,230,150,0.25)] bg-bg-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,230,150,0.15)]">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-1">
          <Snowflake className="h-3.5 w-3.5 text-mint-500" />
          {t('coldChainStatus')}
        </div>
        <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
          {containers.length} REEFERS · IN TREATMENT
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {containers.map(c => (
          <div key={c.id} data-testid="cold-chain-summary">
            <ColdChainSummaryCard trace={c.coldChain!} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run cold-chain-ui.test
```

- [ ] **Step 5: Commit**

```bash
git add components/cold-chain/ColdChainDashboardSection.tsx __tests__/cold-chain-ui.test.tsx
git commit -m "feat(cold-chain): add ColdChainDashboardSection for dashboard"
```

---

## Task 11: ReadinessStrip

**Files:**
- Create: `components/dashboard/ReadinessStrip.tsx`
- Create: `__tests__/readiness-strip.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/readiness-strip.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { documents } from '@/lib/mock-data/documents';
import { importers } from '@/lib/mock-data/importers';
import { ReadinessStrip } from '@/components/dashboard/ReadinessStrip';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ReadinessStrip', () => {
  it('renders 6 mini-cards for containers with ETD in T-7→T0 window', () => {
    render(wrap(<ReadinessStrip containers={containers} documents={documents} importers={importers} />));
    expect(screen.getAllByTestId('ready-mini').length).toBe(6);
  });

  it('each mini-card has exactly 15 readiness cells', () => {
    render(wrap(<ReadinessStrip containers={containers} documents={documents} importers={importers} />));
    const allCells = screen.getAllByTestId('ready-cell');
    // 6 cards × 15 cells = 90
    expect(allCells.length).toBe(90);
  });

  it('shows readiness % per card', () => {
    render(wrap(<ReadinessStrip containers={containers} documents={documents} importers={importers} />));
    const pcts = screen.getAllByTestId('ready-pct');
    expect(pcts.length).toBe(6);
    // Each shows a percentage
    for (const p of pcts) {
      expect(p.textContent).toMatch(/\d+%/);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run readiness-strip.test
```

- [ ] **Step 3: Create `components/dashboard/ReadinessStrip.tsx`**

Props: `containers: Container[]`, `documents: DocumentInstance[]`, `importers: Importer[]`.

**Filtering:**
```typescript
const today = getTodayDemo();
const window = containers.filter(c => {
  const daysUntilEtd = differenceInCalendarDays(new Date(c.etd), today);
  return daysUntilEtd >= 0 && daysUntilEtd <= 7;
});
```
This will return 6 containers with the ETD values set in Task 2 (MSCU-7842156 T-2, MAEU-9182734 T-5, CMAU-9281744 T-1, MSKU-3401827 T-4, MSCU-2873561 T-6, and one more with ETD ≤T-0... wait — see note below).

> **Note**: Verify that after Task 2, exactly 6 containers fall in `daysUntilEtd ∈ [0,7]`. If not, adjust one container's ETD slightly. The 6 containers with ETDs Jan 9–16 relative to demo-today Jan 9 are: CMAU-9281744 (Jan 10, 1 day), MSCU-7842156 (Jan 11, 2 days), MSKU-3401827 (Jan 13, 4 days), MAEU-9182734 (Jan 14, 5 days), MSCU-2873561 (Jan 15, 6 days), and one more. Check whether any ETD = Jan 16 (7 days). If only 5 qualify, set one more container's ETD to Jan 16.

**Per-card readiness:**
```typescript
const docs = documents.filter(d => d.containerId === container.id);
const total = docs.length || 1;
const approved = docs.filter(d => d.status === 'approved').length;
const pct = Math.round((approved / total) * 100);
```

**Readiness cells (15 total):**
Map each document to a cell. If `docs.length < 15`, pad to 15 with gray `k` cells. Cell colors:
- `approved` → `bg-severity-ok` (mint)
- `pending_review` → `bg-severity-watch` (amber)
- `missing` / `rejected` → `bg-severity-crit` (red)
- everything else → `bg-ink-4 opacity-40` (gray)

Each cell: `data-testid="ready-cell"`, `aspect-ratio: 1`, `rounded-sm`.

Each card: `data-testid="ready-mini"`, 200px wide, `bg-bg-2`, `border border-[var(--line-soft)]`, `rounded-lg`, `p-3`.

Card layout:
```
[container ID 11px mono bold]       [pct% data-testid="ready-pct", severity-colored]
[buyer 11px text-ink-3]
[5-col grid of 15 readiness cells]
[T- label]                          [ETD date]
```

The strip itself: `flex gap-2.5 overflow-x-auto px-3.5 py-3.5`.

- [ ] **Step 4: Run tests**

```bash
pnpm test -- --run readiness-strip.test
```

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/ReadinessStrip.tsx __tests__/readiness-strip.test.tsx
git commit -m "feat(dashboard): add ReadinessStrip with 15-cell readiness grid"
```

---

## Task 12: ClosedTable + PenaltyHeatmap

**Files:**
- Create: `components/dashboard/ClosedTable.tsx`
- Create: `components/dashboard/PenaltyHeatmap.tsx`
- Create: `__tests__/bottom-sections.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/bottom-sections.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { closedContainers } from '@/lib/mock-data/containers';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';
import { ClosedTable } from '@/components/dashboard/ClosedTable';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ClosedTable', () => {
  it('renders 6 data rows', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    expect(screen.getAllByTestId('closed-row').length).toBe(6);
  });

  it('renders positive deltaAvgDays in watch color', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    // MSCU-9920183 has deltaAvgDays: 9 (slower than avg = watch)
    const frutimar = screen.getByTestId('delta-MSCU-9920183');
    expect(frutimar.className).toMatch(/watch/);
  });

  it('renders negative deltaAvgDays in ok (mint) color', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    // MSCU-1102934 has deltaAvgDays: -4
    const pacific = screen.getByTestId('delta-MSCU-1102934');
    expect(pacific.className).toMatch(/ok|mint/);
  });

  it('renders penaltyUsd > 0 in crit color', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    const penalty = screen.getByTestId('penalty-MSCU-9920183');
    expect(penalty.className).toMatch(/crit/);
  });
});

describe('PenaltyHeatmap', () => {
  it('renders 6 buyer rows', () => {
    render(wrap(<PenaltyHeatmap matrix={penaltyAvoidedMatrix} />));
    expect(screen.getAllByTestId('heatmap-row').length).toBe(6);
  });

  it('renders 8 column headers', () => {
    render(wrap(<PenaltyHeatmap matrix={penaltyAvoidedMatrix} />));
    expect(screen.getAllByTestId('heatmap-col-header').length).toBe(8);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run bottom-sections.test
```

- [ ] **Step 3: Create `components/dashboard/ClosedTable.tsx`**

Props: `rows: ClosedContainer[]`.

Table columns: CONTAINER · BUYER · CYCLE · Δ AVG · PENALTY.

Each row `data-testid="closed-row"`:
- Container ID: mono `text-ink-1`
- Buyer: `text-ink-2`, truncated
- Cycle: mono right-aligned
- Δ AVG: `data-testid="delta-{id}"`, class `text-severity-ok` if negative, `text-severity-watch` if positive, `text-ink-4` if 0. Display as `+3d` / `-4d` / `—`.
- Penalty: `data-testid="penalty-{id}"`. If `penaltyUsd > 0`: class `text-severity-crit`, `font-mono font-semibold`, display `$1,320`. If 0: class `text-ink-4`, display `—`.

Column header row: font-mono 9.5px uppercase `text-ink-3`, `bg-white/[0.015]`.
Row separator: `border-b border-[var(--line-soft)]`, last row no border.

- [ ] **Step 4: Create `components/dashboard/PenaltyHeatmap.tsx`**

Props: `matrix: PenaltyAvoidedRow[]`.

Column header labels (display): `['Refumig.', 'Phyto Reissue', 'VGM Late', 'DUS Error', 'BL Correction', 'Demurrage', 'Detention', 'Bank Discrep.']`

Column header keys (in order): `['refumigation', 'phyto_reissue', 'vgm_late', 'dus_error', 'bl_correction', 'demurrage', 'detention', 'bank_discrepancy']`

Grid: `grid-template-columns: 110px repeat(8, 1fr)`, gap 3px.

Column headers `data-testid="heatmap-col-header"`: rotated `-38deg`, 9px mono, `text-ink-3`.

Each buyer row `data-testid="heatmap-row"`:
- Row label: `text-ink-2`, 10.5px, right-padded.
- 8 cells, each `aspect-ratio: 2.2`, `rounded-sm`. Density color by value:
  - 0: `bg-bg-2 text-ink-4`
  - 1: `rgba(0,230,150,0.10)` bg, `text-ink-3`
  - 2: `rgba(0,230,150,0.22)` bg, `text-ink-2`
  - 3: `rgba(0,230,150,0.40)` bg, `text-mint-300`
  - 4+: `bg-mint-500 text-bg-0 font-semibold`

Footer: legend swatches (LESS → MORE) + `OPEN PERFORMANCE →` link to `/performance`.

- [ ] **Step 5: Run tests**

```bash
pnpm test -- --run bottom-sections.test
```

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/ClosedTable.tsx components/dashboard/PenaltyHeatmap.tsx __tests__/bottom-sections.test.tsx
git commit -m "feat(dashboard): add ClosedTable and PenaltyHeatmap"
```

---

## Task 13: i18n keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/es.json`

No new test — i18n is covered by existing `__tests__/i18n.test.ts`.

- [ ] **Step 1: Update `messages/en.json`**

Under `"nav"`, add:
```json
"todaysQueue": "Today's queue",
"notifications": "Notifications"
```

Under `"dashboard"`, **remove** stale keys: `title`, `actionQueue`, `alertsRail`, `weekReadiness`, `closedLastWeek`, `penaltyHeatmap`, `kpiActiveContainers`, `kpiCostAtRisk`, `kpiOnTimeDocs`, `kpiAlertsOpen`, `kpiCutoffNext24h`, `kpiColdTreatmentCompliance`.

**Add** new keys:
```json
"mapLabel": "ACTIVE SHIPMENTS GLOBE · LIVE",
"mapHint": "HOVER AN ARC · CLICK TO OPEN CONTAINER",
"inTransit": "IN TRANSIT",
"watch": "WATCH",
"action": "ACTION",
"critical": "CRITICAL",
"onTrack": "ON-TRACK",
"needsAction": "Needs action",
"now": "now",
"liveAlerts": "Live alerts",
"open": "OPEN",
"showingOf": "SHOWING {shown} OF {total} ACTIVE",
"viewAllContainers": "View all containers",
"reefersInTreatment": "{n} REEFERS · IN TREATMENT",
"thisWeekReadiness": "This week · container readiness",
"readinessWindow": "T-7 → T0 WINDOW · {n} CONTAINERS",
"lastWeekClosed": "Last week · closed",
"shipmentsAvg": "{n} SHIPMENTS · AVG {avg}D",
"penaltiesAvoided": "Penalties avoided · trailing 30d",
"buyerEventAvoided": "BUYER × EVENT · USD AVOIDED",
"openPerformance": "OPEN PERFORMANCE",
"kpiActiveShipments": "Active Shipments",
"kpiAvoidedPenalties": "Avoided Penalties · Wk",
"kpiDemurrageIncurred": "Demurrage Incurred · Wk",
"kpiAvgCycleTime": "Avg Cycle Time",
"kpiDocAutoGenRate": "Doc Auto-Gen Rate",
"costAtRisk": "COST AT RISK",
"dueNow": "Due NOW"
```

Under `"alerts"`, add keys for the 5 new alert types added in Task 3:
```json
"blMismatchTitle": "BL draft consignee mismatch with LC",
"blMismatchBody": "Switch window closes T+2.",
"demurrageAccruingTitle": "Demurrage accruing",
"demurrageAccruingBody": "6 days × USD 180. Buyer dispute on quality.",
"aflatoxinRetestTitle": "Aflatoxin re-test recommended",
"aflatoxinRetestBody": "CoA shows 1.7 ppb total — within EU limit but margin <1 ppb.",
"freeTimeEndingTitle": "Free time ends in 3 days",
"freeTimeEndingBody": "Container still at JAFZA. Buyer on holiday.",
"paymentExpectedTitle": "Payment expected today",
"paymentExpectedBody": "Avg 9 days for this buyer. No SWIFT advice yet.",
"tracesNtPendingTitle": "TRACES NT entry pending validation",
"tracesNtPendingBody": "Carrier IGM filed OK."
```

- [ ] **Step 2: Update `messages/es.json`** with the same keys translated to Spanish. Suggested translations:

```json
"nav": { "todaysQueue": "Cola de hoy", "notifications": "Notificaciones" }

"dashboard": {
  "mapLabel": "GLOBE DE ENVÍOS ACTIVOS · EN VIVO",
  "mapHint": "HOVER UN ARCO · CLICK PARA ABRIR CONTENEDOR",
  "needsAction": "Necesita acción",
  "now": "ahora",
  "liveAlerts": "Alertas en vivo",
  "open": "ABIERTAS",
  "showingOf": "MOSTRANDO {shown} DE {total} ACTIVOS",
  "viewAllContainers": "Ver todos los contenedores",
  "kpiActiveShipments": "Envíos Activos",
  "kpiAvoidedPenalties": "Penalidades Evitadas · Sem.",
  "kpiDemurrageIncurred": "Demurrage Incurrido · Sem.",
  "kpiAvgCycleTime": "Tiempo Ciclo Prom.",
  "kpiDocAutoGenRate": "Tasa Auto-Gen Docs",
  "costAtRisk": "COSTO EN RIESGO",
  "dueNow": "Vence AHORA",
  "lastWeekClosed": "Semana pasada · cerrados",
  "penaltiesAvoided": "Penalidades evitadas · últimos 30d",
  "openPerformance": "ABRIR RENDIMIENTO",
  // ... (fill in remaining keys following the same pattern)
}
```

- [ ] **Step 3: Run i18n tests**

```bash
pnpm test -- --run i18n.test
```
Expected: pass (no missing keys — the test checks key existence).

- [ ] **Step 4: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add Phase 2 dashboard keys, remove stale KPI keys"
```

---

## Task 14: Wire up `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`
- Create: `__tests__/ops-dashboard.test.tsx`

- [ ] **Step 1: Write failing integration test**

```typescript
// __tests__/ops-dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';

// Mock the 'use client' components to avoid jsdom SVG issues
vi.mock('@/components/map/ShipmentMap', () => ({
  ShipmentMap: () => <div data-testid="shipment-map" />,
}));

vi.mock('@/components/dashboard/ContainerCard', () => ({
  ContainerCard: () => <div data-testid="timeline-mini" />,
}));

import OperationsDashboard from '@/app/page';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('Operations Dashboard page', () => {
  it('renders shipment map section', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getByTestId('shipment-map')).toBeInTheDocument();
  });

  it('renders KPI strip with 5 tiles', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getAllByTestId('kpi-value').length).toBe(5);
  });

  it('renders action queue section header', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getByText(/Needs action/i)).toBeInTheDocument();
  });

  it('renders live alerts section header', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getByText(/Live alerts/i)).toBeInTheDocument();
  });

  it('renders last week closed table', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getAllByTestId('closed-row').length).toBe(6);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test -- --run ops-dashboard.test
```

- [ ] **Step 3: Rewrite `app/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { containers } from '@/lib/mock-data/containers';
import { closedContainers } from '@/lib/mock-data/containers';
import { kpis } from '@/lib/mock-data/kpis';
import { alerts } from '@/lib/mock-data/alerts';
import { importers } from '@/lib/mock-data/importers';
import { documents } from '@/lib/mock-data/documents';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';
import { ShipmentMap } from '@/components/map/ShipmentMap';
import { KPIStrip } from '@/components/kpi/KPIStrip';
import { ActionQueue } from '@/components/dashboard/ActionQueue';
import { AlertsRail } from '@/components/dashboard/AlertsRail';
import { ColdChainDashboardSection } from '@/components/cold-chain/ColdChainDashboardSection';
import { ReadinessStrip } from '@/components/dashboard/ReadinessStrip';
import { ClosedTable } from '@/components/dashboard/ClosedTable';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';

export default async function OperationsDashboard() {
  const t = await getTranslations('dashboard');
  const reefers = containers.filter(c => c.coldChain?.required === true);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8 min-h-screen bg-bg-0">

      {/* §3 Shipment Map */}
      <ShipmentMap containers={containers} alerts={alerts} />

      {/* §4 KPI Strip */}
      <KPIStrip kpis={kpis} />

      {/* §5 Action Queue + Alerts Rail */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'stretch' }}>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <ActionQueue containers={containers} alerts={alerts} importers={importers} />
        </section>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <AlertsRail alerts={alerts} />
        </section>
      </div>

      {/* §6 Cold Chain — conditional */}
      {reefers.length > 0 && <ColdChainDashboardSection containers={reefers} />}

      {/* §7 This Week Readiness */}
      <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
          <span className="text-sm font-medium text-ink-1">{t('thisWeekReadiness')}</span>
          <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
            T-7 → T0 WINDOW
          </span>
        </div>
        <ReadinessStrip containers={containers} documents={documents} importers={importers} />
      </section>

      {/* §8 Last Week Closed + Penalty Heatmap */}
      <div className="grid grid-cols-2 gap-4">
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
            <span className="text-sm font-medium text-ink-1">{t('lastWeekClosed')}</span>
          </div>
          <ClosedTable rows={closedContainers} />
        </section>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
            <span className="text-sm font-medium text-ink-1">{t('penaltiesAvoided')}</span>
          </div>
          <PenaltyHeatmap matrix={penaltyAvoidedMatrix} />
        </section>
      </div>
    </div>
  );
}
```

Also update `components/layout/AppShell.tsx` (or `app/layout.tsx`) to pass breadcrumb to `Header` on the dashboard route. Pass `breadcrumb={{ parent: t('nav.operations'), current: t('nav.todaysQueue') }}` to `<Header>` from the root layout or page.

> **Implementation note:** Since `Header` is rendered in `app/layout.tsx`, pass the breadcrumb dynamically by either making `AppShell` accept a breadcrumb prop threaded from the page, or by reading the pathname in `Header` to decide which breadcrumb to show. The simplest approach: add logic to `Header` to detect `pathname === '/'` and render the Operations breadcrumb automatically.

- [ ] **Step 4: Run all tests**

```bash
pnpm test
```
Expected: all tests pass (74 Phase 1 + ~40 Phase 2 new tests).

- [ ] **Step 5: Build check**

```bash
pnpm build
```
Expected: zero TypeScript errors, zero build errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx __tests__/ops-dashboard.test.tsx
git commit -m "feat(dashboard): wire up Operations Dashboard — Phase 2 complete"
```

---

## DoD Checklist (from spec)

- [ ] `pnpm add react-simple-maps && pnpm add -D @types/react-simple-maps` completed
- [ ] Map renders ≥7 animated arcs; reefer arcs pulse; motion pips animate; hover tooltip works
- [ ] KPI strip: exactly 5 tiles, sparklines are 80×24px absolute positioned bottom-right
- [ ] Action queue: 5 cards ordered by urgency, each with T-day timeline + cost-at-risk + due badge
- [ ] Alerts rail: matches action queue height, 7 rows with correct severity pills
- [ ] Cold chain section: renders for 2 reefer containers, hidden when none
- [ ] Readiness strip: 6 mini-cards with 15-cell 5×3 readiness grid per card
- [ ] Closed table: 6 rows, Δ AVG colored correctly, non-zero penalty in red
- [ ] Penalty heatmap: buyer × event matrix with density color scale + OPEN PERFORMANCE link
- [ ] Header: search is magnifying-glass icon only; breadcrumb shows `OPERATIONS / Today's queue`
- [ ] No page-title block — map starts immediately below header
- [ ] Stale `dashboard.*` i18n keys removed; all new keys present in both locales
- [ ] `pnpm build` passes with zero TypeScript errors

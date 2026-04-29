# Agora Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four Phase 3 surfaces — containers kanban, PO list + detail, importer/producer EntityFiche, and compliance page — on top of an enriched 7-stage container status model and enriched mock data.

**Architecture:** Tasks 1–3 establish shared foundations (types, i18n, mock data) that unblock four independent surface tracks. EntityFiche uses a shell + children composition pattern. All Phase 3 routes already exist in the sidebar — no nav work needed.

**Tech Stack:** Next.js 16.x App Router, React 19, TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`), Tailwind v4 (`@theme {}` in `app/globals.css`), `@base-ui/react`, `next-intl v4.11.0`, Vitest + `@testing-library/react`

---

## File Map

### Modified files
- `agora-app/types/index.ts` — add ContainerStatus export, POStatus, POEvent, VolumeHistoryEntry, CertifiedProduct, SAGCertification; enrich PurchaseOrder, Importer, Producer
- `agora-app/messages/en.json` — replace 6-key containers.statuses with 7 new keys
- `agora-app/messages/es.json` — same in Spanish
- `agora-app/lib/mock-data/containers.ts` — update status values to new 7-stage enum, distribute 8 containers
- `agora-app/lib/mock-data/purchase-orders.ts` — add status, events, producerId, market
- `agora-app/lib/mock-data/importers.ts` — add avgPaymentDays, volumeHistory, paymentHistory, marketProfile
- `agora-app/lib/mock-data/producers.ts` — add volumeHistory, certifiedProducts, sagCertifications
- `agora-app/components/dashboard/ActionQueue.tsx:28` — replace `status !== 'arrived'` with ACTIVE_STATUSES predicate
- `agora-app/app/containers/page.tsx` — replace simple table with kanban toggle page

### Created files
- `agora-app/lib/containers.ts` — `isActiveContainer` predicate + `stageLabelKey` utility
- `agora-app/components/shared/VolumeTimeSeries.tsx` — SVG line chart
- `agora-app/components/shared/MiniSeasonBar.tsx` — 12-month bar
- `agora-app/components/containers/ContainersPageClient.tsx` — client wrapper with search/filter/toggle
- `agora-app/components/containers/ContainerKanban.tsx` — 7-column kanban
- `agora-app/components/containers/KanbanColumn.tsx` — single kanban column
- `agora-app/components/containers/ContainerCard.tsx` — kanban card
- `agora-app/components/purchase-orders/POListTable.tsx`
- `agora-app/components/purchase-orders/PODetail.tsx`
- `agora-app/components/purchase-orders/POKpiStrip.tsx`
- `agora-app/components/purchase-orders/POResumenEjecutivo.tsx`
- `agora-app/components/purchase-orders/POLifecycleTimeline.tsx`
- `agora-app/components/purchase-orders/PODocumentSection.tsx`
- `agora-app/components/entity-fiche/EntityFiche.tsx`
- `agora-app/components/entity-fiche/EntityKpiStrip.tsx`
- `agora-app/components/entity-fiche/RelationshipHistory.tsx`
- `agora-app/components/entity-fiche/ImporterSpecificSections.tsx`
- `agora-app/components/entity-fiche/ProducerSpecificSections.tsx`
- `agora-app/components/compliance/MarketRulePackCard.tsx`
- `agora-app/components/compliance/ProductProfileCard.tsx`
- `agora-app/components/compliance/CommercialProfileCard.tsx`
- `agora-app/components/compliance/SentinelQueue.tsx`
- `agora-app/app/purchase-orders/page.tsx`
- `agora-app/app/purchase-orders/[id]/page.tsx`
- `agora-app/app/importers/page.tsx`
- `agora-app/app/importers/[id]/page.tsx`
- `agora-app/app/producers/page.tsx`
- `agora-app/app/producers/[id]/page.tsx`
- `agora-app/app/compliance/page.tsx`
- `agora-app/__tests__/container-status.test.ts`
- `agora-app/__tests__/phase3-components.test.tsx`
- `agora-app/__tests__/entity-fiche.test.tsx`

---

## Task 1: Types & data model

**Files:**
- Modify: `agora-app/types/index.ts`
- Create: `agora-app/lib/containers.ts`
- Create: `agora-app/__tests__/container-status.test.ts`

- [ ] **Step 1: Write failing tests**

Create `agora-app/__tests__/container-status.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ACTIVE_STATUSES, isActiveContainer, stageLabelKey } from '@/lib/containers';
import type { Container } from '@/types';

const makeContainer = (status: Container['status']): Container =>
  ({ id: 'X', status } as unknown as Container);

describe('isActiveContainer', () => {
  it('returns true for all active stages', () => {
    const active = ['planning', 'preparation', 'documentation', 'in_transit', 'customs_release', 'delivery_payment'] as const;
    active.forEach(s => expect(isActiveContainer(makeContainer(s))).toBe(true));
  });

  it('returns false only for closed', () => {
    expect(isActiveContainer(makeContainer('closed'))).toBe(false);
  });
});

describe('stageLabelKey', () => {
  it('returns the correct i18n key for each status', () => {
    expect(stageLabelKey('planning')).toBe('containers.statuses.planning');
    expect(stageLabelKey('preparation')).toBe('containers.statuses.preparation');
    expect(stageLabelKey('documentation')).toBe('containers.statuses.documentation');
    expect(stageLabelKey('in_transit')).toBe('containers.statuses.in_transit');
    expect(stageLabelKey('customs_release')).toBe('containers.statuses.customs_release');
    expect(stageLabelKey('delivery_payment')).toBe('containers.statuses.delivery_payment');
    expect(stageLabelKey('closed')).toBe('containers.statuses.closed');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && pnpm test -- container-status
```

Expected: FAIL — cannot find module `@/lib/containers`

- [ ] **Step 3: Update `types/index.ts`**

Replace the inline union on `Container.status` and add new types. Find `Container` interface (line ~180) and make these changes:

**Replace** the `status` field:
```ts
// Before:
status: 'planning' | 'docs_in_progress' | 'in_treatment' | 'at_sea' | 'arrived' | 'cleared';

// After:
status: ContainerStatus;
```

**Add at top of file**, after the `Market` type:
```ts
export type ContainerStatus =
  | 'planning'
  | 'preparation'
  | 'documentation'
  | 'in_transit'
  | 'customs_release'
  | 'delivery_payment'
  | 'closed'

export type POStatus = 'draft' | 'confirmed' | 'in_fulfillment' | 'delivered' | 'cancelled'

export type POEvent = {
  date: string
  type: 'confirmed' | 'container_assigned' | 'bl_issued' | 'docs_submitted' | 'delivered' | 'payment_received'
  note?: string
}

export type VolumeHistoryEntry = {
  season: string
  volumeKg: number
}

export type CertifiedProduct = {
  productId: string
  name: string
  hsCode: string
  seasonStart: string
  seasonEnd: string
  requiresColdChain: boolean
  coldProtocol?: string
  enabledMarkets: Market[]
}

export type SAGCertification = {
  id: string
  name: string
  expiryDate: string
  daysUntilExpiry: number
}
```

**Replace** the `PurchaseOrder` interface:
```ts
export interface PurchaseOrder {
  id: string;
  importerId: string;
  producerId: string;
  productId: ProductId;
  market: Market;
  quantityKg: number;
  incotermPaymentId: IncotermPaymentId;
  valueUsd: number;
  issuedAt: string;
  deliveryWindow: { from: string; to: string };
  containerIds: string[];
  status: POStatus;
  events: POEvent[];
}
```

**Replace** the `Importer` interface:
```ts
export interface Importer {
  id: string;
  name: string;
  country: string;
  market: Market;
  activeContainers: number;
  annualVolumeKg: number;
  creditRating?: string;
  avgPaymentDays: number;
  volumeHistory: VolumeHistoryEntry[];
  paymentHistory: Array<{
    poId: string;
    method: string;
    bank: string;
    amount: number;
    daysToCollect?: number;
    status: 'paid' | 'pending';
  }>;
  marketProfile: {
    inspectionAuthority: string[];
    digitalSystem: string;
    requiredRegistrations: string[];
    labelLanguages: string[];
    coldTreatmentOptions?: string[];
  };
}
```

**Replace** the `Producer` interface:
```ts
export interface Producer {
  id: string;
  name: string;
  region: string;
  products: ProductId[];
  sagId: string;
  activeContainers: number;
  avgPaymentDays?: number;
  volumeHistory: VolumeHistoryEntry[];
  certifiedProducts: CertifiedProduct[];
  sagCertifications: SAGCertification[];
}
```

- [ ] **Step 4: Create `agora-app/lib/containers.ts`**

```ts
import type { Container, ContainerStatus } from '@/types';

export const ACTIVE_STATUSES: ContainerStatus[] = [
  'planning', 'preparation', 'documentation',
  'in_transit', 'customs_release', 'delivery_payment',
];

export const isActiveContainer = (c: Container): boolean =>
  ACTIVE_STATUSES.includes(c.status);

export const stageLabelKey = (status: ContainerStatus): string =>
  `containers.statuses.${status}`;

export const STAGES: Array<{ status: ContainerStatus; label: string; color: string }> = [
  { status: 'planning',          label: 'Planning',           color: '#8B5CF6' },
  { status: 'preparation',       label: 'Preparation',        color: '#00E696' },
  { status: 'documentation',     label: 'Documentation',      color: '#F59E0B' },
  { status: 'in_transit',        label: 'In Transit',         color: '#7DD3FC' },
  { status: 'customs_release',   label: 'Customs & Release',  color: '#F97316' },
  { status: 'delivery_payment',  label: 'Delivery & Payment', color: '#3B82F6' },
  { status: 'closed',            label: 'Closed',             color: '#64748B' },
];
```

- [ ] **Step 5: Run tests**

```bash
cd agora-app && pnpm test -- container-status
```

Expected: PASS (7 tests)

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: errors only in mock-data files (status values not yet updated) — that's fine.

- [ ] **Step 7: Commit**

```bash
git add agora-app/types/index.ts agora-app/lib/containers.ts agora-app/__tests__/container-status.test.ts
git commit -m "feat(phase3): add ContainerStatus, PO/Importer/Producer type enrichments"
```

---

## Task 2: i18n + ContainerStatus migration

**Files:**
- Modify: `agora-app/messages/en.json`
- Modify: `agora-app/messages/es.json`
- Modify: `agora-app/components/dashboard/ActionQueue.tsx` (line 28)
- Modify: `agora-app/lib/mock-data/containers.ts` — status values only

- [ ] **Step 1: Update `messages/en.json`**

Find the `containers.statuses` block and replace it:

```json
"statuses": {
  "planning": "Planning",
  "preparation": "Preparation",
  "documentation": "Documentation",
  "in_transit": "In Transit",
  "customs_release": "Customs & Release",
  "delivery_payment": "Delivery & Payment",
  "closed": "Closed"
}
```

- [ ] **Step 2: Update `messages/es.json`**

Same block in Spanish:

```json
"statuses": {
  "planning": "Planificación",
  "preparation": "Preparación",
  "documentation": "Documentación",
  "in_transit": "En Tránsito",
  "customs_release": "Aduana y Liberación",
  "delivery_payment": "Entrega y Pago",
  "closed": "Cerrado"
}
```

- [ ] **Step 3: Fix `ActionQueue.tsx` line 28**

```ts
// Before:
const activeCount = containers.filter(c => c.status !== 'arrived').length;

// After:
import { isActiveContainer } from '@/lib/containers';
// ...
const activeCount = containers.filter(isActiveContainer).length;
```

Note: add the import at the top of the file.

- [ ] **Step 4: Update container status values in mock data**

In `agora-app/lib/mock-data/containers.ts`, update `status` fields to use new enum values. Map old → new:

| Old value | New value |
|---|---|
| `planning` | `planning` (unchanged) |
| `docs_in_progress` | `documentation` |
| `in_treatment` | `preparation` |
| `at_sea` | `in_transit` |
| `arrived` | `customs_release` |
| `cleared` | `delivery_payment` |

The `closed` stage is for ClosedContainer (already separate type), not Container.

- [ ] **Step 5: Run full test suite**

```bash
cd agora-app && pnpm test
```

Expected: all existing tests pass. If `action-queue.test.tsx` fails because it checks `activeCount` against a hardcoded number, update the expected count to match the number of containers that are not `closed`.

- [ ] **Step 6: Commit**

```bash
git add agora-app/messages/en.json agora-app/messages/es.json agora-app/components/dashboard/ActionQueue.tsx agora-app/lib/mock-data/containers.ts
git commit -m "feat(phase3): migrate ContainerStatus to 7-stage enum, update i18n keys"
```

---

## Task 3: Mock data enrichment

**Files:**
- Modify: `agora-app/lib/mock-data/containers.ts` — distribute 8 containers across all 7 stages
- Modify: `agora-app/lib/mock-data/purchase-orders.ts`
- Modify: `agora-app/lib/mock-data/importers.ts`
- Modify: `agora-app/lib/mock-data/producers.ts`

The demo date anchor is `2027-01-09T10:00:00-04:00`.

- [ ] **Step 1: Distribute containers across all 7 stages**

In `containers.ts`, ensure at least one container in each stage. Current containers can be reassigned. Aim for distribution: 1 planning, 1 preparation, 1 documentation, 2 in_transit, 1 customs_release, 1 delivery_payment, 1 closed. The `closed` container should be added to the `closedContainers` export (it's a `ClosedContainer` type), not the main `containers` array. Assign 7 active containers (one per active stage) plus 1 in `delivery_payment` for variety.

- [ ] **Step 2: Enrich purchase-orders.ts**

For each of the 8 POs, add:
- `status`: use `'in_fulfillment'` for most, `'delivered'` for 1-2
- `producerId`: match to a producer from `producers.ts` (e.g., `'PRD-VF-MAULE'`)
- `market`: derive from the importer's market
- `events`: 3–5 events per PO. Example:

```ts
events: [
  { date: '2026-10-15', type: 'confirmed', note: 'Signed by both parties' },
  { date: '2026-11-20', type: 'container_assigned', note: 'MSCU-7842156 assigned' },
  { date: '2027-01-05', type: 'bl_issued' },
]
```

- [ ] **Step 3: Enrich importers.ts**

For each of the 9 importers, add:

```ts
avgPaymentDays: 12,   // varies per importer (8-45)
volumeHistory: [
  { season: '2023/24', volumeKg: 480_000 },
  { season: '2024/25', volumeKg: 580_000 },
  { season: '2025/26', volumeKg: 665_000 },
  { season: '2026/27', volumeKg: 720_000 },
],
paymentHistory: [
  { poId: 'PO-2026-0142', method: 'L/C a la vista', bank: 'HSBC Shanghai', amount: 142_500, daysToCollect: 7, status: 'paid' },
  { poId: 'PO-2026-0157', method: 'CAD', bank: 'Citi Mumbai', amount: 215_000, status: 'pending' },
],
marketProfile: {
  inspectionAuthority: ['GACC', 'CIQ'],   // from market-rules.ts data
  digitalSystem: 'SAG-GACC',
  requiredRegistrations: ['GACC Decree 280 facility', 'orchard registration'],
  labelLanguages: ['Mandarin', 'English'],
  coldTreatmentOptions: ['15d @ -0.5°C'],
},
```

Set `marketProfile` values to match each importer's `market` (CN, IN, US, EU, MENA) using data from `lib/mock-data/market-rules.ts`.

- [ ] **Step 4: Enrich producers.ts**

For each of the 5 producers, add:

```ts
avgPaymentDays: 30,
volumeHistory: [
  { season: '2023/24', volumeKg: 14_200 },
  { season: '2024/25', volumeKg: 18_800 },
  { season: '2025/26', volumeKg: 21_500 },
  { season: '2026/27', volumeKg: 22_800 },
],
certifiedProducts: [
  {
    productId: 'walnuts_in_shell',
    name: 'Walnuts in Shell',
    hsCode: '0802.31',
    seasonStart: 'Sep',
    seasonEnd: 'Jan',
    requiresColdChain: false,
    enabledMarkets: ['IN', 'EU'],
  },
],
sagCertifications: [
  {
    id: 'SAG-MAU-00412',
    name: 'Export Authorization — Walnuts',
    expiryDate: '2027-08-31',
    daysUntilExpiry: 234,   // relative to 2027-01-09
  },
  {
    id: 'SAG-MAU-00413',
    name: 'Orchard Registration',
    expiryDate: '2027-02-15',
    daysUntilExpiry: 37,   // warn: < 60d
  },
],
```

Include at least one `SAGCertification` with `daysUntilExpiry < 60` and one with `daysUntilExpiry < 14` across the dataset.

- [ ] **Step 5: Run TypeScript and tests**

```bash
cd agora-app && pnpm tsc --noEmit && pnpm test
```

Expected: 0 type errors, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add agora-app/lib/mock-data/
git commit -m "feat(phase3): enrich mock data — containers, POs, importers, producers"
```

---

## Task 4: Shared UI components

**Files:**
- Create: `agora-app/components/shared/VolumeTimeSeries.tsx`
- Create: `agora-app/components/shared/MiniSeasonBar.tsx`

- [ ] **Step 1: Create `VolumeTimeSeries.tsx`**

This renders a SVG line chart inside a `div` with `height: 180px; width: 100%`. The y-axis is tightly scaled to data range (not from 0).

```tsx
'use client';

import type { VolumeHistoryEntry } from '@/types';

interface Props {
  data: VolumeHistoryEntry[];
}

export function VolumeTimeSeries({ data }: Props) {
  if (data.length === 0) return null;

  const W = 500;
  const H = 130;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

  const minV = Math.min(...data.map(d => d.volumeKg));
  const maxV = Math.max(...data.map(d => d.volumeKg));
  const range = maxV - minV || 1;
  const paddedMin = minV - range * 0.1;
  const paddedMax = maxV + range * 0.1;
  const paddedRange = paddedMax - paddedMin;

  const xStep = (W - PAD.left - PAD.right) / Math.max(data.length - 1, 1);
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - (v - paddedMin) / paddedRange);

  const points = data.map((d, i) => `${toX(i)},${toY(d.volumeKg)}`).join(' ');
  const areaPoints = [
    `${toX(0)},${H - PAD.bottom}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.volumeKg)}`),
    `${toX(data.length - 1)},${H - PAD.bottom}`,
  ].join(' ');

  const formatVol = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1_000)}k`;

  return (
    <div style={{ width: '100%', height: '180px' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E696" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00E696" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((t, i) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * t;
          const val = paddedMax - paddedRange * t;
          return (
            <g key={i}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#ffffff0d" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#ffffff50">
                {formatVol(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#vol-grad)" />

        {/* Line */}
        <polyline points={points} fill="none" stroke="#00E696" strokeWidth="1.8" strokeLinejoin="round" />

        {/* Past dots */}
        {data.slice(0, -1).map((d, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(d.volumeKg)}
            r="3"
            fill="none"
            stroke="#00E696"
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}

        {/* Glowing composite dot — most recent */}
        {(() => {
          const last = data[data.length - 1]!;
          const lx = toX(data.length - 1);
          const ly = toY(last.volumeKg);
          return (
            <g>
              <circle cx={lx} cy={ly} r="7" fill="#00E696" opacity="0.15" />
              <circle cx={lx} cy={ly} r="4" fill="#00E696" opacity="0.35" />
              <circle cx={lx} cy={ly} r="2.5" fill="#00E696" />
            </g>
          );
        })()}

        {/* X axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={toX(i)}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize="10"
            fill="#ffffff60"
          >
            {d.season}
          </text>
        ))}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Create `MiniSeasonBar.tsx`**

12-month bar with mint fill for the season window. Month abbreviations: Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec.

```tsx
interface Props {
  start: string;   // month abbreviation, e.g. 'Nov'
  end: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MiniSeasonBar({ start, end }: Props) {
  const sIdx = MONTHS.indexOf(start);
  const eIdx = MONTHS.indexOf(end);
  const active = MONTHS.map((_, i) => {
    if (sIdx <= eIdx) return i >= sIdx && i <= eIdx;
    return i >= sIdx || i <= eIdx;   // wraps year boundary (e.g. Nov–Jan)
  });

  return (
    <div style={{ display: 'flex', gap: '2px', height: '8px' }}>
      {MONTHS.map((m, i) => (
        <div
          key={m}
          title={m}
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: active[i] === true ? '#00E696' : '#ffffff18',
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write and run tests for shared components**

Add to `agora-app/__tests__/phase3-components.test.tsx` (create the file if it doesn't exist yet):

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VolumeTimeSeries } from '@/components/shared/VolumeTimeSeries';
import { MiniSeasonBar } from '@/components/shared/MiniSeasonBar';
import type { VolumeHistoryEntry } from '@/types';

describe('VolumeTimeSeries', () => {
  it('renders without error for valid data', () => {
    const data: VolumeHistoryEntry[] = [
      { season: '2023/24', volumeKg: 480_000 },
      { season: '2024/25', volumeKg: 580_000 },
    ];
    const { container } = render(<VolumeTimeSeries data={data} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('2023/24')).toBeInTheDocument();
  });

  it('renders nothing for empty data', () => {
    const { container } = render(<VolumeTimeSeries data={[]} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('MiniSeasonBar', () => {
  it('renders 12 month segments', () => {
    const { container } = render(<MiniSeasonBar start="Nov" end="Jan" />);
    expect(container.querySelectorAll('div > div').length).toBe(12);
  });

  it('marks Nov, Dec, Jan as active for a Nov–Jan season (wraps year boundary)', () => {
    const { container } = render(<MiniSeasonBar start="Nov" end="Jan" />);
    const segments = Array.from(container.querySelectorAll('div > div')) as HTMLElement[];
    // MONTHS index: Nov=10, Dec=11, Jan=0
    expect(segments[10]?.style.backgroundColor).toBe('rgb(0, 230, 150)');  // #00E696
    expect(segments[11]?.style.backgroundColor).toBe('rgb(0, 230, 150)');
    expect(segments[0]?.style.backgroundColor).toBe('rgb(0, 230, 150)');
    // Feb (index 1) should NOT be active
    expect(segments[1]?.style.backgroundColor).not.toBe('rgb(0, 230, 150)');
  });
});
```

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: all 4 shared component tests pass.

- [ ] **Step 4: TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep "shared/"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/shared/ agora-app/__tests__/phase3-components.test.tsx
git commit -m "feat(phase3): add VolumeTimeSeries and MiniSeasonBar shared components"
```

---

## Task 5: Containers kanban page

**Files:**
- Create: `agora-app/components/containers/ContainerCard.tsx`
- Create: `agora-app/components/containers/KanbanColumn.tsx`
- Create: `agora-app/components/containers/ContainerKanban.tsx`
- Modify: `agora-app/app/containers/page.tsx`
- Create: `agora-app/__tests__/phase3-components.test.tsx` (initial section)

The T-day indicator colors: ok (≥0), watch (-1 to -3), risk (-4 to -7), crit (<-7). T-day is computed as days between demo date and ETD.

- [ ] **Step 1: Write failing ContainerCard test**

Create `agora-app/__tests__/phase3-components.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { ContainerCard } from '@/components/containers/ContainerCard';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ContainerCard', () => {
  it('renders container ID', () => {
    const c = containers[0]!;
    const imp = importers.find(i => i.id === c.importerId)!;
    render(wrap(<ContainerCard container={c} importer={imp} />));
    expect(screen.getByText(c.id)).toBeInTheDocument();
  });

  it('renders cold chain badge only when coldChain.required is true', () => {
    const cold = containers.find(c => c.coldChain?.required === true)!;
    const noCold = containers.find(c => !c.coldChain || c.coldChain.required === false)!;
    const impCold = importers.find(i => i.id === cold.importerId)!;
    const impNoCold = importers.find(i => i.id === noCold.importerId)!;

    const { rerender } = render(wrap(<ContainerCard container={cold} importer={impCold} />));
    expect(screen.getByTestId('cold-chain-badge')).toBeInTheDocument();

    rerender(wrap(<ContainerCard container={noCold} importer={impNoCold} />));
    expect(screen.queryByTestId('cold-chain-badge')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: FAIL — cannot find module `@/components/containers/ContainerCard`

- [ ] **Step 3: Create `ContainerCard.tsx`**

```tsx
import type { Container, Importer } from '@/types';
import { getTodayDemo } from '@/lib/dates';
import { differenceInDays } from 'date-fns';

interface Props {
  container: Container;
  importer: Importer;
}

const STAGE_COLORS: Record<string, string> = {
  planning: '#8B5CF6',
  preparation: '#00E696',
  documentation: '#F59E0B',
  in_transit: '#7DD3FC',
  customs_release: '#F97316',
  delivery_payment: '#3B82F6',
  closed: '#64748B',
};

function tDayColor(days: number): string {
  if (days >= 0) return '#00E696';
  if (days >= -3) return '#F59E0B';
  if (days >= -7) return '#F97316';
  return '#EF4444';
}

export function ContainerCard({ container, importer }: Props) {
  const today = getTodayDemo();
  const etd = new Date(container.etd);
  const tDays = differenceInDays(etd, today);

  return (
    <div
      style={{
        background: '#1a1f2e',
        border: '1px solid #ffffff12',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00E696', fontSize: '13px', fontWeight: 600 }}>
        {container.id}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e2e8f0' }}>
        {container.productLabel}
        {container.coldChain?.required && (
          <span data-testid="cold-chain-badge" style={{ fontSize: '11px', color: '#7DD3FC', display: 'flex', alignItems: 'center', gap: '3px' }}>
            ❄ Reefer
          </span>
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{container.market}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: tDayColor(tDays), fontWeight: 600 }}>
          T{tDays >= 0 ? '+' : ''}{tDays}d
        </span>
        <span style={{ fontSize: '11px', color: '#64748b' }}>{importer.name}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `KanbanColumn.tsx`**

```tsx
'use client';

import type { Container, ContainerStatus, Importer } from '@/types';
import { ContainerCard } from './ContainerCard';
import { useState } from 'react';

interface Props {
  status: ContainerStatus;
  label: string;
  color: string;
  containers: Container[];
  importers: Importer[];
  defaultCollapsed?: boolean;
}

export function KanbanColumn({ status, label, color, containers, importers, defaultCollapsed = false }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const imp = (id: string) => importers.find(i => i.id === id);

  return (
    <div style={{ minWidth: '220px', flex: '0 0 220px' }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#e2e8f0',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        {label}
        <span style={{
          marginLeft: 'auto',
          background: '#ffffff12',
          borderRadius: '10px',
          padding: '1px 7px',
          fontSize: '11px',
          color: '#94a3b8',
        }}>
          {containers.length}
        </span>
      </button>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          {containers.map(c => {
            const importer = imp(c.importerId);
            if (!importer) return null;
            return <ContainerCard key={c.id} container={c} importer={importer} />;
          })}
          {containers.length === 0 && (
            <div style={{ fontSize: '11px', color: '#334155', textAlign: 'center', padding: '16px 0' }}>—</div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `ContainerKanban.tsx`**

```tsx
'use client';

import type { Container, Importer } from '@/types';
import { STAGES } from '@/lib/containers';
import { KanbanColumn } from './KanbanColumn';

interface Props {
  containers: Container[];
  importers: Importer[];
}

export function ContainerKanban({ containers, importers }: Props) {
  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', alignItems: 'flex-start' }}>
      {STAGES.map(stage => (
        <KanbanColumn
          key={stage.status}
          status={stage.status}
          label={stage.label}
          color={stage.color}
          containers={containers.filter(c => c.status === stage.status)}
          importers={importers}
          defaultCollapsed={stage.status === 'closed'}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create `ContainersPageClient.tsx` and replace `app/containers/page.tsx`**

The spec (§4) requires a search bar, product multiselect, destination multiselect, and kanban/table toggle. These are all client-side concerns. Create a client component that owns this state, keeping `page.tsx` as a server component that passes data down.

Create `agora-app/components/containers/ContainersPageClient.tsx`:

```tsx
'use client';

import { useState, useMemo } from 'react';
import type { Container, Importer } from '@/types';
import { ContainerKanban } from './ContainerKanban';
import { ContainerListTable } from './ContainerListTable';

interface Props {
  containers: Container[];
  importers: Importer[];
}

export function ContainersPageClient({ containers, importers }: Props) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const allProducts = useMemo(() =>
    [...new Set(containers.map(c => c.productId))].sort(),
    [containers],
  );
  const allMarkets = useMemo(() =>
    [...new Set(containers.map(c => c.market))].sort(),
    [containers],
  );

  const filtered = useMemo(() => containers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.id.toLowerCase().includes(q) ||
      c.productLabel.toLowerCase().includes(q) ||
      importers.find(i => i.id === c.importerId)?.name.toLowerCase().includes(q);
    const matchProduct = selectedProducts.length === 0 || selectedProducts.includes(c.productId);
    const matchMarket = selectedMarkets.length === 0 || selectedMarkets.includes(c.market);
    return matchSearch && matchProduct && matchMarket;
  }), [containers, importers, search, selectedProducts, selectedMarkets]);

  const toggleProduct = (p: string) =>
    setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleMarket = (m: string) =>
    setSelectedMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <div>
      {/* Controls bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search containers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ffffff18', background: '#1a1f2e', color: '#e2e8f0', fontSize: '13px', width: '220px' }}
        />

        {/* Product multiselect */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {allProducts.map(p => (
            <button
              key={p}
              onClick={() => toggleProduct(p)}
              style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                border: '1px solid #ffffff18',
                background: selectedProducts.includes(p) ? '#00E69622' : 'transparent',
                color: selectedProducts.includes(p) ? '#00E696' : '#64748b',
              }}
            >
              {p.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Market multiselect */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {allMarkets.map(m => (
            <button
              key={m}
              onClick={() => toggleMarket(m)}
              style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                border: '1px solid #ffffff18',
                background: selectedMarkets.includes(m) ? '#F9731622' : 'transparent',
                color: selectedMarkets.includes(m) ? '#F97316' : '#64748b',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', border: '1px solid #ffffff18', borderRadius: '6px', overflow: 'hidden' }}>
          {(['kanban', 'table'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                background: view === v ? '#ffffff18' : 'transparent',
                color: view === v ? '#e2e8f0' : '#64748b',
                border: 'none',
              }}
            >
              {v === 'kanban' ? 'Kanban' : 'Table'}
            </button>
          ))}
        </div>
      </div>

      {view === 'kanban'
        ? <ContainerKanban containers={filtered} importers={importers} />
        : <ContainerListTable containers={filtered} importers={importers} />
      }
    </div>
  );
}
```

Then replace `agora-app/app/containers/page.tsx`:

```tsx
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';
import { ContainersPageClient } from '@/components/containers/ContainersPageClient';

export default function ContainersPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>
        Containers
      </h1>
      <ContainersPageClient containers={containers} importers={importers} />
    </div>
  );
}
```

- [ ] **Step 6b: Update `ContainerListTable` props and grouped-by-stage behavior**

Read the existing `agora-app/components/containers/ContainerListTable.tsx` before editing.

The spec (§4 Table View) requires rows grouped under collapsible stage headers. The existing component is a flat table. Two changes needed:

1. Add `importers: Importer[]` to its props interface (needed by `ContainersPageClient`)
2. Group rows by `container.status` and render collapsible stage headers using `@base-ui/react` Collapsible (or a simple `useState` toggle per group)

Skeleton for grouped table:

```tsx
'use client';

import { useState } from 'react';
import type { Container, ContainerStatus, Importer } from '@/types';
import { STAGES } from '@/lib/containers';  // export STAGES array from lib/containers.ts

export function ContainerListTable({ containers, importers }: { containers: Container[]; importers: Importer[] }) {
  const [collapsedStages, setCollapsedStages] = useState<Set<ContainerStatus>>(new Set());
  const toggle = (s: ContainerStatus) => setCollapsedStages(prev => {
    const next = new Set(prev);
    next.has(s) ? next.delete(s) : next.add(s);
    return next;
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>...</thead>
      <tbody>
        {STAGES.map(stage => {
          const rows = containers.filter(c => c.status === stage.status);
          if (rows.length === 0) return null;
          const collapsed = collapsedStages.has(stage.status);
          return (
            <>
              <tr key={`header-${stage.status}`} onClick={() => toggle(stage.status)} style={{ cursor: 'pointer', background: '#0d1117' }}>
                <td colSpan={7} style={{ padding: '8px 12px', color: stage.color, fontWeight: 600, fontSize: '12px' }}>
                  {collapsed ? '▶' : '▼'} {stage.label} ({rows.length})
                </td>
              </tr>
              {!collapsed && rows.map(c => <tr key={c.id}>...</tr>)}
            </>
          );
        })}
      </tbody>
    </table>
  );
}
```

Also export `STAGES` from `agora-app/lib/containers.ts`:

```ts
export const STAGES: Array<{ status: ContainerStatus; label: string; color: string }> = [
  { status: 'planning',         label: 'Planning',          color: '#8B5CF6' },
  { status: 'preparation',      label: 'Preparation',       color: '#00E696' },
  { status: 'documentation',    label: 'Documentation',     color: '#F59E0B' },
  { status: 'in_transit',       label: 'In Transit',        color: '#7DD3FC' },
  { status: 'customs_release',  label: 'Customs & Release', color: '#F97316' },
  { status: 'delivery_payment', label: 'Delivery & Payment',color: '#3B82F6' },
  { status: 'closed',           label: 'Closed',            color: '#64748B' },
];
```

(Replace the inline array in `ContainerKanban.tsx` with an import from `@/lib/containers`.)

- [ ] **Step 7: Run tests**

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: ContainerCard tests PASS.

- [ ] **Step 8: Commit**

```bash
git add agora-app/components/containers/ContainerCard.tsx agora-app/components/containers/KanbanColumn.tsx agora-app/components/containers/ContainerKanban.tsx agora-app/app/containers/page.tsx agora-app/__tests__/phase3-components.test.tsx
git commit -m "feat(phase3): containers kanban page with 7-stage columns"
```

---

## Task 6: Purchase Orders list + detail

**Files:**
- Create: `agora-app/components/purchase-orders/POListTable.tsx`
- Create: `agora-app/components/purchase-orders/PODetail.tsx`
- Create: `agora-app/components/purchase-orders/POKpiStrip.tsx`
- Create: `agora-app/components/purchase-orders/POResumenEjecutivo.tsx`
- Create: `agora-app/components/purchase-orders/POLifecycleTimeline.tsx`
- Create: `agora-app/components/purchase-orders/PODocumentSection.tsx`
- Create: `agora-app/app/purchase-orders/page.tsx`
- Create: `agora-app/app/purchase-orders/[id]/page.tsx`

- [ ] **Step 1: Write failing POLifecycleTimeline test**

In `__tests__/phase3-components.test.tsx`, add:

```tsx
import { POLifecycleTimeline } from '@/components/purchase-orders/POLifecycleTimeline';
import type { POEvent } from '@/types';

describe('POLifecycleTimeline', () => {
  it('renders mint fill covering exactly completed milestones', () => {
    const events: POEvent[] = [
      { date: '2026-10-01', type: 'confirmed' },
      { date: '2026-11-01', type: 'container_assigned' },
      { date: '2026-12-01', type: 'bl_issued' },
    ];
    render(<POLifecycleTimeline events={events} />);
    // 3 of 6 milestones completed → progress fill should be present
    expect(screen.getByTestId('tl-progress')).toBeInTheDocument();
  });

  it('renders all 6 milestone nodes', () => {
    render(<POLifecycleTimeline events={[]} />);
    expect(screen.getAllByTestId('tl-node').length).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: FAIL on POLifecycleTimeline import.

- [ ] **Step 3: Create `POLifecycleTimeline.tsx`**

The single rail + progress overlay approach avoids broken connectors. 6 milestones in order: `confirmed → container_assigned → bl_issued → docs_submitted → delivered → payment_received`.

```tsx
import type { POEvent } from '@/types';

const MILESTONES: Array<{ type: POEvent['type']; label: string }> = [
  { type: 'confirmed',           label: 'Confirmada' },
  { type: 'container_assigned',  label: 'Contenedor asignado' },
  { type: 'bl_issued',           label: 'BL emitido' },
  { type: 'docs_submitted',      label: 'Docs presentados' },
  { type: 'delivered',           label: 'Entregada' },
  { type: 'payment_received',    label: 'Pago recibido' },
];

interface Props {
  events: POEvent[];
}

export function POLifecycleTimeline({ events }: Props) {
  const completedTypes = new Set(events.map(e => e.type));
  const lastCompletedIdx = MILESTONES.reduce(
    (acc, m, i) => (completedTypes.has(m.type) ? i : acc),
    -1,
  );
  const progressPct = lastCompletedIdx < 0
    ? 0
    : (lastCompletedIdx / (MILESTONES.length - 1)) * 100;

  return (
    <div style={{ position: 'relative', padding: '24px 0' }}>
      {/* Rail */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '2px',
        background: '#ffffff12',
        transform: 'translateY(-50%)',
      }} />
      {/* Progress */}
      <div
        data-testid="tl-progress"
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          width: `${progressPct}%`,
          height: '2px',
          background: '#00E696',
          transform: 'translateY(-50%)',
          transition: 'width 0.3s',
        }}
      />
      {/* Nodes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {MILESTONES.map((m, i) => {
          const done = completedTypes.has(m.type);
          const event = events.find(e => e.type === m.type);
          return (
            <div key={m.type} data-testid="tl-node" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: done ? '#00E696' : '#1e293b',
                border: `2px solid ${done ? '#00E696' : '#334155'}`,
                zIndex: 1,
              }} />
              <span style={{ fontSize: '10px', color: done ? '#e2e8f0' : '#475569', textAlign: 'center', maxWidth: '72px' }}>
                {m.label}
              </span>
              {event?.date && (
                <span style={{ fontSize: '9px', color: '#475569' }}>
                  {new Date(event.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `POKpiStrip.tsx`**

5 KPI tiles: Total value USD, Quantity kg, Container count, Days to delivery, Payment status.

```tsx
import type { PurchaseOrder } from '@/types';
import { getTodayDemo } from '@/lib/dates';
import { differenceInDays } from 'date-fns';

interface Props {
  po: PurchaseOrder;
}

export function POKpiStrip({ po }: Props) {
  const today = getTodayDemo();
  const daysToDelivery = differenceInDays(new Date(po.deliveryWindow.to), today);
  const lastPayment = po.events.find(e => e.type === 'payment_received');

  const tiles = [
    { label: 'Total Value', value: `$${(po.valueUsd / 1000).toFixed(0)}k`, sub: 'USD' },
    { label: 'Quantity', value: `${(po.quantityKg / 1000).toFixed(1)}t`, sub: 'kg' },
    { label: 'Containers', value: String(po.containerIds.length), sub: 'units' },
    { label: 'Days to Delivery', value: daysToDelivery > 0 ? `${daysToDelivery}d` : 'Past', sub: '' },
    { label: 'Payment', value: lastPayment ? 'Received' : 'Pending', sub: po.incotermPaymentId },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', margin: '16px 0' }}>
      {tiles.map(t => (
        <div key={t.label} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{t.label}</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{t.value}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `POResumenEjecutivo.tsx`**

Verdict line + quick-scan chips + 2×2 grid of 4 status summaries. Keep simple — no SVG imports needed, use text-based icons.

```tsx
import type { PurchaseOrder } from '@/types';

interface Props {
  po: PurchaseOrder;
}

export function POResumenEjecutivo({ po }: Props) {
  const statusLabel: Record<string, string> = {
    draft: 'Borrador', confirmed: 'Confirmado', in_fulfillment: 'En Ejecución',
    delivered: 'Entregado', cancelled: 'Cancelado',
  };

  return (
    <section>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Resumen Ejecutivo</h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
        PO {po.id} en estado <strong style={{ color: '#e2e8f0' }}>{statusLabel[po.status]}</strong> con {po.containerIds.length} contenedor(es) asignado(s).
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[po.market, po.incotermPaymentId, po.status].map(tag => (
          <span key={tag} style={{ padding: '3px 10px', borderRadius: '12px', background: '#ffffff0d', fontSize: '11px', color: '#94a3b8' }}>
            {tag}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { icon: '📋', label: 'Estado de PO', value: statusLabel[po.status] ?? po.status },
          { icon: '❄', label: 'Cadena de frío', value: po.events.find(e => e.type === 'bl_issued') ? 'Monitoreo activo' : 'Pendiente' },
          { icon: '📄', label: 'Documentación', value: po.events.find(e => e.type === 'docs_submitted') ? 'Presentada' : 'En proceso' },
          { icon: '💳', label: 'Situación financiera', value: po.events.find(e => e.type === 'payment_received') ? 'Pago recibido' : 'Pendiente de pago' },
        ].map(item => (
          <div key={item.label} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5b: Replace emoji icons in `POResumenEjecutivo.tsx` with inline SVGs**

The spec (§5) explicitly prohibits emoji icons. Replace the emoji `icon` strings with inline SVG elements. Use these minimal SVGs:

```tsx
// Status icon (clipboard)
const StatusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2h-2"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>
  </svg>
);
// Cold chain icon (snowflake)
const ColdIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="1.5">
    <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="5.64" y1="5.64" x2="18.36" y2="18.36"/><line x1="5.64" y1="18.36" x2="18.36" y2="5.64"/>
  </svg>
);
// Docs icon (file)
const DocsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="11" y2="17"/>
  </svg>
);
// Finance icon (credit card)
const FinanceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
```

Replace the `icon` property in the 2×2 grid items with `icon: <StatusIcon />`, `icon: <ColdIcon />`, etc., and update the grid item render from `<span style={{ fontSize: '18px' }}>{item.icon}</span>` to `<span style={{ color: '#94a3b8' }}>{item.icon}</span>`.

- [ ] **Step 6: Create `PODocumentSection.tsx`**

Documents grouped by status: Listo (mint), En Revisión (blue), Pendiente (amber).

```tsx
import type { DocumentInstance, DocStatus } from '@/types';

interface Props {
  documents: DocumentInstance[];
}

export function PODocumentSection({ documents }: Props) {
  const sections = [
    { key: 'approved',       label: 'Listo',       borderColor: '#00E696', statuses: ['approved'] as DocStatus[] },
    { key: 'pending_review', label: 'En Revisión', borderColor: '#3B82F6', statuses: ['pending_review'] as DocStatus[] },
    { key: 'pending',        label: 'Pendiente',   borderColor: '#F59E0B', statuses: ['draft', 'missing'] as DocStatus[] },
  ];

  return (
    <section>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Documentos</h2>
      {sections.map(s => {
        const docs = documents.filter(d => (s.statuses as string[]).includes(d.status));
        if (docs.length === 0) return null;
        return (
          <div key={s.key} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '12px', color: s.borderColor, marginBottom: '8px', fontWeight: 600 }}>{s.label}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {docs.map(doc => (
                <div key={doc.id} style={{
                  background: '#1a1f2e',
                  borderTop: `2px solid ${s.borderColor}`,
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>{doc.type.replace(/_/g, ' ')}</div>
                  {doc.issuedAt && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      {new Date(doc.issuedAt).toLocaleDateString('es-CL')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
```

- [ ] **Step 7: Create `POListTable.tsx`**

Filterable table. Columns: PO ID, Product, Importer, Status, Value USD, Date.

```tsx
'use client';

import { useState } from 'react';
import type { PurchaseOrder, Importer } from '@/types';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  draft: '#64748b', confirmed: '#3B82F6', in_fulfillment: '#00E696',
  delivered: '#8B5CF6', cancelled: '#EF4444',
};

interface Props {
  purchaseOrders: PurchaseOrder[];
  importers: Importer[];
}

export function POListTable({ purchaseOrders, importers }: Props) {
  const [search, setSearch] = useState('');
  const imp = (id: string) => importers.find(i => i.id === id);

  const filtered = purchaseOrders.filter(po =>
    po.id.toLowerCase().includes(search.toLowerCase()) ||
    imp(po.importerId)?.name.toLowerCase().includes(search.toLowerCase()) ||
    po.productId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search POs…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '16px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ffffff18', background: '#1a1f2e', color: '#e2e8f0', fontSize: '13px', width: '280px' }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ color: '#64748b', borderBottom: '1px solid #ffffff12' }}>
            {['PO ID', 'Product', 'Importer', 'Status', 'Value USD', 'Date'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(po => (
            <tr key={po.id} style={{ borderBottom: '1px solid #ffffff08', color: '#e2e8f0' }}>
              <td style={{ padding: '10px 12px' }}>
                <Link href={`/purchase-orders/${po.id}`} style={{ color: '#00E696', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>
                  {po.id}
                </Link>
              </td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{po.productId.replace(/_/g, ' ')}</td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{imp(po.importerId)?.name ?? po.importerId}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', background: STATUS_COLORS[po.status] + '22', color: STATUS_COLORS[po.status], fontSize: '11px' }}>
                  {po.status}
                </span>
              </td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>${po.valueUsd.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(po.issuedAt).toLocaleDateString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 8: Create `PODetail.tsx`**

```tsx
import type { PurchaseOrder, Importer, DocumentInstance, Container } from '@/types';
import { POKpiStrip } from './POKpiStrip';
import { POResumenEjecutivo } from './POResumenEjecutivo';
import { POLifecycleTimeline } from './POLifecycleTimeline';
import { PODocumentSection } from './PODocumentSection';
import { differenceInDays } from 'date-fns';
import { getTodayDemo } from '@/lib/dates';

interface Props {
  po: PurchaseOrder;
  importer: Importer;
  documents: DocumentInstance[];
  linkedContainers: Container[];
}

export function PODetail({ po, importer, documents, linkedContainers }: Props) {
  const today = getTodayDemo();
  const pills = [
    { key: 'status',   label: po.status,                               color: '#3B82F6' },
    { key: 'importer', label: importer.name,                           color: '#8B5CF6' },
    { key: 'product',  label: po.productId.replace(/_/g, ' '),         color: '#00E696' },
    { key: 'market',   label: po.market,                               color: '#F97316' },
    { key: 'incoterm', label: po.incotermPaymentId,                    color: '#F59E0B' },
    { key: 'payment',  label: importer.paymentHistory.find(p => p.poId === po.id)?.method ?? po.incotermPaymentId, color: '#7DD3FC' },
    { key: 'date',     label: new Date(po.issuedAt).toLocaleDateString('es-CL'), color: '#64748b' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', color: '#e2e8f0', fontWeight: 700, marginBottom: '12px' }}>
          {po.id}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {pills.map(p => (
            <span key={p.key} style={{
              padding: '3px 10px', borderRadius: '12px',
              background: p.color + '22',
              color: p.color,
              fontSize: '12px', fontWeight: 500,
            }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <POKpiStrip po={po} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
        <POResumenEjecutivo po={po} />
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Ciclo de Vida</h2>
          <POLifecycleTimeline events={po.events} />
        </section>
        <PODocumentSection documents={documents} />
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Fulfillment & Contraparte</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
            {/* Linked containers table */}
            <div>
              <h3 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 500 }}>Contenedores vinculados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ffffff12', color: '#64748b' }}>
                    {['ID', 'Producto', 'Etapa', 'T-Day'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linkedContainers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #ffffff08', color: '#94a3b8' }}>
                      <td style={{ padding: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#00E696', fontSize: '11px' }}>{c.id}</td>
                      <td style={{ padding: '8px' }}>{c.productLabel}</td>
                      <td style={{ padding: '8px' }}>{c.status}</td>
                      <td style={{ padding: '8px' }}>
                        {(() => { const d = differenceInDays(new Date(c.etd), today); return `T${d >= 0 ? '+' : ''}${d}d`; })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Importer mini-card */}
            <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{importer.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{importer.country} · {importer.market}</div>
              {importer.creditRating && (
                <div style={{ fontSize: '12px', color: '#00E696', fontFamily: 'JetBrains Mono, monospace' }}>{importer.creditRating}</div>
              )}
              <div style={{ fontSize: '12px', color: '#64748b' }}>Avg payment: {importer.avgPaymentDays}d</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create app routes**

`agora-app/app/purchase-orders/page.tsx`:
```tsx
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { importers } from '@/lib/mock-data/importers';
import { POListTable } from '@/components/purchase-orders/POListTable';

export default function POListPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>Purchase Orders</h1>
      <POListTable purchaseOrders={purchaseOrders} importers={importers} />
    </div>
  );
}
```

`agora-app/app/purchase-orders/[id]/page.tsx`:
```tsx
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { importers } from '@/lib/mock-data/importers';
import { documents } from '@/lib/mock-data/documents';
import { containers } from '@/lib/mock-data/containers';
import { PODetail } from '@/components/purchase-orders/PODetail';
import { notFound } from 'next/navigation';

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = purchaseOrders.find(p => p.id === id);
  if (!po) notFound();
  const importer = importers.find(i => i.id === po.importerId);
  if (!importer) notFound();
  const docs = documents.filter(d => po.containerIds.some(cid => d.containerId === cid));
  const linked = containers.filter(c => po.containerIds.includes(c.id));

  return <PODetail po={po} importer={importer} documents={docs} linkedContainers={linked} />;
}
```

Note: read `node_modules/next/dist/docs/` to verify the `params: Promise<...>` pattern is correct for this Next.js version — dynamic params handling may differ.

- [ ] **Step 10: Run tests**

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: all POLifecycleTimeline tests pass.

- [ ] **Step 11: TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep "purchase-orders"
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add agora-app/components/purchase-orders/ agora-app/app/purchase-orders/
git commit -m "feat(phase3): PO list and detail pages"
```

---

## Task 7: EntityFiche shell + Importer fiche

**Files:**
- Create: `agora-app/components/entity-fiche/EntityFiche.tsx`
- Create: `agora-app/components/entity-fiche/EntityKpiStrip.tsx`
- Create: `agora-app/components/entity-fiche/RelationshipHistory.tsx`
- Create: `agora-app/components/entity-fiche/ImporterSpecificSections.tsx`
- Create: `agora-app/app/importers/page.tsx`
- Create: `agora-app/app/importers/[id]/page.tsx`
- Create: `agora-app/__tests__/entity-fiche.test.tsx`

- [ ] **Step 1: Write integration tests**

Create `agora-app/__tests__/entity-fiche.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

const kpis = [
  { label: 'Volume', value: '720k', sub: 'kg' },
  { label: 'PO Value', value: '$1.2M', sub: 'USD' },
  { label: 'Containers', value: '4', sub: '' },
  { label: 'Avg Payment', value: '12d', sub: '' },
];

describe('EntityFiche shell', () => {
  it('renders entity name in header', () => {
    render(wrap(
      <EntityFiche name="Dragon Imports Ltd." pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <div>entity content</div>
      </EntityFiche>
    ));
    expect(screen.getByText('Dragon Imports Ltd.')).toBeInTheDocument();
  });

  it('renders injected children', () => {
    render(wrap(
      <EntityFiche name="Test Entity" pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <div data-testid="custom-section">custom</div>
      </EntityFiche>
    ));
    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
  });

  it('renders KPI labels', () => {
    render(wrap(
      <EntityFiche name="X" pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <></>
      </EntityFiche>
    ));
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Avg Payment')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && pnpm test -- entity-fiche
```

Expected: FAIL — cannot find module `@/components/entity-fiche/EntityFiche`

- [ ] **Step 3: Create `EntityKpiStrip.tsx`**

```tsx
interface KpiTile {
  label: string;
  value: string;
  sub: string;
}

interface Props {
  kpis: KpiTile[];
}

export function EntityKpiStrip({ kpis }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: '12px', margin: '16px 0' }}>
      {kpis.map(k => (
        <div key={k.label} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{k.label}</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{k.value}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `RelationshipHistory.tsx`**

```tsx
interface Column<T> {
  label: string;
  render: (row: T) => React.ReactNode;
}

interface Props<P, C> {
  pos: P[];
  containers: C[];
  poColumns: Column<P>[];
  containerColumns: Column<C>[];
}

export function RelationshipHistory<P, C>({ pos, containers, poColumns, containerColumns }: Props<P, C>) {
  const renderTable = <T,>(rows: T[], columns: Column<T>[]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ffffff12' }}>
          {columns.map(c => (
            <th key={c.label} style={{ padding: '6px 8px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #ffffff08' }}>
            {columns.map(c => (
              <td key={c.label} style={{ padding: '8px 8px', color: '#94a3b8' }}>{c.render(row)}</td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={columns.length} style={{ padding: '16px 8px', color: '#334155', textAlign: 'center' }}>—</td></tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '16px 0' }}>
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Purchase Orders</h3>
        {renderTable(pos, poColumns)}
      </div>
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Containers</h3>
        {renderTable(containers, containerColumns)}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `EntityFiche.tsx`**

```tsx
import type { ReactNode } from 'react';
import { EntityKpiStrip } from './EntityKpiStrip';
import { RelationshipHistory } from './RelationshipHistory';

interface Pill {
  label: string;
  color: string;
}

interface KpiTile {
  label: string;
  value: string;
  sub: string;
}

interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface Props<P, C> {
  name: string;
  pills: Pill[];
  kpis: KpiTile[];
  pos: P[];
  containers: C[];
  poColumns: Column<P>[];
  containerColumns: Column<C>[];
  children: ReactNode;
}

export function EntityFiche<P, C>({ name, pills, kpis, pos, containers, poColumns, containerColumns, children }: Props<P, C>) {
  const initials = name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: '#ffffff18', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '16px', color: '#e2e8f0', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>{name}</h1>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {pills.map(p => (
              <span key={p.label} style={{
                padding: '2px 8px', borderRadius: '10px',
                background: p.color + '22', color: p.color,
                fontSize: '11px', fontWeight: 500,
              }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <EntityKpiStrip kpis={kpis} />
      <RelationshipHistory pos={pos} containers={containers} poColumns={poColumns} containerColumns={containerColumns} />

      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `ImporterSpecificSections.tsx`**

Two cards: market flags + payment history.

```tsx
import type { Importer } from '@/types';
import { VolumeTimeSeries } from '@/components/shared/VolumeTimeSeries';

interface Props {
  importer: Importer;
}

export function ImporterSpecificSections({ importer }: Props) {
  return (
    <>
      {/* Volume time series */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Volumen por Temporada</h2>
        <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
          <VolumeTimeSeries data={importer.volumeHistory} />
        </div>
      </section>

      {/* Market profile */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Perfil de Mercado</h2>
        <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Autoridad de Inspección', values: importer.marketProfile.inspectionAuthority },
            { label: 'Sistema Digital', values: [importer.marketProfile.digitalSystem] },
            { label: 'Registros Requeridos', values: importer.marketProfile.requiredRegistrations },
            { label: 'Idiomas de Etiqueta', values: importer.marketProfile.labelLanguages },
            ...(importer.marketProfile.coldTreatmentOptions
              ? [{ label: 'Tratamiento de Frío', values: importer.marketProfile.coldTreatmentOptions }]
              : []),
          ].map(row => (
            <div key={row.label}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{row.label}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {row.values.map(v => (
                  <span key={v} style={{ padding: '2px 8px', borderRadius: '10px', background: '#ffffff0d', fontSize: '11px', color: '#94a3b8' }}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment history */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Historial de Pagos</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ffffff12', color: '#64748b' }}>
              {['PO', 'Método', 'Banco', 'Monto', 'Días', 'Estado'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {importer.paymentHistory.map(p => (
              <tr key={p.poId} style={{ borderBottom: '1px solid #ffffff08', color: '#94a3b8' }}>
                <td style={{ padding: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#00E696' }}>{p.poId}</td>
                <td style={{ padding: '8px' }}>{p.method}</td>
                <td style={{ padding: '8px' }}>{p.bank}</td>
                <td style={{ padding: '8px' }}>${p.amount.toLocaleString()}</td>
                <td style={{ padding: '8px' }}>{p.daysToCollect != null ? `${p.daysToCollect}d` : '—'}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ color: p.status === 'paid' ? '#00E696' : '#F59E0B' }}>
                    {p.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
```

- [ ] **Step 7: Create importer pages**

`agora-app/app/importers/page.tsx`:
```tsx
import { importers } from '@/lib/mock-data/importers';
import Link from 'next/link';

export default function ImportersPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>Importers</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {importers.map(imp => (
          <Link key={imp.id} href={`/importers/${imp.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{imp.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{imp.country} · {imp.market}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

`agora-app/app/importers/[id]/page.tsx`:
```tsx
import { importers } from '@/lib/mock-data/importers';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { containers } from '@/lib/mock-data/containers';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { ImporterSpecificSections } from '@/components/entity-fiche/ImporterSpecificSections';
import { notFound } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import { getTodayDemo } from '@/lib/dates';
import Link from 'next/link';

export default async function ImporterFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imp = importers.find(i => i.id === id);
  if (!imp) notFound();

  const pos = purchaseOrders.filter(po => po.importerId === id);
  const cons = containers.filter(c => c.importerId === id);
  const today = getTodayDemo();

  const kpis = [
    { label: 'Annual Volume', value: `${(imp.annualVolumeKg / 1_000_000).toFixed(1)}M kg`, sub: 'kg' },
    { label: 'PO Value', value: `$${(pos.reduce((s, p) => s + p.valueUsd, 0) / 1000).toFixed(0)}k`, sub: 'USD' },
    { label: 'Active Containers', value: String(imp.activeContainers), sub: '' },
    { label: 'Avg Payment', value: `${imp.avgPaymentDays}d`, sub: '' },
  ];

  const pills = [
    { label: imp.country, color: '#94a3b8' },
    { label: imp.market, color: '#F97316' },
    ...(imp.creditRating ? [{ label: imp.creditRating, color: '#00E696' }] : []),
  ];

  return (
    <EntityFiche
      name={imp.name}
      pills={pills}
      kpis={kpis}
      pos={pos}
      containers={cons}
      poColumns={[
        { label: 'ID', render: po => <Link href={`/purchase-orders/${po.id}`} style={{ color: '#00E696', fontFamily: 'monospace', textDecoration: 'none' }}>{po.id}</Link> },
        { label: 'Product', render: po => po.productId.replace(/_/g, ' ') },
        { label: 'Status', render: po => po.status },
        { label: 'Value', render: po => `$${po.valueUsd.toLocaleString()}` },
      ]}
      containerColumns={[
        { label: 'ID', render: c => <span style={{ fontFamily: 'monospace', color: '#00E696' }}>{c.id}</span> },
        { label: 'Product', render: c => c.productLabel },
        { label: 'Stage', render: c => c.status },
        { label: 'T-Day', render: c => {
          const d = differenceInDays(new Date(c.etd), today);
          return `T${d >= 0 ? '+' : ''}${d}d`;
        }},
      ]}
    >
      <ImporterSpecificSections importer={imp} />
    </EntityFiche>
  );
}
```

- [ ] **Step 8: Run tests**

```bash
cd agora-app && pnpm test -- entity-fiche
```

Expected: all 3 EntityFiche tests pass.

- [ ] **Step 9: Commit**

```bash
git add agora-app/components/entity-fiche/ agora-app/app/importers/ agora-app/__tests__/entity-fiche.test.tsx
git commit -m "feat(phase3): EntityFiche shell and importer fiche pages"
```

---

## Task 8: Producer fiche

**Files:**
- Create: `agora-app/components/entity-fiche/ProducerSpecificSections.tsx`
- Create: `agora-app/app/producers/page.tsx`
- Create: `agora-app/app/producers/[id]/page.tsx`

- [ ] **Step 1: Write failing test for ProducerSpecificSections**

In `agora-app/__tests__/entity-fiche.test.tsx`, add:

```tsx
import { ProducerSpecificSections } from '@/components/entity-fiche/ProducerSpecificSections';
import { producers } from '@/lib/mock-data/producers';

describe('EntityFiche with ProducerSpecificSections', () => {
  it('renders without errors with producer children', () => {
    const prod = producers[0]!;
    render(wrap(
      <EntityFiche name={prod.name} pills={[]} kpis={[
        { label: 'A', value: '1', sub: '' },
        { label: 'B', value: '2', sub: '' },
        { label: 'C', value: '3', sub: '' },
        { label: 'D', value: '4', sub: '' },
      ]} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <ProducerSpecificSections producer={prod} />
      </EntityFiche>
    ));
    expect(screen.getByText(prod.name)).toBeInTheDocument();
  });

  it('renders SAG certifications list', () => {
    const prod = producers[0]!;
    render(wrap(<ProducerSpecificSections producer={prod} />));
    prod.sagCertifications.forEach(cert => {
      expect(screen.getByText(cert.name)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && pnpm test -- entity-fiche
```

Expected: FAIL — cannot find module `@/components/entity-fiche/ProducerSpecificSections`

- [ ] **Step 3: Create `ProducerSpecificSections.tsx`**

Two sections: certified products grid (2 cols) + SAG certifications list.

```tsx
import type { Producer } from '@/types';
import { VolumeTimeSeries } from '@/components/shared/VolumeTimeSeries';
import { MiniSeasonBar } from '@/components/shared/MiniSeasonBar';

interface Props {
  producer: Producer;
}

export function ProducerSpecificSections({ producer }: Props) {
  return (
    <>
      {/* Volume time series */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Volumen por Temporada</h2>
        <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
          <VolumeTimeSeries data={producer.volumeHistory} />
        </div>
      </section>

      {/* Certified products */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Productos Certificados</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {producer.certifiedProducts.map(cp => (
            <div key={cp.productId} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{cp.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{cp.hsCode}</div>
                </div>
                <span style={{ fontSize: '11px', color: cp.requiresColdChain ? '#7DD3FC' : '#64748b' }}>
                  {cp.requiresColdChain ? '❄ Cold chain' : 'Ambient'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>Season: {cp.seasonStart}–{cp.seasonEnd}</div>
                <MiniSeasonBar start={cp.seasonStart} end={cp.seasonEnd} />
              </div>
              {cp.coldProtocol && (
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Protocol: {cp.coldProtocol}</div>
              )}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {cp.enabledMarkets.map(m => (
                  <span key={m} style={{ padding: '1px 6px', borderRadius: '8px', background: '#00E69622', color: '#00E696', fontSize: '10px' }}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAG certifications */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Certificaciones SAG</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {producer.sagCertifications.map(cert => {
            const isOk = cert.daysUntilExpiry > 60;
            const isWarn = cert.daysUntilExpiry <= 60 && cert.daysUntilExpiry > 14;
            const isCrit = cert.daysUntilExpiry <= 14;
            const statusColor = isCrit ? '#EF4444' : isWarn ? '#F59E0B' : '#00E696';
            const statusLabel = isCrit ? `Vence en ${cert.daysUntilExpiry}d` : isWarn ? `Vence en ${cert.daysUntilExpiry}d` : 'Vigente';

            return (
              <div key={cert.id} style={{
                background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: statusColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  {isOk ? '✓' : '⚠'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{cert.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{cert.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {new Date(cert.expiryDate).toLocaleDateString('es-CL')}
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', background: statusColor + '22', color: statusColor, fontSize: '11px' }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Create producer pages**

`agora-app/app/producers/page.tsx`:
```tsx
import { producers } from '@/lib/mock-data/producers';
import Link from 'next/link';

export default function ProducersPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>Producers</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {producers.map(p => (
          <Link key={p.id} href={`/producers/${p.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{p.region} · SAG {p.sagId}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

`agora-app/app/producers/[id]/page.tsx`:
```tsx
import { producers } from '@/lib/mock-data/producers';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { containers } from '@/lib/mock-data/containers';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { ProducerSpecificSections } from '@/components/entity-fiche/ProducerSpecificSections';
import { notFound } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import { getTodayDemo } from '@/lib/dates';
import Link from 'next/link';

export default async function ProducerFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prod = producers.find(p => p.id === id);
  if (!prod) notFound();

  const pos = purchaseOrders.filter(po => po.producerId === id);
  const cons = containers.filter(c => c.producerId === id);
  const today = getTodayDemo();

  const seasonVolume = prod.volumeHistory[prod.volumeHistory.length - 1]?.volumeKg ?? 0;
  const totalCerts = prod.sagCertifications.length;
  const validCerts = prod.sagCertifications.filter(c => c.daysUntilExpiry > 14).length;

  const kpis = [
    { label: 'Active Containers', value: String(prod.activeContainers), sub: '' },
    { label: 'Season Volume', value: `${(seasonVolume / 1000).toFixed(1)}t`, sub: 'kg' },
    { label: 'Shipped Value', value: `$${(pos.reduce((s, p) => s + p.valueUsd, 0) / 1000).toFixed(0)}k`, sub: 'USD' },
    { label: 'Certifications', value: `${validCerts}/${totalCerts}`, sub: 'valid' },
  ];

  const pills = [
    { label: prod.region, color: '#94a3b8' },
    { label: prod.sagId, color: '#00E696' },
    ...prod.products.map(p => ({ label: p.replace(/_/g, ' '), color: '#8B5CF6' })),
  ];

  return (
    <EntityFiche
      name={prod.name}
      pills={pills}
      kpis={kpis}
      pos={pos}
      containers={cons}
      poColumns={[
        { label: 'ID', render: po => <Link href={`/purchase-orders/${po.id}`} style={{ color: '#00E696', fontFamily: 'monospace', textDecoration: 'none' }}>{po.id}</Link> },
        { label: 'Importer', render: po => po.importerId },
        { label: 'Status', render: po => po.status },
        { label: 'Value', render: po => `$${po.valueUsd.toLocaleString()}` },
      ]}
      containerColumns={[
        { label: 'ID', render: c => <span style={{ fontFamily: 'monospace', color: '#00E696' }}>{c.id}</span> },
        { label: 'Destination', render: c => c.market },
        { label: 'Stage', render: c => c.status },
        { label: 'T-Day', render: c => {
          const d = differenceInDays(new Date(c.etd), today);
          return `T${d >= 0 ? '+' : ''}${d}d`;
        }},
      ]}
    >
      <ProducerSpecificSections producer={prod} />
    </EntityFiche>
  );
}
```

- [ ] **Step 5: Run tests**

```bash
cd agora-app && pnpm test -- entity-fiche
```

Expected: all EntityFiche + ProducerSpecificSections tests pass.

- [ ] **Step 6: TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep "producers\|entity-fiche"
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add agora-app/components/entity-fiche/ProducerSpecificSections.tsx agora-app/app/producers/ agora-app/__tests__/entity-fiche.test.tsx
git commit -m "feat(phase3): producer fiche page"
```

---

## Task 9: Compliance page

**Files:**
- Create: `agora-app/components/compliance/MarketRulePackCard.tsx`
- Create: `agora-app/components/compliance/ProductProfileCard.tsx`
- Create: `agora-app/components/compliance/CommercialProfileCard.tsx`
- Create: `agora-app/components/compliance/SentinelQueue.tsx`
- Create: `agora-app/app/compliance/page.tsx`
- Modify: `agora-app/__tests__/phase3-components.test.tsx` (add SentinelQueue tests)

- [ ] **Step 1: Write failing SentinelQueue tests**

In `__tests__/phase3-components.test.tsx`, add:

```tsx
import { SentinelQueue } from '@/components/compliance/SentinelQueue';
import type { Alert } from '@/types';

const makeAlert = (severity: Alert['severity'], id = 'a1'): Alert => ({
  id,
  severity,
  titleKey: 'alerts.test_title',
  bodyKey: 'alerts.test_body',
  raisedAt: '2027-01-09',
  raisedBy: 'agent',
  category: 'market_compliance',
});

describe('SentinelQueue', () => {
  it('renders warn, crit, and info severity items', () => {
    const alerts = [
      makeAlert('warn', 'a1'),
      makeAlert('crit', 'a2'),
      makeAlert('info', 'a3'),
    ];
    render(wrap(<SentinelQueue alerts={alerts} />));
    expect(screen.getByTestId('sentinel-item-a1')).toBeInTheDocument();
    expect(screen.getByTestId('sentinel-item-a2')).toBeInTheDocument();
    expect(screen.getByTestId('sentinel-item-a3')).toBeInTheDocument();
  });

  it('renders empty state when no alerts', () => {
    render(wrap(<SentinelQueue alerts={[]} />));
    expect(screen.getByText(/no alerts/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: FAIL on SentinelQueue import.

- [ ] **Step 3: Create `SentinelQueue.tsx`**

Uses the existing `Alert` type from `@/types`. Render i18n keys directly — `useTranslations` in next-intl v4 does not expose a `.has()` method, so pass the key directly using `t(key as any)` with a try/catch fallback, or just render the key string. The simplest correct approach is to use `useTranslations` with `t(key as Parameters<typeof t>[0])` for known keys and fall back to the raw string for dynamic alert keys. Since alert title/body keys come from mock data and are known at the call sites, the safest pattern is to render them via `t` cast:

```tsx
'use client';

import type { Alert } from '@/types';
import { useTranslations } from 'next-intl';

const SEVERITY_COLORS: Record<string, string> = {
  crit: '#EF4444',
  warn: '#F59E0B',
  info: '#3B82F6',
  ok: '#00E696',
  risk: '#F97316',
  watch: '#F59E0B',
};

interface Props {
  alerts: Alert[];
}

export function SentinelQueue({ alerts }: Props) {
  const t = useTranslations();

  if (alerts.length === 0) {
    return <div style={{ color: '#475569', fontSize: '13px', padding: '16px 0' }}>No alerts</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {alerts.map(alert => {
        const color = SEVERITY_COLORS[alert.severity] ?? '#64748b';
        let titleText: string;
        let bodyText: string;
        try { titleText = t(alert.titleKey as Parameters<typeof t>[0]); } catch { titleText = alert.titleKey; }
        try { bodyText = t(alert.bodyKey as Parameters<typeof t>[0]); } catch { bodyText = alert.bodyKey; }
        return (
          <div
            key={alert.id}
            data-testid={`sentinel-item-${alert.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color, fontWeight: 700, fontSize: '12px',
            }}>
              {alert.severity === 'crit' ? '!' : alert.severity === 'warn' ? '⚠' : 'i'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#e2e8f0' }}>{titleText}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{bodyText}</div>
            </div>
            {alert.containerId && (
              <span style={{ padding: '2px 8px', borderRadius: '8px', background: '#ffffff0d', color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                {alert.containerId}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create `MarketRulePackCard.tsx`**

```tsx
import type { MarketProfileExtended, SAGCertification } from '@/types';

interface Props {
  market: MarketProfileExtended;
  certAlerts?: SAGCertification[];
}

const MARKET_COLORS: Record<string, string> = {
  CN: '#EF4444', EU: '#3B82F6', US: '#8B5CF6', IN: '#F97316', MENA: '#F59E0B',
};

export function MarketRulePackCard({ market, certAlerts = [] }: Props) {
  const color = MARKET_COLORS[market.id] ?? '#64748b';
  const hasExpiring = certAlerts.some(c => c.daysUntilExpiry < 60);

  return (
    <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ height: '4px', background: color }} />
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '15px' }}>{market.id}</div>
          {hasExpiring && (
            <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#F59E0B22', color: '#F59E0B', fontSize: '10px' }}>Cert expiry</span>
          )}
        </div>

        {[
          { label: 'Inspection Authority', value: market.inspectionAuthority },
          ...(market.digitalPhytoSystem ? [{ label: 'Digital System', value: market.digitalPhytoSystem }] : []),
          { label: 'Registrations', value: market.registrationsRequired.join(', ') },
          { label: 'Label Languages', value: market.labelLanguageRequired.join(', ') },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{row.label}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `ProductProfileCard.tsx`**

```tsx
import type { ProductProfile } from '@/types';
import { MiniSeasonBar } from '@/components/shared/MiniSeasonBar';

interface Props {
  product: ProductProfile;
}

export function ProductProfileCard({ product }: Props) {
  const [seasonStart, seasonEnd] = (product.seasonality ?? 'Jan-Dec').split(/[–\-]/);

  return (
    <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{product.id.replace(/_/g, ' ')}</div>
        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{product.hsCode}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: '#64748b' }}>Season: {product.seasonality}</span>
        <span style={{ color: product.requiresColdChain ? '#7DD3FC' : '#64748b' }}>
          {product.requiresColdChain ? '❄ Cold chain' : 'Ambient'}
        </span>
      </div>

      <MiniSeasonBar start={seasonStart ?? 'Jan'} end={seasonEnd ?? 'Dec'} />
    </div>
  );
}
```

- [ ] **Step 6: Create `CommercialProfileCard.tsx`**

Draft profiles: dashed border + `opacity: 0.55`.

The spec §7.3 requires showing bank, avg collection days (with threshold coloring: ok if ≤ 7d for L/C or ≤ 45d for T/T; warn otherwise), and currency. The existing `CommercialProfile` type does not have these fields. First, add them to `types/index.ts` in the `CommercialProfile` interface and add matching values to `lib/mock-data/commercial-profiles.ts`:

```ts
// Add to CommercialProfile interface in types/index.ts:
bank?: string;
avgCollectionDays?: number;
currency?: string;
isDraft?: boolean;
```

Also add these fields to the mock data entries in `commercial-profiles.ts`. Mark one entry with `isDraft: true` (e.g., `dap_open_account` or a new 6th profile). Add `bank`, `avgCollectionDays`, and `currency` values for at least 4 of the 6 profiles so the card renders them.

```tsx
import type { CommercialProfile } from '@/types';

interface Props {
  profile: CommercialProfile;
  isDraft?: boolean;
  activePOCount?: number;
}

export function CommercialProfileCard({ profile, isDraft = false, activePOCount = 0 }: Props) {
  const avgDaysOk = profile.avgCollectionDays == null ? true
    : profile.paymentMethod === 'L/C' ? profile.avgCollectionDays <= 7
    : profile.avgCollectionDays <= 45;

  return (
    <div style={{
      background: '#1a1f2e',
      border: isDraft ? '1px dashed #ffffff30' : '1px solid #ffffff12',
      borderRadius: '8px',
      padding: '14px',
      opacity: isDraft ? 0.55 : 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>
        {profile.label.replace('commercial.', '').replace(/_/g, ' ')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
        <div><span style={{ color: '#e2e8f0', fontWeight: 600 }}>{profile.incoterm}</span> · {profile.paymentTerms}</div>
        {profile.bank && <div>Banco: {profile.bank}</div>}
        {profile.currency && <div>Moneda: {profile.currency}</div>}
        {profile.avgCollectionDays != null && (
          <div style={{ color: avgDaysOk ? '#00E696' : '#F59E0B' }}>
            Cobro promedio: {profile.avgCollectionDays}d {avgDaysOk ? '✓' : '⚠'}
          </div>
        )}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #ffffff08' }}>
        {isDraft && (
          <span style={{ fontSize: '10px', color: '#64748b' }}>Draft</span>
        )}
        {activePOCount > 0 && (
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{activePOCount} active POs</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `app/compliance/page.tsx`**

```tsx
import { marketProfiles } from '@/lib/mock-data/market-rules';
import { productProfiles } from '@/lib/mock-data/product-profiles';
import { commercialProfiles } from '@/lib/mock-data/commercial-profiles';
import { alerts } from '@/lib/mock-data/alerts';
import { MarketRulePackCard } from '@/components/compliance/MarketRulePackCard';
import { ProductProfileCard } from '@/components/compliance/ProductProfileCard';
import { CommercialProfileCard } from '@/components/compliance/CommercialProfileCard';
import { SentinelQueue } from '@/components/compliance/SentinelQueue';

export default function CompliancePage() {
  const complianceAlerts = alerts.filter(a => a.category === 'market_compliance');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Market Rule Packs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {marketProfiles.slice(0, 3).map(m => (
            <MarketRulePackCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Product Profiles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {productProfiles.map(p => (
            <ProductProfileCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Commercial Profiles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {commercialProfiles.map(p => (
            <CommercialProfileCard key={p.id} profile={p} isDraft={p.isDraft} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Master Data Sentinel Queue</h2>
        <SentinelQueue alerts={complianceAlerts} />
      </section>
    </div>
  );
}
```

Note: `SentinelQueue` uses `useTranslations` so it's a client component. Add `'use client'` at the top of `SentinelQueue.tsx` if Next.js reports it cannot use hooks in a server component.

- [ ] **Step 8: Run tests**

```bash
cd agora-app && pnpm test -- phase3-components
```

Expected: all SentinelQueue tests pass, all previous tests still pass.

- [ ] **Step 9: Run full test suite**

```bash
cd agora-app && pnpm test
```

Expected: all tests pass.

- [ ] **Step 10: TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 11: Commit**

```bash
git add agora-app/components/compliance/ agora-app/app/compliance/
git commit -m "feat(phase3): compliance page — market packs, products, commercial profiles, sentinel queue"
```

---

## Final verification

- [ ] Run `pnpm tsc --noEmit` — 0 errors
- [ ] Run `pnpm test` — all tests pass (new + existing)
- [ ] Spot-check each route in the browser: `/containers`, `/purchase-orders`, `/purchase-orders/[id]`, `/importers`, `/importers/[id]`, `/producers`, `/producers/[id]`, `/compliance`

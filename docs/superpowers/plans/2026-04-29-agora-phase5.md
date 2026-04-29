# Agora Phase 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/performance` page (agent grid, penalty heatmap, cold-chain panel), add Framer Motion polish (page transitions, KPI count-up, alert pulse), and audit conditional rendering + i18n.

**Architecture:** Server component page at `app/performance/page.tsx` assembles mock data and passes props to three new client components: `AgentGrid`, `ColdChainPanel`, and the updated `PenaltyHeatmap`. Polish is applied globally via a `PageTransition` wrapper and `useCountUp` hook. All cold-chain UI is gated on `reefers.length > 0`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind v4 (tokens in `@theme {}` in `globals.css`), next-intl v4, Framer Motion, Vitest + React Testing Library. Run tests from `agora-app/` with `npm test`.

---

## File Map

**New files:**
- `lib/hooks/useCountUp.ts` — count-up animation hook
- `lib/mock-data/agent-statuses.ts` — static status + lastAction per agent (25 entries)
- `app/performance/page.tsx` — server component, page root
- `app/performance/components/AgentCard.tsx` — single agent card
- `app/performance/components/AgentGrid.tsx` — 25-card grid, handles cold-sentinel filtering
- `app/performance/components/ColdChainPanel.tsx` — bottom-right cold-chain panel
- `components/shared/PageTransition.tsx` — Framer Motion entry animation wrapper

**Modified files:**
- `types/index.ts` — rename `PenaltyAvoidedRow.counts` → `savedUsd`; add `AgentStatus`, `AgentStatusEntry`
- `lib/mock-data/penalty-events.ts` — replace count data with dollar savings values
- `lib/mock-data/kpis.ts` — add `active_agents` and `cold_incidents` KPIs
- `components/dashboard/PenaltyHeatmap.tsx` — dollar thresholds, `fmtSaved`, `hidePerformanceLink` prop
- `components/kpi/KPITile.tsx` — integrate `useCountUp`
- `components/dashboard/AlertsRail.tsx` — pulse CSS on `crit` alerts
- `components/alerts/ValidationFeed.tsx` — pulse CSS on `crit` validations
- `app/page.tsx`, `app/containers/page.tsx`, `app/purchase-orders/page.tsx`, `app/importers/page.tsx`, `app/producers/page.tsx`, `app/compliance/page.tsx`, `app/documents/page.tsx` — wrap root div in `PageTransition`
- `messages/es.json`, `messages/en.json` — add `performance` namespace

**Updated tests:**
- `__tests__/mock-data.ops.test.ts` — update `kpis.length` assertion (5 → 7), update `penaltyAvoidedMatrix` field name
- `__tests__/ops-dashboard.test.tsx` — fix KPIStrip mock to use prop instead of global `kpis` array
- `__tests__/kpi-strip.test.tsx` — update tile-count assertion (5 → 7); add `useCountUp` module mock
- `__tests__/i18n.test.ts` — add `performance` to `requiredNamespaces`
- New: `__tests__/performance/AgentGrid.test.tsx`
- New: `__tests__/performance/ColdChainPanel.test.tsx`
- New: `__tests__/performance/performance-page.test.tsx`
- New: `__tests__/hooks/useCountUp.test.ts`

---

## Task 1: Update `PenaltyAvoidedRow` type and data

This must be first — all subsequent tasks depend on the type being correct.

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/mock-data/penalty-events.ts`
- Modify: `__tests__/mock-data.ops.test.ts`

- [ ] **Step 1: Update `PenaltyAvoidedRow` in `types/index.ts`**

Find the interface (search for `PenaltyAvoidedRow`) and rename the field:

```typescript
export interface PenaltyAvoidedRow {
  buyerName: string;
  savedUsd: Record<PenaltyEventType, number>;  // was: counts
}
```

- [ ] **Step 2: Update `penalty-events.ts` with dollar values**

Replace the entire `penaltyAvoidedMatrix` array in `lib/mock-data/penalty-events.ts`:

```typescript
export const penaltyAvoidedMatrix: PenaltyAvoidedRow[] = [
  { buyerName: 'Mumbai Dry Fruits', savedUsd: { refumigation:2400, phyto_reissue:1100, vgm_late:400,  dus_error:900, bl_correction:700,  demurrage:800,  detention:600,  bank_discrepancy:2100 } },
  { buyerName: 'Frutimar SL',       savedUsd: { refumigation:800,  phyto_reissue:1200, vgm_late:800,  dus_error:500, bl_correction:2400, demurrage:1600, detention:600,  bank_discrepancy:1600 } },
  { buyerName: 'Sun Yang Foods',    savedUsd: { refumigation:1600, phyto_reissue:600,  vgm_late:400,  dus_error:500, bl_correction:700,  demurrage:3200, detention:2700, bank_discrepancy:800  } },
  { buyerName: 'Al Madina Trading', savedUsd: { refumigation:800,  phyto_reissue:600,  vgm_late:400,  dus_error:900, bl_correction:1400, demurrage:2400, detention:1200, bank_discrepancy:800  } },
  { buyerName: 'Pacific Produce',   savedUsd: { refumigation:1600, phyto_reissue:1200, vgm_late:1200, dus_error:900, bl_correction:700,  demurrage:800,  detention:600,  bank_discrepancy:1600 } },
  { buyerName: 'Costco FreshCo',    savedUsd: { refumigation:800,  phyto_reissue:600,  vgm_late:800,  dus_error:500, bl_correction:700,  demurrage:800,  detention:600,  bank_discrepancy:1600 } },
];
```

- [ ] **Step 3: Update the test that references `counts`**

In `__tests__/mock-data.ops.test.ts`, find any assertions referencing `.counts` on `penaltyAvoidedMatrix` rows and update them to `.savedUsd`.

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass (TypeScript compilation errors on `PenaltyHeatmap` are expected until Task 2).

- [ ] **Step 5: Commit**

```bash
git add types/index.ts lib/mock-data/penalty-events.ts __tests__/mock-data.ops.test.ts
git commit -m "refactor(types): rename PenaltyAvoidedRow.counts to savedUsd, populate dollar values"
```

---

## Task 2: Update `PenaltyHeatmap` for dollar values

**Files:**
- Modify: `components/dashboard/PenaltyHeatmap.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/heatmap-dollars.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';
import type { PenaltyAvoidedRow } from '@/types';

const singleRow: PenaltyAvoidedRow[] = [{
  buyerName: 'Test Buyer',
  savedUsd: { refumigation:3200, phyto_reissue:0, vgm_late:800, dus_error:1500, bl_correction:2000, demurrage:999, detention:1000, bank_discrepancy:400 },
}];

describe('PenaltyHeatmap — dollar mode', () => {
  it('displays abbreviated dollar values', () => {
    render(<PenaltyHeatmap matrix={singleRow} />);
    expect(screen.getByText('$3.2k')).toBeInTheDocument();
    expect(screen.getByText('$800')).toBeInTheDocument();
    expect(screen.getByText('$1.5k')).toBeInTheDocument();
  });

  it('shows empty cell for $0', () => {
    render(<PenaltyHeatmap matrix={singleRow} />);
    // $0 cell should render nothing — check no "$0" text
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
  });

  it('hides OPEN PERFORMANCE link when hidePerformanceLink is true', () => {
    render(<PenaltyHeatmap matrix={singleRow} hidePerformanceLink />);
    expect(screen.queryByText(/OPEN PERFORMANCE/)).not.toBeInTheDocument();
  });

  it('shows OPEN PERFORMANCE link by default', () => {
    render(<PenaltyHeatmap matrix={singleRow} />);
    expect(screen.getByText(/OPEN PERFORMANCE/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd agora-app && npm test -- heatmap-dollars
```

Expected: FAIL — `savedUsd` not found, type errors.

- [ ] **Step 3: Implement dollar-mode heatmap**

Replace the contents of `components/dashboard/PenaltyHeatmap.tsx`:

```typescript
import type { PenaltyAvoidedRow, PenaltyEventType } from '@/types';

const COL_LABELS = ['Refumig.', 'Phyto Reissue', 'VGM Late', 'DUS Error', 'BL Correction', 'Demurrage', 'Detention', 'Bank Discrep.'];
const COL_KEYS: PenaltyEventType[] = ['refumigation', 'phyto_reissue', 'vgm_late', 'dus_error', 'bl_correction', 'demurrage', 'detention', 'bank_discrepancy'];

function fmtSaved(usd: number): string {
  if (usd === 0) return '';
  return usd >= 1000 ? `$${(usd / 1000).toFixed(1)}k` : `$${usd}`;
}

function cellClass(usd: number): string {
  if (usd === 0)          return 'bg-bg-2 text-ink-4';
  if (usd < 1000)         return 'bg-[rgba(0,230,150,0.10)] text-ink-3';
  if (usd < 2000)         return 'bg-[rgba(0,230,150,0.22)] text-ink-2';
  if (usd < 3000)         return 'bg-[rgba(0,230,150,0.40)] text-ink-1';
  return 'bg-mint-500 text-bg-0 font-semibold';
}

interface Props {
  matrix: PenaltyAvoidedRow[];
  hidePerformanceLink?: boolean;
}

export function PenaltyHeatmap({ matrix, hidePerformanceLink = false }: Props) {
  return (
    <div className="p-4">
      {/* Header row */}
      <div className="grid gap-[3px] mb-[3px]" style={{ gridTemplateColumns: '110px repeat(8, 1fr)' }}>
        <div />
        {COL_LABELS.map((label, i) => (
          <div
            key={i}
            data-testid="heatmap-col-header"
            className="font-mono text-[9px] text-ink-3 flex items-end justify-center pb-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 60 }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Buyer rows */}
      {matrix.map((row, ri) => (
        <div
          key={ri}
          data-testid="heatmap-row"
          className="grid gap-[3px] mb-[3px]"
          style={{ gridTemplateColumns: '110px repeat(8, 1fr)' }}
        >
          <span className="text-[10.5px] text-ink-2 flex items-center pr-2 truncate">{row.buyerName}</span>
          {COL_KEYS.map((key, ci) => {
            const v = row.savedUsd[key] ?? 0;
            return (
              <div
                key={ci}
                className={`rounded-sm flex items-center justify-center text-[9px] font-mono ${cellClass(v)}`}
                style={{ aspectRatio: '2.2' }}
              >
                {fmtSaved(v)}
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-ink-4">
          <span>$0</span>
          {[0, 500, 1500, 2500, 3500].map(v => (
            <div key={v} className={`h-3 w-3 rounded-sm ${cellClass(v)}`} />
          ))}
          <span>$3k+</span>
        </div>
        {!hidePerformanceLink && (
          <a href="/performance" className="font-mono text-[9px] text-mint-500 hover:text-mint-400">
            OPEN PERFORMANCE →
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass including the new heatmap-dollars tests.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/PenaltyHeatmap.tsx __tests__/heatmap-dollars.test.tsx
git commit -m "feat(heatmap): dollar savings thresholds, fmtSaved, hidePerformanceLink prop"
```

---

## Task 3: Add new types + `agent-statuses` mock data

**Files:**
- Modify: `types/index.ts`
- Create: `lib/mock-data/agent-statuses.ts`

- [ ] **Step 1: Add `AgentStatus` and `AgentStatusEntry` to `types/index.ts`**

Append after the existing `PenaltyAvoidedRow` interface:

```typescript
export type AgentStatus = 'active' | 'idle' | 'alert';

export interface AgentStatusEntry {
  agentId: string;
  status: AgentStatus;
  lastAction: string; // raw display string in Spanish — not an i18n key
}
```

- [ ] **Step 2: Create `lib/mock-data/agent-statuses.ts`**

The `agentId` values must exactly match the `id` fields in `lib/mock-data/agents.ts`.

```typescript
import type { AgentStatusEntry } from '@/types';

export const agentStatuses: AgentStatusEntry[] = [
  // collect
  { agentId: 'booking_confirmation_collector', status: 'active', lastAction: 'Recibió 3 confirmaciones · hace 1h' },
  { agentId: 'doc_deadline_guardian',          status: 'active', lastAction: 'Alerta de cierre DUS enviada · hace 18h' },
  { agentId: 'invoice_fetcher',                status: 'active', lastAction: 'Obtuvo 2 facturas · hace 3h' },
  { agentId: 'bl_tracker',                     status: 'active', lastAction: 'BL confirmado emitido · hace 6h' },
  // validate
  { agentId: 'invoice_validator',              status: 'active', lastAction: 'Validó MSCU-7842156 · hace 2h' },
  { agentId: 'phyto_validator',                status: 'active', lastAction: 'Certificado válido · hace 4h' },
  { agentId: 'weight_reconciler',              status: 'active', lastAction: 'Discrepancia resuelta · hace 1d' },
  { agentId: 'customs_check',                  status: 'active', lastAction: 'DUS pendiente de presentación · ahora' },
  { agentId: 'lc_discrepancy_catcher',         status: 'idle',   lastAction: 'Esperando borrador L/C · inactivo' },
  // monitor
  { agentId: 'vessel_tracker',                 status: 'active', lastAction: 'MAEU en horario · hace 30m' },
  { agentId: 'port_congestion_watcher',        status: 'active', lastAction: 'Yangshan: congestion moderada · hace 1h' },
  { agentId: 'cutoff_sentinel',                status: 'active', lastAction: '18h para cierre de documentos · activo' },
  { agentId: 'eta_monitor',                    status: 'active', lastAction: 'ETA sin cambios · hace 2h' },
  { agentId: 'lunar_new_year_window_watcher',  status: 'idle',   lastAction: '27d para ventana Año Nuevo Lunar · observando' },
  // orchestrate
  { agentId: 'export_workflow_orchestrator',   status: 'active', lastAction: '2 flujos activos · en ejecución' },
  { agentId: 'approval_router',                status: 'idle',   lastAction: 'Esperando aprobación · inactivo' },
  { agentId: 'document_assembler',             status: 'active', lastAction: 'Armó 4 sets de documentos · hace 3h' },
  // reconcile
  { agentId: 'po_invoice_reconciler',          status: 'active', lastAction: '3 OCs conciliadas · hoy' },
  { agentId: 'freight_cost_reconciler',        status: 'active', lastAction: 'Variación $240 marcada · hace 4h' },
  // cold chain sentinels
  { agentId: 'pre_cooling_tracker',            status: 'active', lastAction: 'Preenfriamiento completo · verificado' },
  { agentId: 'cold_storage_monitor',           status: 'active', lastAction: '−0.5°C estable · hace 15m' },
  { agentId: 'reefer_pti_validator',           status: 'active', lastAction: 'PTI aprobado · hace 2d' },
  { agentId: 'in_transit_telemetry_watcher',   status: 'active', lastAction: 'Sin excursiones · hace 1h' },
  { agentId: 'cold_treatment_auditor',         status: 'active', lastAction: 'Día 10/15 en curso · activo' },
  { agentId: 'arrival_cold_chain_coordinator', status: 'active', lastAction: 'Prep llegada Yangshan · 5d restantes' },
];
```

- [ ] **Step 3: Run tests**

```bash
cd agora-app && npm test
```

Expected: all 178+ tests pass.

- [ ] **Step 4: Commit**

```bash
git add types/index.ts lib/mock-data/agent-statuses.ts
git commit -m "feat(data): add AgentStatusEntry type and 25-entry agent-statuses mock data"
```

---

## Task 4: Add `active_agents` and `cold_incidents` KPIs

**Files:**
- Modify: `lib/mock-data/kpis.ts`
- Modify: `__tests__/mock-data.ops.test.ts`

- [ ] **Step 1: Update the failing kpis-length test**

In `__tests__/mock-data.ops.test.ts`, find `expect(kpis.length).toBe(5)` and change to `toBe(7)`.

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd agora-app && npm test -- mock-data.ops
```

Expected: FAIL on `kpis.length` assertion.

- [ ] **Step 3: Add new KPIs to `lib/mock-data/kpis.ts`**

Append these two entries to the `kpis` array:

```typescript
{ id: 'active_agents',  labelKey: 'performance.kpiActiveAgents',  value: 25, unit: 'count', deltaPct: 9,   sparkline: [21,22,22,23,23,24,25,25] },
{ id: 'cold_incidents', labelKey: 'performance.kpiColdIncidents', value: 2,  unit: 'count', deltaPct: 100, sparkline: [0,0,1,0,0,1,1,2], deltaPositiveIsGood: false },
```

- [ ] **Step 4: Scope the ops dashboard to its original 5 KPIs**

`app/page.tsx` passes `kpis` directly to `KPIStrip` — after adding 2 new KPIs it would show 7 tiles. Add a filter constant so the ops dashboard stays at 5 tiles:

```typescript
// In app/page.tsx, add after imports:
const OPS_DASHBOARD_KPI_IDS = ['active_shipments', 'avoided_penalties', 'demurrage_incurred', 'avg_cycle_time', 'doc_auto_gen_rate'];

// Replace the KPIStrip line:
const dashKpis = OPS_DASHBOARD_KPI_IDS.map(id => kpis.find(k => k.id === id)!).filter(Boolean);
// ...
<KPIStrip kpis={dashKpis} />
```

- [ ] **Step 5: Update kpi-strip test KPIStrip tile count**

In `__tests__/kpi-strip.test.tsx`, the test `renders exactly 5 tiles` passes ALL `kpis` to KPIStrip — after this task `kpis` has 7 entries. Update:

```typescript
// Find the test "renders exactly 5 tiles" and change:
it('renders exactly 7 tiles', async () => {
  render(wrap(await KPIStrip({ kpis })));
  expect(screen.getAllByTestId('kpi-value').length).toBe(7);  // was 5
```

- [ ] **Step 6: Fix `ops-dashboard.test.tsx` KPIStrip mock to use the prop**

The current mock (`lines 29–41`) imports all `kpis` and ignores the prop — after this task it would render 7 tiles and break `toBe(5)`. Replace the mock with a prop-based version:

```typescript
// In __tests__/ops-dashboard.test.tsx, replace the entire KPIStrip mock block:
vi.mock('@/components/kpi/KPIStrip', () => ({
  KPIStrip: ({ kpis }: { kpis: Array<{ id: string; value: number }> }) => (
    <div>
      {kpis.map((k) => (
        <span key={k.id} data-testid="kpi-value">{k.value}</span>
      ))}
    </div>
  ),
}));
```

With the `OPS_DASHBOARD_KPI_IDS` filter added to `app/page.tsx` (Step 4), the page passes exactly 5 KPIs, so `toBe(5)` remains correct.

- [ ] **Step 7: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add lib/mock-data/kpis.ts __tests__/mock-data.ops.test.ts __tests__/kpi-strip.test.tsx __tests__/ops-dashboard.test.tsx app/page.tsx
git commit -m "feat(data): add active_agents and cold_incidents KPIs; scope ops dashboard to original 5"
```

---

## Task 5: `useCountUp` hook

**Files:**
- Create: `lib/hooks/useCountUp.ts`
- Create: `__tests__/hooks/useCountUp.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/hooks/useCountUp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

// Test the pure math — easeOutCubic formula exported from the hook
import { easeOutCubic } from '@/lib/hooks/useCountUp';

describe('useCountUp — easeOutCubic', () => {
  it('returns 0 at progress 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('returns 1 at progress 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('is greater than linear midpoint at progress 0.5 (ease-out accelerates early)', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd agora-app && npm test -- useCountUp
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/hooks/useCountUp.ts`**

```typescript
import { useState, useEffect } from 'react';

export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test -- useCountUp
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/hooks/useCountUp.ts __tests__/hooks/useCountUp.test.ts
git commit -m "feat(hooks): add useCountUp with easeOutCubic"
```

---

## Task 6: `AgentCard` + `AgentGrid` components

**Files:**
- Create: `app/performance/components/AgentCard.tsx`
- Create: `app/performance/components/AgentGrid.tsx`
- Create: `__tests__/performance/AgentGrid.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/performance/AgentGrid.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgentGrid } from '@/app/performance/components/AgentGrid';
import { agents } from '@/lib/mock-data/agents';
import { agentStatuses } from '@/lib/mock-data/agent-statuses';
import type { Container } from '@/types';

const reefers = [{ coldChain: { required: true } }] as Container[];
const noReefers: Container[] = [];

describe('AgentGrid', () => {
  it('renders all 25 agents when reefers exist', () => {
    render(<AgentGrid agents={agents} statuses={agentStatuses} reefers={reefers} />);
    expect(screen.getAllByTestId('agent-card').length).toBe(25);
  });

  it('hides cold-chain sentinel cards when no reefers', () => {
    render(<AgentGrid agents={agents} statuses={agentStatuses} reefers={noReefers} />);
    const cards = screen.getAllByTestId('agent-card');
    expect(cards.length).toBe(19); // 25 total - 6 cold-chain sentinels
  });

  it('shows ❄ badge only on cold-chain agents', () => {
    render(<AgentGrid agents={agents} statuses={agentStatuses} reefers={reefers} />);
    expect(screen.getAllByTestId('cold-badge').length).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd agora-app && npm test -- AgentGrid
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `app/performance/components/AgentCard.tsx`**

```typescript
'use client';
import type { Agent, AgentStatusEntry } from '@/types';
import clsx from 'clsx';

interface AgentCardProps {
  agent: Agent;
  statusEntry: AgentStatusEntry;
}

const DOT_COLOR: Record<string, string> = {
  active: 'bg-mint-500',
  idle: 'bg-ink-4',
  alert: 'bg-severity-risk',
};

const COLD_DOT_COLOR = 'bg-[#7DD3FC]';

export function AgentCard({ agent, statusEntry }: AgentCardProps) {
  const isCold = agent.tags.includes('cold_chain');
  const dotColor = isCold && statusEntry.status === 'active'
    ? COLD_DOT_COLOR
    : (DOT_COLOR[statusEntry.status] ?? 'bg-ink-4');

  return (
    <div
      data-testid="agent-card"
      className={clsx(
        'rounded-[7px] border p-2.5 flex flex-col gap-1.5',
        isCold
          ? 'bg-[#0d1a26] border-l-2 border-l-[rgba(125,211,252,0.5)] border-[rgba(125,211,252,0.2)]'
          : 'bg-bg-2 border-[var(--line-soft)]',
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
        <span className={clsx('text-[11px] font-medium leading-snug flex-1', isCold ? 'text-[#7DD3FC]' : 'text-ink-2')}>
          {agent.label}
        </span>
        {isCold && (
          <span data-testid="cold-badge" className="text-[9px] shrink-0">❄</span>
        )}
      </div>
      <div className="font-mono text-[9px] text-ink-4 leading-snug">
        {statusEntry.lastAction}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/performance/components/AgentGrid.tsx`**

```typescript
'use client';
import type { Agent, AgentStatusEntry, Container } from '@/types';
import { AgentCard } from './AgentCard';

interface AgentGridProps {
  agents: Agent[];
  statuses: AgentStatusEntry[];
  reefers: Container[];
}

export function AgentGrid({ agents, statuses, reefers }: AgentGridProps) {
  const statusMap = new Map(statuses.map(s => [s.agentId, s]));
  const visibleAgents = reefers.length > 0
    ? agents
    : agents.filter(a => !a.tags.includes('cold_chain'));

  return (
    <div
      className="grid gap-2 p-3.5"
      style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
    >
      {visibleAgents.map(agent => {
        const statusEntry = statusMap.get(agent.id) ?? {
          agentId: agent.id,
          status: 'idle' as const,
          lastAction: '—',
        };
        return <AgentCard key={agent.id} agent={agent} statusEntry={statusEntry} />;
      })}
    </div>
  );
}
```

- [ ] **Step 5: Run tests**

```bash
cd agora-app && npm test -- AgentGrid
```

Expected: 3 tests pass. Note: `agent.label` in `AgentCard` renders the i18n key string (e.g. `agents.booking_confirmation_collector.label`) in test context — that is acceptable for unit tests.

- [ ] **Step 6: Commit**

```bash
git add app/performance/components/AgentCard.tsx app/performance/components/AgentGrid.tsx __tests__/performance/AgentGrid.test.tsx
git commit -m "feat(performance): AgentCard and AgentGrid components with cold-sentinel gating"
```

---

## Task 7: `ColdChainPanel` component

**Files:**
- Create: `app/performance/components/ColdChainPanel.tsx`
- Create: `__tests__/performance/ColdChainPanel.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/performance/ColdChainPanel.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ColdChainPanel } from '@/app/performance/components/ColdChainPanel';
import { containers } from '@/lib/mock-data/containers';
import { agentStatuses } from '@/lib/mock-data/agent-statuses';
import { agents } from '@/lib/mock-data/agents';

const reefers = containers.filter(c => c.coldChain?.required === true);

describe('ColdChainPanel', () => {
  it('renders nothing when reefers is empty', () => {
    const { container } = render(
      <ColdChainPanel reefers={[]} agents={agents} agentStatuses={agentStatuses} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows active container ID when reefers exist', () => {
    render(<ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />);
    expect(screen.getByText('MAEU-9182734')).toBeInTheDocument();
  });

  it('shows cold treatment progress bar', () => {
    render(<ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />);
    expect(screen.getByTestId('treatment-progress')).toBeInTheDocument();
  });

  it('lists cold-chain sentinel agents', () => {
    render(<ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />);
    expect(screen.getAllByTestId('sentinel-row').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd agora-app && npm test -- ColdChainPanel
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `app/performance/components/ColdChainPanel.tsx`**

`Container` fields verified from `types/index.ts`: `productLabel`, `polLabel`, `podLabel`. `ColdChainTrace` fields: `treatmentRequiredMinutes`, `treatmentMinutesCompliant`, `excursionEvents: ExcursionEvent[]`. Convert minutes to days for display.

```typescript
'use client';
import type { Agent, AgentStatusEntry, Container } from '@/types';

interface ColdChainPanelProps {
  reefers: Container[];
  agents: Agent[];
  agentStatuses: AgentStatusEntry[];
}

export function ColdChainPanel({ reefers, agents, agentStatuses }: ColdChainPanelProps) {
  if (reefers.length === 0) return null;

  const container = reefers[0]!;
  const cc = container.coldChain!;
  const daysCurrent = Math.round(cc.treatmentMinutesCompliant / 60 / 24);
  const daysRequired = Math.round(cc.treatmentRequiredMinutes / 60 / 24);
  const progressPct = daysRequired > 0 ? Math.round((daysCurrent / daysRequired) * 100) : 0;

  const coldAgents = agents.filter(a => a.tags.includes('cold_chain'));
  const statusMap = new Map(agentStatuses.map(s => [s.agentId, s]));

  const excursions = cc.excursionEvents.length;
  const incidents = excursions;

  return (
    <div className="bg-[#0d1a26] border border-[rgba(125,211,252,0.2)] rounded-[10px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(125,211,252,0.1)]">
        <span className="text-sm font-medium text-[#7DD3FC]">❄ Cold Chain</span>
        <span className="font-mono text-[9px] text-[#4a7a99] tracking-widest uppercase">
          {reefers.length} active
        </span>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-5">
        {/* Container card */}
        <div className="bg-bg-1 border border-[rgba(125,211,252,0.12)] rounded-[7px] p-3.5">
          <div className="font-mono text-[11px] text-[#7DD3FC] mb-1">{container.id}</div>
          <div className="text-[12px] text-ink-2 mb-3">
            {container.productLabel} · {container.polLabel} → {container.podLabel}
          </div>
          <div>
            <div className="font-mono text-[9px] text-ink-4 tracking-widest mb-1.5 flex justify-between">
              <span>COLD TREATMENT</span>
              <span className="text-[#7DD3FC]">DAY {daysCurrent} / {daysRequired}</span>
            </div>
            <div
              data-testid="treatment-progress"
              className="h-[5px] bg-white/6 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-[#7DD3FC] rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sentinel list */}
        <div className="flex-1">
          <div className="font-mono text-[9px] text-[#4a7a99] tracking-widest mb-1">
            SENTINEL STATUS
          </div>
          <div className="flex flex-col">
            {coldAgents.map(agent => {
              const entry = statusMap.get(agent.id);
              return (
                <div
                  key={agent.id}
                  data-testid="sentinel-row"
                  className="flex items-center gap-2 py-2 border-b border-white/4 last:border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7DD3FC] shrink-0" />
                  <span className="text-[11px] text-ink-2 flex-1">{agent.label}</span>
                  <span className="font-mono text-[9px] text-mint-600">
                    {entry?.status ?? 'active'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div>
          {[
            { label: 'EXCURSIONS', value: String(excursions), color: excursions === 0 ? 'text-mint-500' : 'text-severity-risk' },
            { label: 'INCIDENTS',  value: String(incidents),  color: incidents  === 0 ? 'text-mint-500' : 'text-severity-risk' },
            { label: 'COMPLIANCE', value: 'ON TRACK',         color: 'text-mint-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-t border-[rgba(125,211,252,0.08)]">
              <span className="font-mono text-[10px] text-ink-4 tracking-widest">{label}</span>
              <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test -- ColdChainPanel
```

Expected: all ColdChainPanel tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/performance/components/ColdChainPanel.tsx __tests__/performance/ColdChainPanel.test.tsx
git commit -m "feat(performance): ColdChainPanel — treatment progress, sentinel list, stats"
```

---

## Task 8: i18n — `performance` namespace

**Files:**
- Modify: `messages/es.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add `performance` namespace to `messages/es.json`**

Add this top-level key alongside the existing namespaces:

```json
"performance": {
  "title": "Rendimiento",
  "kpiActiveAgents": "Agentes Activos",
  "kpiColdIncidents": "Incidentes Cadena de Frío",
  "digitalTeam": "Equipo Digital",
  "agentsCount": "{count} agentes · {coldCount} centinelas cadena de frío",
  "dollarsSaved": "Dólares Ahorrados — Penalidades Evitadas",
  "seasonMeta": "Temporada 2026–27 · USD · por comprador × tipo",
  "coldChainTitle": "Cadena de Frío",
  "coldChainActive": "{count} activa",
  "sentinelStatus": "Estado de Centinelas",
  "excursions": "Excursiones",
  "incidents": "Incidentes",
  "compliance": "Cumplimiento",
  "onTrack": "EN CURSO"
}
```

- [ ] **Step 2: Add `performance` namespace to `messages/en.json`**

```json
"performance": {
  "title": "Performance",
  "kpiActiveAgents": "Active Agents",
  "kpiColdIncidents": "Cold Chain Incidents",
  "digitalTeam": "Digital Team",
  "agentsCount": "{count} agents · {coldCount} cold-chain sentinels",
  "dollarsSaved": "Dollars Saved — Penalties Avoided",
  "seasonMeta": "Season 2026–27 · USD · by buyer × type",
  "coldChainTitle": "Cold Chain",
  "coldChainActive": "{count} active",
  "sentinelStatus": "Sentinel Status",
  "excursions": "Excursions",
  "incidents": "Incidents",
  "compliance": "Compliance",
  "onTrack": "ON TRACK"
}
```

- [ ] **Step 3: Add `performance` to `requiredNamespaces` in `__tests__/i18n.test.ts`**

Find the `requiredNamespaces` array and append `'performance'`:

```typescript
const requiredNamespaces = ['nav','dashboard','containers','coldChain','agents','settings','common','docs','validations','tabs','performance'];
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add messages/es.json messages/en.json __tests__/i18n.test.ts
git commit -m "feat(i18n): add performance namespace to es and en"
```

---

## Task 9: `/performance` page

**Files:**
- Create: `app/performance/page.tsx`
- Create: `__tests__/performance/performance-page.test.tsx`

- [ ] **Step 1: Write the failing smoke test**

Create `__tests__/performance/performance-page.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../messages/en.json';

vi.mock('next-intl/server', async () => {
  const messages = (await import('../../messages/en.json')).default as any;
  return {
    getTranslations: async () => (key: string) =>
      key.split('.').reduce((obj: any, k) => obj?.[k], messages) ?? key,
  };
});

// KPIStrip is an async RSC — stub it to avoid nested async RSC resolution in tests
vi.mock('@/components/kpi/KPIStrip', () => ({
  KPIStrip: ({ kpis }: { kpis: Array<{ id: string; value: number }> }) => (
    <div>
      {kpis.map(k => (
        <span key={k.id} data-testid="kpi-value">{k.value}</span>
      ))}
    </div>
  ),
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('/performance page', () => {
  it('renders all 25 agent cards when reefers exist', async () => {
    const PerformancePage = (await import('@/app/performance/page')).default;
    render(wrap(await PerformancePage()));
    expect(screen.getAllByTestId('agent-card').length).toBe(25);
  });

  it('renders the KPI strip with 5 performance KPIs', async () => {
    const PerformancePage = (await import('@/app/performance/page')).default;
    render(wrap(await PerformancePage()));
    expect(screen.getAllByTestId('kpi-value').length).toBe(5);
  });

  it('renders the heatmap', async () => {
    const PerformancePage = (await import('@/app/performance/page')).default;
    render(wrap(await PerformancePage()));
    expect(screen.getAllByTestId('heatmap-row').length).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd agora-app && npm test -- performance-page
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `app/performance/page.tsx`**

```typescript
import { getTranslations } from 'next-intl/server';
import { containers } from '@/lib/mock-data/containers';
import { kpis } from '@/lib/mock-data/kpis';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';
import { agents } from '@/lib/mock-data/agents';
import { agentStatuses } from '@/lib/mock-data/agent-statuses';
import { KPIStrip } from '@/components/kpi/KPIStrip';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';
import { AgentGrid } from './components/AgentGrid';
import { ColdChainPanel } from './components/ColdChainPanel';

const PERF_KPI_IDS = ['avoided_penalties', 'active_agents', 'cold_incidents', 'doc_auto_gen_rate', 'avg_cycle_time'];

export default async function PerformancePage() {
  const t = await getTranslations('performance');
  const reefers = containers.filter(c => c.coldChain?.required === true);
  const perfKpis = PERF_KPI_IDS.map(id => kpis.find(k => k.id === id)!).filter(Boolean);
  const coldAgentCount = agents.filter(a => a.tags.includes('cold_chain')).length;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8 min-h-screen bg-bg-0">
      {/* KPI strip */}
      <KPIStrip kpis={perfKpis} />

      {/* Agent grid */}
      <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
          <span className="text-sm font-medium text-ink-1">{t('digitalTeam')}</span>
          <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
            {t('agentsCount', { count: agents.length, coldCount: coldAgentCount })}
          </span>
        </div>
        <AgentGrid agents={agents} statuses={agentStatuses} reefers={reefers} />
      </section>

      {/* Bottom split: heatmap + cold panel */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px', alignItems: 'stretch' }}>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
            <span className="text-sm font-medium text-ink-1">{t('dollarsSaved')}</span>
            <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
              {t('seasonMeta')}
            </span>
          </div>
          <PenaltyHeatmap matrix={penaltyAvoidedMatrix} hidePerformanceLink />
        </section>

        {reefers.length > 0 && (
          <ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass including the 3 new performance-page tests.

- [ ] **Step 5: Commit**

```bash
git add app/performance/page.tsx __tests__/performance/performance-page.test.tsx
git commit -m "feat(performance): wire up /performance page — KPI strip, agent grid, heatmap, cold panel"
```

---

## Task 10: `PageTransition` wrapper

**Files:**
- Create: `components/shared/PageTransition.tsx`
- Modify: `app/page.tsx`, `app/containers/page.tsx`, `app/purchase-orders/page.tsx`, `app/importers/page.tsx`, `app/producers/page.tsx`, `app/compliance/page.tsx`, `app/documents/page.tsx`, `app/performance/page.tsx`

- [ ] **Step 1: Install Framer Motion if not already present**

```bash
cd agora-app && cat package.json | grep framer
```

If `framer-motion` is not listed, install it:

```bash
cd agora-app && npm install framer-motion
```

- [ ] **Step 2: Create `components/shared/PageTransition.tsx`**

```typescript
'use client';
import { motion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Wrap each page's root element**

For each of the 8 pages below, import `PageTransition` and wrap the outermost `<div>`:

```typescript
import { PageTransition } from '@/components/shared/PageTransition';
// ...
return <PageTransition><div className="...">{/* existing content */}</div></PageTransition>;
```

Pages to update:
- `app/page.tsx`
- `app/containers/page.tsx`
- `app/purchase-orders/page.tsx`
- `app/importers/[id]/page.tsx` and `app/importers/page.tsx`
- `app/producers/[id]/page.tsx` and `app/producers/page.tsx`
- `app/compliance/page.tsx`
- `app/documents/page.tsx`
- `app/performance/page.tsx`

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass. Framer Motion wrapping doesn't affect test output.

- [ ] **Step 5: Commit**

```bash
git add components/shared/PageTransition.tsx app/page.tsx app/containers/page.tsx app/purchase-orders/page.tsx app/importers/ app/producers/ app/compliance/page.tsx app/documents/page.tsx app/performance/page.tsx
git commit -m "feat(polish): add PageTransition Framer Motion wrapper to all 8 primary pages"
```

---

## Task 11: KPITile count-up animation

**Files:**
- Modify: `components/kpi/KPITile.tsx`
- Modify: `__tests__/kpi-strip.test.tsx`

- [ ] **Step 1: Update `KPITile` to use `useCountUp`**

`KPITile` is already a `'use client'` component. Add the hook:

```typescript
'use client';
import { useState, useEffect } from 'react';
import type { KPI } from '@/types';
import { useCountUp } from '@/lib/hooks/useCountUp';

// ... existing Sparkline component unchanged ...

export function KPITile({ kpi, label }: Props) {
  const animatedValue = useCountUp(kpi.value);
  const deltaPct = kpi.deltaPct ?? 0;
  const positiveIsGood = kpi.deltaPositiveIsGood !== false;
  const isGoodChange = deltaPct === 0 ? null : (deltaPct > 0) === positiveIsGood;
  const deltaColorClass = isGoodChange === null ? 'text-ink-3' : isGoodChange ? 'text-mint-500' : 'text-severity-risk';
  const unitLabels: Record<string, string> = { usd: 'USD', pct: '%', count: 'FCL', days: 'DAYS', minutes: 'MIN' };
  const valueDisplay = kpi.unit === 'usd' ? animatedValue.toLocaleString() : String(animatedValue);
  // ... rest unchanged
```

- [ ] **Step 2: Update kpi-strip test to mock `useCountUp` (avoid RAF/jsdom issues)**

`requestAnimationFrame` and `performance.now` are not reliably stubbed in jsdom — fake timers don't advance RAF. Mock `useCountUp` at the module level to return the target directly:

```typescript
// Add at the top of __tests__/kpi-strip.test.tsx, after existing vi imports:
vi.mock('@/lib/hooks/useCountUp', () => ({
  useCountUp: (target: number) => target,
  easeOutCubic: (p: number) => p,
}));
```

With this mock the `renders the KPI value` test remains synchronous — no `waitFor` needed. The existing assertion `toHaveTextContent('12')` stays unchanged.

- [ ] **Step 3: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add components/kpi/KPITile.tsx __tests__/kpi-strip.test.tsx
git commit -m "feat(polish): KPITile count-up animation via useCountUp"
```

---

## Task 12: Alert pulse on critical items

**Files:**
- Modify: `components/dashboard/AlertsRail.tsx`
- Modify: `components/alerts/ValidationFeed.tsx`
- Modify: `app/globals.css` (add keyframes)

- [ ] **Step 1: Add `@keyframes pulse-crit` to `app/globals.css`**

In `globals.css`, add inside the CSS (outside any `@theme` block):

```css
@keyframes pulse-crit {
  0%, 100% { border-color: var(--color-severity-crit); }
  50%       { border-color: transparent; }
}
```

- [ ] **Step 2: Apply pulse to `crit` alert rows in `AlertsRail.tsx`**

In the alert row `<div>`, add conditional animation when `alert.severity === 'crit'`:

```typescript
<div
  key={alert.id}
  data-testid="alert-row"
  className="px-4 py-3 flex flex-col gap-1"
  style={alert.severity === 'crit' ? {
    animation: 'pulse-crit 1.5s ease-in-out infinite',
    border: '1px solid',
  } : undefined}
>
```

- [ ] **Step 3: Apply pulse to `crit` validation rows in `ValidationFeed.tsx`**

Find the validation row `<div>` (it already has `border-l-severity-crit` for crit items via `SEV_BORDER`). Add inline animation for crit severity:

```typescript
style={v.severity === 'crit' ? { animation: 'pulse-crit 1.5s ease-in-out infinite' } : undefined}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/AlertsRail.tsx components/alerts/ValidationFeed.tsx app/globals.css
git commit -m "feat(polish): pulse-crit CSS animation on critical alerts and validations"
```

---

## Task 13: Conditional rendering audit

Verify that all cold-chain UI is fully hidden in pure-walnuts mode.

**Files:**
- Read: `components/containers/ContainerTabs.tsx` (check `ColdChainTab` gating)
- Modify if needed: any component where gating is missing or uses a different condition

- [ ] **Step 1: Check `ColdChainTab` gating**

Read `components/containers/ContainerTabs.tsx`. Verify that the cold-chain tab is only shown when `container.coldChain?.required === true`. If it's always rendered, add the condition.

- [ ] **Step 2: Create walnut-mode smoke test in a separate file**

Create `__tests__/performance/performance-walnut-mode.test.tsx` — a separate file so `vi.resetModules()` applies cleanly:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../messages/en.json';

// Reset module registry before each test in this file
beforeEach(() => {
  vi.resetModules();
});

vi.mock('next-intl/server', async () => {
  const messages = (await import('../../messages/en.json')).default as any;
  return {
    getTranslations: async () => (key: string) =>
      key.split('.').reduce((obj: any, k) => obj?.[k], messages) ?? key,
  };
});

vi.mock('@/components/kpi/KPIStrip', () => ({
  KPIStrip: () => <div />,
}));

vi.mock('@/lib/mock-data/containers', () => ({
  containers: [{ id: 'MSCU-7842156', productLabel: 'Walnuts in shell', coldChain: null }],
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('/performance page — walnut-only mode', () => {
  it('hides cold-chain panel when no reefers exist', async () => {
    const { default: PerformancePage } = await import('@/app/performance/page');
    render(wrap(await PerformancePage()));
    expect(screen.queryByText('❄ Cold Chain')).not.toBeInTheDocument();
  });

  it('hides cold-chain sentinel cards', async () => {
    const { default: PerformancePage } = await import('@/app/performance/page');
    render(wrap(await PerformancePage()));
    // With no reefers, only 19 agents should be visible (25 - 6 cold-chain sentinels)
    expect(screen.getAllByTestId('agent-card').length).toBe(19);
  });
});
```

- [ ] **Step 3: Run full test suite**

```bash
cd agora-app && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add __tests__/performance/performance-walnut-mode.test.tsx
git commit -m "test(audit): verify cold-chain gating in pure-walnuts mode"
```

---

## Task 14: Final i18n audit

**Files:**
- Grep new components for hardcoded strings

- [ ] **Step 1: Grep for hardcoded Spanish/English strings in new files**

```bash
cd agora-app && grep -rn '"[A-Z]' app/performance/ components/shared/PageTransition.tsx
```

```bash
cd agora-app && grep -rn "'[A-Z]" app/performance/ components/shared/PageTransition.tsx
```

Review output. Any user-visible strings that are not in translation files should be moved to `messages/es.json` + `messages/en.json` and accessed via `useTranslations`.

- [ ] **Step 2: Verify both locales compile without missing keys**

```bash
cd agora-app && npm test -- i18n
```

- [ ] **Step 3: Run full test suite one final time**

```bash
cd agora-app && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat(phase5): complete — /performance page, polish, i18n + conditional rendering audits"
```

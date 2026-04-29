# Agora Phase 5 — Design Spec

**Date:** 2026-04-29
**Status:** Approved — ready for implementation planning
**Phase:** 5 of 5 (final phase)

---

## 0. Context

Agora is a B2B operations dashboard for Valle Fresco S.A., a Chilean fresh-produce exporter. Phases 1–4 delivered the foundation, operations dashboard, entity pages (containers, POs, importers, producers, compliance), and full document management. Phase 5 completes the platform with:

1. `/performance` page — the only remaining primary surface
2. Polish — Framer Motion page transitions, KPI count-up animations, alert pulse
3. Audits — conditional rendering and i18n

**Tech stack (locked):** Next.js App Router, TypeScript strict, Tailwind v4 (tokens in `@theme {}` in `globals.css`), next-intl v4 cookie-based i18n (Spanish default + English), @base-ui/react, Framer Motion, Vitest + React Testing Library.

**Demo anchor:** `getTodayDemo()` → `new Date('2027-01-09T10:00:00-04:00')`

---

## 1. Scope

### In scope
- `/performance` page (new primary surface)
- `lib/mock-data/penalty-events.ts` — data model change: counts → dollar savings
- `components/dashboard/PenaltyHeatmap.tsx` — update for dollar values (affects ops dashboard too)
- `components/shared/PageTransition.tsx` — new Framer Motion wrapper
- `components/kpi/KPITile.tsx` — add count-up animation
- Alert pulse on `severity: 'crit'` items in `AlertsRail` and `ValidationFeed`
- i18n audit — `performance` namespace added to `es.json` + `en.json`
- Conditional rendering audit — cold-chain UI gated on `reefers.length > 0`

### Out of scope (deferred)
- Cmd+K command palette
- Any backend or real data connectors
- Approval Queue page (remains a disabled sidebar stub)

---

## 2. Data Model Changes

### 2.1 `penaltyAvoidedMatrix` — counts → dollar savings

**Current type:**
```typescript
export interface PenaltyAvoidedRow {
  buyerName: string;
  counts: Record<PenaltyEventType, number>;
}
```

**New type:**
```typescript
export interface PenaltyAvoidedRow {
  buyerName: string;
  savedUsd: Record<PenaltyEventType, number>;
}
```

The field rename from `counts` to `savedUsd` is a breaking change. All consumers (`PenaltyHeatmap`, any tests) must be updated.

**Representative values** (dollar amounts saved per buyer × penalty type):

| Buyer | Refumig. | Phyto | VGM | DUS | BL | Demurrage | Detention | Bank |
|---|---|---|---|---|---|---|---|---|
| Mumbai Dry Fruits | 2400 | 1100 | 400 | 900 | 700 | 800 | 600 | 2100 |
| Frutimar SL | 800 | 1200 | 800 | 500 | 2400 | 1600 | 600 | 1600 |
| Sun Yang Foods | 1600 | 600 | 400 | 500 | 700 | 3200 | 2700 | 800 |
| Al Madina Trading | 800 | 600 | 400 | 900 | 1400 | 2400 | 1200 | 800 |
| Pacific Produce | 1600 | 1200 | 1200 | 900 | 700 | 800 | 600 | 1600 |
| Costco FreshCo | 800 | 600 | 800 | 500 | 700 | 800 | 600 | 1600 |

### 2.2 `agent-statuses.ts` — new mock data file

New file `lib/mock-data/agent-statuses.ts` provides a static last-action string and status per agent:

```typescript
export type AgentStatus = 'active' | 'idle' | 'alert';

export interface AgentStatusEntry {
  agentId: string;
  status: AgentStatus;
  lastAction: string; // short, already-translated display string key
}
```

The `lastAction` field is an i18n key resolved via the `performance` namespace. Each of the 25 agents gets an entry.

### 2.3 New KPI — `cold_incidents`

Add to `lib/mock-data/kpis.ts`:

```typescript
{ id: 'cold_incidents', labelKey: 'performance.kpiColdIncidents', value: 2, unit: 'count', deltaPct: 100, sparkline: [0,0,1,0,0,1,1,2], deltaPositiveIsGood: false }
```

---

## 3. `/performance` Page

### 3.1 Route and file structure

```
app/performance/
  page.tsx                          # server component
  components/
    AgentGrid.tsx                   # 25-card grid
    AgentCard.tsx                   # individual agent card
    ColdChainPanel.tsx              # right panel in bottom split
```

`page.tsx` is a server component. It imports mock data and passes props down. No client state at the page level.

### 3.2 Layout

```
┌─────────────────────────────────────────────────────┐
│  KPI STRIP — 5 tiles (full width)                   │
├─────────────────────────────────────────────────────┤
│  AGENT GRID — 25 cards, 5 columns (full width)      │
├──────────────────────────────┬──────────────────────┤
│  DOLLARS SAVED HEATMAP       │  ❄ COLD CHAIN PANEL  │
│  (flex: 1)                   │  (width: 300px)       │
│                              │  same height as left  │
└──────────────────────────────┴──────────────────────┘
```

The bottom split uses `display: grid; grid-template-columns: 1fr 300px; align-items: stretch` so both panels share the same height.

### 3.3 KPI strip

Reuses existing `KPIStrip` / `KPITile` components. Five tiles on this page:

| KPI | Value | Unit |
|---|---|---|
| `avoided_penalties` | $14,200 | usd |
| `active_agents` | 25 | count |
| `cold_incidents` | 2 | count (warning color, `deltaPositiveIsGood: false`) |
| `doc_auto_gen_rate` | 87% | pct |
| `avg_cycle_time` | 58 | days |

`cold_incidents` renders its value in `--color-severity-risk` (orange) instead of mint when value > 0.

### 3.4 Agent grid (`AgentGrid` + `AgentCard`)

**Grid:** `display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px`

**`AgentCard` props:**
```typescript
interface AgentCardProps {
  agent: Agent;
  statusEntry: AgentStatusEntry;
}
```

**Card anatomy:**
- Top row: status dot (6px circle) + agent name + optional ❄ badge (cold-chain agents only)
- Bottom: `lastAction` string in monospace, ink-4 color

**Status dot colors:**
- `active` → `--color-mint-500` (#00E696)
- `idle` → `--color-ink-4` (#475063)
- `alert` → `--color-severity-risk` (#F97316)

**Cold-chain sentinel styling** (agents where `tags.includes('cold_chain')`):
- Card background: `#0d1a26`
- Left border: `2px solid rgba(125,211,252,0.5)` (trace/sky color)
- Card border: `1px solid rgba(125,211,252,0.2)`
- Agent name color: `#7DD3FC`
- Status dot color when active: `#7DD3FC`
- ❄ badge visible

**Conditional rendering:** Cold-chain sentinel cards are hidden entirely when no reefer containers are active (i.e., `containers.filter(c => c.coldChain?.required).length === 0`). The grid reflows naturally.

### 3.5 Penalty heatmap (bottom left)

Reuses `PenaltyHeatmap` component from `components/dashboard/PenaltyHeatmap.tsx` after it is updated for dollar values (see §3.7).

Section header: "Dollars Saved — Penalties Avoided" / "Season 2026–27 · USD · by buyer × risk type"

### 3.6 Cold-chain panel (bottom right, `ColdChainPanel`)

Hidden entirely when `reefers.length === 0`.

**Panel layout** (flex column, `justify-content: space-between`, height matches heatmap via `align-items: stretch` on parent grid):

1. **Container card** (top) — container ID, product + route, cold treatment progress bar (Day X / 15). For MAEU-9182734: Day 10/15, progress 67%.

2. **Sentinel status list** (middle, `flex: 1`) — one row per cold-chain sentinel agent: dot + name + status string. Six rows for the cherry container.

3. **Stats** (bottom, anchored) — three rows:
   - EXCURSIONS → 0 (mint)
   - INCIDENTS → 2 (orange)
   - COMPLIANCE → ON TRACK (mint)

**Color language:** Sky/trace (`#7DD3FC`) for all cold-chain panel chrome. Border: `rgba(125,211,252,0.2)`. Background: `#0d1a26`.

### 3.7 `PenaltyHeatmap` update (affects dashboard + performance)

Cell color thresholds change from count-based to dollar-based:

| Tier | Range | Background |
|---|---|---|
| 0 | $0 | `#141A29` (bg-2) |
| 1 | $1–$999 | `rgba(0,230,150,0.10)` |
| 2 | $1,000–$1,999 | `rgba(0,230,150,0.22)` |
| 3 | $2,000–$2,999 | `rgba(0,230,150,0.40)` |
| 4 | $3,000+ | `#00E696` (solid mint) |

Cell display: abbreviated dollar value (`$2.4k`, `$800`, `$3.2k`). Helper function:
```typescript
function fmtSaved(usd: number): string {
  if (usd === 0) return '';
  return usd >= 1000 ? `$${(usd / 1000).toFixed(1)}k` : `$${usd}`;
}
```

Legend below heatmap: `$0 ░▒▓█ $3k+`

---

## 4. Polish

### 4.1 Page transitions (`PageTransition`)

New `components/shared/PageTransition.tsx` — a client component using Framer Motion:

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

Wrap each page's root `<div>` with `<PageTransition>`. Apply to all 8 primary pages: `/`, `/containers`, `/purchase-orders`, `/importers`, `/producers`, `/compliance`, `/documents`, `/performance`.

### 4.2 KPI count-up (`useCountUp`)

Custom hook in `components/kpi/KPITile.tsx` (or `lib/hooks/useCountUp.ts`):

```typescript
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}
```

Applied inside `KPITile` to the displayed value. Dollar formatting and unit suffixes applied after animation completes. Works for all unit types (`count`, `usd`, `pct`, `days`).

### 4.3 Alert pulse

Critical alerts (`severity === 'crit'`) in `AlertsRail` and `ValidationFeed` get a CSS animation on their border:

```css
@keyframes pulse-crit {
  0%, 100% { border-color: var(--color-severity-crit); }
  50%       { border-color: transparent; }
}
```

Applied via a Tailwind utility class or inline style: `animation: pulse-crit 1.5s ease-in-out infinite`.

No Framer Motion needed here — pure CSS animation is sufficient and more performant for a looping border effect.

---

## 5. Audits

### 5.1 Conditional rendering

Cold-chain UI must be invisible when no reefer containers are active (pure-walnuts mode). Full checklist:

| Component | Gating condition | Status |
|---|---|---|
| `ColdChainDashboardSection` (ops dashboard) | `reefers.length > 0` | Already conditional ✓ |
| `ColdChainTab` in container detail | `container.coldChain?.required` | Verify |
| Agent grid cold-sentinel cards (`AgentCard`) | `reefers.length > 0` | New — must implement |
| `ColdChainPanel` in `/performance` | `reefers.length > 0` | New — must implement |

The `reefers` array is derived as `containers.filter(c => c.coldChain?.required === true)` and passed as a prop. No global state — prop drilling is sufficient.

### 5.2 i18n audit

**New `performance` namespace** — add to both `es.json` and `en.json`:

Keys needed:
- `performance.title`
- `performance.kpiColdIncidents`
- `performance.digitalTeam` (section title)
- `performance.agentsCount` (meta: "25 agents · 6 cold-chain sentinels")
- `performance.dollarsSaved` (heatmap section title)
- `performance.seasonMeta`
- `performance.coldChainTitle`
- `performance.coldChainActive`
- `performance.sentinelStatus`
- `performance.excursions` / `performance.incidents` / `performance.compliance`
- `performance.onTrack`
- 25 × `performance.agentLastAction.<agentId>` keys

**Audit pass:** After all new components are built, grep for hardcoded Spanish and English strings in:
- `app/performance/`
- `components/shared/PageTransition.tsx`
- Updated `components/kpi/KPITile.tsx`
- Updated `components/dashboard/PenaltyHeatmap.tsx`

Both locales must render without layout breaks. Verify at 1280px wide.

---

## 6. New Files

| File | Type | Notes |
|---|---|---|
| `app/performance/page.tsx` | Server component | Page root |
| `app/performance/components/AgentGrid.tsx` | Client component | 25-card grid |
| `app/performance/components/AgentCard.tsx` | Client component | Individual card |
| `app/performance/components/ColdChainPanel.tsx` | Client component | Bottom-right panel |
| `lib/mock-data/agent-statuses.ts` | Mock data | 25 entries |
| `components/shared/PageTransition.tsx` | Client component | Framer Motion wrapper |
| `lib/hooks/useCountUp.ts` | Hook | Count-up animation |

## 7. Modified Files

| File | Change |
|---|---|
| `lib/mock-data/penalty-events.ts` | `counts` → `savedUsd` (dollar amounts) |
| `lib/mock-data/kpis.ts` | Add `cold_incidents` KPI |
| `types/index.ts` | `PenaltyAvoidedRow.counts` → `savedUsd` |
| `components/dashboard/PenaltyHeatmap.tsx` | Dollar thresholds, `fmtSaved`, `savedUsd` field |
| `components/kpi/KPITile.tsx` | Add `useCountUp` hook |
| `components/layout/Sidebar.tsx` | No change needed (performance link already present) |
| `app/page.tsx` (ops dashboard) | Wrap root div in `PageTransition` |
| `app/containers/page.tsx` | Wrap in `PageTransition` |
| `app/purchase-orders/page.tsx` | Wrap in `PageTransition` |
| `app/importers/page.tsx` | Wrap in `PageTransition` |
| `app/producers/page.tsx` | Wrap in `PageTransition` |
| `app/compliance/page.tsx` | Wrap in `PageTransition` |
| `app/documents/page.tsx` | Wrap in `PageTransition` |
| `components/dashboard/AlertsRail.tsx` | Add pulse CSS to crit alerts |
| `components/alerts/ValidationFeed.tsx` | Add pulse CSS to crit alerts |
| `messages/es.json` | Add `performance` namespace |
| `messages/en.json` | Add `performance` namespace |

---

## 8. Testing

- Unit tests for `useCountUp` hook — verifies it reaches target value, ease-out behavior
- Unit tests for updated `PenaltyHeatmap` — dollar thresholds, `fmtSaved` formatting
- Unit tests for `AgentGrid` — cold-sentinel cards hidden when `reefers` is empty
- Unit tests for `ColdChainPanel` — hidden when `reefers` is empty
- Smoke test for `/performance` page render — all 25 agents present
- i18n test — both locales render the performance page without missing keys

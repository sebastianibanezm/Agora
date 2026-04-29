# Agora Phase 2 — Operations Dashboard Design Spec

**Date:** 2026-04-28
**Status:** Approved — ready for implementation planning
**Design source:** `/Users/sebastian.ibanez/Downloads/design_handoff_agora_ops/screenshots/`

---

## 0. What This Covers

Phase 2 builds the Operations Dashboard — the root route `/` — currently a Next.js starter placeholder. Phase 1 built 3 containers; the dashboard design requires 8. This phase adds 5 containers to mock data, replaces the KPI data, adds closed-shipment and penalty-avoided data structures, then composes the dashboard UI from them.

### Mock data changes required (not new files unless noted)

| File | Change |
|---|---|
| `lib/mock-data/containers.ts` | Add 5 new active containers + export a separate `closedContainers` array (6 items) |
| `lib/mock-data/kpis.ts` | Replace all 6 existing KPIs with 5 new ones matching the design handoff |
| `lib/mock-data/alerts.ts` | Add `category: AlertCategory` + `amountUsd?: number` to existing alerts; add alerts for the 5 new containers |
| `lib/mock-data/importers.ts` | Add importers for the 5 new containers (or reuse existing ones where market matches) |
| `lib/mock-data/penalty-events.ts` | Add `penaltyAvoidedMatrix` export (buyer × event-type count matrix) |
| `types/index.ts` | Add `sparkline: number[]` to `KPI`; add `AlertCategory` type + `category` + `amountUsd?` to `Alert`; add `PenaltyAvoidedRow` + `PenaltyEventType` types; add `ClosedContainer` interface |

---

## 1. Page Structure

No page-title block. The map renders immediately below the app header. Section order top to bottom:

1. Shipment Map
2. KPI Strip
3. Action Queue + Alerts Rail (side by side)
4. Cold Chain Status (conditional)
5. This Week Container Readiness
6. Last Week Closed + Penalty Heatmap (side by side)

---

## 2. App Header (updates to existing `components/layout/Header.tsx`)

Three changes to the existing header:

- **Breadcrumb (left side):** Add a breadcrumb slot to the left of the header. On the dashboard route it shows `OPERATIONS / Today's queue`. Use `useTranslations('nav')` key `operations` + new key `todaysQueue`. The breadcrumb sits to the right of the logo/sidebar area; the separator ` / ` is rendered as a literal character; `OPERATIONS` is uppercased via CSS `text-transform: uppercase`. Existing `nav.operations` values (`"Operaciones"` / `"Operations"`) are used as-is.
- **Notification bell:** Add a bell icon (`lucide-react` `Bell`, 18px, `--color-ink-2`) with a red badge showing unread alert count, positioned right of the search icon. This does not exist in Phase 1 — it is new in Phase 2. Clicking does nothing in Phase 2 (notification drawer is a future phase).
- **Search icon:** Add a `Search` icon from `lucide-react` (18px, `--color-ink-3`) positioned immediately left of the notification bell. Clicking does nothing in Phase 2 (Cmd+K palette is Phase 4).

---

## 3. Shipment Map

**Component:** `components/map/ShipmentMap.tsx` (new — `'use client'` required)
**Package:** `react-simple-maps` — must be added to `package.json` (`pnpm add react-simple-maps`)

### Layout
Full-width panel, `background: #080E1A`, 320px tall.

```
[map-header: label + status counters]
[map-body: SVG map with legend + hint overlays]
```

### Map Header
- Left: pulsing mint dot + `ACTIVE SHIPMENTS GLOBE · LIVE` (10px uppercase `--color-ink-3`)
- Right: severity count row computed from containers: `IN TRANSIT {n} · WATCH {n} · ACTION {n} · CRITICAL {n}` (10px mono)

### Map Body
`react-simple-maps` `ComposableMap` with `Mercator` or equirectangular projection + Natural Earth TopoJSON 110m from `react-simple-maps` package. Layers back-to-front:

1. Background fill `#080E1A`
2. Graticule lines — every 20°, `rgba(255,255,255,0.04)`, 0.5px
3. Country polygons — `Geographies` component, fill `#0F1A2E`, stroke `rgba(125,211,252,0.15)` 0.8px
4. Shipping arcs — quadratic Bézier POL→POD via `<Line>` or custom `<path>`. SVG `stroke-dasharray` draw animation on mount (2–4s). Stroke by severity:
   - on-track: `#00E696`, 1.6px
   - watch: `#F59E0B`, 1.6px
   - action: `#F97316`, 1.8px
   - critical: `#EF4444`, 2.2px — reefer arcs additionally pulse opacity (`0.9→0.5→0.9`, 1.5s)
5. Motion pips — `<animateMotion>` along arc path, looping, colored by severity
6. Origin pin (San Antonio, Chile) — filled circle + expanding halo animation
7. Destination markers — 8×8 rotated diamond (`<rect transform="rotate(45)">`)
8. Port labels — 8px monospace, `--color-ink-4`

### Legend overlay (bottom-left)
`ON-TRACK · WATCH · ACTION · CRITICAL` with 20px colored line swatches.

### Hint overlay (bottom-right)
`HOVER AN ARC · CLICK TO OPEN CONTAINER` — `--color-ink-4`, 10px uppercase.

### Interactions
- Arc hover: tooltip showing container ID, buyer, product, POL→POD, ETA, cost-at-risk
- Arc click: navigate to `/containers/[id]`

### Arc severity derivation
A container's severity = worst alert severity across its active alerts. Explicit mapping from `Severity` to arc category:

| `Alert.severity` | Arc category | Color |
|---|---|---|
| `'crit'` | critical | `#EF4444` |
| `'risk'` | action | `#F97316` |
| `'watch'` | watch | `#F59E0B` |
| `'ok'` | on-track | `#00E696` |
| `'info'` | on-track | `#00E696` |

Worst = highest in the order: crit > risk > watch > info > ok. All 8 containers need `pol` and `pod` coordinate fields populated for the map to render their arcs. Ensure all containers (including the 5 new ones) have `pol` and `pod` set.

---

## 4. KPI Strip

**Components:** `components/kpi/KPIStrip.tsx` + `components/kpi/KPITile.tsx` (new)

5-column grid, 12px gap. No cold-chain tile on the dashboard.

### KPI type addition (`types/index.ts`)
```typescript
// Add to existing KPI interface:
sparkline: number[]; // e.g. [10, 14, 12, 16, 18] — 5–8 data points
```

### New `kpis.ts` content (replaces existing)
```typescript
export const kpis: KPI[] = [
  { id: 'active_shipments',    labelKey: 'dashboard.kpiActiveShipments',    value: 3,      unit: 'count', deltaPct: 0,   sparkline: [1,2,2,3,3,3] },
  { id: 'avoided_penalties',   labelKey: 'dashboard.kpiAvoidedPenalties',   value: 14_200, unit: 'usd',   deltaPct: 18,  sparkline: [8000,9500,11000,12800,14200] },
  { id: 'demurrage_incurred',  labelKey: 'dashboard.kpiDemurrageIncurred',  value: 1_080,  unit: 'usd',   deltaPct: -55, sparkline: [5200,4100,3800,2400,1080] },
  { id: 'avg_cycle_time',      labelKey: 'dashboard.kpiAvgCycleTime',       value: 58,     unit: 'days',  deltaPct: -5,  sparkline: [65,63,62,60,58] },
  { id: 'doc_auto_gen_rate',   labelKey: 'dashboard.kpiDocAutoGenRate',     value: 87,     unit: 'pct',   deltaPct: 5,   sparkline: [72,76,79,83,87] },
];
```

### KPI Tile anatomy
```
[label — 10px uppercase --color-ink-3]
[value — 28px JetBrains Mono bold]  [unit — 13px --color-ink-2]
[delta — 11px; positive=mint, negative=--color-severity-crit]
[sparkline — full-width SVG 40px tall, opacity 0.5, preserveAspectRatio="none"]
```

Sparkline: `<polyline>` with `stroke="#00E696"`, `stroke-width="2"`. Scale points to fit `viewBox="0 0 200 40"`.

---

## 5. Action Queue + Alerts Rail

**Layout:** CSS grid `1fr 380px`, `align-items: stretch` — both panels equal height.

### 5a. Action Queue — "Needs action now"

**Component:** `components/dashboard/ActionQueue.tsx` + `components/dashboard/ContainerCard.tsx`

#### New containers required in `containers.ts`

Add these 5 containers (in addition to the existing 3). Full container records per the existing `Container` interface:

| ID | Buyer | Market | Product | Route POL→POD | Carrier | Active alert |
|---|---|---|---|---|---|---|
| `OOLU-7710443` | Sun Yang Foods Co. | CN | `table_grapes_red` | CLSAI→CNSHA | OOCL | Demurrage accruing — Due NOW |
| `MSKU-3401827` | Frutimar SL | EU | `fresh_cherries` | CLVAP→ESVLC | MAERSK | Aflatoxin re-test recommended |
| `HLXU-4427109` | Al Madina Trading LLC | MENA | `almonds_in_shell` | CLSAI→AEJEA | HAPAG-LLOYD | Free time ends in 3 days |
| `MSCU-6128390` | Pacific Produce Inc. | US | `table_grapes_white` | CLSAI→USLAX | COSCO | Payment expected today |
| `MSCU-2873561` | Heritage European Fruits BV | EU | `fresh_blueberries` | CLVAP→NLRTM | MSC | TRACES NT entry pending validation |

Assign realistic T-day values anchored to `getTodayDemo()` (2027-01-09).

#### Section header
- Left: `Needs action` bold + `now` muted
- Right: `● 2 CRITICAL · ● 2 ACTION · ● 1 WATCH` — counts derived from active alert severities

#### ContainerCard row — 3-column grid: `260px 1fr 180px`

**Left column**
- Container ID — JetBrains Mono, 15px bold
- Buyer name — 12px `--color-ink-2` — derived by looking up `importers.find(i => i.id === container.importerId)?.name`. The `Container` interface has no `buyerName` field; always resolve via importers lookup.
- Market badge (colored pill) + product line (11px `--color-ink-3`)
  - CN: red-tint bg/border/text; IN: blue-tint; EU: blue-tint; MENA: amber-tint; US: green-tint
- Route — `{POL} → {POD} · {carrier}` — 10px mono `--color-ink-4`

**Center column**
- T-day timeline: horizontal line `T–` to `T+45`, milestone dots (done=mint, alert=red, future=dim border), current position = 12px green circle with mint glow
- Alert row: colored severity dot + alert description (11px `--color-ink-2`) + category label right-aligned (9px mono `--color-ink-4` uppercase)

**Right column** (right-aligned)
- `COST AT RISK` — 9px uppercase `--color-ink-4`
- `USD {value}` — 22px JetBrains Mono bold, color by severity:
  - critical: `--color-severity-crit`
  - action/risk: `--color-severity-risk`
  - watch: `--color-severity-watch`
- Description text — 11px `--color-ink-2`
- Due badge — 10px mono; `Due NOW` pulses `--color-severity-crit`; `Due in 18h` `--color-severity-risk`; `Due in 36h` `--color-severity-watch`; `Due in 3d` `--color-ink-3`

#### Cards (ordered by urgency, top to bottom)
1. OOLU-7710443 · Sun Yang Foods · CN · USD 1,080 · Due NOW
2. MSCU-7842156 · Mumbai Dry Fruits · IN · USD 1,200 · Due in 18h
3. MSKU-3401827 · Frutimar SL · EU · USD 8,000 · (no due date — compliance check)
4. CMAU-9281744 · Shenzhen Imports · CN · USD 1,500 · Due in 36h
5. HLXU-4427109 · Al Madina Trading · MENA · USD 540 · Due in 3d

#### Footer
`SHOWING 5 OF {n} ACTIVE` (left, 11px uppercase `--color-ink-4`) · `View all containers →` mint link (right) → `/containers`

---

### 5b. Alerts Rail — "Live alerts"

**Component:** `components/dashboard/AlertsRail.tsx`

#### New `Alert` interface fields (`types/index.ts`)

```typescript
// Add to existing Alert interface:
category: AlertCategory;
amountUsd?: number; // cost-at-risk amount — used in alerts rail USD column
```

```typescript
export type AlertCategory =
  | 'shipment_doc' | 'market_compliance' | 'bl_switch_window'
  | 'payment_aging' | 'free_time_tracker';
```

Update all existing alert records in `alerts.ts` to include `category`. Add alerts for the 5 new containers.

#### Section header
- Left: `Live alerts`
- Right: `{n} OPEN` mono `--color-ink-3`

#### Alert row layout
```
[category label 9px mono --color-ink-3]     [severity pill]
[container-id · description — 11px]
[due in {x} — 10px mono]                    [USD {amount} — 10px mono --color-ink-3]
```

Severity pills use colored background + border tokens matching `--color-severity-*`.

#### Alerts shown (7, ordered by severity)
| Category | Severity | Container | Description | Due | USD |
|---|---|---|---|---|---|
| SHIPMENT DOC | CRITICAL | MSCU-7842156 | DUS not yet filed | 18h | 1,200 |
| MARKET COMPLIANCE | ACTION | MSKU-3401827 | Aflatoxin re-test recommended | — | 8,000 |
| BL SWITCH WINDOW | ACTION | CMAU-9281744 | BL draft consignee mismatch with LC | 36h | 1,500 |
| PAYMENT AGING | INFO | MSCU-6128390 | Payment expected today | — | — |
| FREE TIME TRACKER | WATCH | HLXU-4427109 | Free time ends in 3 days | 3d | 540 |
| MARKET COMPLIANCE | INFO | MSCU-2873561 | TRACES NT entry pending validation | — | — |
| FREE TIME TRACKER | CRITICAL | OOLU-7710443 | Demurrage accruing | NOW | 1,080 |

---

## 6. Cold Chain Status (conditional)

**Component:** `components/cold-chain/ColdChainDashboardSection.tsx` (new — distinct from the existing `ColdChainSummaryCard` used in container detail tabs)

Renders only when `containers.some(c => c.coldChain?.required === true)`. Panel border: `rgba(0,230,150,0.25)`.

### Section header
- Left: snowflake icon (lucide `Snowflake`, 14px mint) + `Cold Chain Status`
- Right: `{n} REEFERS · IN TREATMENT` mono

### Cards
2-column grid, one card per active reefer container. Each card:

```
[container ID mono bold]
[product · route · Day {n} of {total}]
[progress bar — mint fill, proportional to treatmentMinutesCompliant/treatmentRequiredMinutes]
["{Xd Yh} compliant" (left)  "{pct}% on track" (right, severity-colored)]
[logger temps strip: TOP / MID / BOT readings in mono]
  within tolerance → mint; approaching → amber; exceeded → red
```

Progress bar has mint glow (`box-shadow: 0 0 8px rgba(0,230,150,0.4)`).

---

## 7. This Week Container Readiness

**Component:** `components/dashboard/ReadinessStrip.tsx`

Containers shown: those whose ETD falls within T-7 → T0 window (relative to `getTodayDemo()`). With 8 total active containers, at least 6 should fall in this window by setting their T-day values accordingly.

### Section header
- Left: `This week · container readiness`
- Right: `T-7 → T0 WINDOW · {n} CONTAINERS` — mono `--color-ink-3`

### Mini-cards
6-column grid, `border-right: 1px solid --color-line` between cards.

Each card:
```
[container-id 11px mono]         [pct% 13px mono bold, severity-colored]
[buyer name 10px --color-ink-3]
[readiness grid — 8 cols × 3 rows of 9px squares]
  mint=done, amber=watch, red=critical, gray=not started
[T- date]                        [ETD date]
```

Readiness grid: filter `documents` array from `lib/mock-data/documents.ts` by `containerId`. Count docs by status: `approved`→mint, `pending_review`→amber, `missing`/`rejected`→red, not-yet-issued→gray. Readiness % = `approved / total_expected_docs`. For the 5 new containers, add a representative subset of `DocumentInstance` records to `documents.ts` (full document sets are not required for the strip — 12–18 entries per container is sufficient, with a mix of statuses matching the handoff percentages).

---

## 8. Last Week Closed + Penalty Heatmap

**Layout:** CSS grid `1fr 1fr`, gap 16px.

### 8a. Last Week Closed

**Component:** `components/dashboard/ClosedTable.tsx`

#### New data required: `closedContainers` export in `containers.ts`
Add a separate export (not part of the active `containers` array):

```typescript
export const closedContainers: ClosedContainer[] = [...]; // 6 items
```

New type in `types/index.ts`:
```typescript
export interface ClosedContainer {
  id: string;
  buyerName: string;
  cycledays: number;
  deltaAvgDays: number; // negative = faster than avg, positive = slower
  penaltyUsd: number;   // 0 = no penalty
}
```

#### Section header
`Last week · closed` + `{n} SHIPMENTS · AVG {avg}D` (mono)

#### Table columns
CONTAINER · BUYER · CYCLE · Δ AVG · PENALTY

- Container ID: 11px mono
- Cycle: mono
- Δ AVG: negative = `--color-severity-ok` (mint), positive = `--color-severity-watch`, zero = `--color-ink-4`
- PENALTY: `--color-severity-crit` mono bold if > 0, else `--color-ink-4` dash

#### Data (6 rows)
| Container | Buyer | Cycle | Δ AVG | Penalty |
|---|---|---|---|---|
| MSCU-1102934 | Pacific Produce Inc. | 54d | -4d | — |
| CMAU-7741209 | Heritage European Fruits BV | 61d | +3d | — |
| MAEU-3398172 | Costco FreshCo | 58d | 0d | — |
| HLXU-2298110 | Mumbai Dry Fruits | 55d | -3d | — |
| MSCU-9920183 | Frutimar SL | 67d | +9d | $1,320 |
| OOLU-4419220 | Shenzhen Imports | 59d | +1d | — |

---

### 8b. Penalties Avoided Heatmap

**Component:** `components/dashboard/PenaltyHeatmap.tsx`

#### New data required: `penaltyAvoidedMatrix` export in `penalty-events.ts`

New type in `types/index.ts`:
```typescript
export type PenaltyEventType =
  | 'refumigation' | 'phyto_reissue' | 'vgm_late' | 'dus_error'
  | 'bl_correction' | 'demurrage' | 'detention' | 'bank_discrepancy';

export interface PenaltyAvoidedRow {
  buyerName: string;
  counts: Record<PenaltyEventType, number>;
}
```

Column headers (display labels): `REFUMIG. · PHYTO REISSUE · VGM LATE · DUS ERROR · BL CORRECTION · DEMURRAGE · DETENTION · BANK DISCREP.`

#### Section header
`Penalties avoided · trailing 30d` + `BUYER × EVENT · USD AVOIDED` (mono subtitle)

#### Cell rendering
Value = `counts[eventType]`. Density color scale (background of each cell):
- 1: `rgba(0,230,150,0.12)` text `--color-ink-3`
- 2: `rgba(0,230,150,0.22)` text `--color-ink-2`
- 3: `rgba(0,230,150,0.38)` text `--color-mint-500`
- 4+: `rgba(0,230,150,0.55)` text white

Column headers: `writing-mode: vertical-rl`, `transform: rotate(180deg)`, 9px mono.

#### Footer
Legend (LESS → MORE swatches) left · `OPEN PERFORMANCE →` (`--color-mint-500`) right → `/performance`

---

## 9. i18n

All strings use `useTranslations`. Add the following keys to both `messages/es.json` and `messages/en.json`. **Reconcile with existing `dashboard.*` keys** — replace keys that no longer apply (old KPI keys like `kpiActiveContainers`, `kpiCostAtRisk`, `kpiOnTimeDocs`, `kpiAlertsOpen`, `kpiCutoffNext24h`, `kpiColdTreatmentCompliance`).

```json
"nav": {
  // Add to existing:
  "todaysQueue": "Today's queue"
},
"dashboard": {
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
  "coldChainStatus": "Cold Chain Status",
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
  "dueNow": "Due NOW",
  "dueIn": "Due in {time}"
}
```

CSS variable note: use Tailwind utility classes (e.g., `text-severity-crit`, `text-mint-500`, `text-ink-3`) rather than raw CSS custom properties in component code. These map to the tokens defined in `app/globals.css` under `@theme {}`.

---

## 10. New Components Summary

| Component | File | `'use client'`? | Depends on |
|---|---|---|---|
| `ShipmentMap` | `components/map/ShipmentMap.tsx` | yes | react-simple-maps, containers, alerts |
| `KPIStrip` | `components/kpi/KPIStrip.tsx` | no | kpis |
| `KPITile` | `components/kpi/KPITile.tsx` | no | KPI type |
| `ActionQueue` | `components/dashboard/ActionQueue.tsx` | no | containers, alerts, importers |
| `ContainerCard` | `components/dashboard/ContainerCard.tsx` | no | Container + Importer types |
| `AlertsRail` | `components/dashboard/AlertsRail.tsx` | no | alerts |
| `ColdChainDashboardSection` | `components/cold-chain/ColdChainDashboardSection.tsx` | no | containers, cold-chain-traces |
| `ReadinessStrip` | `components/dashboard/ReadinessStrip.tsx` | no | containers, documents, importers |
| `ClosedTable` | `components/dashboard/ClosedTable.tsx` | no | closedContainers |
| `PenaltyHeatmap` | `components/dashboard/PenaltyHeatmap.tsx` | no | penaltyAvoidedMatrix |

**Note:** The existing `components/cold-chain/ColdChainSummaryCard.tsx` (single-trace card, used inside the Container Detail cold-chain tab) is unchanged. The new `ColdChainDashboardSection` is a separate dashboard-level wrapper that maps over reefer containers and renders summary cards for each.

`app/page.tsx` is a server component that imports and composes all of the above.

---

## 11. Definition of Done

- [ ] `pnpm add react-simple-maps` completed, types resolve
- [ ] Map renders ≥7 animated arcs; reefer arcs pulse; motion pips animate; hover tooltip works
- [ ] KPI strip: exactly 5 tiles, sparklines span full tile width
- [ ] Action queue: 5 cards ordered by urgency, each with T-day timeline + cost-at-risk + due badge
- [ ] Alerts rail: matches action queue height, 7 rows with correct severity pills
- [ ] Cold chain section: renders when reefer containers active, hidden otherwise
- [ ] Readiness strip: 6 mini-cards with colored grid squares
- [ ] Closed table: 6 rows, Δ AVG colored correctly, non-zero penalty in red
- [ ] Penalty heatmap: buyer × event matrix with density color scale + OPEN PERFORMANCE link
- [ ] Header: search is magnifying-glass icon only; breadcrumb shows `OPERATIONS / Today's queue`
- [ ] No page-title block — map starts immediately below header
- [ ] Stale `dashboard.*` i18n keys removed; all new keys present in both locales
- [ ] `pnpm build` passes with zero TypeScript errors

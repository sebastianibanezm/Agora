# Booking Detail UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 13 identified UI/UX issues in the booking detail section — broken tab styling, poor visual hierarchy, dispersed information, and missing status signals.

**Architecture:** All changes are confined to `components/bookings/` and `components/ui/tabs.tsx`. No new files needed. Each task is a focused edit to one component; tasks are mostly independent and can be done in any order after Task 1.

**Tech Stack:** Next.js, React, Tailwind v4, @base-ui/react, clsx, lucide-react

---

## File Map

| File | Changes |
|------|---------|
| `components/ui/tabs.tsx` | Fix default variant: active tab darker than container (inverted) |
| `components/bookings/BookingDetailClient.tsx` | Tab bar → `variant="line"`, add persistent context bar, fix Quick Actions hierarchy, add tab status indicators, fix empty states, deduplicate button logic |
| `components/bookings/BookingHeader.tsx` | Two-row layout: identifiers row + metadata row, separate urgency signals |
| `components/bookings/BookingLifecycleStrip.tsx` | Larger dots, taller current-step indicator, better label sizing |

---

### Task 1: Fix tabs default variant active-state inversion

**Files:**
- Modify: `components/ui/tabs.tsx`

The `default` variant uses `bg-muted` as the list container (`#141A29` in dark) and `data-active:bg-background` for active tabs (`#070A12` in dark). Active tabs are _darker_ than the container — visually inverted. Fix: active tabs should be `bg-bg-3` (`#1B2235`) so they lift above the container.

- [ ] **Step 1: Update active tab background in TabsTrigger**

In `components/ui/tabs.tsx`, find the line:
```
"data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
```
Replace with:
```
"data-active:bg-bg-3 data-active:text-ink-1 dark:data-active:border-transparent dark:data-active:bg-bg-3 dark:data-active:text-ink-1",
// Note: bg-bg-3 resolves from --color-bg-3 in @theme. If build fails, use bg-[var(--color-bg-3)] instead.
```

- [ ] **Step 2: Verify the tab list container color is appropriate**

In `tabsListVariants`, the `default` variant has `bg-muted`. In dark mode `--muted` is `#141A29` (bg-2). That's fine as the tray — leave it.

- [ ] **Step 3: Commit**
```bash
git add components/ui/tabs.tsx
git commit -m "fix(tabs): active tab should lift above container, not darken"
```

---

### Task 2: Switch BookingDetailClient tabs to `variant="line"`

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

The pill-style default tabs look heavy. Line variant (underline indicator, transparent bg) is cleaner on a dark detail page.

- [ ] **Step 1: Pass `variant="line"` to `TabsList`**

Find:
```tsx
<TabsList>
```
Replace with:
```tsx
<TabsList variant="line" className="border-b border-[var(--line-soft)] w-full rounded-none pb-0">
```

- [ ] **Step 2: Add status dot indicators to SI and BL tab triggers**

Find the `TabsTrigger` for `si` and `bl`, replace them:
```tsx
<TabsTrigger value="si" className="gap-1.5">
  {t('tabSI')}
  {si && siHasFails && (
    <span className="h-1.5 w-1.5 rounded-full bg-severity-crit" />
  )}
  {si && !siHasFails && (
    <span className="h-1.5 w-1.5 rounded-full bg-severity-ok" />
  )}
</TabsTrigger>
<TabsTrigger value="bl" className="gap-1.5">
  {t('tabBL')}
  {bl && blHasFails && (
    <span className="h-1.5 w-1.5 rounded-full bg-severity-crit" />
  )}
  {bl && !blHasFails && (
    <span className="h-1.5 w-1.5 rounded-full bg-severity-ok" />
  )}
</TabsTrigger>
```

- [ ] **Step 3: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "fix(booking-detail): line tabs with per-tab validation status dots"
```

---

### Task 3: Add persistent context bar below tabs

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

Once on SI/BL/Activity tab, the route summary (POL→POD, vessel, ETD) is gone. Add a slim sticky bar above tab content that shows this at all times.

- [ ] **Step 1: Add context bar between `TabsList` and `TabsContent`**

After the closing `</TabsList>` and before the first `<TabsContent`, insert:
```tsx
{/* Persistent route context — visible on all tabs */}
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--line-soft)] px-0 py-2 font-mono text-[11px] text-ink-3">
  <span className="text-ink-2">
    {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
  </span>
  <span>{booking.vesselName} / {booking.voyage}</span>
  <span>ETD {formatTs(booking.etd)}</span>
  <span>ETA {formatTs(booking.eta)}</span>
  <span>Cut-off {formatTs(booking.cutOff)}</span>
  {booking.isReefer && booking.setpointC !== undefined && (
    <span className="text-trace">{booking.containerType} @ {booking.setpointC} °C</span>
  )}
</div>
```

- [ ] **Step 2: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "fix(booking-detail): persist route/vessel context across all tabs"
```

---

### Task 4: Fix Quick Actions visual hierarchy

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

Four buttons with no hierarchy. Primary actions (Generate e-SI, Release BL) must be visually dominant. Navigation actions (Open SI, View BL) are secondary. Add a divider between the two groups.

- [ ] **Step 1: Reorder and restyle Quick Actions buttons**

Find the Quick Actions `<div className="flex flex-col gap-2">` block and replace its contents:
```tsx
{/* Primary actions */}
<Button
  onClick={handleGenerateEsi}
  disabled={!si || siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
  className="w-full"
>
  {transmitting ? (
    <><Loader2 data-icon="inline-start" className="animate-spin" /> {t('transmittingEsi')}</>
  ) : (
    <><Send data-icon="inline-start" /> {t('generateEsi')}</>
  )}
</Button>
<Button
  onClick={handleReleaseBl}
  disabled={!bl || blHasFails || booking.status === 'bl_released' || booking.status === 'closed'}
  className="w-full"
>
  {t('releaseBl')}
</Button>

{/* Divider */}
<div className="my-1 h-px bg-[var(--line-soft)]" />

{/* Navigation actions */}
<Button
  variant="ghost"
  disabled={!si}
  onClick={() => setTab('si')}
  className="w-full justify-start text-ink-2"
>
  <Upload data-icon="inline-start" /> {t('openSi')}
</Button>
<Button
  variant="ghost"
  disabled={!bl}
  onClick={() => setTab('bl')}
  className="w-full justify-start text-ink-2"
>
  <FileCheck2 data-icon="inline-start" /> {t('viewBl')}
</Button>
```

- [ ] **Step 2: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "fix(booking-detail): quick actions — primary actions first, ghost nav links below"
```

---

### Task 5: Add alerts badge on Overview tab + persist alerts visibility

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

Alerts are only visible on Overview tab with no signal from other tabs.

- [ ] **Step 1: Add alert count badge to Overview tab trigger**

Find:
```tsx
<TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
```
Replace with:
```tsx
<TabsTrigger value="overview" className="gap-1.5">
  {t('tabOverview')}
  {alerts.length > 0 && (
    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-severity-watch/20 px-1 font-mono text-[10px] text-severity-watch">
      {alerts.length}
    </span>
  )}
</TabsTrigger>
```

- [ ] **Step 2: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "fix(booking-detail): show alert count badge on Overview tab trigger"
```

---

### Task 6: Group parameters card by logical sections

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

The 12-field flat `dl` grid has zero grouping. Split into: Route & Schedule, Container, and Documents sections.

- [ ] **Step 1: Replace flat `dl` with grouped sections**

Find the `<dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">` block and replace the entire `<Card className="lg:col-span-2 p-4">` card with:
```tsx
<Card className="lg:col-span-2 p-4 flex flex-col gap-4">
  {/* Route & Schedule */}
  <div>
    <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-4 uppercase">
      Route & Schedule
    </div>
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
      <div>
        <dt className="text-ink-3">POL → POD</dt>
        <dd className="text-ink-1">{booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}</dd>
      </div>
      <div>
        <dt className="text-ink-3">{t('vessel')}</dt>
        <dd className="text-ink-1">{booking.vesselName}</dd>
      </div>
      <div>
        <dt className="text-ink-3">{t('voyage')}</dt>
        <dd className="font-mono text-ink-1">{booking.voyage}</dd>
      </div>
      <div>
        <dt className="text-ink-3">ETD → ETA</dt>
        <dd className="text-ink-1">{formatTs(booking.etd)} → {formatTs(booking.eta)}</dd>
      </div>
      <div>
        <dt className="text-ink-3">{t('stacking')}</dt>
        <dd className="text-ink-1">{formatTs(booking.stackingFrom)} → {formatTs(booking.stackingTo)}</dd>
      </div>
      <div>
        <dt className="text-ink-3">Cut-off</dt>
        <dd className="font-mono text-ink-1">{formatTs(booking.cutOff)}</dd>
      </div>
    </dl>
  </div>

  {/* Container */}
  <div className="border-t border-[var(--line-soft)] pt-3">
    <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-4 uppercase">
      Container
    </div>
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
      <div>
        <dt className="text-ink-3">{t('container')}</dt>
        <dd className="text-ink-1">
          {booking.containerType}
          {booking.isReefer && booking.setpointC !== undefined && ` · ${booking.setpointC} °C`}
        </dd>
      </div>
      {booking.containerNumber && (
        <div>
          <dt className="text-ink-3">{t('containerNumber')}</dt>
          <dd className="font-mono text-ink-1">{booking.containerNumber}</dd>
        </div>
      )}
      {booking.sealNumber && (
        <div>
          <dt className="text-ink-3">{t('sealNumber')}</dt>
          <dd className="font-mono text-ink-1">{booking.sealNumber}</dd>
        </div>
      )}
    </dl>
  </div>

  {/* Documents */}
  {booking.blNumber && (
    <div className="border-t border-[var(--line-soft)] pt-3">
      <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-4 uppercase">
        Documents
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div>
          <dt className="text-ink-3">{t('blNumber')}</dt>
          <dd className="font-mono text-ink-1">{booking.blNumber}</dd>
        </div>
      </dl>
    </div>
  )}
</Card>
```

- [ ] **Step 2: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "fix(booking-detail): group parameters into Route, Container, Documents sections"
```

---

### Task 7: Fix empty states (remove LifecyclePill as icon)

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

`EmptyState` uses `<LifecyclePill status="awaiting_si" />` as decorative art — semantically wrong and visually odd.

- [ ] **Step 1: Replace `EmptyState` component**

Find the `EmptyState` function at the bottom of the file:
```tsx
function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
      <LifecyclePill status="awaiting_si" />
      <div className="mt-2 text-sm font-medium text-ink-1">{title}</div>
      <div className="text-xs text-ink-3">{hint}</div>
    </Card>
  );
}
```
Replace with:
```tsx
function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-soft)] bg-bg-2">
        <FileCheck2 className="h-5 w-5 text-ink-3" />
      </div>
      <div className="text-sm font-medium text-ink-1">{title}</div>
      <div className="max-w-xs text-xs text-ink-3">{hint}</div>
    </Card>
  );
}
```

- [ ] **Step 2: Remove unused `LifecyclePill` import if no longer used elsewhere in this file**

Check if `LifecyclePill` is used anywhere else in `BookingDetailClient.tsx`. If not, remove the import line:
```tsx
import { LifecyclePill } from './LifecyclePill';
```

- [ ] **Step 3: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "fix(booking-detail): replace LifecyclePill-as-art empty state with proper icon"
```

---

### Task 8: Deduplicate e-SI button logic

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

The "Generate e-SI" button with its transmitting/disabled logic is copy-pasted in Overview and SI tabs. Extract it.

- [ ] **Step 1: Extract `GenerateEsiButton` into a local component**

Above the `BookingDetailClient` function's `return`, add:

```tsx
// inline helper — rendered in two tabs
function GenerateEsiButton({
  onClick, disabled, transmitting, label, transmittingLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  transmitting: boolean;
  label: string;
  transmittingLabel: string;
}) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {transmitting ? (
        <><Loader2 data-icon="inline-start" className="animate-spin" /> {transmittingLabel}</>
      ) : (
        <><Send data-icon="inline-start" /> {label}</>
      )}
    </Button>
  );
}
```

- [ ] **Step 2: Replace both inline button instances**

In the Overview tab Quick Actions card, replace the e-SI `<Button>` block with:
```tsx
<GenerateEsiButton
  onClick={handleGenerateEsi}
  disabled={!si || siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
  transmitting={transmitting}
  label={t('generateEsi')}
  transmittingLabel={t('transmittingEsi')}
/>
```

In the SI tab `ValidationPanel` action prop, replace with:
```tsx
<GenerateEsiButton
  onClick={handleGenerateEsi}
  disabled={siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
  transmitting={transmitting}
  label={t('generateEsi')}
  transmittingLabel={t('transmittingEsi')}
/>
```

- [ ] **Step 3: Commit**
```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "refactor(booking-detail): extract GenerateEsiButton to remove duplication"
```

---

### Task 9: Improve BookingHeader layout

**Files:**
- Modify: `components/bookings/BookingHeader.tsx`

Everything on one line separated by `·` dots with no visual hierarchy. Restructure into two clear rows: (1) identity row with booking number + status + chips, (2) urgency row pushed to right.

- [ ] **Step 1: Rewrite `BookingHeader` layout**

Replace the entire component return:
```tsx
export function BookingHeader({ booking, exporter, naviera, order }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/bookings"
        className="inline-flex w-fit items-center gap-1 text-xs text-ink-3 hover:text-ink-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Bookings
      </Link>

      {/* Identity row */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-mono text-2xl font-semibold text-ink-1">{booking.bookingNumber}</h1>
        <LifecyclePill status={booking.status} />
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
          <ExporterChip exporter={exporter} />
          <span>·</span>
          <NavieraChip naviera={naviera} />
          <span>·</span>
          <Link
            href={`/orders/${order.id}`}
            className="text-ink-2 underline-offset-2 hover:underline"
          >
            {order.orderNumber}
          </Link>
        </div>

        {/* Urgency signals — right-aligned */}
        <div className="flex items-center gap-4">
          {booking.costAtRiskUsd > 0 && (
            <div className="flex items-center gap-1 font-mono text-xs text-severity-watch">
              <AlertTriangle className="h-3 w-3" />
              USD {booking.costAtRiskUsd.toLocaleString()} at risk
            </div>
          )}
          <CutoffCountdown cutoffIso={booking.cutOff} prefix />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add missing `AlertTriangle` import**

The `AlertTriangle` icon is used in the header. Add it to the imports:
```tsx
import { ArrowLeft, AlertTriangle } from 'lucide-react';
```

- [ ] **Step 3: Commit**
```bash
git add components/bookings/BookingHeader.tsx
git commit -m "fix(booking-header): two-row layout — identity then metadata+urgency signals"
```

---

### Task 10: Improve BookingLifecycleStrip visual prominence

**Files:**
- Modify: `components/bookings/BookingLifecycleStrip.tsx`

8px dots and 9px text are too small. Current step barely distinguishable. Increase dot size, add a filled larger indicator for the current step, bump label to 10px.

- [ ] **Step 1: Rewrite the strip with better sizing**

Replace the dot and label rendering inside the `<div className={clsx('flex flex-col items-center text-center', ...)}` block:

Find:
```tsx
<div
  className={clsx(
    'h-2 w-2 rounded-full transition-colors',
    reached
      ? failed && i === 2
        ? 'bg-severity-crit'
        : 'bg-mint-500'
      : 'bg-ink-3/40',
    isCurrent && 'ring-2 ring-mint-500/30',
  )}
/>
<span
  className={clsx(
    'mt-1 font-mono text-[9px] tracking-wide uppercase',
    reached ? 'text-ink-2' : 'text-ink-3',
    isCurrent && 'text-ink-1',
  )}
>
  {SHORT_LABELS[status]}
</span>
```

Replace with:
```tsx
<div
  className={clsx(
    'rounded-full transition-all duration-200',
    isCurrent ? 'h-3 w-3' : 'h-2 w-2',
    reached
      ? failed && i === 2
        ? 'bg-severity-crit'
        : 'bg-mint-500'
      : 'bg-ink-4/50',
    isCurrent && 'ring-2 ring-offset-1 ring-mint-500/40 ring-offset-[var(--color-bg-0)]',
  )}
/>
<span
  className={clsx(
    'mt-1 font-mono text-[10px] tracking-wide uppercase',
    reached ? 'text-ink-2' : 'text-ink-4',
    isCurrent && 'font-semibold text-ink-1',
  )}
>
  {SHORT_LABELS[status]}
</span>
```

- [ ] **Step 2: Commit**
```bash
git add components/bookings/BookingLifecycleStrip.tsx
git commit -m "fix(lifecycle-strip): larger dots, bolder current step, improved label sizing"
```

---

## Done

All 13 issues addressed across 10 tasks. No new files created. Run `pnpm dev` and visit a booking detail page to verify visually.

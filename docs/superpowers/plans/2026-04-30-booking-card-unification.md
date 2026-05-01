# Booking Card Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a single `BookingCard` component from `ActiveTransitPanel`'s card style and use it in all three dashboard sections — Active Transit, Approaching Cutoff Strip, and Action Queue — with optional extra slots per section.

**Architecture:** One new shared component (`BookingCard`) with a fixed 3-row base and opt-in `alert`, `cutoff`, and `chevron` slots appended below a divider. A new `getCutoffSeverity` utility drives the left severity border for the Cutoff Strip. The three dashboard components are then refactored to delegate card rendering to `BookingCard`, plus one prop-threading change to wire `Exporter[]` into `ActiveTransitPanel` through `GlobeTransitSection`.

**Tech Stack:** Next.js (RSC + Client Components), TypeScript, Tailwind v4, `next-intl`, Vitest + React Testing Library

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `agora-app/lib/utils/dates.ts` | Add `getCutoffSeverity` |
| Modify | `agora-app/__tests__/dates.test.ts` | Tests for `getCutoffSeverity` |
| Create | `agora-app/components/shared/BookingCard.tsx` | Unified booking card component |
| Create | `agora-app/__tests__/dashboard/booking-card.test.tsx` | Tests for `BookingCard` |
| Modify | `agora-app/components/dashboard/GlobeTransitSection.tsx` | Thread `exporters: Exporter[]` prop |
| Modify | `agora-app/components/dashboard/ActiveTransitPanel.tsx` | Accept `exporters`, use `BookingCard` |
| Modify | `agora-app/components/dashboard/ApproachingCutoffStrip.tsx` | Use `BookingCard` with `showCutoff` |
| Modify | `agora-app/components/dashboard/ActionQueueV2.tsx` | Use `BookingCard` with `alert`/`showCutoff`/`showChevron` |
| Modify | `agora-app/app/[locale]/page.tsx` | Pass `exporters` to `GlobeTransitSection` |

---

## Task 1: `getCutoffSeverity` utility

**Files:**
- Modify: `agora-app/lib/utils/dates.ts`
- Modify: `agora-app/__tests__/dates.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `agora-app/__tests__/dates.test.ts`:

```ts
import { getTodayDemo, tDayFrom, formatDate, hoursUntil, getCutoffSeverity } from '@/lib/utils/dates';

// ...existing tests...

describe('getCutoffSeverity', () => {
  it('returns critical when cutoff is within 72h', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 48 * 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBe('critical');
  });

  it('returns action when cutoff is between 72h and 120h', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 96 * 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBe('action');
  });

  it('returns null when cutoff is beyond 120h', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 200 * 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getCutoffSeverity('')).toBeNull();
  });

  it('returns null when cutoff is in the past', () => {
    const cutoff = new Date(getTodayDemo().getTime() - 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd agora-app && npx vitest run __tests__/dates.test.ts
```

Expected: fail with `getCutoffSeverity is not a function`.

- [ ] **Step 3: Implement `getCutoffSeverity`**

Add to `agora-app/lib/utils/dates.ts`:

```ts
import type { AlertSeverity } from '@/types';

export function getCutoffSeverity(cutoffIso: string, now: Date = getTodayDemo()): AlertSeverity | null {
  if (!cutoffIso) return null;
  const delta = hoursUntil(cutoffIso, now);
  if (delta <= 0) return null;
  if (delta <= 72) return 'critical';
  if (delta <= 120) return 'action';
  return null;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd agora-app && npx vitest run __tests__/dates.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/lib/utils/dates.ts agora-app/__tests__/dates.test.ts
git commit -m "feat(utils): add getCutoffSeverity for booking card severity border"
```

---

## Task 2: `BookingCard` component

**Files:**
- Create: `agora-app/components/shared/BookingCard.tsx`
- Create: `agora-app/__tests__/dashboard/booking-card.test.tsx`

The component has a fixed 3-row base and optional slots for `alert`, `cutoff`, `chevron`, and `severity` border. When `isHovered` is true the card applies the active hover style (used by `ActiveTransitPanel` for globe sync).

- [ ] **Step 1: Write failing tests**

Create `agora-app/__tests__/dashboard/booking-card.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingCard } from '@/components/shared/BookingCard';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera, Alert } from '@/types';

const mockNaviera: Naviera = {
  id: 'NAV-MSC', name: 'MSC Mediterranean Shipping', shortName: 'MSC', code: 'MSCU',
  apiCapability: 'manual', totalBookings: 10, avgDraftBlTurnaroundHours: 24,
  siRejectionRate: 0.02, cutoffDisciplineRate: 0.95,
};

const mockExporter: Exporter = {
  id: 'EXP-1', name: 'Comfrut', legalName: 'Comfrut S.A.', taxId: '12345',
  address: 'Linares', city: 'Linares', country: 'Chile',
  contactName: 'Cristián', contactEmail: 'c@comfrut.com', contactPhone: '+56',
  defaultIncoterm: 'FOB', defaultPaymentTerm: 'COBRANZA',
  primaryProducts: ['cherries'], primaryMarkets: ['US'],
  totalOrders: 5, totalContainers: 10, onTimeSiRate: 0.9,
  siQualityScore: 0.85, avgSiTurnaroundHours: 12,
};

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BKG-1', bookingNumber: 'MSCSAI9999',
    navieraId: 'NAV-MSC', containerType: '40HC', containerCount: 1, isReefer: false,
    shipper: 'Comfrut', consignee: 'Consignee Co.',
    freightTerm: 'COLLECT', emissionType: 'BL', containerIds: [],
    vesselName: 'MSC Test', voyage: 'V001',
    pol: 'San Antonio, Chile', polCoords: [-71.6, -33.6],
    pod: 'Rotterdam, Netherlands', podCoords: [4.5, 51.9],
    etd: '2026-05-15T19:00:00-04:00', eta: '2026-06-01T07:00:00-04:00',
    cutOff: '2026-05-10T16:00:00-04:00',
    stackingFrom: '2026-05-08T08:00:00-04:00', stackingTo: '2026-05-10T14:00:00-04:00',
    status: 'awaiting_si', createdAt: '2026-04-20T10:00:00-04:00',
    alertIds: [], costAtRiskUsd: 0,
    ...overrides,
  };
}

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

describe('BookingCard base', () => {
  it('renders booking number', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('MSCSAI9999')).toBeInTheDocument();
  });

  it('renders naviera shortName', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('MSC')).toBeInTheDocument();
  });

  it('renders route', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText(/San Antonio.*Rotterdam/)).toBeInTheDocument();
  });

  it('renders exporter name', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('Comfrut')).toBeInTheDocument();
  });

  it('renders reefer emoji when isReefer', () => {
    wrap(<BookingCard booking={makeBooking({ isReefer: true })} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('❄')).toBeInTheDocument();
  });

  it('does not render reefer emoji when not isReefer', () => {
    wrap(<BookingCard booking={makeBooking({ isReefer: false })} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.queryByText('❄')).not.toBeInTheDocument();
  });
});

describe('BookingCard cutoff slot', () => {
  it('does not render cutoff section when showCutoff is false', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.queryByText('Cutoff')).not.toBeInTheDocument();
  });

  it('renders cutoff section when showCutoff is true', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} showCutoff />);
    expect(screen.getByText('Cutoff')).toBeInTheDocument();
  });
});

describe('BookingCard alert slot', () => {
  const mockAlert: Alert = {
    id: 'ALT-1', bookingId: 'BKG-1',
    severity: 'critical', title: 'SI rejected', titleEs: 'SI rechazado',
    costAtRiskUsd: 4200, createdAt: '2026-04-30T10:00:00-04:00',
    resolvedAt: null,
  };

  it('does not render alert when not provided', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.queryByText('SI rejected')).not.toBeInTheDocument();
  });

  it('renders alert title in English', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} alert={mockAlert} />);
    expect(screen.getByText(/SI rejected/)).toBeInTheDocument();
  });

  it('renders cost at risk when present', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} alert={mockAlert} />);
    expect(screen.getByText(/4,200/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd agora-app && npx vitest run __tests__/dashboard/booking-card.test.tsx
```

Expected: fail with module not found.

- [ ] **Step 3: Implement `BookingCard`**

Create `agora-app/components/shared/BookingCard.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { Alert, AlertSeverity, Booking, Exporter, Naviera } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { getCutoffSeverity } from '@/lib/utils/dates';

export interface BookingCardProps {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alert?: Alert;
  showCutoff?: boolean;
  showChevron?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHovered?: boolean;
}

const SEVERITY_BORDER: Record<AlertSeverity, string> = {
  critical: 'border-l-severity-crit',
  action:   'border-l-severity-watch',
  watch:    'border-l-severity-info',
  info:     'border-l-ink-3',
};

function resolveSeverity(booking: Booking, alert?: Alert, showCutoff?: boolean): AlertSeverity | null {
  if (alert) return alert.severity;
  if (showCutoff) return getCutoffSeverity(booking.cutOff ?? '');
  return null;
}

export function BookingCard({
  booking, exporter, naviera,
  alert, showCutoff, showChevron,
  onMouseEnter, onMouseLeave, isHovered,
}: BookingCardProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale() as 'es' | 'en';

  const severity = resolveSeverity(booking, alert, showCutoff);
  const hasExtra = !!alert || !!showCutoff;

  const pol = booking.pol.split(',')[0];
  const pod = booking.pod.split(',')[0];

  return (
    <Link
      href={`/bookings/${booking.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        'block rounded-lg border bg-bg-2 px-3 py-2 transition-colors',
        severity ? ['border-l-2', SEVERITY_BORDER[severity]] : '',
        isHovered
          ? 'border-[var(--line-mid)] bg-bg-3'
          : 'border-[var(--line-soft)] hover:border-[var(--line-mid)] hover:bg-bg-3',
      )}
    >
      {/* Row 1 */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-ink-1">
          {booking.bookingNumber}
        </span>
        <div className="flex items-center gap-1.5">
          <NavieraChip naviera={naviera} size="sm" asLink={false} />
          {showChevron && <ChevronRight className="h-3.5 w-3.5 text-ink-3" />}
        </div>
      </div>

      {/* Row 2 */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[10px] text-ink-3">{pol} → {pod}</span>
        <LifecyclePill status={booking.status} size="sm" />
      </div>

      {/* Row 3 */}
      <div className="mt-1 flex items-center justify-between gap-2">
        <ExporterChip exporter={exporter} size="sm" asLink={false} />
        <div className="flex items-center gap-1.5 shrink-0">
          {booking.isReefer && <span className="text-[10px] text-trace">❄</span>}
          <span className="rounded border border-[var(--line-soft)] bg-bg-1 px-[5px] py-px font-mono text-[9px] text-ink-3">
            {booking.containerType}
          </span>
          <span className="font-mono text-[9.5px] text-ink-4">
            ETD {booking.etd ? new Date(booking.etd).toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-GB', { day: 'numeric', month: 'short' }) : '—'}
          </span>
        </div>
      </div>

      {/* Extra slots */}
      {hasExtra && (
        <div className="mt-1.5 border-t border-[var(--line-soft)] pt-1.5 flex flex-col gap-1">
          {alert && (
            <div className="flex items-start gap-1.5 text-[10px]">
              <AlertTriangle className="mt-px h-3 w-3 shrink-0 text-severity-watch" />
              <span className="text-ink-2">
                {locale === 'es' ? (alert.titleEs ?? alert.title) : alert.title}
              </span>
              {alert.costAtRiskUsd ? (
                <span className="font-mono text-severity-watch shrink-0">
                  · USD {alert.costAtRiskUsd.toLocaleString()}
                </span>
              ) : null}
            </div>
          )}
          {showCutoff && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-ink-4">{t('cutoff')}</span>
              <CutoffCountdown cutoffIso={booking.cutOff ?? ''} />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
```

**Note on ETD formatting:** The ETD uses inline `toLocaleDateString` rather than `formatShortDate` from `dates.ts` to avoid an extra import coupling. If `formatShortDate` is already used in this file's context, prefer it for consistency.

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd agora-app && npx vitest run __tests__/dashboard/booking-card.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/shared/BookingCard.tsx agora-app/__tests__/dashboard/booking-card.test.tsx
git commit -m "feat(dashboard): add unified BookingCard component"
```

---

## Task 3: Wire `exporters` into `GlobeTransitSection` → `ActiveTransitPanel`

`ActiveTransitPanel` currently renders `booking.shipper` (a string). We need to pass `Exporter[]` down from `page.tsx` through `GlobeTransitSection`.

**Files:**
- Modify: `agora-app/components/dashboard/GlobeTransitSection.tsx`
- Modify: `agora-app/components/dashboard/ActiveTransitPanel.tsx`
- Modify: `agora-app/app/[locale]/page.tsx`

- [ ] **Step 1: Update `GlobeTransitSection` to accept and forward `exporters`**

In `agora-app/components/dashboard/GlobeTransitSection.tsx`, change:

```tsx
import type { Booking, Naviera } from '@/types';

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  height: number;
}

export function GlobeTransitSection({ bookings, navieras, height }: Props) {
```

to:

```tsx
import type { Booking, Exporter, Naviera } from '@/types';

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  exporters: Exporter[];
  height: number;
}

export function GlobeTransitSection({ bookings, navieras, exporters, height }: Props) {
```

And pass `exporters` to `ActiveTransitPanel`:

```tsx
<ActiveTransitPanel
  bookings={bookings}
  navieras={navieras}
  exporters={exporters}
  height={height}
  onHoverBooking={setHoveredBooking}
  hoveredBookingId={hoveredBooking?.id ?? null}
/>
```

- [ ] **Step 2: Update `ActiveTransitPanel` to accept `exporters` and use `BookingCard`**

Replace the contents of `agora-app/components/dashboard/ActiveTransitPanel.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';

const ACTIVE_STATUSES = new Set([
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated',
]);

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  exporters: Exporter[];
  height: number;
  onHoverBooking: (b: Booking | null) => void;
  hoveredBookingId: string | null;
}

export function ActiveTransitPanel({ bookings, navieras, exporters, height, onHoverBooking, hoveredBookingId }: Props) {
  const t = useTranslations('dashboard');
  const navieraMap = new Map(navieras.map((n) => [n.id, n]));
  const active = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));

  return (
    <div
      className="flex flex-col flex-1 min-w-0 rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden"
      style={{ height }}
    >
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-[var(--line-soft)] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase">
          {t('enTransit')}
        </span>
        <span className="font-mono text-[10px] text-ink-4">{active.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1.5">
        {active.map((booking) => {
          const naviera = navieraMap.get(booking.navieraId);
          // Booking has no exporterId — match by shipper string against exporter name/legalName
          const exporter = exporters.find(
            (e) => e.name === booking.shipper || e.legalName === booking.shipper
          );
          if (!naviera || !exporter) return null;

          return (
            <BookingCard
              key={booking.id}
              booking={booking}
              exporter={exporter}
              naviera={naviera}
              onMouseEnter={() => onHoverBooking(booking)}
              onMouseLeave={() => onHoverBooking(null)}
              isHovered={hoveredBookingId === booking.id}
            />
          );
        })}

        {active.length === 0 && (
          <div className="flex h-full items-center justify-center text-[11px] text-ink-4">
            {t('noActiveShipments')}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Note:** `Booking` has no `exporterId` field — the match is done by comparing `booking.shipper` against `exporter.name` and `exporter.legalName`, which is the same pattern used in `page.tsx`.

- [ ] **Step 3: Pass `exporters` in `page.tsx`**

In `agora-app/app/[locale]/page.tsx`, find the `GlobeTransitSection` usage and add the `exporters` prop:

```tsx
<GlobeTransitSection bookings={bookings} navieras={navieras} exporters={exporters} height={468} />
```

`exporters` is already imported and available in this file.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/dashboard/GlobeTransitSection.tsx \
        agora-app/components/dashboard/ActiveTransitPanel.tsx \
        agora-app/app/\[locale\]/page.tsx
git commit -m "feat(dashboard): wire exporters into ActiveTransitPanel via GlobeTransitSection"
```

---

## Task 4: Refactor `ApproachingCutoffStrip`

**Files:**
- Modify: `agora-app/components/dashboard/ApproachingCutoffStrip.tsx`

- [ ] **Step 1: Replace inline card with `BookingCard`**

Replace the contents of `agora-app/components/dashboard/ApproachingCutoffStrip.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';

interface Props {
  items: { booking: Booking; exporter: Exporter; naviera: Naviera }[];
}

export function ApproachingCutoffStrip({ items }: Props) {
  const t = useTranslations('dashboard');
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('approachingCutoff')}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto p-3">
        {items.map(({ booking, exporter, naviera }) => (
          <div key={booking.id} className="w-[240px] shrink-0">
            <BookingCard
              booking={booking}
              exporter={exporter}
              naviera={naviera}
              showCutoff
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd agora-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/dashboard/ApproachingCutoffStrip.tsx
git commit -m "feat(dashboard): refactor ApproachingCutoffStrip to use BookingCard"
```

---

## Task 5: Refactor `ActionQueueV2`

**Files:**
- Modify: `agora-app/components/dashboard/ActionQueueV2.tsx`

Note: The existing layout is a horizontal `flex items-center` row with chips inline. `BookingCard` uses a vertical 3-row grid. This is the intentional unification — the Action Queue will now render taller cards, consistent with the other two sections.

- [ ] **Step 1: Replace inline card with `BookingCard`**

Replace the contents of `agora-app/components/dashboard/ActionQueueV2.tsx`:

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Alert, Booking, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';

interface QueueItem {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alert?: Alert;
}

interface Props {
  items: QueueItem[];
}

export function ActionQueueV2({ items }: Props) {
  const t = useTranslations('dashboard');

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 p-6 text-center text-sm text-ink-3">
        {t('noPendingActions')}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('actionQueue')}
        </div>
        <Link
          href="/bookings?status=awaiting_si,si_failed,draft_bl_received"
          className="text-xs text-ink-3 hover:text-ink-1"
        >
          {t('actionQueueViewAll', { n: items.length })}
        </Link>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {items.slice(0, 7).map(({ booking, exporter, naviera, alert }) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            exporter={exporter}
            naviera={naviera}
            alert={alert}
            showCutoff
            showChevron
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd agora-app && npx tsc --noEmit
```

- [ ] **Step 3: Run all tests**

```bash
cd agora-app && npx vitest run
```

Expected: all passing.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/dashboard/ActionQueueV2.tsx
git commit -m "feat(dashboard): refactor ActionQueueV2 to use BookingCard"
```

---

## Task 6: Smoke test in browser

- [ ] **Step 1: Start dev server**

```bash
cd agora-app && npm run dev
```

- [ ] **Step 2: Open the dashboard**

Navigate to `http://localhost:3000` (or the locale-prefixed path, e.g. `/en` or `/es`).

- [ ] **Step 3: Verify each section**

- [ ] Active Transit Panel: cards render with exporter chip in row 3; hovering a card highlights the globe pin
- [ ] Approaching Cutoff Strip: cards render identically to Active Transit + cutoff row below divider; cards are 240px wide in horizontal scroll
- [ ] Action Queue: cards render identically to Active Transit + alert row + cutoff row below divider; severity left border visible
- [ ] Reefer bookings show `❄` emoji (not a badge) across all sections

- [ ] **Step 4: Final commit if any visual fixes were needed**

```bash
git add -p
git commit -m "fix(dashboard): visual polish after BookingCard unification"
```

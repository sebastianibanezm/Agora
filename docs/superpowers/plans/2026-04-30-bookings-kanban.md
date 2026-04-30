# Bookings Kanban Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 7-column Kanban board view to the Bookings page, selectable via a Board/List toggle, with shared filter state across both views.

**Architecture:** A new `BookingsViewClient` wraps both views and owns all filter state. `BookingsKanbanClient` renders 7 columns derived from lifecycle status groups; `KanbanCard` handles per-card rendering. `BookingsListClient` is refactored to accept pre-filtered rows, removing its filter state. `page.tsx` computes three new derived fields per row (`highestAlertSeverity`, `siFailedCheckCount`, `esiTransmittedAt`).

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind v4, next-intl (en + es), Vitest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `messages/en.json` | Modify | Add `bookings.kanban.*` keys |
| `messages/es.json` | Modify | Add `bookings.kanban.*` keys (Spanish) |
| `lib/utils/dates.ts` | Modify | Add `formatElapsedSince` and `formatShortDate` |
| `app/[locale]/bookings/page.tsx` | Modify | Compute new Row fields; swap to `BookingsViewClient` |
| `components/bookings/KanbanCard.tsx` | Create | Single card tile |
| `components/bookings/BookingsKanbanClient.tsx` | Create | Board layout with 7 columns |
| `components/bookings/BookingsViewClient.tsx` | Create | View toggle + shared filter state |
| `components/bookings/BookingsListClient.tsx` | Modify | Accept pre-filtered rows, remove filter state |
| `__tests__/bookings/kanban-card.test.tsx` | Create | Unit tests for KanbanCard |
| `__tests__/bookings/bookings-kanban-client.test.tsx` | Create | Column grouping tests |

---

## Task 1: Add i18n keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/es.json`

- [ ] **Step 1: Add `bookings.kanban` block to `en.json`**

Inside the `"bookings"` object, add a `"kanban"` key after the last existing key:

```json
"kanban": {
  "viewBoard": "Board",
  "viewList": "List",
  "colSiInReview": "SI in Review",
  "colReadyToSend": "Ready to Send",
  "colAwaitingDraftBl": "Awaiting Draft BL",
  "colReadyToRelease": "Ready to Release",
  "filterUrgentOnly": "Show urgent only",
  "cardIssues": "{n, plural, one {# issue} other {# issues}}",
  "cardEsiSent": "e-SI sent {when}",
  "cardDraftBlReceived": "Draft BL received",
  "cardBlReady": "BL clean · ready",
  "cardReleased": "✓ Released · {date}",
  "cardClosed": "Closed · {date}",
  "cardReadySince": "Ready {when}",
  "emptyColumn": "No bookings"
}
```

- [ ] **Step 2: Add `bookings.kanban` block to `es.json`**

```json
"kanban": {
  "viewBoard": "Tablero",
  "viewList": "Lista",
  "colSiInReview": "SI en Revisión",
  "colReadyToSend": "Listo para Enviar",
  "colAwaitingDraftBl": "Esperando BL Borrador",
  "colReadyToRelease": "Listo para Liberar",
  "filterUrgentOnly": "Solo urgentes",
  "cardIssues": "{n, plural, one {# problema} other {# problemas}}",
  "cardEsiSent": "e-SI enviado {when}",
  "cardDraftBlReceived": "BL borrador recibido",
  "cardBlReady": "BL limpio · listo",
  "cardReleased": "✓ Liberado · {date}",
  "cardClosed": "Cerrado · {date}",
  "cardReadySince": "Listo hace {when}",
  "emptyColumn": "Sin embarques"
}
```

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
cd agora-app && pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add agora-app/messages/en.json agora-app/messages/es.json
git commit -m "feat(i18n): add bookings.kanban translation keys (en + es)"
```

---

## Task 2: Add date utilities

**Files:**
- Modify: `agora-app/lib/utils/dates.ts`

These utilities are used by KanbanCard for elapsed-time and short-date metrics.

- [ ] **Step 1: Add `formatElapsedSince` and `formatShortDate` to `dates.ts`**

Append after the last existing function:

```ts
/**
 * Returns a human-readable elapsed string like "4d ago" or "2h ago".
 * Uses the demo time anchor as "now".
 */
export function formatElapsedSince(iso: string, now: Date = getTodayDemo()): string {
  const deltaMs = now.getTime() - new Date(iso).getTime();
  const totalMinutes = Math.floor(deltaMs / 60_000);
  const totalHours = Math.floor(deltaMs / 3_600_000);
  const totalDays = Math.floor(deltaMs / 86_400_000);
  if (totalDays >= 1) return `${totalDays}d ago`;
  if (totalHours >= 1) return `${totalHours}h ago`;
  return `${totalMinutes}m ago`;
}

/**
 * Returns a short locale-aware date like "Apr 25" (en) or "25 abr" (es).
 */
export function formatShortDate(iso: string, locale: 'es' | 'en'): string {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd agora-app && pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add agora-app/lib/utils/dates.ts
git commit -m "feat(utils): add formatElapsedSince and formatShortDate helpers"
```

---

## Task 3: Extend Row type and computed fields in page.tsx

**Files:**
- Modify: `agora-app/app/[locale]/bookings/page.tsx`

`page.tsx` is the server component that assembles each `Row`. Three new derived fields need to be computed here.

- [ ] **Step 1: Add imports to `page.tsx`**

Add to the existing imports at the top:

```ts
import { shippingInstructions } from '@/lib/mock-data/shipping-instructions';
import type { AlertSeverity } from '@/types';
```

- [ ] **Step 2: Add severity priority helper inside `page.tsx`**

Add before the `rows` computation:

```ts
const SEVERITY_ORDER: AlertSeverity[] = ['critical', 'action', 'watch', 'info'];

function resolveHighestSeverity(bookingAlerts: typeof activeAlerts): AlertSeverity | null {
  for (const sev of SEVERITY_ORDER) {
    if (bookingAlerts.some((a) => a.severity === sev)) return sev;
  }
  return null;
}
```

- [ ] **Step 3: Build lookup maps for SI data**

Add after the existing `navieraMap` line:

```ts
const siByBookingId = new Map(
  shippingInstructions.map((si) => [si.bookingId, si])
);
```

- [ ] **Step 4: Extend the `rows` map to compute new fields**

Replace the existing `rows` computation:

```ts
const rows = bookings
  .filter((b) => b.status !== 'cancelled')
  .map((booking) => {
    const order = orderMap.get(booking.orderId);
    const exporter = order ? exporterMap.get(order.exporterId) : undefined;
    const naviera = navieraMap.get(booking.navieraId);
    if (!order || !exporter || !naviera) return null;

    const bookingAlerts = activeAlerts.filter((a) => a.bookingId === booking.id);
    const alertCount = bookingAlerts.length;
    const highestAlertSeverity = resolveHighestSeverity(bookingAlerts);

    const si = siByBookingId.get(booking.id);
    const siFailedCheckCount = si
      ? si.validationResults.filter((c) => c.result === 'fail').length
      : 0;
    const esiTransmittedAt = si?.esiTransmittedAt ?? null;

    return { booking, order, exporter, naviera, alertCount, highestAlertSeverity, siFailedCheckCount, esiTransmittedAt };
  })
  .filter(Boolean) as Array<{
    booking: typeof bookings[number];
    order: typeof orders[number];
    exporter: typeof exporters[number];
    naviera: typeof navieras[number];
    alertCount: number;
    highestAlertSeverity: AlertSeverity | null;
    siFailedCheckCount: number;
    esiTransmittedAt: string | null;
  }>;
```

Note: `cancelled` filtering moves here from `BookingsViewClient` since both views exclude them.

- [ ] **Step 5: Update the JSX to pass rows to `BookingsViewClient` (temporary — just swap the component name for now to avoid a compilation error; `BookingsViewClient` is created in Task 6)**

Leave `BookingsListClient` in place for now. Just verify TypeScript is happy with the extended row type:

```bash
cd agora-app && pnpm tsc --noEmit
```
Expected: no errors (BookingsListClient will get extra props it ignores for now — that's fine).

- [ ] **Step 6: Commit**

```bash
git add agora-app/app/[locale]/bookings/page.tsx
git commit -m "feat(bookings): extend Row with alert severity, SI fail count, esiTransmittedAt"
```

---

## Task 4: Create KanbanCard (TDD)

**Files:**
- Create: `agora-app/components/bookings/KanbanCard.tsx`
- Create: `agora-app/__tests__/bookings/kanban-card.test.tsx`

`KanbanCard` is a pure presentational component. It receives a fully-resolved `Row` and the current column's status group, and renders the card tile. No state.

- [ ] **Step 1: Write failing tests**

Create `agora-app/__tests__/bookings/kanban-card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { KanbanCard } from '@/components/bookings/KanbanCard';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera, Order, AlertSeverity } from '@/types';

const mockNaviera: Naviera = {
  id: 'NAV-MSC', name: 'MSC', shortName: 'MSC', code: 'MSCU',
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

const mockOrder: Order = {
  id: 'ORD-1', orderNumber: 'ORD-2026-0001', exporterId: 'EXP-1',
  destinationMarket: 'US', destinationCountry: 'USA', containerCount: 1,
  windowFrom: '2026-05-01', windowTo: '2026-05-15',
  status: 'in_progress', bookingIds: ['BKG-TEST'], createdAt: '2026-04-01',
};

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BKG-TEST', bookingNumber: 'MSCSAI9999', orderId: 'ORD-1',
    navieraId: 'NAV-MSC', containerType: '40RF', isReefer: false,
    vesselName: 'MSC Test', voyage: 'V001',
    pol: 'San Antonio, Chile', polCoords: [-71.6, -33.6],
    pod: 'Charleston, USA', podCoords: [-79.9, 32.8],
    etd: '2026-05-03T19:00:00-04:00', eta: '2026-05-17T07:00:00-04:00',
    cutOff: '2026-05-01T16:00:00-04:00',
    stackingFrom: '2026-04-29T08:00:00-04:00', stackingTo: '2026-05-01T14:00:00-04:00',
    status: 'awaiting_si', createdAt: '2026-04-20T10:00:00-04:00',
    alertIds: [], costAtRiskUsd: 0,
    ...overrides,
  };
}

function makeRow(bookingOverrides: Partial<Booking> = {}, extras: {
  highestAlertSeverity?: AlertSeverity | null;
  siFailedCheckCount?: number;
  esiTransmittedAt?: string | null;
} = {}) {
  return {
    booking: makeBooking(bookingOverrides),
    order: mockOrder,
    exporter: mockExporter,
    naviera: mockNaviera,
    alertCount: extras.highestAlertSeverity ? 1 : 0,
    highestAlertSeverity: extras.highestAlertSeverity ?? null,
    siFailedCheckCount: extras.siFailedCheckCount ?? 0,
    esiTransmittedAt: extras.esiTransmittedAt ?? null,
  };
}

function renderCard(row: ReturnType<typeof makeRow>) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <KanbanCard row={row} />
    </NextIntlClientProvider>,
  );
}

describe('KanbanCard', () => {
  it('renders booking number', () => {
    renderCard(makeRow());
    expect(screen.getByText('MSCSAI9999')).toBeInTheDocument();
  });

  it('renders naviera short name', () => {
    renderCard(makeRow());
    expect(screen.getByText('MSC')).toBeInTheDocument();
  });

  it('renders exporter name', () => {
    renderCard(makeRow());
    expect(screen.getByText('Comfrut')).toBeInTheDocument();
  });

  it('renders container type badge', () => {
    renderCard(makeRow());
    expect(screen.getByText('40RF')).toBeInTheDocument();
  });

  it('renders reefer icon only for reefer bookings', () => {
    const { rerender } = renderCard(makeRow({ isReefer: false }));
    expect(screen.queryByTestId('reefer-icon')).toBeNull();

    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <KanbanCard row={makeRow({ isReefer: true })} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId('reefer-icon')).toBeInTheDocument();
  });

  it('renders severity strip when highestAlertSeverity is set', () => {
    const { container } = renderCard(makeRow({}, { highestAlertSeverity: 'critical' }));
    expect(container.querySelector('[data-severity="critical"]')).toBeInTheDocument();
  });

  it('does not render severity strip when no alerts', () => {
    const { container } = renderCard(makeRow({}, { highestAlertSeverity: null }));
    expect(container.querySelector('[data-severity]')).toBeNull();
  });

  it('shows issue count for si_failed bookings', () => {
    renderCard(makeRow({ status: 'si_failed' }, { siFailedCheckCount: 3 }));
    expect(screen.getByText('3 issues')).toBeInTheDocument();
  });

  it('shows "BL clean · ready" for bl_validated bookings', () => {
    renderCard(makeRow({ status: 'bl_validated' }));
    expect(screen.getByText('BL clean · ready')).toBeInTheDocument();
  });

  it('shows "Draft BL received" for draft_bl_received bookings', () => {
    renderCard(makeRow({ status: 'draft_bl_received' }));
    expect(screen.getByText('Draft BL received')).toBeInTheDocument();
  });

  it('wraps in a link to the booking detail page', () => {
    const { container } = renderCard(makeRow());
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/bookings/BKG-TEST');
  });
});
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/kanban-card.test.tsx
```
Expected: all tests FAIL with "Cannot find module '@/components/bookings/KanbanCard'".

- [ ] **Step 3: Create `KanbanCard.tsx`**

Create `agora-app/components/bookings/KanbanCard.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, AlertSeverity, Exporter, Naviera, Order } from '@/types';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { formatElapsedSince, formatShortDate } from '@/lib/utils/dates';
import clsx from 'clsx';

const SEVERITY_STRIP: Record<AlertSeverity, string> = {
  critical: 'bg-severity-crit',
  action:   'bg-severity-risk',
  watch:    'bg-severity-watch',
  info:     'bg-severity-info',
};

export interface KanbanRow {
  booking: Booking;
  order: Order;
  exporter: Exporter;
  naviera: Naviera;
  alertCount: number;
  highestAlertSeverity: AlertSeverity | null;
  siFailedCheckCount: number;
  esiTransmittedAt: string | null;
}

interface Props {
  row: KanbanRow;
}

export function KanbanCard({ row }: Props) {
  const { booking, exporter, naviera, highestAlertSeverity, siFailedCheckCount, esiTransmittedAt } = row;
  const t = useTranslations('bookings.kanban');
  const locale = useLocale() as 'es' | 'en';

  const pol = booking.pol.split(',')[0];
  const pod = booking.pod.split(',')[0];

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group block relative rounded-lg border border-[var(--line-soft)] bg-bg-2 px-2 pb-2 pt-2 pl-[11px] transition-colors hover:border-white/15 hover:bg-bg-3 overflow-hidden"
    >
      {/* severity strip */}
      {highestAlertSeverity && (
        <span
          data-severity={highestAlertSeverity}
          className={clsx(
            'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg',
            SEVERITY_STRIP[highestAlertSeverity],
          )}
        />
      )}

      {/* row 1: booking number + naviera */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-[11px] font-semibold text-ink-1">
          {booking.bookingNumber}
        </span>
        <NavieraChip naviera={naviera} size="sm" asLink={false} />
      </div>

      {/* row 2: exporter + container type + reefer */}
      <div className="mt-1 flex items-center justify-between gap-1">
        <span className="max-w-[110px] truncate text-[11px] text-ink-2">
          {exporter.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="rounded border border-[var(--line-soft)] bg-bg-1 px-[5px] py-px font-mono text-[9.5px] text-ink-3">
            {booking.containerType}
          </span>
          {booking.isReefer && (
            <span data-testid="reefer-icon" className="text-[11px] text-trace">❄</span>
          )}
        </div>
      </div>

      {/* row 3: lane + column metric */}
      <div className="mt-[5px] flex items-center justify-between gap-1">
        <span className="text-[10px] text-ink-3">
          {pol} → {pod}
        </span>
        <CardMetric
          booking={booking}
          siFailedCheckCount={siFailedCheckCount}
          esiTransmittedAt={esiTransmittedAt}
          locale={locale}
          t={t}
        />
      </div>
    </Link>
  );
}

// ── Column metric ─────────────────────────────────────────────────────────────

type TFn = ReturnType<typeof useTranslations<'bookings.kanban'>>;

function CardMetric({ booking, siFailedCheckCount, esiTransmittedAt, locale, t }: {
  booking: Booking;
  siFailedCheckCount: number;
  esiTransmittedAt: string | null;
  locale: 'es' | 'en';
  t: TFn;
}) {
  const status = booking.status;

  if (status === 'awaiting_si' || status === 'created' || status === 'si_received') {
    return <CutoffCountdown cutoffIso={booking.cutOff} />;
  }

  if (status === 'si_failed') {
    return (
      <span className="font-mono text-[10px] text-severity-crit">
        {t('cardIssues', { n: siFailedCheckCount })}
      </span>
    );
  }

  if (status === 'si_validated') {
    const when = formatElapsedSince(booking.createdAt);
    return (
      <span className="font-mono text-[10px] text-ink-3">
        {t('cardReadySince', { when })}
      </span>
    );
  }

  if (status === 'esi_sent') {
    const when = esiTransmittedAt ? formatElapsedSince(esiTransmittedAt) : '—';
    return (
      <span className="font-mono text-[10px] text-trace">
        {t('cardEsiSent', { when })}
      </span>
    );
  }

  if (status === 'draft_bl_received') {
    return (
      <span className="font-mono text-[10px] text-severity-info">
        {t('cardDraftBlReceived')}
      </span>
    );
  }

  if (status === 'bl_validated') {
    return (
      <span className="font-mono text-[10px] text-severity-ok">
        {t('cardBlReady')}
      </span>
    );
  }

  if (status === 'bl_released') {
    const date = formatShortDate(booking.etd, locale);
    return (
      <span className="font-mono text-[10px] text-ink-4">
        {t('cardReleased', { date })}
      </span>
    );
  }

  if (status === 'closed') {
    const date = formatShortDate(booking.etd, locale);
    return (
      <span className="font-mono text-[10px] text-ink-4">
        {t('cardClosed', { date })}
      </span>
    );
  }

  return null;
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/kanban-card.test.tsx
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/bookings/KanbanCard.tsx agora-app/__tests__/bookings/kanban-card.test.tsx
git commit -m "feat(kanban): add KanbanCard component with tests"
```

---

## Task 5: Create BookingsKanbanClient

**Files:**
- Create: `agora-app/components/bookings/BookingsKanbanClient.tsx`
- Create: `agora-app/__tests__/bookings/bookings-kanban-client.test.tsx`

`BookingsKanbanClient` receives pre-filtered rows and groups them into 7 columns. It owns no state.

- [ ] **Step 1: Write failing column-grouping test**

Create `agora-app/__tests__/bookings/bookings-kanban-client.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingsKanbanClient } from '@/components/bookings/BookingsKanbanClient';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera, Order } from '@/types';

// minimal mocks ---------------------------------------------------------------
const naviera: Naviera = {
  id: 'NAV-MSC', name: 'MSC', shortName: 'MSC', code: 'MSCU',
  apiCapability: 'manual', totalBookings: 1, avgDraftBlTurnaroundHours: 24,
  siRejectionRate: 0, cutoffDisciplineRate: 1,
};
const exporter: Exporter = {
  id: 'EXP-1', name: 'Comfrut', legalName: 'Comfrut S.A.', taxId: '0',
  address: '', city: '', country: 'Chile', contactName: '', contactEmail: '',
  contactPhone: '', defaultIncoterm: 'FOB', defaultPaymentTerm: 'COBRANZA',
  primaryProducts: [], primaryMarkets: [], totalOrders: 0, totalContainers: 0,
  onTimeSiRate: 1, siQualityScore: 1, avgSiTurnaroundHours: 12,
};
const order: Order = {
  id: 'ORD-1', orderNumber: 'ORD-001', exporterId: 'EXP-1',
  destinationMarket: 'US', destinationCountry: 'USA', containerCount: 1,
  windowFrom: '', windowTo: '', status: 'in_progress', bookingIds: [],
  createdAt: '',
};

function makeRow(status: Booking['status'], num: string) {
  const booking: Booking = {
    id: `BKG-${num}`, bookingNumber: num, orderId: 'ORD-1', navieraId: 'NAV-MSC',
    containerType: '40HC', isReefer: false, vesselName: 'Test', voyage: 'V1',
    pol: 'San Antonio', polCoords: [-71.6, -33.6], pod: 'Charleston', podCoords: [-79.9, 32.8],
    etd: '2026-05-03T00:00:00Z', eta: '2026-05-17T00:00:00Z',
    cutOff: '2026-05-01T16:00:00-04:00', stackingFrom: '2026-04-29T00:00:00Z',
    stackingTo: '2026-05-01T00:00:00Z', status, createdAt: '2026-04-20T00:00:00Z',
    alertIds: [], costAtRiskUsd: 0,
  };
  return { booking, order, exporter, naviera, alertCount: 0, highestAlertSeverity: null, siFailedCheckCount: 0, esiTransmittedAt: null };
}

function renderBoard(rows: ReturnType<typeof makeRow>[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <BookingsKanbanClient rows={rows} />
    </NextIntlClientProvider>,
  );
}

describe('BookingsKanbanClient', () => {
  it('renders all 7 column headers', () => {
    renderBoard([]);
    expect(screen.getByText('Awaiting SI')).toBeInTheDocument();
    expect(screen.getByText('SI in Review')).toBeInTheDocument();
    expect(screen.getByText('SI Failed')).toBeInTheDocument();
    expect(screen.getByText('Ready to Send')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Draft BL')).toBeInTheDocument();
    expect(screen.getByText('Ready to Release')).toBeInTheDocument();
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('places awaiting_si booking in column 1', () => {
    renderBoard([makeRow('awaiting_si', 'BKG001')]);
    expect(screen.getByText('BKG001')).toBeInTheDocument();
  });

  it('places si_failed booking in SI Failed column', () => {
    renderBoard([makeRow('si_failed', 'BKG002')]);
    expect(screen.getByText('BKG002')).toBeInTheDocument();
  });

  it('places esi_sent and draft_bl_received in same column 5', () => {
    renderBoard([
      makeRow('esi_sent', 'ESI001'),
      makeRow('draft_bl_received', 'DBL001'),
    ]);
    expect(screen.getByText('ESI001')).toBeInTheDocument();
    expect(screen.getByText('DBL001')).toBeInTheDocument();
  });

  it('shows empty-column text when a column has no cards', () => {
    renderBoard([]);
    const empties = screen.getAllByText('No bookings');
    expect(empties.length).toBe(7);
  });

  it('shows correct count badge per column', () => {
    renderBoard([makeRow('si_failed', 'F1'), makeRow('si_failed', 'F2')]);
    // "2" badge should appear for SI Failed; all other columns show "0"
    const badges = screen.getAllByText('2');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/bookings-kanban-client.test.tsx
```
Expected: FAIL — "Cannot find module".

- [ ] **Step 3: Create `BookingsKanbanClient.tsx`**

Create `agora-app/components/bookings/BookingsKanbanClient.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import type { BookingStatus } from '@/types';
import type { KanbanRow } from '@/components/bookings/KanbanCard';
import { KanbanCard } from '@/components/bookings/KanbanCard';
import clsx from 'clsx';

// ── Column definitions ────────────────────────────────────────────────────────

interface ColumnDef {
  key: string;
  statuses: BookingStatus[];
  dotClass: string;
  titleKey: string;
  titleNs: 'lifecycle' | 'bookings.kanban';
}

const COLUMNS: ColumnDef[] = [
  { key: 'awaiting_si',      statuses: ['created', 'awaiting_si'],              dotClass: 'bg-severity-watch', titleKey: 'awaiting_si',      titleNs: 'lifecycle' },
  { key: 'si_in_review',     statuses: ['si_received'],                          dotClass: 'bg-severity-info',  titleKey: 'colSiInReview',    titleNs: 'bookings.kanban' },
  { key: 'si_failed',        statuses: ['si_failed'],                            dotClass: 'bg-severity-crit',  titleKey: 'si_failed',        titleNs: 'lifecycle' },
  { key: 'ready_to_send',    statuses: ['si_validated'],                         dotClass: 'bg-mint-500',       titleKey: 'colReadyToSend',   titleNs: 'bookings.kanban' },
  { key: 'awaiting_dbl',     statuses: ['esi_sent', 'draft_bl_received'],        dotClass: 'bg-trace',          titleKey: 'colAwaitingDraftBl', titleNs: 'bookings.kanban' },
  { key: 'ready_to_release', statuses: ['bl_validated'],                         dotClass: 'bg-mint-500',       titleKey: 'colReadyToRelease', titleNs: 'bookings.kanban' },
  { key: 'released',         statuses: ['bl_released', 'closed'],               dotClass: 'bg-ink-4',          titleKey: 'bl_released',      titleNs: 'lifecycle' },
];

interface Props {
  rows: KanbanRow[];
}

export function BookingsKanbanClient({ rows }: Props) {
  const tKanban = useTranslations('bookings.kanban');
  const tLifecycle = useTranslations('lifecycle');

  const byStatus = new Map<BookingStatus, KanbanRow[]>();
  for (const row of rows) {
    const list = byStatus.get(row.booking.status) ?? [];
    list.push(row);
    byStatus.set(row.booking.status, list);
  }

  return (
    <div className="flex gap-[10px] overflow-x-auto pb-4 pt-3">
      {COLUMNS.map((col) => {
        const colRows = col.statuses.flatMap((s) => byStatus.get(s) ?? []);
        const title = col.titleNs === 'lifecycle'
          ? tLifecycle(col.titleKey as Parameters<typeof tLifecycle>[0])
          : tKanban(col.titleKey as Parameters<typeof tKanban>[0]);

        return (
          <div
            key={col.key}
            className="flex w-[230px] min-w-[230px] flex-col overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-bg-1"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-[10px] py-2">
              <div className="flex items-center gap-[6px]">
                <span className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', col.dotClass)} />
                <span className="text-[11px] font-semibold text-ink-2">{title}</span>
              </div>
              <span className="rounded bg-bg-2 px-[5px] py-px font-mono text-[10px] text-ink-4">
                {colRows.length}
              </span>
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col gap-[6px] overflow-y-auto p-[7px]">
              {colRows.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-ink-4">
                  {tKanban('emptyColumn')}
                </p>
              ) : (
                colRows.map((row) => <KanbanCard key={row.booking.id} row={row} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/bookings-kanban-client.test.tsx
```
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/bookings/BookingsKanbanClient.tsx agora-app/__tests__/bookings/bookings-kanban-client.test.tsx
git commit -m "feat(kanban): add BookingsKanbanClient with column layout and tests"
```

---

## Task 6: Create BookingsViewClient + refactor BookingsListClient

**Files:**
- Create: `agora-app/components/bookings/BookingsViewClient.tsx`
- Modify: `agora-app/components/bookings/BookingsListClient.tsx`

This task has two parts that must be done together — moving filter state out of `BookingsListClient` into `BookingsViewClient`.

### Part A: Refactor BookingsListClient

`BookingsListClient` currently owns all filter state and renders its own filter bar. After refactoring, it accepts pre-filtered rows and renders only the table + density toggle.

- [ ] **Step 1: Replace `BookingsListClient.tsx` content**

The new version accepts pre-filtered rows and drops all filter state. It keeps only the density toggle in a simple inline control above the table.

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, Exporter, Naviera, Order, AlertSeverity } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { formatDate } from '@/lib/utils/dates';
import { Snowflake, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export interface ListRow {
  booking: Booking;
  order: Order;
  exporter: Exporter;
  naviera: Naviera;
  alertCount: number;
  highestAlertSeverity: AlertSeverity | null;
  siFailedCheckCount: number;
  esiTransmittedAt: string | null;
}

interface Props {
  rows: ListRow[];
}

export function BookingsListClient({ rows }: Props) {
  const t = useTranslations('bookings');
  const locale = useLocale() as 'es' | 'en';
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

  return (
    <div className="flex flex-col">
      {/* density toggle — lives here since it's list-only */}
      <div className="flex justify-end pb-2">
        <div className="flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 p-0.5">
          <button
            onClick={() => setDensity('compact')}
            className={clsx(
              'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
              density === 'compact' ? 'bg-bg-2 text-ink-1' : 'text-ink-3',
            )}
          >
            {t('densityCompact')}
          </button>
          <button
            onClick={() => setDensity('comfortable')}
            className={clsx(
              'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
              density === 'comfortable' ? 'bg-bg-2 text-ink-1' : 'text-ink-3',
            )}
          >
            {t('densityComfortable')}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-3">{t('empty')}</div>
        ) : (
          <table className={clsx('w-full', density === 'compact' ? 'text-xs' : 'text-sm')}>
            <thead>
              <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                <th className="px-3 py-2 font-normal">{t('colNumber')}</th>
                <th className="px-3 py-2 font-normal">{t('colExporter')}</th>
                <th className="px-3 py-2 font-normal">{t('colNaviera')}</th>
                <th className="px-3 py-2 font-normal">{t('colContainerType')}</th>
                <th className="px-3 py-2 font-normal">{t('colRoute')}</th>
                <th className="px-3 py-2 font-normal">{t('colCutoff')}</th>
                <th className="px-3 py-2 font-normal">{t('colEtd')}</th>
                <th className="px-3 py-2 font-normal">{t('colStatus')}</th>
                <th className="px-3 py-2 font-normal text-center">{t('colAlerts')}</th>
                <th className="px-3 py-2 font-normal text-right">{t('colCostAtRisk')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ booking, exporter, naviera, alertCount }) => (
                <tr
                  key={booking.id}
                  className={clsx(
                    'border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5',
                    density === 'compact' ? '[&>td]:py-1.5' : '[&>td]:py-2.5',
                  )}
                >
                  <td className="px-3">
                    <Link href={`/bookings/${booking.id}`} className="font-mono text-ink-1 hover:underline inline-flex items-center gap-1.5">
                      {booking.bookingNumber}
                      {booking.isReefer && <Snowflake className="h-3 w-3 text-trace" />}
                    </Link>
                  </td>
                  <td className="px-3"><ExporterChip exporter={exporter} size="sm" asLink={false} /></td>
                  <td className="px-3"><NavieraChip naviera={naviera} size="sm" asLink={false} /></td>
                  <td className="px-3 font-mono text-ink-2">{booking.containerType}</td>
                  <td className="px-3 text-ink-2">
                    {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
                  </td>
                  <td className="px-3"><CutoffCountdown cutoffIso={booking.cutOff} /></td>
                  <td className="px-3 font-mono text-ink-2">{formatDate(booking.etd, locale)}</td>
                  <td className="px-3"><LifecyclePill status={booking.status} size="sm" /></td>
                  <td className="px-3 text-center">
                    {alertCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-severity-watch">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="font-mono">{alertCount}</span>
                      </span>
                    ) : (
                      <span className="text-ink-4">—</span>
                    )}
                  </td>
                  <td className="px-3 text-right font-mono text-ink-2">
                    {booking.costAtRiskUsd > 0 ? booking.costAtRiskUsd.toLocaleString('en-US') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-2 text-right font-mono text-[10px] text-ink-3">
        {rows.length}
      </div>
    </div>
  );
}
```

### Part B: Create BookingsViewClient

- [ ] **Step 2: Create `BookingsViewClient.tsx`**

This component owns the view toggle and ALL filter state. It renders the shared filter bar and passes filtered rows to whichever view is active.

```tsx
'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { BookingStatus, Exporter, Market, Naviera } from '@/types';
import type { ListRow } from '@/components/bookings/BookingsListClient';
import { BookingsListClient } from '@/components/bookings/BookingsListClient';
import { BookingsKanbanClient } from '@/components/bookings/BookingsKanbanClient';
import { getTodayDemo } from '@/lib/mock-data/today';
import { Search, Snowflake, X } from 'lucide-react';
import clsx from 'clsx';

// Re-export Row so page.tsx can type the prop without importing from BookingsListClient
export type { ListRow as Row };

const STATUS_OPTIONS: BookingStatus[] = [
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated', 'bl_released', 'closed',
];
const MARKETS: Market[] = ['US', 'EU', 'IN', 'CN', 'MENA', 'LATAM'];

interface Props {
  rows: ListRow[];
  exporters: Exporter[];
  navieras: Naviera[];
}

export function BookingsViewClient({ rows, exporters, navieras }: Props) {
  const t = useTranslations('bookings');
  const tKanban = useTranslations('bookings.kanban');
  const tCommon = useTranslations('common');
  const tLifecycle = useTranslations('lifecycle');
  const sp = useSearchParams();

  // ── view toggle ──────────────────────────────────────────────────────────
  const [view, setView] = useState<'board' | 'list'>('board');

  // ── shared filter state ──────────────────────────────────────────────────
  const initialStatuses = (sp.get('status') ?? '').split(',').filter(Boolean) as BookingStatus[];
  const initialPol = sp.get('pol') ?? '';
  const initialPod = sp.get('pod') ?? '';

  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Set<BookingStatus>>(new Set(initialStatuses));
  const [exporterFilter, setExporterFilter] = useState('');
  const [navieraFilter, setNavieraFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState<Market | ''>('');
  const [reeferOnly, setReeferOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const toggleStatus = (s: BookingStatus) => {
    const next = new Set(statuses);
    next.has(s) ? next.delete(s) : next.add(s);
    setStatuses(next);
  };

  const now = getTodayDemo().getTime();
  const URGENT_MS = 24 * 3_600_000;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ booking, exporter, naviera, order, highestAlertSeverity }) => {
      if (statuses.size > 0 && !statuses.has(booking.status)) return false;
      if (exporterFilter && exporter.id !== exporterFilter) return false;
      if (navieraFilter && naviera.id !== navieraFilter) return false;
      if (marketFilter && order.destinationMarket !== marketFilter) return false;
      if (reeferOnly && !booking.isReefer) return false;
      if (initialPol && booking.pol !== initialPol) return false;
      if (initialPod && booking.pod !== initialPod) return false;
      if (urgentOnly) {
        const isNearCutoff = new Date(booking.cutOff).getTime() - now < URGENT_MS;
        const isCritical = highestAlertSeverity === 'critical';
        if (!isNearCutoff && !isCritical) return false;
      }
      if (q) {
        const hay = [
          booking.bookingNumber, booking.containerNumber ?? '',
          booking.vesselName, booking.voyage, exporter.name, naviera.name, order.orderNumber,
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statuses, exporterFilter, navieraFilter, marketFilter, reeferOnly, urgentOnly, search, initialPol, initialPod, now]);

  const clearAll = () => {
    setStatuses(new Set());
    setExporterFilter('');
    setNavieraFilter('');
    setMarketFilter('');
    setReeferOnly(false);
    setUrgentOnly(false);
    setSearch('');
  };

  const hasFilters = statuses.size > 0 || exporterFilter || navieraFilter || marketFilter || reeferOnly || urgentOnly || search;

  return (
    <div className="flex flex-col">
      {/* ── sticky filter bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--line-soft)] bg-bg-0/95 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          {/* search */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-ink-3" />
            <input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--line-soft)] bg-bg-1 pl-8 pr-3 py-2 text-sm text-ink-1 placeholder:text-ink-3 focus:border-mint-500 focus:outline-none"
            />
          </div>

          {/* exporter */}
          <select value={exporterFilter} onChange={(e) => setExporterFilter(e.target.value)}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none">
            <option value="">{t('filterExporter')}</option>
            {exporters.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          {/* naviera */}
          <select value={navieraFilter} onChange={(e) => setNavieraFilter(e.target.value)}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none">
            <option value="">{t('filterNaviera')}</option>
            {navieras.map((n) => <option key={n.id} value={n.id}>{n.shortName}</option>)}
          </select>

          {/* market */}
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value as Market | '')}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none">
            <option value="">{t('filterMarket')}</option>
            {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* reefer */}
          <label className="flex items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-2 cursor-pointer">
            <input type="checkbox" checked={reeferOnly} onChange={(e) => setReeferOnly(e.target.checked)} className="accent-trace" />
            <Snowflake className="h-3 w-3 text-trace" />
            {t('reefer')}
          </label>

          {/* urgent only — board-specific but visible in list too for context */}
          {view === 'board' && (
            <button
              onClick={() => setUrgentOnly((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 rounded-md border px-2 py-2 text-xs transition-colors',
                urgentOnly
                  ? 'border-severity-watch bg-severity-watch/8 text-severity-watch'
                  : 'border-[var(--line-soft)] bg-bg-1 text-ink-2',
              )}
            >
              <span className={clsx('h-[7px] w-[7px] rounded-full', urgentOnly ? 'bg-severity-watch' : 'bg-ink-4')} />
              {tKanban('filterUrgentOnly')}
            </button>
          )}

          {/* view toggle */}
          <div className="ml-auto flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-2 p-0.5">
            <button onClick={() => setView('board')}
              className={clsx('rounded px-2 py-1 text-[10px] font-medium', view === 'board' ? 'bg-bg-3 text-ink-1' : 'text-ink-3')}>
              {tKanban('viewBoard')}
            </button>
            <button onClick={() => setView('list')}
              className={clsx('rounded px-2 py-1 text-[10px] font-medium', view === 'list' ? 'bg-bg-3 text-ink-1' : 'text-ink-3')}>
              {tKanban('viewList')}
            </button>
          </div>
        </div>

        {/* status pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const active = statuses.has(s);
            return (
              <button key={s} onClick={() => toggleStatus(s)}
                className={clsx(
                  'rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                  active ? 'border-mint-500 bg-mint-500/10 text-mint-500' : 'border-[var(--line-soft)] bg-bg-1 text-ink-3 hover:text-ink-2',
                )}>
                {tLifecycle(s)}
              </button>
            );
          })}
          {hasFilters && (
            <button onClick={clearAll}
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-ink-3/10 px-2 py-0.5 text-[10px] text-ink-2 hover:bg-ink-3/20">
              <X className="h-3 w-3" /> {tCommon('cancel')}
            </button>
          )}
        </div>
      </div>

      {/* ── view ──────────────────────────────────────────────────────────────── */}
      <div className="mt-3">
        {view === 'board' ? (
          <BookingsKanbanClient rows={filtered} />
        ) : (
          <BookingsListClient rows={filtered} />
        )}
      </div>

      <div className="mt-2 text-right font-mono text-[10px] text-ink-3">
        {filtered.length} / {rows.length}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/bookings/BookingsViewClient.tsx agora-app/components/bookings/BookingsListClient.tsx
git commit -m "feat(kanban): add BookingsViewClient, refactor BookingsListClient to accept pre-filtered rows"
```

---

## Task 7: Wire page.tsx

**Files:**
- Modify: `agora-app/app/[locale]/bookings/page.tsx`

Final wiring — swap `BookingsListClient` for `BookingsViewClient` in the page.

- [ ] **Step 1: Update imports in `page.tsx`**

Replace:
```ts
import { BookingsListClient } from '@/components/bookings/BookingsListClient';
```
With:
```ts
import { BookingsViewClient } from '@/components/bookings/BookingsViewClient';
```

- [ ] **Step 2: Update the JSX render call**

Replace:
```tsx
<BookingsListClient rows={rows} exporters={exporters} navieras={navieras} />
```
With:
```tsx
<BookingsViewClient rows={rows} exporters={exporters} navieras={navieras} />
```

- [ ] **Step 3: Run the full test suite**

```bash
cd agora-app && pnpm vitest run
```
Expected: all tests pass including the existing lifecycle-pill and cutoff-countdown tests.

- [ ] **Step 4: TypeScript final check**

```bash
cd agora-app && pnpm tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Start dev server and verify in browser**

```bash
cd agora-app && pnpm dev
```

Navigate to `http://localhost:3000/bookings`. Verify:
- Board view loads by default with 7 columns
- Bookings appear in correct columns per their status
- Severity strips appear on cards with active alerts
- Board/List toggle switches views
- List view renders the table with density toggle
- "Show urgent only" toggle filters correctly
- Exporter / Naviera / Market filters work in both views
- Switching to Spanish (`/es/bookings`) shows all labels translated
- Clicking a card navigates to the booking detail page

- [ ] **Step 6: Commit**

```bash
git add agora-app/app/[locale]/bookings/page.tsx
git commit -m "feat(bookings): wire BookingsViewClient into bookings page — kanban board live"
```

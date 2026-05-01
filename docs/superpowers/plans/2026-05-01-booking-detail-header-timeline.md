# Booking Detail Header & Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the shipper/consignee text from the booking header and replace the lifecycle strip with a 7-step kanban-aligned timeline that has a continuous fill line and a sub-badge on the active step.

**Architecture:** Three independent changes — i18n keys first (other tasks depend on them), then the header fix (small, isolated), then the lifecycle strip (full component replacement). Each task commits independently.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, next-intl, Vitest + Testing Library

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `messages/en.json` | Modify | Add 4 new `lifecycle.*` keys |
| `messages/es.json` | Modify | Add same 4 keys in Spanish |
| `components/bookings/BookingHeader.tsx` | Modify | Remove shipper/consignee; fix chip separator pattern |
| `components/bookings/BookingLifecycleStrip.tsx` | Replace | Full rewrite — kanban-aligned steps, continuous track, JS fill |
| `__tests__/bookings/booking-header.test.tsx` | Create | Verify shipper/consignee is absent; verify no trailing dot |
| `__tests__/bookings/booking-lifecycle-strip.test.tsx` | Create | Verify step states, ghost dot, sub-badge behavior |

---

## Task 1: Add i18n keys for new timeline step labels

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/es.json`

The existing `lifecycle` namespace already has keys for `awaiting_si`, `si_failed`, and `bl_released`. Four new keys are needed for the kanban-column labels that don't yet exist.

- [ ] **Step 1: Add 4 keys to `messages/en.json`**

Inside the `"lifecycle"` object, add after the existing keys:

```json
"si_in_review": "SI In Review",
"ready_to_send": "Ready to Send",
"awaiting_draft_bl": "Awaiting Draft BL",
"ready_to_release": "Ready to Release"
```

- [ ] **Step 2: Add the same 4 keys to `messages/es.json`**

Inside the `"lifecycle"` object, add:

```json
"si_in_review": "SI en revisión",
"ready_to_send": "Listo para enviar",
"awaiting_draft_bl": "Esperando BL borrador",
"ready_to_release": "Listo para liberar"
```

- [ ] **Step 3: Run the i18n shape test**

```bash
cd agora-app && npx vitest run __tests__/i18n.test.ts
```

Expected: all 3 tests pass. The shape test verifies `en` and `es` have identical key structure — it will fail if you added keys to one file but not the other.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/es.json
git commit -m "feat(i18n): add lifecycle keys for kanban-aligned timeline steps"
```

---

## Task 2: BookingHeader — remove shipper/consignee and fix chip separators

**Files:**
- Modify: `components/bookings/BookingHeader.tsx`
- Create: `__tests__/bookings/booking-header.test.tsx`

The current metadata row appends a `·` dot unconditionally after each chip's block. Removing only the shipper/consignee span leaves a trailing dot. The fix restructures the left group to render dots only between present chips.

- [ ] **Step 1: Write the failing test**

Create `__tests__/bookings/booking-header.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingHeader } from '@/components/bookings/BookingHeader';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera } from '@/types';

const booking: Booking = {
  id: 'b1',
  bookingNumber: 'MSC-001',
  status: 'awaiting_si',
  shipper: 'ACME Exports',
  consignee: 'Global Imports',
  pol: 'Shanghai, China',
  pod: 'Los Angeles, USA',
  vesselName: 'Ever Given',
  voyage: '001E',
  etd: '2026-05-10T00:00:00Z',
  eta: '2026-05-25T00:00:00Z',
  cutOff: '2026-05-08T00:00:00Z',
  containerType: '40HC',
  isReefer: false,
  costAtRiskUsd: 0,
  exporterId: 'exp1',
  navieraId: 'nav1',
  stackingFrom: null,
  stackingTo: null,
  setpointC: undefined,
};

const exporter: Exporter = {
  id: 'exp1', name: 'ACME Exports', shortName: 'ACME',
  country: 'US', contactEmail: 'ops@acme.com', logoUrl: null,
};

const naviera: Naviera = {
  id: 'nav1', name: 'MSC', shortName: 'MSC', logoUrl: null,
};

function renderHeader(exp?: Exporter, nav?: Naviera) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <BookingHeader booking={booking} exporter={exp} naviera={nav} />
    </NextIntlClientProvider>,
  );
}

describe('BookingHeader', () => {
  it('does not show shipper or consignee', () => {
    const { queryByText } = renderHeader(exporter, naviera);
    expect(queryByText(/ACME Exports → Global Imports/)).toBeNull();
    expect(queryByText(/Global Imports/)).toBeNull();
  });

  it('does not end with a trailing dot when naviera is absent', () => {
    const { container } = renderHeader(exporter, undefined);
    // Find the metadata left group — it should not end with a bare ·
    const dots = container.querySelectorAll('span');
    const lastDot = [...dots].reverse().find(s => s.textContent === '·');
    // If there's a trailing dot, it would be the last text node in the chips group
    // Check that no ·-only span appears as the last child of its parent
    if (lastDot) {
      const parent = lastDot.parentElement;
      expect(parent?.lastElementChild).not.toBe(lastDot);
    }
  });

  it('shows both chips when both are provided', () => {
    const { getByText } = renderHeader(exporter, naviera);
    expect(getByText('ACME')).toBeInTheDocument(); // ExporterChip shortName
    expect(getByText('MSC')).toBeInTheDocument();  // NavieraChip shortName
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx vitest run __tests__/bookings/booking-header.test.tsx
```

Expected: "does not show shipper or consignee" FAILS (shipper/consignee is currently rendered).

*Note:* If the `Booking` type shape doesn't match exactly, adjust the mock object fields to satisfy TypeScript — check `types/index.ts` for the exact interface.

- [ ] **Step 3: Update `BookingHeader.tsx`**

Replace the metadata row left group (lines ~35–39 in the current file):

```tsx
// BEFORE:
<div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
  {exporter && <><ExporterChip exporter={exporter} /><span>·</span></>}
  {naviera && <><NavieraChip naviera={naviera} /><span>·</span></>}
  <span className="text-ink-2">{booking.shipper} → {booking.consignee}</span>
</div>

// AFTER:
<div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
  {[
    exporter && <ExporterChip key="exp" exporter={exporter} />,
    naviera  && <NavieraChip  key="nav" naviera={naviera} />,
  ]
    .filter((el): el is React.ReactElement => Boolean(el))
    .map((el, i, arr) => (
      <Fragment key={el.key ?? i}>
        {el}
        {i < arr.length - 1 && <span>·</span>}
      </Fragment>
    ))}
</div>
```

Add `Fragment` to the React import at the top of the file:

```tsx
import { Fragment } from 'react';
```

- [ ] **Step 4: Run the tests**

```bash
npx vitest run __tests__/bookings/booking-header.test.tsx
```

Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/bookings/BookingHeader.tsx __tests__/bookings/booking-header.test.tsx
git commit -m "feat(booking-header): remove shipper/consignee, fix chip separator pattern"
```

---

## Task 3: Replace BookingLifecycleStrip with kanban-aligned timeline

**Files:**
- Replace: `components/bookings/BookingLifecycleStrip.tsx`
- Create: `__tests__/bookings/booking-lifecycle-strip.test.tsx`

Full replacement. The new component has 7 steps matching kanban columns, a continuous track div with a JS-positioned fill, and a sub-badge on the active step.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/bookings/booking-lifecycle-strip.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingLifecycleStrip } from '@/components/bookings/BookingLifecycleStrip';
import en from '@/messages/en.json';
import type { BookingStatus } from '@/types';

// ResizeObserver is not available in jsdom — mock it
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation((cb) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));
});

function renderStrip(status: BookingStatus) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <BookingLifecycleStrip current={status} />
    </NextIntlClientProvider>,
  );
}

describe('BookingLifecycleStrip', () => {
  it('renders all 7 step labels', () => {
    const { getByText } = renderStrip('awaiting_si');
    expect(getByText('Awaiting SI')).toBeInTheDocument();
    expect(getByText('SI In Review')).toBeInTheDocument();
    expect(getByText('SI Failed')).toBeInTheDocument();
    expect(getByText('Ready to Send')).toBeInTheDocument();
    expect(getByText('Awaiting Draft BL')).toBeInTheDocument();
    expect(getByText('Ready to Release')).toBeInTheDocument();
    expect(getByText('Released')).toBeInTheDocument();
  });

  it('shows the sub-badge with current raw status on the active step', () => {
    const { getByText } = renderStrip('si_received');
    expect(getByText('si_received')).toBeInTheDocument();
  });

  it('does not show a sub-badge for non-active statuses', () => {
    const { queryByText } = renderStrip('si_received');
    // Other raw status strings should not appear as badges
    expect(queryByText('awaiting_si')).toBeNull();
    expect(queryByText('si_validated')).toBeNull();
  });

  it('shows si_failed badge with correct text when status is si_failed', () => {
    const { getByText } = renderStrip('si_failed');
    expect(getByText('si_failed')).toBeInTheDocument();
  });

  it('hides the SI Failed label (ghost) on the happy path', () => {
    const { getByText } = renderStrip('si_received');
    const label = getByText('SI Failed');
    // Ghost label must be invisible — has the `invisible` class
    expect(label.className).toMatch(/invisible/);
  });

  it('shows the SI Failed label when status is si_failed', () => {
    const { getByText } = renderStrip('si_failed');
    const label = getByText('SI Failed');
    expect(label.className).not.toMatch(/invisible/);
  });

  it('handles all BookingStatus values without throwing', () => {
    const statuses: BookingStatus[] = [
      'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
      'esi_sent', 'draft_bl_received', 'bl_validated', 'bl_released', 'closed', 'cancelled',
    ];
    for (const s of statuses) {
      expect(() => renderStrip(s)).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npx vitest run __tests__/bookings/booking-lifecycle-strip.test.tsx
```

Expected: most tests fail — the current component doesn't have the new step labels or ghost behavior.

- [ ] **Step 3: Replace `BookingLifecycleStrip.tsx`**

Overwrite the entire file:

```tsx
'use client';

import { Fragment, useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { BookingStatus } from '@/types';
import clsx from 'clsx';

// Maps every BookingStatus to its kanban column step index (0–6).
// cancelled has no column on the board and renders nothing active.
const STATUS_TO_STEP: Record<BookingStatus, number> = {
  created: 0,          awaiting_si: 0,
  si_received: 1,
  si_failed: 2,
  si_validated: 3,
  esi_sent: 4,         draft_bl_received: 4,
  bl_validated: 5,
  bl_released: 6,      closed: 6,
  cancelled: -1,
};

interface StepDef {
  key: string;
  labelKey: string;
  isFailedBranch?: boolean; // this step is the SI Failed dead-end
}

const STEPS: StepDef[] = [
  { key: 'awaiting_si',     labelKey: 'awaiting_si' },
  { key: 'si_in_review',   labelKey: 'si_in_review' },
  { key: 'si_failed',      labelKey: 'si_failed',      isFailedBranch: true },
  { key: 'ready_to_send',  labelKey: 'ready_to_send' },
  { key: 'awaiting_dbl',   labelKey: 'awaiting_draft_bl' },
  { key: 'ready_to_release', labelKey: 'ready_to_release' },
  { key: 'released',       labelKey: 'bl_released' },
];

interface Props {
  current: BookingStatus;
  className?: string;
}

export function BookingLifecycleStrip({ current, className }: Props) {
  const t = useTranslations('lifecycle');
  const trackRef = useRef<HTMLDivElement>(null);
  const activeDotRef = useRef<HTMLDivElement>(null);
  const [fillPct, setFillPct] = useState(0);

  const currentStep = STATUS_TO_STEP[current] ?? -1;
  const isFailed = current === 'si_failed';

  useEffect(() => {
    function update() {
      const dot = activeDotRef.current;
      const track = trackRef.current;
      if (!dot || !track) return;
      const dotRect = dot.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const dotCenter = dotRect.left + dotRect.width / 2;
      const pct = ((dotCenter - trackRect.left) / trackRect.width) * 100;
      setFillPct(Math.max(0, Math.min(100, pct)));
    }
    const observer = new ResizeObserver(update);
    if (trackRef.current) observer.observe(trackRef.current);
    update();
    return () => observer.disconnect();
  }, [currentStep]);

  return (
    <div className={clsx('relative', className)}>
      {/* Continuous track behind the dots */}
      <div
        ref={trackRef}
        className="absolute left-0 right-0 top-[5px] h-[2px] rounded-sm bg-[var(--line-soft)]"
      >
        <div
          className={clsx(
            'absolute left-0 top-0 h-full rounded-sm transition-[width] duration-300',
            isFailed ? 'bg-severity-crit/50' : 'bg-severity-ok/60',
          )}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* Step row */}
      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const isActive        = idx === currentStep;
          const isReached       = !step.isFailedBranch && idx < currentStep;
          const isCurrent       = isActive && !step.isFailedBranch;
          const isFailedCurrent = isActive && step.isFailedBranch;
          const isGhost         = step.isFailedBranch && !isFailedCurrent;
          const isUnreached     = !isGhost && !isReached && !isCurrent && !isFailedCurrent;

          const alignClass =
            idx === 0
              ? 'items-start'
              : idx === STEPS.length - 1
              ? 'items-end'
              : 'items-center';

          return (
            <div key={step.key} className={clsx('flex flex-col', alignClass)}>
              {/* Dot */}
              <div
                ref={isActive ? activeDotRef : undefined}
                className={clsx(
                  'relative z-10 rounded-full border-2 transition-all duration-200',
                  isUnreached     && 'h-3 w-3 border-[var(--line-soft)] bg-bg-0',
                  isReached       && 'h-3 w-3 border-severity-ok bg-severity-ok/20',
                  isCurrent       && 'h-3.5 w-3.5 -mt-px border-severity-ok bg-severity-ok/30 shadow-[0_0_0_4px_rgba(74,222,128,0.12)]',
                  isFailedCurrent && 'h-3.5 w-3.5 -mt-px border-severity-crit bg-severity-crit/20 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]',
                  isGhost         && 'h-3 w-3 border-[var(--line-soft)] bg-transparent opacity-20',
                )}
              />

              {/* Column label */}
              <div
                className={clsx(
                  'mt-2.5 max-w-[58px] font-mono text-[10px] uppercase tracking-wide leading-snug',
                  idx === 0              && 'text-left',
                  idx === STEPS.length - 1 && 'text-right',
                  idx !== 0 && idx !== STEPS.length - 1 && 'text-center',
                  isUnreached     && 'text-ink-4/40',
                  isReached       && 'text-ink-3',
                  isCurrent       && 'font-bold text-ink-1',
                  isFailedCurrent && 'font-bold text-severity-crit',
                  isGhost         && 'invisible',
                )}
              >
                {t(step.labelKey as Parameters<typeof t>[0])}
              </div>

              {/* Sub-badge — shown only on the active step */}
              <div className="mt-1.5 min-h-[18px] flex items-center">
                {isActive && (
                  <span
                    className={clsx(
                      'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide',
                      isFailedCurrent
                        ? 'bg-severity-crit/10 text-severity-crit'
                        : 'bg-severity-ok/10 text-severity-ok',
                    )}
                  >
                    {current}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the tests**

```bash
npx vitest run __tests__/bookings/booking-lifecycle-strip.test.tsx
```

Expected: all 7 tests pass.

- [ ] **Step 5: Run the full test suite to check for regressions**

```bash
npx vitest run
```

Expected: all tests pass. If `__tests__/i18n.test.ts` fails, the new message keys were not added correctly — go back to Task 1.

- [ ] **Step 6: Commit**

```bash
git add components/bookings/BookingLifecycleStrip.tsx __tests__/bookings/booking-lifecycle-strip.test.tsx
git commit -m "feat(booking-detail): replace lifecycle strip with kanban-aligned timeline"
```

---

## Task 4: Visual smoke-check

No automated test covers the ResizeObserver fill alignment (jsdom has no layout). Verify visually in the browser.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open a booking detail page**

Navigate to any booking (e.g., `/bookings/<id>`). Verify:

1. The header no longer shows `Shipper Name → Consignee Name`
2. No trailing `·` appears after the last chip
3. The timeline shows 7 steps with column names
4. The green fill line reaches exactly to the center of the active dot
5. The active step shows a small sub-badge with the raw status string
6. The SI Failed step is invisible on happy-path bookings

- [ ] **Step 3: Test a failed booking**

Switch a booking to `si_failed` status (use the demo store if available) and verify:

1. The fill turns red and stops at the SI Failed dot
2. The SI Failed label appears in red
3. The sub-badge shows `si_failed` in red

- [ ] **Step 4: Resize the window**

Drag the window narrower and wider. The fill should recalculate and stay locked to the active dot center.

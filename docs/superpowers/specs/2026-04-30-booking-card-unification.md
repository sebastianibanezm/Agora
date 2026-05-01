# Booking Card Unification

**Date:** 2026-04-30
**Status:** Approved

## Problem

Dashboard booking cards are inconsistent across three sections — Approaching Cutoff Strip, Active Transit Panel, and Action Queue — each rendering different layouts, fields, and visual styling for the same underlying booking data.

## Out of Scope

The Bookings section (KanbanCard, BookingsListClient) is intentionally excluded. Those views have their own specialized layouts and are not being touched.

## Design

### Unified `BookingCard` component

A single `BookingCard` component replaces the inline card markup in all three dashboard sections. It has a fixed base and optional extra slots.

#### Base (always rendered, identical everywhere)

```
Row 1: booking number (mono, semibold)          naviera chip (logo + shortName)
Row 2: POL → POD (route, small, ink-3)          LifecyclePill (status)
Row 3: ExporterChip (logo + name)               ❄ (if reefer, trace color) · container badge · ETD
```

- Styling mirrors the current `ActiveTransitPanel` card: `rounded-lg border border-[var(--line-soft)] bg-bg-2 px-3 py-2`
- Hover: `border-[var(--line-mid)] bg-bg-3`
- Reefer indicator is always the bare `❄` emoji in `text-trace` — no badge, no Lucide icon, no label. This is an intentional simplification from the current `ApproachingCutoffStrip` which renders a styled badge with a Snowflake icon.

**ActiveTransitPanel exporter data:** `ActiveTransitPanel` currently receives `Booking[]` only and renders `booking.shipper` (a plain string). To use `ExporterChip` it must receive `Exporter[]` from its parent. The prop threading path is: `app/[locale]/page.tsx` (RSC, already fetches exporters) → `GlobeTransitSection` (add `exporters: Exporter[]` prop) → `ActiveTransitPanel` (add `exporters: Exporter[]` prop). No new API calls needed.

#### Extra slots (appended below a `border-t border-[var(--line-soft)]` divider)

Each slot is opt-in via a prop. Multiple slots can stack.

| Slot | Rendered as | Used by |
|---|---|---|
| `cutoff` | flex row `justify-between`: plain `<span>` i18n label left · `<CutoffCountdown>` right (siblings, not using `prefix` prop) | Cutoff Strip, Action Queue |
| `alert` | `⚠ alertTitle · USD costAtRiskUsd` (watch color); title uses `alert.titleEs` when locale is `es`, falls back to `alert.title` | Action Queue |
| `chevron` | `ChevronRight` icon appended to row 1, right of naviera chip | Action Queue |
| `severity` | Left border `border-l-2` colored by severity (see below) | Action Queue, Cutoff Strip |

**Severity border:** `BookingCard` derives the severity internally using this priority:

1. If `alert` is present: use `alert.severity` directly
2. Else if `showCutoff` is true: compute via `getCutoffSeverity(booking.cutOff)` (new utility in `lib/utils/dates.ts`)

`getCutoffSeverity(cutoffIso: string): AlertSeverity | null` — thresholds: `'critical'` when delta ≤ 72h, `'action'` when delta ≤ 120h, `null` otherwise. Returns `null` when cutoff is empty or in the past.

The border token lookup uses the same four-value map already in `ActionQueueV2`:

```ts
const SEVERITY_BORDER: Record<AlertSeverity, string> = {
  critical: 'border-l-severity-crit',
  action:   'border-l-severity-watch',
  watch:    'border-l-severity-info',
  info:     'border-l-ink-3',
};
```

#### Component interface

```ts
interface BookingCardProps {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  // optional extras
  alert?: Alert;
  showCutoff?: boolean;
  showChevron?: boolean;
  // for Active Transit globe hover interaction
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHovered?: boolean;
}
```

### Per-section usage

**ActiveTransitPanel** — base only. Receives `Exporter[]` from parent (see data threading above). Passes `onMouseEnter`/`onMouseLeave`/`isHovered` for globe interaction. No layout change.

**ApproachingCutoffStrip** — `showCutoff`. Cards remain `w-[240px]` fixed-width in a horizontal scroll container. Reefer treatment changes from styled badge to bare `❄` emoji (intentional). Severity border derived from cutoff delta.

**ActionQueueV2** — `alert`, `showCutoff`, `showChevron`. **Note layout change:** the existing implementation uses a horizontal flex row with chips inline alongside the booking number. `BookingCard` uses a vertical 3-row grid. This is the intentional unification — the Action Queue will render taller cards instead of compact rows.

### Files affected

- `agora-app/lib/utils/dates.ts` — add `getCutoffSeverity` utility
- `agora-app/components/shared/BookingCard.tsx` — new component
- `agora-app/components/dashboard/GlobeTransitSection.tsx` — add `exporters: Exporter[]` prop, thread to `ActiveTransitPanel`
- `agora-app/components/dashboard/ActiveTransitPanel.tsx` — add `exporters: Exporter[]` prop, replace inline card with `BookingCard`
- `agora-app/components/dashboard/ApproachingCutoffStrip.tsx` — replace inline card with `BookingCard`
- `agora-app/components/dashboard/ActionQueueV2.tsx` — replace inline card with `BookingCard`
- `agora-app/app/[locale]/page.tsx` (or RSC parent) — pass `exporters` to `GlobeTransitSection`

## Non-goals

- No changes to KanbanCard or BookingsListClient
- No new data fetching — exporters are already fetched by the dashboard RSC
- No layout changes to the section containers themselves (scroll behavior, widths, headers, panel titles)

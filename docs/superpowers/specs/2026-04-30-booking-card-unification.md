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
- Reefer indicator is always the bare `❄` emoji in `text-trace` — no badge, no label

#### Extra slots (appended below a `border-t border-[var(--line-soft)]` divider)

Each slot is opt-in via a prop. Multiple slots can stack.

| Slot | Rendered as | Used by |
|---|---|---|
| `cutoff` | `CutoffCountdown` right-aligned with a `Cutoff` label left, colored by urgency | Cutoff Strip, Action Queue |
| `alert` | `⚠ alert.title · USD costAtRiskUsd` (watch color) | Action Queue |
| `chevron` | `ChevronRight` icon appended to row 1 right side | Action Queue |
| `severity` | Left border (`border-l-3`) colored by alert severity | Action Queue, Cutoff Strip (when cutoff < 3d) |

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

Severity border is derived automatically: present when `alert` is provided (driven by `alert.severity`) or when `showCutoff` is true and cutoff is within 3 days.

### Per-section usage

**ActiveTransitPanel** — base only, passes `onMouseEnter`/`onMouseLeave`/`isHovered` for globe interaction.

**ApproachingCutoffStrip** — `showCutoff`. Cards remain 250px fixed-width in a horizontal scroll container. Severity border when cutoff < 3 days.

**ActionQueueV2** — `alert`, `showCutoff`, `showChevron`. Severity border driven by `alert.severity`.

### Files affected

- `agora-app/components/shared/BookingCard.tsx` — new component
- `agora-app/components/dashboard/ActiveTransitPanel.tsx` — replace inline card with `BookingCard`
- `agora-app/components/dashboard/ApproachingCutoffStrip.tsx` — replace inline card with `BookingCard`
- `agora-app/components/dashboard/ActionQueueV2.tsx` — replace inline card with `BookingCard`

## Non-goals

- No changes to KanbanCard or BookingsListClient
- No new data fetching — all three sections already receive the necessary data
- No layout changes to the section containers themselves (scroll behavior, widths, headers)

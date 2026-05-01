# Booking Detail — Header & Timeline Redesign

**Date:** 2026-05-01  
**Status:** Approved  
**Scope:** `BookingHeader.tsx`, `BookingLifecycleStrip.tsx`

---

## Problem

1. The booking detail header shows `shipper → consignee` (exporter and importer names) to the right of the carrier/exporter chips — redundant and visually noisy.
2. The lifecycle strip uses raw internal status values as step labels and is misaligned with the kanban board's column model, confusing the mental map between views.
3. The lifecycle strip design (tiny dots + uppercase mono labels) is visually weak.

---

## Changes

### 1. BookingHeader — remove shipper/consignee

**File:** `components/bookings/BookingHeader.tsx`

Remove the `{booking.shipper} → {booking.consignee}` span from the metadata row.

The current code emits a `·` dot unconditionally after each chip's own conditional block, meaning removing only the shipper span leaves a trailing dot after the last chip. To fix this, restructure the left group to render dots only between consecutive present elements (join-style):

```tsx
{[
  exporter && <ExporterChip key="exp" exporter={exporter} />,
  naviera  && <NavieraChip  key="nav" naviera={naviera} />,
].filter(Boolean).reduce<React.ReactNode[]>((acc, el, i) =>
  i === 0 ? [el] : [...acc, <span key={i}>·</span>, el], []
)}
```

After the change the row renders:

```
ExporterChip · NavieraChip    [cost-at-risk] [cutoff]
ExporterChip                  [cost-at-risk] [cutoff]   ← when naviera absent
                              [cost-at-risk] [cutoff]   ← when both absent
```

No trailing dot in any combination. No other changes to the header.

---

### 2. BookingLifecycleStrip — kanban-aligned redesign

**File:** `components/bookings/BookingLifecycleStrip.tsx`

#### Step model

The strip maps to the 7 kanban columns, in order:

| # | Step label      | Kanban column     | Raw statuses                    |
|---|-----------------|-------------------|---------------------------------|
| 0 | Awaiting SI     | awaiting_si       | `created`, `awaiting_si`        |
| 1 | SI In Review    | si_in_review      | `si_received`                   |
| 2 | SI Failed       | si_failed         | `si_failed`                     |
| 3 | Ready to Send   | ready_to_send     | `si_validated`                  |
| 4 | Awaiting Draft BL | awaiting_dbl    | `esi_sent`, `draft_bl_received` |
| 5 | Ready to Release | ready_to_release | `bl_validated`                  |
| 6 | Released        | released          | `bl_released`, `closed`         |

A mapping from `BookingStatus` → step index drives all visual state. The current component's `ORDER` array omits `si_validated` — the new implementation must include it at step 3.

```ts
const STATUS_TO_STEP: Record<BookingStatus, number> = {
  created: 0, awaiting_si: 0,
  si_received: 1,
  si_failed: 2,
  si_validated: 3,
  esi_sent: 4, draft_bl_received: 4,
  bl_validated: 5,
  bl_released: 6, closed: 6,
  cancelled: -1, // not rendered
};
```

#### Layout

```
[dot]————————[dot]————————[dot]  …  [dot]
 Label         Label (active)  Label
                 ┌──────────┐
                 │ si_rcvd  │  ← sub-badge, active step only
                 └──────────┘
```

- A single `track` div sits behind all dots (absolute, `top: 5px`, `left: 0`, `right: 0`, `height: 2px`).
- A `fill` div inside the track is sized by a `ResizeObserver` effect that measures the center x of the active dot relative to the track left edge.
- Steps are laid out with `justify-content: space-between` in a relative-positioned flex row on top of the track.

#### Dot states

| State          | Condition                                    | Visual                                          |
|----------------|----------------------------------------------|-------------------------------------------------|
| `unreached`    | step index > current step index              | Dark background, muted border                   |
| `reached`      | step index < current step index (happy path) | Green fill, green border                        |
| `current`      | active step (happy path)                     | Green, larger (14 × 14px), green glow ring      |
| `failed-current` | active step is SI Failed                   | Red fill, red border, red glow ring             |
| `ghost`        | SI Failed step when not on that branch       | Near-invisible (transparent bg, dark border, low opacity). **Both the dot and the label text are hidden** (e.g. `opacity: 0` or `visibility: hidden`) — the ghost preserves spacing without adding visual noise. |

#### Fill color

- Green (`rgba(74, 222, 128, 0.6)`) on all statuses except `si_failed`.
- Red (`rgba(239, 68, 68, 0.5)`) when `booking.status === 'si_failed'`.

Fill width is computed in a `useEffect` + `ResizeObserver`. The observer must be disconnected in the cleanup function to avoid leaks under React strict mode:

```ts
useEffect(() => {
  function update() {
    const dot = dotRef.current;
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
```

#### Sub-badge

A small monospace chip appears **only under the active step** showing the raw `BookingStatus` string. It is hidden (zero-height placeholder) for all other steps to prevent layout shift.

- Happy-path badge: `rgba(74,222,128,0.1)` background, green text.
- Failed badge: `rgba(239,68,68,0.12)` background, red text.

#### SI Failed positioning

SI Failed is step 2 in the linear sequence. On the happy path it renders as a ghost dot — low-opacity, no label color — so it does not interrupt the visual flow between SI In Review and Ready to Send. When `booking.status === 'si_failed'`, it activates fully with red styling.

#### i18n

Step labels are sourced from the `lifecycle` translation namespace, matching existing keys where possible. New keys required:

- `lifecycle.si_in_review` → "SI In Review"
- `lifecycle.ready_to_send` → "Ready to Send"  
- `lifecycle.awaiting_draft_bl` → "Awaiting Draft BL"
- `lifecycle.ready_to_release` → "Ready to Release"

Existing keys reused: `awaiting_si`, `si_failed`, `bl_released` (mapped to "Released").

---

## Out of Scope

- No changes to `LifecyclePill`, `KanbanCard`, or any other component.
- The `cancelled` status is not shown on the strip (cancelled bookings are filtered before the detail page renders, per existing behavior).
- No changes to the route/ship/container strip below the header — that is already approved as-is.

---

## Files Changed

| File | Change |
|------|--------|
| `components/bookings/BookingHeader.tsx` | Remove shipper/consignee span and its dot separator |
| `components/bookings/BookingLifecycleStrip.tsx` | Full replacement — kanban-aligned steps, continuous track, JS fill |
| `messages/en.json` | Add 4 new `lifecycle.*` keys |
| `messages/es.json` | Add 4 new `lifecycle.*` keys |

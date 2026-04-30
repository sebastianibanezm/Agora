# Bookings Kanban — Design Spec

**Date:** 2026-04-30  
**Status:** Approved

---

## Overview

A Kanban board over the Bookings page that collapses the 11 `BookingStatus` states into 7 action-oriented columns. Sits above the existing table, selectable via a **Board / List** view toggle. Both views share the same filter state and data.

---

## Architecture

### Component tree

```
bookings/page.tsx  (server — fetches rows, passes to wrapper)
└── BookingsViewClient  (new — owns view toggle + filter state)
    ├── BookingsKanbanClient  (new — renders the board)
    │   └── KanbanCard  (new — single card tile)
    └── BookingsListClient  (existing — unchanged)
```

`BookingsViewClient` receives the same `rows: Row[]`, `exporters`, and `navieras` props that `BookingsListClient` currently receives from the page. It owns the `view: 'board' | 'list'` toggle and the shared filter state (exporter, naviera, market, date range, reeferOnly, search, urgentOnly). It renders either `BookingsKanbanClient` or `BookingsListClient`, passing filtered rows down to whichever is active.

The existing `BookingsListClient` is refactored to accept pre-filtered rows and no longer owns filter state — filter management moves up to `BookingsViewClient`.

---

## Column Mapping

| # | Column | Maps from `BookingStatus` | Column header i18n key |
|---|--------|--------------------------|------------------------|
| 1 | Awaiting SI | `created`, `awaiting_si` | `lifecycle.awaiting_si` |
| 2 | SI in Review | `si_received` | `bookings.kanban.colSiInReview` |
| 3 | SI Failed | `si_failed` | `lifecycle.si_failed` |
| 4 | Ready to Send | `si_validated` | `bookings.kanban.colReadyToSend` |
| 5 | Awaiting Draft BL | `esi_sent`, `draft_bl_received` | `bookings.kanban.colAwaitingDraftBl` |
| 6 | Ready to Release | `bl_validated` | `bookings.kanban.colReadyToRelease` |
| 7 | Released | `bl_released`, `closed` | `lifecycle.bl_released` |

`cancelled` bookings are excluded from the board by default (no column). A future "show cancelled" filter toggle can surface them.

Columns are fixed-width (`230px`), rendered in a horizontally-scrollable row. The board does not wrap.

---

## View Toggle

Replaces the current `compact / comfortable` density toggle in the filter bar header. A segmented control using the existing `bg-bg-2 border-line-soft` styling:

```
[ Board ]  [ List ]
```

- Active button: `bg-bg-3 text-ink-1`
- Inactive button: `text-ink-3`
- i18n: `bookings.kanban.viewBoard`, `bookings.kanban.viewList`

---

## Filter Bar

Shared across both views, owned by `BookingsViewClient`. Renders at the top of the page (sticky, same treatment as the current list filter bar).

**Filters (same as list view):**
- Exporter select → `bookings.filterExporter`
- Naviera select → `bookings.filterNaviera`
- Market select → `bookings.filterMarket`
- Date range select (ETD window) — new, board-specific display

**Board-only addition:**
- "Show urgent only" toggle: filters to bookings with cut-off < 24h OR active critical alerts
  - i18n: `bookings.kanban.filterUrgentOnly`
  - Active state: amber border + background tint (`severity-watch/8`)

---

## Card Anatomy

Each card is `230px` wide (full column width minus padding). Layout:

```
┌─[3px severity strip]──────────────────┐
│ BOOKING-NUM          [NAVIERA chip]    │  ← row 1
│ Exporter name        [40RF] [❄]        │  ← row 2
│ POL → POD            [column metric]  │  ← row 3
│ [sub-pill if applicable]               │  ← row 4 (conditional)
└────────────────────────────────────────┘
```

**Row 1 — Booking number + naviera:**
- Booking number: `font-mono text-[11px] font-semibold text-ink-1`
- Naviera chip: reuses `NavieraChip` component (shortName, bordered, `bg-bg-1`)

**Row 2 — Exporter + container:**
- Exporter name: `text-[11px] text-ink-2`, truncated at `110px`
- Container type badge: `font-mono text-[9.5px] text-ink-3 bg-bg-1 border-line-soft rounded`
- Reefer icon: `❄` in `text-trace` — shown only when `isReefer === true`

**Row 3 — Lane + column metric:**
- Lane: `"${pol.split(',')[0]} → ${pod.split(',')[0]}"`, `text-[10px] text-ink-3`
- Column metric: `font-mono text-[10px]`, content and color are column-specific (see below)

**Row 4 — Sub-pill (conditional):**
- Only rendered when there is a note to surface (e.g. weight mismatch on a Draft BL card)
- Style: `text-[9px] px-[5px] py-[1px] rounded-full border border-line-soft`

**Severity strip:**
- `3px` left border on the card
- Rendered only when the booking has `alertIds.length > 0`
- Color maps to the highest-severity active alert: `sev-crit` > `sev-watch` > `sev-info`
- No strip when no active alerts

**Card click:** navigates to `/bookings/${booking.id}` (same as list row).

---

## Column Metrics

The bottom-right of each card shows a context-specific metric:

| Column | Metric content | Color logic |
|--------|---------------|-------------|
| Awaiting SI | Cutoff countdown via `CutoffCountdown` component | Component handles colors (`crit`/`warn`/`ok`) |
| SI in Review | Cutoff countdown | Same as above |
| SI Failed | `{n} issue(s)` — count of `si_failed` validation checks | Always `text-severity-crit` |
| Ready to Send | `bookings.kanban.cardReadySince` with elapsed time | `text-ink-3` |
| Awaiting Draft BL | `bookings.kanban.cardEsiSent` with elapsed time, OR `bookings.kanban.cardDraftBlReceived` | `text-trace` / `text-severity-info` |
| Ready to Release | `bookings.kanban.cardBlReady` | `text-severity-ok` |
| Released | `bookings.kanban.cardReleased` / `bookings.kanban.cardClosed` with date | `text-ink-4` |

---

## Column Visual Treatment

| Column | Header dot color | Column accent |
|--------|-----------------|---------------|
| Awaiting SI | `severity-watch` | — |
| SI in Review | `severity-info` | — |
| SI Failed | `severity-crit` | — |
| Ready to Send | `mint-500` | — |
| Awaiting Draft BL | `trace` | — |
| Ready to Release | `mint-500` | — |
| Released | `ink-4` | muted, faded treatment |

Column header: `bg-bg-1`, `border-b border-line-soft`. Column body: vertically scrollable, `gap-[6px]` between cards.

---

## i18n — New Keys

All new strings live under `bookings.kanban`. Both `en.json` and `es.json` must be updated simultaneously.

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

**Reused existing keys (no new strings):**
- `lifecycle.awaiting_si`, `lifecycle.si_failed`, `lifecycle.bl_released` — column headers
- `bookings.filterExporter`, `bookings.filterNaviera`, `bookings.filterMarket` — filter dropdowns
- `bookings.empty` — empty column fallback (alternative to `kanban.emptyColumn`)
- `cutoff.*` — via `CutoffCountdown` component
- `common.all` — "All" prefix for filter options

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/bookings/BookingsViewClient.tsx` | View toggle + shared filter state |
| `components/bookings/BookingsKanbanClient.tsx` | Board layout, 7 columns |
| `components/bookings/KanbanCard.tsx` | Single card tile |

## Files to Modify

| File | Change |
|------|--------|
| `agora-app/app/[locale]/bookings/page.tsx` | Pass rows to `BookingsViewClient` instead of `BookingsListClient` |
| `components/bookings/BookingsListClient.tsx` | Refactor to accept pre-filtered rows; remove filter state ownership |
| `messages/en.json` | Add `bookings.kanban.*` keys |
| `messages/es.json` | Add `bookings.kanban.*` keys (Spanish) |

---

## Out of Scope (V1)

- Drag-and-drop between columns
- Group-by toggle (naviera / exporter) — mentioned in brief as "nice-to-have"; deferred
- "Show cancelled" toggle
- URL param persistence of view state
- Auto-archive threshold in "Released" column (display all `bl_released` / `closed` as-is)

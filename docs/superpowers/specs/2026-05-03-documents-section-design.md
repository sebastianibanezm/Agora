# Documents Section — Design Spec

**Date:** 2026-05-03
**Status:** Approved
**Scope:** New top-level "Documentos" page showing all documents across all bookings, grouped by booking, with shared filters and the existing document popup.

---

## 1. Overview

A new top-level section in the sidebar that gives operators a unified view of every document in the system. Documents are grouped by their parent booking. Clicking a document opens the same `BookingDocumentPopup` used in the booking detail page. Clicking a booking number navigates to that booking.

---

## 2. Navigation

Add a new sidebar item in `components/layout/Sidebar.tsx`:

- **Label:** Documentos
- **Icon:** `FileStack` (lucide-react)
- **Route:** `/documents`
- **Position:** Between Bookings and Exporters

---

## 3. Routing & Data Loading

**File:** `app/[locale]/(app)/documents/page.tsx`

Server component. Loads:
- All bookings from `bookings` mock array
- All exporters from `exporters` mock array
- All navieras from `navieras` mock array
- All shipping instructions from `shippingInstructions` mock array
- All draft BLs from `draftBLs` mock array
- All exporter BLs from `exporterBLs` mock array
- All activity events from `activityEvents` mock array

Assembles a `DocumentsRow[]` array (one per booking) and passes it to `DocumentsViewClient`.

```ts
interface DocumentsRow {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  si: ShippingInstruction | undefined;
  bl: DraftBL | undefined;
  exporterBl: ExporterBL | undefined;
  events: ActivityEvent[];
}
```

---

## 4. Filter Bar

**File:** `components/documents/DocumentsViewClient.tsx`

Exact replica of the `BookingsViewClient` filter bar — same components, same filter state shape, same filtering logic applied to `row.booking`. Rendered sticky at the top with the same `bg-bg-0/95 backdrop-blur` treatment.

Filter controls, in order:

| Control | Type | Filters on |
|---|---|---|
| Search | text input | `booking.bookingNumber`, `booking.vesselName`, `booking.voyage`, `exporter.name`, `naviera.name` |
| Exportador | `MultiSelectDropdown` | `exporter.id` |
| Naviera | `MultiSelectDropdown` | `naviera.id` |
| País destino | `MultiSelectDropdown` | last segment of `booking.pod` |
| Tipo documento | `MultiSelectDropdown` | doc type (`'booking' \| 'si' \| 'bl' \| 'exporterBl'`) — hides non-matching doc rows within each group |
| ❄ Reefer | checkbox | `booking.isReefer` |
| × Limpiar | button | clears all filters; shown only when any filter is active |

No view toggle. No "Urgente" button. No `UploadBookingDialog`.

### Tipo documento filter behaviour

When one or more doc types are selected, rows for non-selected types are hidden within each group. Groups where all visible rows are filtered out are hidden entirely. Groups with no documents at all remain visible (collapsed) regardless.

---

## 5. Grouped List

**File:** `components/documents/DocumentsGroupedList.tsx`

### Container

```
rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden
```

### Column layout

```
grid-template-columns: 1fr 90px 80px 72px
```

Columns: **Documento** · **Exportador** · **Naviera** · **Estado**

### Table header row

```
border-b border-[var(--line-soft)] bg-bg-0
font-mono text-[9.5px] tracking-wider text-ink-3 uppercase px-3 py-2
```

### Group header row

One row per booking. Clicking toggles collapse.

```
border-b border-[var(--line-soft)] bg-bg-0/60 hover:bg-bg-0/80 cursor-pointer px-3 py-2
```

Contents (flex, gap-2):
- Severity dot `h-[7px] w-[7px] rounded-full` — colour maps to booking status using same `dotClass` logic as `BookingsListClient`
- Booking number — `<Link href="/bookings/[id]">` — `font-mono text-[11px] font-semibold text-ink-1 hover:underline` — clicking navigates, does **not** toggle collapse
- Exporter · vessel · POD — `text-[11px] text-ink-3`
- Doc count badge — `rounded bg-bg-2 px-[5px] py-px font-mono text-[10px] text-ink-4`
- Chevron (`ChevronDown`) — `ml-auto h-3.5 w-3.5 text-ink-4 transition-transform`, rotated -90° when collapsed

**Initial state:** groups that have at least one document present are open; groups with zero present documents start collapsed.

### Document rows

Four rows per group (Booking, SI, Draft BL, Exporter BL), in that order. Missing rows are rendered at `opacity-50`.

```
border-b border-[var(--line-soft)] last:border-b-0
cursor-pointer hover:bg-white/5 [&>td]:py-1.5 px-3
```

Clicking any row (including missing) opens `BookingDocumentPopup`.

#### Documento cell

Flex row, gap-2:
- **Type badge** `text-[10px] px-[6px] py-[2px] rounded border`:
  - `booking` — `bg-trace/10 text-trace border-trace/20`
  - `si` — `bg-severity-ok/10 text-severity-ok border-severity-ok/20`
  - `bl` — `bg-severity-watch/10 text-severity-watch border-severity-watch/20`
  - `exporterBl` — `bg-severity-crit/8 text-severity-crit border-severity-crit/15`
- **Filename** — `font-mono text-[11px] text-ink-1 truncate max-w-[260px]`; missing: `text-ink-4 italic font-sans` with text "Sin documento"

#### Estado cell

- `✓ OK` — `text-severity-ok`
- `⚠ Atención` — `text-severity-watch`
- `✗ Fallido` — `text-severity-crit`
- `— missing` — `text-ink-4`

Status derivation (matches `BookingDetailClient` logic):
- **booking** — `bookingFileUrl` present → `ok`; absent → `missing`
- **si** — `si.validationStatus === 'green'` → `ok`; `'yellow'` → `warn`; `'red'` → `fail`; no SI → `missing`
- **bl** — same as SI using `bl.validationStatus`
- **exporterBl** — `exporterBl.status === 'approved'` → `ok`; `'uploaded'` → `warn`; `'pending'` or absent → `missing`

---

## 6. Document Popup

Reuse `BookingDocumentPopup` without modification.

When a document row is clicked, set state:
```ts
{ bookingId: string; docType: DocType }
```

Resolve `booking`, `si`, `bl`, `exporterBl`, `events` from the rows array using `bookingId`, then render:

```tsx
<BookingDocumentPopup
  docType={selected.docType}
  docId={resolvedDocId}           // same id logic as BookingDetailClient
  booking={booking}
  si={si}
  bl={bl}
  exporterBl={exporterBl}
  events={events}
  onClose={() => setSelected(null)}
  onDelete={handleDocDelete}
/>
```

`handleDocDelete` calls `deleteBookingDocument(bookingId, docType)` from `useDemoStore`, then clears `selected`.

`resolvedDocId` follows the same mapping as `BookingDetailClient`:
- `booking` → `booking.id`
- `si` → `si.id` (or `booking.siId`)
- `bl` → `bl.id` (or `booking.draftBlId`)
- `exporterBl` → `exporterBl.id`

---

## 7. Empty & Edge States

- **No rows after filtering** — `py-12 text-center text-sm text-ink-3` — "Sin documentos para los filtros seleccionados."
- **Group with all rows missing** — group visible but collapsed by default; rows shown at 50% opacity when expanded
- **Tipo documento filter hides all rows in a group** — group header hidden entirely

---

## 8. Files to Create / Modify

| Action | File |
|---|---|
| Create | `app/[locale]/(app)/documents/page.tsx` |
| Create | `components/documents/DocumentsViewClient.tsx` |
| Create | `components/documents/DocumentsGroupedList.tsx` |
| Modify | `components/layout/Sidebar.tsx` — add Documentos nav item |

No changes to `BookingDocumentPopup`, `useDemoStore`, or any existing mock data.

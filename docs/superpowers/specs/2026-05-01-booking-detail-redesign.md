# Booking Detail Page Redesign

**Date:** 2026-05-01  
**Status:** Approved  
**Scope:** Everything below the lifecycle strip on the booking detail page — removes tabs, adds Actividades log, expands Ruta y Horario, adds Documentos section with document popup.

---

## Overview

The current booking detail page uses a tab layout (Overview, SI, BL, Activity). This redesign eliminates tabs in favour of a single scrolling page. SI and BL document interactions move into a new Documentos section with per-document popups. The Quick Actions sidebar is replaced by an Actividades log.

---

## 1. Page Layout

Single vertical scroll. Top to bottom:

1. **BookingHeader** — unchanged
2. **BookingLifecycleStrip** — unchanged
3. **Alertas** — moved up from bottom of Overview
4. **Ruta y Horario** — two-column: 4 info cards (left) + Actividades log (right)
5. **Contenedores** — unchanged
6. **Documentos** — 4 clickable document cards

`<Tabs>`, `TabsList`, `TabsTrigger`, `TabsContent`, the `tab` state, and `setTab` are deleted from `BookingDetailClient`.

---

## 2. Alertas Section

- Rendered immediately after `BookingLifecycleStrip`, only when `alerts.length > 0`.
- Each alert card: `border-l-[3px] border-severity-watch bg-[rgba(185,122,31,0.06)]`, amber title, message, suggested action in `text-severity-ok`.
- No changes to the `Alert` type.

---

## 3. Ruta y Horario — Two-Column Layout

```
grid grid-cols-2 gap-3 items-stretch
├── Left  — flex flex-col gap-2.5
└── Right — flex flex-col h-full
```

**Height behaviour**: `items-stretch` makes both columns the same height as the taller one. In practice the left column (4 stacked cards) will usually be taller and determines row height. The right column's scroll area uses `flex: 1; min-height: 0; overflow-y: auto` so it scrolls its content without growing the row. If somehow the log is taller, the right column expands and the left column stretches to match via `items-stretch` — the page simply becomes taller. There is no cap on either column's height.

### Left column: 4 info cards stacked

| Card | Fields (`Booking` key → display label) |
|---|---|
| **Partes** | `shipper` → Embarcador, `consignee` → Consignatario, `referenciaCliente` → Ref. Cliente, `condicionPago` → Condición de pago, `emision` → Emisión, `diasLibresOrigen` → Días libres origen |
| **Ruta** | Port flow strip (see below), `vesselName` → Nave, `voyage` → Viaje, `etd` → ETD, `eta` → ETA |
| **Referencias** | `bookingNumber` → Booking #, `masterBl` → Master BL, `blInterglobo` → BL Interglobo, `scacNaviera` → SCAC Naviera, `scacInterglobo` → SCAC Interglobo, `depositoRetiro` → Depósito retiro |
| **Carga & Logística** | `containerType` → Contenedor, `setpointC` → Temperatura, `ventilation` → Ventilación, `stackingFrom`/`stackingTo` → Stacking, `cutOff` → Cut-off documental, ISF warning (conditional) |

**Port flow strip**: renders `pol → transshipmentPort → pod`. When `transshipmentPort` is null or empty string the middle node is hidden and the strip renders `pol → pod` with a single arrow.

**ISF warning**: amber inline chip inside Carga & Logística, rendered only when `destinoUsa === true`. Text (i18n key `isfWarning`): "ISF debe enviarse al recibidor 48 h antes del zarpe. El incumplimiento puede generar multas en destino." No CTA or link.

### Right column: Actividades log

- Pane: `bg-bg-2 border border-line-soft rounded-lg overflow-hidden flex flex-col h-full`
- Header row: `font-mono text-[10px] uppercase tracking-widest text-ink-4 p-[9px_14px] border-b border-line-soft flex-shrink-0`
- Scroll area: `flex-1 min-h-0 overflow-y-auto p-[14px_16px]`
- **Empty state**: `text-xs text-ink-4 text-center py-6` — "Sin actividad registrada."

**Vertical timeline** — no icons, dots only:

| Event | Dot classes |
|---|---|
| Agent alert | `bg-severity-watch border-severity-watch` |
| Completion / approval | `bg-severity-ok border-severity-ok` |
| System event | `bg-bg-3 border-line-mid` |
| User action | `bg-trace border-trace` |
| `document_replaced` | `bg-severity-watch border-severity-watch` (treated as agent alert — system-initiated re-scan) |
| `document_deleted` | `bg-severity-crit border-severity-crit` |

Each entry: event title `text-sm font-medium text-ink-1` / timestamp `font-mono text-[10px] text-ink-4` / 2–3 sentence description `text-xs text-ink-3` / actor badge(s).

**Actor badges** — `font-mono text-[9px] uppercase tracking-wide px-1.5 py-px rounded`:
- `Sistema` — `bg-severity-info/10 text-severity-info border border-severity-info/20`
- `Agente` — `bg-severity-ok/10 text-severity-ok border border-severity-ok/20`
- `Usuario` — `bg-trace/10 text-trace border border-trace/20`
- `Re-escaneado` — `bg-ink-4/10 text-ink-3 border border-line-mid` — renders **alongside** the actor badge as a second chip in a `flex gap-1` row. Appears on `document_replaced` events only. It is an event-characteristic label, not an actor type.

`document_replaced` events appear in both the booking-level log here and the document-scoped log in the popup (Section 6c). This is intentional.

Data source: all `ActivityEvent[]` for the booking with no filtering — including events that have a `documentId` set (e.g. `document_replaced`). The booking-level log never filters by `documentId`.

---

## 4. Contenedores

No changes.

---

## 5. Documentos Section

`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5`

| Card | Prop | Status logic |
|---|---|---|
| **Booking** | `booking.bookingDocumentUrl?: string` | `undefined` or `null` → `missing`; string → `ok` |
| **Shipping Instruction** | `si` prop | `null` → `missing`; `siHasFails` → `warn`; otherwise → `ok` |
| **Draft BL** | `bl` prop | `null` → `missing`; `blHasFails` → `warn`; otherwise → `ok` |
| **Exporter BL** | `exporterBl` prop (new) | `null` or `status === 'pending'` → `missing`; `status === 'uploaded'` → `warn`; `status === 'approved'` → `ok` |

`siHasFails` and `blHasFails` are boolean values computed inline in `BookingDetailClient`:
```ts
const siHasFails = si?.validationResults?.some(r => r.status === 'fail') ?? false
const blHasFails = bl?.validationResults?.some(r => r.status === 'fail') ?? false
```
They are not props.

`missing` cards: `opacity-[0.55]`, icon wrapper `border-dashed`.

Clicking any non-missing card opens the Document Popup. Clicking a `missing` Exporter BL card opens the popup in upload mode (see Section 6 — Exporter BL special case).

---

## 6. Document Popup

**Backdrop**: `fixed inset-0 bg-[rgba(43,31,18,0.45)] backdrop-blur-sm flex items-start justify-center p-8`. Clicking the backdrop closes the popup **unless** the delete confirmation overlay is active (pointer events on the backdrop are blocked by the overlay's `position: absolute inset-0`).

**Panel**: `bg-bg-1 border border-line-mid rounded-xl w-full max-w-[900px] max-h-[calc(100vh-64px)] flex flex-col overflow-hidden shadow-[0_24px_60px_rgba(43,31,18,0.22)]`. At viewport height < 600px the panel drops `max-h` and the whole panel scrolls (header is no longer sticky).

**State**: `selectedDoc: { type: 'booking' | 'si' | 'bl' | 'exporterBl'; id: string } | null` local state in `BookingDetailClient`. `null` = closed.

`id` values by document type:
- `booking` — use `booking.id` (the booking's own ID; there is no separate booking-document entity)
- `si` — use `si.id`
- `bl` — use `bl.id`
- `exporterBl` — use `exporterBl.id` (or `booking.id` when in upload/missing mode — `selectedDoc.id` is not used in upload mode)

`deleteBookingDocument` acts solely on `documentType` and ignores `selectedDoc.id`.

### 6a. Header

```
flex items-center justify-between gap-3 p-4 border-b border-line-mid flex-shrink-0
├── Left: flex flex-col gap-0.5
│   ├── Document name — font-[Georgia] text-[17px] font-normal text-ink-1 tracking-[-0.01em]
│   └── Meta row — font-mono text-[10px] text-ink-4 flex gap-2.5
│       e.g. "SNG0506037 · CMA CGM · Recibido 11-05-2026"
└── Right: flex items-center gap-1.5 flex-shrink-0
    ├── [Primary action — SI and BL only, see 6e]
    ├── "Eliminar" — size="sm" variant="destructive"
    └── × icon button — 28×28 rounded-lg bg-bg-3 border border-line-soft
```

### 6b. Summary strip

```
flex flex-col gap-2 p-3 border-b border-line-soft bg-bg-2 flex-shrink-0
├── Summary card — bg-bg-1 border border-line-soft rounded-lg p-[10px_13px]
│   text-xs text-ink-2 leading-relaxed
│   2–3 sentence plain-language description of the document and its processing status
└── Alert chip — only when doc has active alerts
    bg-[rgba(185,122,31,0.08)] border border-[rgba(185,122,31,0.25)] border-l-[3px] border-l-severity-watch
    rounded-lg p-[7px_11px] flex gap-2 items-start
    ├── AlertTriangle icon (Lucide, 13px, text-severity-watch)
    └── flex flex-col
        ├── bold title text-[11px] text-severity-watch
        └── description text-[10px] text-ink-3
```

### 6c. Body (`flex: 1 overflow: hidden grid grid-cols-2`)

**Left — Document preview** (`border-r border-line-soft overflow-y-auto p-3.5 flex flex-col gap-2.5`):

Button row (`flex items-center justify-between gap-2`):
- Left: "Ver PDF completo" — `size="sm" variant="outline"`. Opens `selectedDoc`'s `fileUrl` in a new tab via `window.open`. Disabled (not hidden) when no `fileUrl` exists (HTML-replica-only mode).
- Right group (`flex gap-1.5`):
  - "Descargar" — `size="sm"`, `bg-severity-ok/10 text-severity-ok border-severity-ok/25 hover:bg-severity-ok/18`. Triggers a `<a download>` against `fileUrl`. Disabled when no `fileUrl`.
  - "Reemplazar" — `size="sm"`, `bg-severity-watch/10 text-severity-watch border-severity-watch/25 hover:bg-severity-watch/18`. Only rendered when a document is not in `missing` state.

Reemplazar flow:
1. Button click → show amber inline notice below button row: "El documento será re-escaneado. El historial registrará el reemplazo." Open OS file picker (hidden `<input type="file" accept=".pdf" />`, max 20 MB).
2. File selected → button enters loading state (`<Loader2>` spinner, disabled). Notice text changes to "Re-escaneando documento…".
3. On success → popup refreshes with new document data; a `document_replaced` `ActivityEvent` is prepended to the log with `changedFields` populated. Button returns to normal state.
4. On error → show toast error; button returns to normal state.
5. The button is never hidden at any stage.

Document preview area: a styled-HTML replica of the actual document. **Not** a PDF.js embed or iframe. A white `<div>` on ivory background (`bg-white shadow-sm rounded-sm`) with the document's data rendered as field rows, section separators, and a header matching the real PDF. Read-only. Populated from the booking's stored fields.

**Right — Document history log** (`overflow-y-auto p-3.5 flex flex-col gap-0`):
- Section label: `font-mono text-[10px] uppercase tracking-widest text-ink-4 mb-3`
- Filters `ActivityEvent[]` where `event.documentId === selectedDoc.id`.
- Same vertical timeline style as Section 3.
- **Empty state**: `text-xs text-ink-4 text-center py-6` — "Sin historial para este documento."
- Event kinds shown: `document_received`, `document_extracted`, `document_validated`, `document_approved`, `document_replaced`.

**Exporter BL — missing/upload mode**: when `selectedDoc.type === 'exporterBl'` and `exporterBl === null`, the entire two-column body layout is replaced by a single centred upload affordance: upload icon + "Subir Exporter BL" heading + `<input type="file" accept=".pdf">` styled as a drop zone. The button row ("Ver PDF completo", "Descargar", "Reemplazar") is also not rendered in this mode. No footer is rendered in this mode. Full upload flow is out of scope for this task — this is a placeholder UI.

### 6d. Footer — extracted fields (`border-t border-line-mid bg-bg-2 p-3.5 flex-shrink-0`)

```
flex flex-col gap-2.5
├── Label: "Campos extraídos — editables · Los cambios se propagan a toda la plataforma"
│   font-mono text-[10px] text-ink-4 uppercase tracking-widest
└── grid grid-cols-2 md:grid-cols-4 gap-2
    Each cell: label (font-mono text-[10px] text-ink-4) + <input className="...">
```

Input style: `bg-bg-1 border border-line-mid rounded-[5px] px-2 py-[5px] text-xs text-ink-1 w-full focus:outline-none focus:border-ink-3`.

On change: calls `updateBookingField(bookingId, field, value)` — a new store action in `useDemoStore` (`lib/hooks/useDemoStore.ts`). It is a simple key-value setter on the booking record. `applyBookingOverride` (pre-existing in the same file) is for status transitions and is not used here.

**Booking document fields** — display label → `keyof Booking`:

| Display label | `keyof Booking` |
|---|---|
| Embarcador | `shipper` |
| Consignatario | `consignee` |
| Booking # | `bookingNumber` |
| Master BL | `masterBl` |
| Nave | `vesselName` |
| Viaje | `voyage` |
| ETD | `etd` |
| ETA | `eta` |
| Pto. Embarque | `pol` |
| Pto. Transbordo | `transshipmentPort` |
| Pto. Descarga | `pod` |
| Depósito retiro | `depositoRetiro` |

**SI and BL footer**: out of scope for this task. Render a placeholder: `text-xs text-ink-4 text-center py-4` — "Los campos de este documento se definirán en una próxima tarea."

**Exporter BL footer**: not rendered in upload mode (see 6c). When a document is uploaded, render the same placeholder as SI/BL: `text-xs text-ink-4 text-center py-4` — "Los campos de este documento se definirán en una próxima tarea." Fields are fully deferred.

### 6e. Primary actions (SI and BL only)

- **SI popup header** (left of Eliminar): `<Button size="sm" variant="default">Generar e-SI</Button>`. Disabled when `siHasFails || booking.status === 'esi_sent' || booking.status === 'bl_released'`. Reuses `handleGenerateEsi`.
- **BL popup header** (left of Eliminar): `<Button size="sm" variant="default">Liberar BL</Button>`. Disabled when `blHasFails || booking.status === 'bl_released'`. Reuses `handleReleaseBl`.
- Booking and Exporter BL popups: no primary action.

### 6f. Delete confirmation

Clicking **Eliminar** mounts an overlay inside the popup panel:

```
position: absolute inset-0
bg-[rgba(248,242,228,0.88)] backdrop-blur-sm
flex items-center justify-center
z-10 rounded-xl
```

This overlay sits above the popup content; its `position: absolute` and `inset-0` block pointer events on the outer backdrop, preventing accidental popup dismissal.

Confirmation card (`bg-bg-1 border border-line-mid rounded-xl p-6 max-w-sm w-[90%] shadow-lg flex flex-col gap-3`):
- Title: `font-[Georgia] text-[16px] font-normal text-ink-1` — "Eliminar documento"
- Body: `text-xs text-ink-3 leading-relaxed` — permanent deletion warning + no-undo statement
- Actions: `flex justify-end gap-2` → Cancelar (`variant="outline"`) + Sí, eliminar (`variant="destructive"`)

On confirm: calls `deleteBookingDocument(bookingId, documentType)` which:
1. Nulls out the relevant document field on the booking (`si`, `bl`, or `exporterBl`; `bookingDocumentUrl` for booking type)
2. Emits a `document_deleted` `ActivityEvent` (booking-level, no `documentId`)
3. Sets `selectedDoc = null` (closes popup)

---

## 7. Data Model Changes

### `Booking` type additions

```ts
bookingDocumentUrl?: string  // URL of the uploaded booking confirmation PDF
condicionPago: string        // free-text, displayed as-is, e.g. "COLLECT"
emision: string              // free-text, displayed as-is, e.g. "Seawaybill"
diasLibresOrigen: number     // e.g. 5
masterBl: string             // e.g. "SNG0506037"
blInterglobo: string         // e.g. "9844220"
scacNaviera: string          // e.g. "CMDU"
scacInterglobo: string       // e.g. "ITGB"
depositoRetiro: string       // e.g. "D&C TALCAHUANO"
destinoUsa: boolean          // stored; set at booking creation from POD
```

### New `ExporterBL` type

```ts
interface ExporterBL {
  id: string
  bookingId: string
  status: 'pending' | 'uploaded' | 'approved'
  uploadedAt?: string
  fileUrl?: string
  extractedFields?: Record<string, string>
  validationResults?: ValidationCheck[]
}
```

### `ActivityEvent` changes

The existing `ActivityEvent` base shape (pre-existing, not changed by this task):
```ts
interface ActivityEvent {
  id: string
  bookingId: string
  kind: string           // discriminant — extended by this task
  timestamp: string      // ISO 8601
  actor: 'system' | 'agent' | 'user'
  title: string
  description: string    // 2–3 sentence plain-language summary
  changedFields?: { field: string; before: string; after: string }[]
}
```

Add `documentId?: string` to the existing type. Events without `documentId` are booking-level only. Events with `documentId` appear in both the booking-level log and the document-scoped popup log.

Add to the event kind union:

```ts
// document_replaced
{
  kind: 'document_replaced'
  documentId: string
  documentType: 'booking' | 'si' | 'bl' | 'exporterBl'
  replacedBy: string    // user display name — hardcode to "Usuario Demo" in demo store
  changedFields: { field: string; before: string; after: string }[]
  // changedFields at top level, consistent with all other event kinds
}

// document_deleted (booking-level, no documentId)
{
  kind: 'document_deleted'
  documentType: 'booking' | 'si' | 'bl' | 'exporterBl'
  deletedBy: string     // hardcode to "Usuario Demo" in demo store
}
```

### New store actions (`lib/hooks/useDemoStore.ts`)

```ts
updateBookingField(bookingId: string, field: keyof Booking, value: unknown): void
// Simple key-value setter on the booking record. Not applyBookingOverride.

deleteBookingDocument(bookingId: string, documentType: 'booking' | 'si' | 'bl' | 'exporterBl'): void
// Nulls out the document field, emits document_deleted ActivityEvent.
```

### `BookingDetailClient` new prop

```ts
exporterBl?: ExporterBL
```

---

## 8. Removed

- `<Tabs>`, `TabsList`, `TabsTrigger`, `TabsContent`
- `tab` state + `setTab`
- Quick Actions card — `generateEsi` and `releaseBl` move to SI and BL popup headers (Section 6e)
- `SIViewer` and `DraftBLViewer` — deleted from the codebase in this task. The popup document preview (Section 6c) is a new styled-HTML replica. If reuse is needed later it will be re-evaluated.
- `EmptyState` component — replaced by `missing` card state

---

## 9. i18n

```
// Section labels
sectionPartes, sectionRuta, sectionReferencias, sectionCargaLogistica
sectionActividades, sectionDocumentos

// Partes card field labels
labelShipper, labelConsignee, labelRefCliente, labelCondicionPago
labelEmision, labelDiasLibres

// Document cards
docBooking, docSI, docDraftBL, docExporterBL
docStatusOk, docStatusPending, docStatusMissing, docStatusReview

// Popup
popupExpandPdf, popupDownloadPdf, popupReplacePdf, popupDeleteDoc
popupReplaceNotice, popupReplaceScanning
confirmDeleteTitle, confirmDeleteMessage, confirmDeleteConfirm, confirmDeleteCancel
fieldsExtractedLabel, fieldsTbdPlaceholder

// Activity log
actorSystem, actorAgent, actorUser, badgeRescanned
activityEmpty, docHistoryEmpty

// Alerts / warnings
isfWarning

// Upload placeholder
uploadExporterBl
```

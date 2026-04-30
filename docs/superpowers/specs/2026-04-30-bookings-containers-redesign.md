# Bookings + Containers Redesign

**Date:** 2026-04-30  
**Status:** Approved  
**Scope:** Remove the Order concept entirely; make Booking the top-level entity created via PDF upload; introduce Container as a child entity holding physical/cargo data.

---

## Motivation

The Order entity was a conceptual mismatch with how the domain actually works. Shipping line booking confirmations arrive as PDFs — they don't map to a pre-existing Order record. Removing Orders and making Bookings the primary entity reflects the real workflow: a booking confirmation PDF arrives, the system ingests it, and a Booking record is created with its associated Container(s).

---

## Data Model

### Booking (updated)

Top-level entity. All core fields are sourced from the booking confirmation PDF at creation time.

```typescript
interface Booking {
  id: string;
  bookingNumber: string;
  navieraId: string;

  // Parties (from PDF)
  shipper: string;
  consignee: string;
  referenciaCliente?: string;

  // Routing
  vesselName: string;
  voyage: string;
  pol: string;
  polCoords: [number, number];  // resolved server-side from lanes.ts port lookup; fallback [0,0]
  pod: string;
  podCoords: [number, number];  // resolved server-side from lanes.ts port lookup; fallback [0,0]
  transshipmentPort?: string;

  // Schedule
  etd: string;
  eta: string;
  cutOff?: string;
  stackingFrom?: string;     // container stacking window at port of loading — start
  stackingTo?: string;       // container stacking window at port of loading — end

  // Cargo spec
  containerType: ContainerType;
  containerCount: number;    // = containers.length from API; locked to this value; not editable in review step
  isReefer: boolean;
  setpointC?: number;
  ventilation?: number;
  freightTerm: FreightTerm;
  emissionType: 'BL' | 'Seawaybill';  // defaults to 'BL' if PDF value unrecognized

  // Source file (session-scoped blob URL — does not survive page reload)
  bookingFileUrl?: string;
  bookingFileName?: string;

  // Relations (containerIds pre-generated client-side before any store call)
  containerIds: string[];
  siId?: string;             // undefined at creation
  draftBlId?: string;        // undefined at creation

  status: BookingStatus;     // always 'awaiting_si' at creation
  createdAt: string;
  alertIds: string[];        // empty array at creation
  costAtRiskUsd: number;     // always 0 at creation
}
```

**Removed from Booking:** `orderId`, `containerNumber`, `sealNumber`, `blNumber` (all move to Container).

**`polCoords` / `podCoords` sourcing:** The Next.js API route (`/api/bookings/parse`) runs server-side and imports `lib/mock-data/lanes.ts` directly. Port names from the PDF are matched against the `POL`/`POD` maps in that file. If no match, coords are `[0, 0]`. Coords are part of the API response and are not re-computed client-side.

**`emissionType`:** Constrained to `'BL' | 'Seawaybill'`. The API route normalises the PDF value to one of these; defaults to `'BL'` if absent or unrecognized.

**`freightTerm`:** Optional in the API response. If absent, the API defaults to `'COLLECT'` before returning — it is always present on the `Booking` record.

### Container (new)

Child of Booking. Holds physical tracking and cargo data assigned after the booking is created.

```typescript
interface Container {
  id: string;
  bookingId: string;
  containerNumber?: string;
  sealNumber?: string;
  blNumber?: string;
  netWeightKg?: number;
  grossWeightKg?: number;
  cargoDescription?: string;
}
```

All Container records for a booking share `containerType` and `setpointC` (defined on the Booking). Each Container has its own physical tracking fields.

**ID pre-generation:** The client generates all IDs (for both Booking and Containers) before calling any store function. `containerIds` on the Booking is fully populated before `addBooking()` is called. `addContainer()` is called once per container immediately after.

**Multi-container:** When `containerCount > 1`, the client creates that many Container records, all initially empty (no number, seal, etc.). Mock data always uses `containerCount: 1`.

### Removed

- `Order` interface and `OrderStatus` type
- All `orderId` references on Booking
- `siId`/`draftBlId` are unchanged — existing SI/BL flows have no `orderId` dependency and require no migration beyond the type change

---

## PDF Ingestion Flow

Bookings are created exclusively by uploading a booking confirmation PDF. Manual form entry is removed.

### Entry point

"Upload Booking" button on the Bookings list page, replacing the "Create Booking" button. The nav item "Bookings" is unchanged — the upload entry point lives on the list page only, not in the nav.

### Step-by-step

1. User clicks "Upload Booking" (`bookings.upload` label)
2. `UploadBookingDialog` opens — file drop zone (PDF only)
3. User selects file; client creates a blob URL immediately (`URL.createObjectURL(file)`)
4. Client POSTs to `POST /api/bookings/parse` as `multipart/form-data`
5. **Loading state:** Drop zone replaced by spinner + `bookings.uploadDialog.parsing`; cancel (close dialog) is allowed; blob URL is held in component state for later use
6. **On error (HTTP 400 or network failure):** Show `bookings.uploadDialog.parseError` message + `bookings.uploadDialog.tryAgain` button; discard blob URL; no partial data shown
7. **On success:** Transition to review step
8. User reviews and edits extracted fields; confirm button disabled if `bookingNumber` is empty OR carrier is still `'NAV-UNKNOWN'`
9. On confirm: client pre-generates one Booking ID (`BKG-<bookingNumber>`) and one Container ID per container (`CTR-<uuid>`); populates `containerIds` on the Booking object. Duplicate booking numbers are not guarded against — out of scope for the demo.
10. Calls `addBooking(booking)` then `addContainer(container)` × `containerCount`; last-write-wins on any concurrent calls (acceptable for demo)
11. Navigate to `/bookings/[id]`

### API route: `POST /api/bookings/parse`

**Mapping is done server-side.** The API route resolves SCAC → `navieraId` and port name → coords before returning the response. The client never performs these lookups.

```typescript
// Success response
interface ParseBookingResponse {
  booking: ExtractedBookingFields;
  containers: ExtractedContainerFields[];  // length determines containerCount; always ≥ 1
}

interface ExtractedBookingFields {
  // navieraId is fully resolved; scacCode is NOT included in the response
  navieraId: string;                  // 'NAV-UNKNOWN' if SCAC not in lookup
  bookingNumber: string;
  shipper: string;
  consignee: string;
  referenciaCliente?: string;
  vesselName: string;
  voyage: string;
  pol: string;
  polCoords: [number, number];        // resolved from lanes.ts
  pod: string;
  podCoords: [number, number];        // resolved from lanes.ts
  transshipmentPort?: string;
  etd?: string;
  eta?: string;
  cutOff?: string;
  stackingFrom?: string;
  stackingTo?: string;
  containerType: ContainerType;
  isReefer: boolean;
  setpointC?: number;
  ventilation?: number;
  freightTerm?: FreightTerm;
  emissionType?: 'BL' | 'Seawaybill';
}

interface ExtractedContainerFields {
  containerNumber?: string;
  cargoDescription?: string;
  // sealNumber, blNumber, weights are never present in booking confirmation PDFs
}

// Error response
interface ParseBookingError {
  error: string;
}
```

**`containerCount` on `Booking`:** Set to `containers.length` from the API response. The two values are always consistent — the array is the source of truth. If the API returns an empty array (which should not happen given valid PDFs), the route returns HTTP 400.

**Naviera resolution:**

```typescript
export const SCAC_TO_NAVIERA_ID: Record<string, string> = {
  CMDU: 'NAV-CMACGM',
  MSCU: 'NAV-MSC',
  MAEU: 'NAV-MAERSK',
  HLCU: 'NAV-HAPAG',
  COSU: 'NAV-COSCO',
  ONEY: 'NAV-ONE',
  EGLV: 'NAV-EVERGREEN',
};
// Unknown SCAC → 'NAV-UNKNOWN'
```

### File attachment

`bookingFileUrl` is set to the blob URL created in step 3. Blob URLs are valid for the lifetime of the browser tab. They do not survive a page reload. The PDF viewer checks whether `bookingFileUrl` is truthy; if falsy (seed data or after reload), it shows `bookings.bookingFileUnavailable`. The dialog calls `URL.revokeObjectURL(blobUrl)` on unmount (dialog close or navigation), whether the upload succeeded, errored, or was cancelled.

### Review step

**Section 1 — Booking details** (`bookings.uploadDialog.section_booking`):

| Field | Input type | i18n key | Notes |
|---|---|---|---|
| Booking # | Text | `bookings.colNumber` | required |
| Carrier | Dropdown (navieras from `navieras.ts`) | `bookings.createDialog.naviera` | required; displays `shortName`; when `NAV-UNKNOWN` the underlying value stays `'NAV-UNKNOWN'` (confirm stays disabled) until the user actively picks a carrier from the dropdown |
| Shipper | Text | `bookings.shipper` | |
| Consignee | Text | `bookings.consignee` | |
| Client reference | Text | `bookings.referenciaCliente` | optional; shown empty (no fieldPending) when absent — it is optional, not expected |
| Vessel | Text | `bookings.vessel` | |
| Voyage | Text | `bookings.voyage` | |
| POL | Text | `bookings.labelPolToPod` (split label) | |
| POD | Text | `bookings.labelPolToPod` (split label) | |
| Transshipment | Text | `bookings.transshipmentPort` | optional |
| ETD | Date input | `bookings.labelEtd` | shows `fieldPending` if absent |
| ETA | Date input | `bookings.labelEta` | shows `fieldPending` if absent |
| Cut-off | Date input | `bookings.labelCutoff` | optional; empty if absent |
| Stacking from | Date input | `bookings.createDialog.stackingFrom` | optional; empty if absent |
| Stacking to | Date input | `bookings.createDialog.stackingTo` | optional; empty if absent |
| Container type | Dropdown (`ContainerType`) | `bookings.createDialog.containerType` | |
| Container count | Read-only number | `bookings.createDialog.containerSection` | driven by `containers.length`; not editable |
| Setpoint °C | Number input | `bookings.createDialog.setpoint` | shown only when `isReefer` |
| Freight terms | Dropdown (`FreightTerm`) | `bookings.freightTerms` | |
| Emission type | Dropdown (`'BL' \| 'Seawaybill'`) | `bookings.emissionType` | |

`bookings.uploadDialog.fieldPending` is used as a placeholder for **expected but absent** fields (ETD, ETA, and required text fields when Claude returned `undefined`). Optional fields (cut-off, stackingFrom, stackingTo, transshipment, client reference) show empty instead — never `fieldPending`.

**Section 2 — Containers** (`bookings.uploadDialog.section_containers`):

One row per container. `containerNumber` and `cargoDescription` are pre-filled if Claude extracted them; all other fields show `containers.notAssigned`. Container rows are read-only in the review step — editing is done post-creation via `ContainerCard`.

---

## Demo Store Changes

```typescript
interface DemoState {
  bookingOverrides: Record<string, Partial<Booking>>;
  newBookings: Booking[];
  newContainers: Container[];
}

export function addContainer(container: Container): void
export function getContainersByBookingId(bookingId: string): Container[]
export function updateContainer(id: string, patch: Partial<Container>): void
```

`getContainersByBookingId` merges: returns all entries from `newContainers` for the given `bookingId`, plus any seed containers from `containers.ts` whose `id` does not already appear in `newContainers`. `updateContainer` patches the matching entry in `newContainers`; if the container is seed-only (not yet in `newContainers`), it is copied from the seed and added to `newContainers` before patching. This ensures no duplicates and seed data is promoted lazily. Last-write-wins is acceptable for the demo.

---

## ContainerCard

Displayed in the booking detail Overview tab (not a separate tab). One card per container in `booking.containerIds`.

| Field | i18n key | Input type | Notes |
|---|---|---|---|
| Container # | `containers.containerNumber` | Text | |
| Seal # | `containers.sealNumber` | Text | |
| BL # | `containers.blNumber` | Text | |
| Net weight | `containers.netWeight` | `type="number"` min=0 step=0.01 | suffix `containers.unitKg`; negative rejected |
| Gross weight | `containers.grossWeight` | `type="number"` min=0 step=0.01 | suffix `containers.unitKg`; negative rejected |
| Cargo description | `containers.cargoDescription` | Textarea | |

**Edit UX:** Click a field value or its `containers.notAssigned` placeholder → inline input appears → blur saves via `updateContainer(id, patch)`. No Save/Cancel buttons. Last-write-wins (acceptable for demo).

---

## UI & Navigation Changes

### Navigation

- Remove "Orders" nav item (`nav.orders` key deleted)
- The nav item "Bookings" and its label (`nav.bookings`) are unchanged
- The upload entry point is a button on the Bookings list page only

### Removed routes

- `/[locale]/orders` — deleted; no redirect; 404 intentionally acceptable for demo
- `/[locale]/orders/[id]` — deleted; no redirect

### Removed components/files

- `CreateBookingDialog`
- `lib/mock-data/orders.ts`

### Updated components

| Component | Change |
|---|---|
| `BookingHeader` | Remove order reference; add shipper/consignee display |
| `BookingDetailClient` | Remove order section; add `ContainerCard` per container in Overview tab |
| `BookingsListClient` | Remove Order column; add Shipper column |
| `BookingsKanbanClient` | Remove order reference from cards |
| `BookingActivityFeed` | Remove order reference from `booking_created` event |
| `CompletedBookingsTable` | Remove order column |
| Exporter detail page | Replace "Active orders" section with active bookings grouped by naviera |

### New components

| Component | Purpose |
|---|---|
| `UploadBookingDialog` | Drop zone → loading → review form → confirm |
| `ContainerCard` | Displays one Container's data in booking detail; inline-editable |

---

## Mock Data Changes

- **Delete** `lib/mock-data/orders.ts`
- **Update** `lib/mock-data/bookings.ts`:
  - Remove `orderId` from all records
  - Add `shipper`, `consignee`, `referenciaCliente`, `containerIds`, `bookingFileName`, `containerCount: 1`, `emissionType` to each record
  - `alertIds` and `costAtRiskUsd` carry over unchanged from existing seed data
- **New** `lib/mock-data/containers.ts` — one `Container` per booking with realistic container numbers, seals, weights, and cargo descriptions
- **Update** `lib/mock-data/navieras.ts` — add `SCAC_TO_NAVIERA_ID` export

---

## i18n

All UI strings go through `next-intl`. No hardcoded strings anywhere in the app.

### Removed keys

- Entire `orders` namespace (both locales)
- `nav.orders`
- `bookings.colOrder`
- `bookings.createDialog` (full namespace — replaced by `bookings.uploadDialog`)
- `exporters.kpi_orders`, `exporters.activeOrders`

### New keys (both `en.json` and `es.json`)

```jsonc
// Bookings list page
"bookings.upload"                            // "Upload Booking" / "Subir Booking"
"bookings.colShipper"                        // "Shipper" / "Exportador"

// New booking fields
"bookings.shipper"                           // "Shipper" / "Exportador"
"bookings.consignee"                         // "Consignee" / "Consignatario"
"bookings.referenciaCliente"                 // "Client reference" / "Referencia cliente"
"bookings.transshipmentPort"                 // "Transshipment" / "Transbordo"
"bookings.emissionType"                      // "Emission type" / "Tipo de emisión"
"bookings.bookingFile"                       // "Booking confirmation" / "Confirmación de booking"
"bookings.bookingFileUnavailable"            // "File not available in this session" / "Archivo no disponible en esta sesión"
"bookings.containers"                        // "Containers ({n})" / "Contenedores ({n})"

// Upload dialog
"bookings.uploadDialog.title"                // "Upload Booking Confirmation"
"bookings.uploadDialog.dropzone"             // "Drop a PDF here, or click to browse"
"bookings.uploadDialog.parsing"              // "Extracting booking data…"
"bookings.uploadDialog.reviewTitle"          // "Review extracted data"
"bookings.uploadDialog.reviewHint"           // "Check the fields below before confirming…"
"bookings.uploadDialog.fieldPending"         // "Pending" — placeholder for expected-but-absent fields
"bookings.uploadDialog.section_booking"      // "Booking details"
"bookings.uploadDialog.section_containers"   // "Containers"
"bookings.uploadDialog.confirm"              // "Create Booking"
"bookings.uploadDialog.toast"                // "Booking {number} created."
"bookings.uploadDialog.unknownCarrier"       // "Unknown carrier — please select"
"bookings.uploadDialog.parseError"           // "Could not extract data from this PDF. Please try again."
"bookings.uploadDialog.tryAgain"             // "Try again"

// Containers namespace (ContainerCard + review step)
"containers.title"                           // "Containers"
"containers.containerNumber"                 // "Container #"
"containers.sealNumber"                      // "Seal #"
"containers.blNumber"                        // "BL #"
"containers.netWeight"                       // "Net weight"
"containers.grossWeight"                     // "Gross weight"
"containers.cargoDescription"                // "Cargo description"
"containers.notAssigned"                     // "Not yet assigned"
"containers.unitKg"                          // "kg"
```

`containers.notAssigned` serves both the read-only review step rows and the `ContainerCard` editable placeholder — the copy is identical in both contexts, so one key suffices.

**SI/BL flows audit:** Before implementation, verify that no existing SI or BL UI component reads `orderId` from the booking or order context. If any does, it must be updated to remove that reference. The spec assumes no such dependency, but the implementer must confirm this by scanning `SIViewer`, `DraftBLViewer`, `ValidationPanel`, and related components.

Review step field labels reuse existing `bookings.*` keys where available (`bookings.vessel`, `bookings.voyage`, `bookings.labelEtd`, `bookings.labelEta`, `bookings.labelCutoff`, `bookings.createDialog.stackingFrom`, `bookings.createDialog.stackingTo`, `bookings.createDialog.containerType`, `bookings.createDialog.setpoint`, `bookings.freightTerms`, `bookings.colNumber`, `bookings.createDialog.naviera`). New keys are only added for concepts not already covered.

---

## Out of Scope

- Real file storage (S3, Supabase Storage) — session-scoped blob URLs explicitly acceptable
- Container-level SI or Draft BL
- Bulk PDF upload (multiple files at once)
- Extraction confidence scores or field-level highlighting in the review step
- Redirects from deleted `/orders` routes — 404 intentionally acceptable for demo

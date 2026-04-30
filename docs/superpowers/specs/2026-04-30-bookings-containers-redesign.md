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
  polCoords: [number, number];
  pod: string;
  podCoords: [number, number];
  transshipmentPort?: string;

  // Schedule
  etd: string;
  eta: string;
  cutOff?: string;           // optional — may be PENDIENTE at creation
  stackingFrom?: string;
  stackingTo?: string;

  // Cargo spec
  containerType: ContainerType;
  containerCount: number;
  isReefer: boolean;
  setpointC?: number;
  ventilation?: number;
  freightTerm: FreightTerm;
  emissionType?: string;     // e.g. "Seawaybill" | "BL"

  // Source file
  bookingFileUrl?: string;
  bookingFileName?: string;

  // Relations
  containerIds: string[];
  siId?: string;
  draftBlId?: string;

  status: BookingStatus;
  createdAt: string;
  alertIds: string[];
  costAtRiskUsd: number;
}
```

**Removed from Booking:** `orderId`, `containerNumber`, `sealNumber`, `blNumber` (all move to Container).

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

One Booking has `containerIds: string[]` — typically one entry, but the model supports multiple.

### Removed

- `Order` interface
- `OrderStatus` type
- All references to `orderId` on Booking

### SI and Draft BL placement

SI and Draft BL remain at the Booking level (one per booking). Container-level documents are out of scope for this phase.

---

## PDF Ingestion Flow

Bookings are created exclusively by uploading a booking confirmation PDF. Manual form entry is removed.

### Entry point

"Upload Booking" button on the Bookings list page, replacing the current "Create Booking" button.

### Step-by-step

1. User clicks "Upload Booking"
2. `UploadBookingDialog` opens — file drop zone (PDF only)
3. User selects file
4. Client POSTs to `POST /api/bookings/parse` as `multipart/form-data`
5. API route reads the PDF and calls Claude API to extract structured JSON
6. Dialog transitions to a **review step** — all extracted fields shown pre-filled and editable
7. User confirms → `addBooking()` + `addContainer()` in the demo store
8. Navigate to `/bookings/[id]`

### API route: `POST /api/bookings/parse`

- Accepts `multipart/form-data` with a `file` field (PDF)
- Sends the PDF to Claude with a structured extraction prompt
- Returns `{ booking: ExtractedBookingFields, container: ExtractedContainerFields }`
- Naviera resolution: the PDF contains a SCAC code (e.g. `CMDU`). The route maps SCAC → `navieraId` using a lookup table in `lib/mock-data/navieras.ts`

### File attachment

The client creates a blob URL from the uploaded file before POSTing. That blob URL is stored as `bookingFileUrl` on the created Booking record. The booking detail page renders the PDF inline using this URL. No external file storage required for the demo.

### Review step

- All fields extracted from the PDF are pre-filled
- Fields that were `PENDIENTE` or absent in the PDF arrive empty with a visible placeholder
- All form labels come from translation keys — no hardcoded strings
- User can edit any field before confirming

---

## UI & Navigation Changes

### Navigation

- Remove "Orders" nav item (`nav.orders` translation key deleted)
- Bookings remains the primary operations entry point

### Removed

- `/[locale]/orders` route and page
- `/[locale]/orders/[id]` route and page
- `CreateBookingDialog` component
- `lib/mock-data/orders.ts`

### Updated components

| Component | Change |
|---|---|
| `BookingHeader` | Remove order reference; add shipper/consignee display |
| `BookingDetailClient` | Remove order section; add Containers section |
| `BookingsListClient` | Remove Order column; add Shipper column |
| `BookingsKanbanClient` | Remove order reference from cards |
| `BookingActivityFeed` | Remove order reference from `booking_created` event |
| `CompletedBookingsTable` | Remove order column |
| Exporter detail page | Replace "Active orders" section with active bookings grouped by naviera |

### New components

| Component | Purpose |
|---|---|
| `UploadBookingDialog` | File drop zone → loading state → review form → confirm |
| `ContainerCard` | Displays container data within booking detail; fields are inline-editable when not yet assigned |

---

## Mock Data Changes

- **Delete** `lib/mock-data/orders.ts`
- **Update** `lib/mock-data/bookings.ts` — remove `orderId`; add `shipper`, `consignee`, `referenciaCliente`, `containerIds`, `bookingFileName` to each booking
- **New** `lib/mock-data/containers.ts` — one `Container` per existing booking with realistic data (container number, seal, weight, cargo description)
- **Update** `lib/mock-data/navieras.ts` — add SCAC → navieraId lookup map

---

## i18n

All UI strings go through `next-intl`. No hardcoded strings anywhere in the app.

### Removed translation keys

- Entire `orders` namespace (both `en.json` and `es.json`)
- `nav.orders`
- `bookings.colOrder`
- `bookings.createDialog` (replaced by upload dialog keys)
- `exporters.kpi_orders`, `exporters.activeOrders`

### New translation keys

```json
"nav": {
  "uploadBooking": "Upload Booking" // en
},
"bookings": {
  "upload": "Upload Booking",
  "uploadDialog": {
    "title": "Upload Booking Confirmation",
    "dropzone": "Drop a PDF here, or click to browse",
    "parsing": "Extracting booking data…",
    "reviewTitle": "Review extracted data",
    "reviewHint": "Check the fields below before confirming. Any field marked as pending was not found in the PDF.",
    "fieldPending": "Pending",
    "confirm": "Create Booking",
    "toast": "Booking {number} created."
  },
  "shipper": "Shipper",
  "consignee": "Consignee",
  "referenciaCliente": "Client reference",
  "transshipmentPort": "Transshipment",
  "emissionType": "Emission type",
  "bookingFile": "Booking confirmation",
  "containers": "Containers ({n})"
},
"containers": {
  "title": "Containers",
  "containerNumber": "Container #",
  "sealNumber": "Seal #",
  "blNumber": "BL #",
  "netWeight": "Net weight",
  "grossWeight": "Gross weight",
  "cargoDescription": "Cargo description",
  "notAssigned": "Not yet assigned"
}
```

Both `en.json` and `es.json` are updated in full — no key exists in one file without a counterpart in the other.

---

## Out of Scope

- Real file storage (S3, Supabase Storage) — blob URLs suffice for the demo
- Container-level SI or Draft BL
- Bulk PDF upload (multiple files at once)
- Extraction confidence scores or field-level highlighting in the review step

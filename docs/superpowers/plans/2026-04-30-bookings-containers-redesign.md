# Bookings + Containers Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Order concept entirely; make Booking the top-level entity created via PDF upload with Claude extraction; introduce Container as a child entity for physical/cargo data.

**Architecture:** Types are updated first (Order removed, Booking updated, Container added), which causes TypeScript errors that guide all subsequent changes. Mock data, store, and API route follow; then new UI components (UploadBookingDialog, ContainerCard); then updates to existing components; finally, Orders routes and files are deleted.

**Tech Stack:** Next.js 16 (App Router, route handlers), TypeScript, next-intl, @anthropic-ai/sdk (new), Vitest + Testing Library, Tailwind v4, @base-ui/react

**Spec:** `docs/superpowers/specs/2026-04-30-bookings-containers-redesign.md`

---

## File Map

### New files
| File | Responsibility |
|---|---|
| `app/api/bookings/parse/route.ts` | POST handler: receive PDF, call Claude, return extracted booking + container fields |
| `components/bookings/UploadBookingDialog.tsx` | Drop zone → loading → review form → confirm |
| `components/bookings/ContainerCard.tsx` | Display + inline-edit one Container's physical data |
| `lib/mock-data/containers.ts` | Seed Container records (one per existing booking) |
| `__tests__/bookings/container-card.test.tsx` | ContainerCard unit tests |
| `__tests__/bookings/upload-booking-dialog.test.tsx` | UploadBookingDialog unit tests |

### Modified files
| File | Change |
|---|---|
| `types/index.ts` | Remove Order/OrderStatus; update Booking; add Container |
| `messages/en.json` | Remove orders namespace, add upload dialog + containers keys |
| `messages/es.json` | Same in Spanish |
| `lib/mock-data/bookings.ts` | Remove orderId, add shipper/consignee/containerIds etc. |
| `lib/mock-data/navieras.ts` | Add SCAC_TO_NAVIERA_ID export |
| `lib/hooks/useDemoStore.ts` | Add Container state + addContainer/updateContainer/getContainersByBookingId |
| `components/layout/Sidebar.tsx` | Remove Orders nav entry |
| `components/bookings/BookingHeader.tsx` | Remove Order prop; add shipper/consignee display |
| `components/bookings/BookingDetailClient.tsx` | Remove Order prop/section; add ContainerCard per container |
| `components/bookings/BookingsListClient.tsx` | Remove order from ListRow/KanbanRow; add shipper; update columns |
| `components/bookings/KanbanCard.tsx` | Remove Order from KanbanRow; use booking.shipper |
| `components/bookings/BookingsViewClient.tsx` | Update row assembly to remove order |
| `app/[locale]/bookings/page.tsx` | Remove order lookup; assemble rows from booking.shipper |
| `app/[locale]/bookings/[id]/page.tsx` | Remove order lookup; derive exporter from booking.shipper or naviera |
| `app/[locale]/exporters/[id]/page.tsx` | Replace active orders section with active bookings by naviera |
| `components/dashboard/CompletedBookingsTable.tsx` | Remove order column (already not present — confirm no changes needed) |
| `__tests__/i18n.test.ts` | Remove 'orders' from required namespaces; add 'containers' |
| `__tests__/bookings/kanban-card.test.tsx` | Update mock Booking shape; remove mock Order |
| `__tests__/bookings/bookings-kanban-client.test.tsx` | Update mock shapes |

### Deleted files
| File | Reason |
|---|---|
| `lib/mock-data/orders.ts` | Order concept removed |
| `components/bookings/CreateBookingDialog.tsx` | Replaced by UploadBookingDialog |
| `components/orders/CreateOrderDialog.tsx` | Order concept removed |
| `components/orders/OrdersListClient.tsx` | Order concept removed |
| `app/[locale]/orders/page.tsx` | Route deleted |
| `app/[locale]/orders/[id]/page.tsx` | Route deleted |

---

## Task 1: Install Anthropic SDK + update types

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Install the Anthropic SDK**

```bash
cd agora-app && pnpm add @anthropic-ai/sdk
```

Expected: SDK added to `package.json` dependencies.

- [ ] **Step 2: Remove Order and OrderStatus from types/index.ts**

Delete the `Order` interface, `OrderStatus` type, and their JSDoc comments entirely.

- [ ] **Step 3: Update the Booking interface**

Replace the current `Booking` interface with:

```typescript
export interface Booking {
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
  cutOff?: string;
  stackingFrom?: string;
  stackingTo?: string;

  // Cargo spec
  containerType: ContainerType;
  containerCount: number;
  isReefer: boolean;
  setpointC?: number;
  ventilation?: number;
  freightTerm: FreightTerm;
  emissionType: 'BL' | 'Seawaybill';

  // Source file (session-scoped blob URL)
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

Note: `orderId`, `containerNumber`, `sealNumber`, `blNumber`, `isReefer` (kept) are updated.

- [ ] **Step 4: Add the Container interface** (after the Booking interface)

```typescript
export interface Container {
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

- [ ] **Step 5: Verify TypeScript errors appear as expected**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | head -60
```

Expected: Many errors about `orderId`, `Order` type, etc. This is correct — these guide the next tasks.

- [ ] **Step 6: Commit**

```bash
git add agora-app/types/index.ts agora-app/package.json agora-app/pnpm-lock.yaml
git commit -m "feat(types): replace Order with Container; update Booking for PDF-driven creation"
```

---

## Task 2: Update i18n translation files

**Files:**
- Modify: `agora-app/messages/en.json`
- Modify: `agora-app/messages/es.json`
- Modify: `agora-app/__tests__/i18n.test.ts`

- [ ] **Step 1: Write the failing i18n test first**

In `__tests__/i18n.test.ts`, update `requiredNamespaces`:
- Remove `'orders'`
- Add `'containers'`

Run to confirm it fails:
```bash
cd agora-app && pnpm vitest run __tests__/i18n.test.ts
```
Expected: FAIL — `containers` namespace not yet present.

- [ ] **Step 2: Update en.json**

Remove the entire `"orders"` key block.

In `"nav"`, remove `"orders"` key.

In `"bookings"`:
- Remove `"colOrder"` key
- Remove entire `"createDialog"` block **except keep `"createDialog.naviera"`** — rename it to a top-level key `"carrier"`:
  - Add `"carrier": "Carrier"` to `"bookings"` (this replaces the deleted `createDialog.naviera` usage in `UploadBookingDialog`)
- Add these new keys (insert after `"search"` key):

```json
"upload": "Upload Booking",
"carrier": "Carrier",
"colShipper": "Shipper",
"shipper": "Shipper",
"consignee": "Consignee",
"referenciaCliente": "Client reference",
"transshipmentPort": "Transshipment",
"emissionType": "Emission type",
"bookingFile": "Booking confirmation",
"bookingFileUnavailable": "File not available in this session",
"containers": "Containers ({n})",
"uploadDialog": {
  "title": "Upload Booking Confirmation",
  "dropzone": "Drop a PDF here, or click to browse",
  "parsing": "Extracting booking data…",
  "reviewTitle": "Review extracted data",
  "reviewHint": "Check the fields below before confirming. Fields marked as pending were not found in the PDF.",
  "fieldPending": "Pending",
  "section_booking": "Booking details",
  "section_containers": "Containers",
  "confirm": "Create Booking",
  "toast": "Booking {number} created.",
  "unknownCarrier": "Unknown carrier — please select",
  "parseError": "Could not extract data from this PDF. Please try again.",
  "tryAgain": "Try again"
}
```

In `"exporters"`:
- Remove `"kpi_orders"` key
- Remove `"activeOrders"` key
- Remove `"noActiveOrders"` key
- Add: `"activeBookings": "Active bookings"`

Add a new top-level `"containers"` namespace:

```json
"containers": {
  "title": "Containers",
  "containerNumber": "Container #",
  "sealNumber": "Seal #",
  "blNumber": "BL #",
  "netWeight": "Net weight",
  "grossWeight": "Gross weight",
  "cargoDescription": "Cargo description",
  "notAssigned": "Not yet assigned",
  "unitKg": "kg"
}
```

- [ ] **Step 3: Update es.json with the exact same structural changes**

Remove `"orders"`, remove `"nav.orders"`, remove `"bookings.colOrder"` and `"bookings.createDialog"`.

Add all the same keys in Spanish:

```json
"upload": "Subir Booking",
"carrier": "Naviera",
"colShipper": "Exportador",
"shipper": "Exportador",
"consignee": "Consignatario",
"referenciaCliente": "Referencia cliente",
"transshipmentPort": "Transbordo",
"emissionType": "Tipo de emisión",
"bookingFile": "Confirmación de booking",
"bookingFileUnavailable": "Archivo no disponible en esta sesión",
"containers": "Contenedores ({n})",
"uploadDialog": {
  "title": "Subir Confirmación de Booking",
  "dropzone": "Arrastra un PDF aquí, o haz clic para buscar",
  "parsing": "Extrayendo datos del booking…",
  "reviewTitle": "Revisa los datos extraídos",
  "reviewHint": "Revisa los campos antes de confirmar. Los campos marcados como pendientes no se encontraron en el PDF.",
  "fieldPending": "Pendiente",
  "section_booking": "Detalles del booking",
  "section_containers": "Contenedores",
  "confirm": "Crear Booking",
  "toast": "Booking {number} creado.",
  "unknownCarrier": "Naviera desconocida — selecciona una",
  "parseError": "No se pudo extraer datos de este PDF. Intenta nuevamente.",
  "tryAgain": "Intentar de nuevo"
}
```

Exporters in es.json:
- Remove `"kpi_orders"`, `"activeOrders"`, `"noActiveOrders"`
- Add: `"activeBookings": "Bookings activos"`

Add Spanish `"containers"` namespace:

```json
"containers": {
  "title": "Contenedores",
  "containerNumber": "N° de contenedor",
  "sealNumber": "N° de precinto",
  "blNumber": "N° de BL",
  "netWeight": "Peso neto",
  "grossWeight": "Peso bruto",
  "cargoDescription": "Descripción de carga",
  "notAssigned": "Sin asignar",
  "unitKg": "kg"
}
```

- [ ] **Step 4: Run i18n tests**

```bash
cd agora-app && pnpm vitest run __tests__/i18n.test.ts
```

Expected: All 3 tests PASS. If the shape test fails, compare the two JSON files key-by-key to find any mismatch.

- [ ] **Step 5: Commit**

```bash
git add agora-app/messages/en.json agora-app/messages/es.json agora-app/__tests__/i18n.test.ts
git commit -m "feat(i18n): remove orders namespace; add upload dialog + containers keys (en + es)"
```

---

## Task 3: Update mock data

**Files:**
- Delete: `agora-app/lib/mock-data/orders.ts`
- Modify: `agora-app/lib/mock-data/bookings.ts`
- Create: `agora-app/lib/mock-data/containers.ts`
- Modify: `agora-app/lib/mock-data/navieras.ts`

- [ ] **Step 1: Add SCAC_TO_NAVIERA_ID to navieras.ts**

At the bottom of `lib/mock-data/navieras.ts`, add:

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
```

- [ ] **Step 2: Rewrite bookings.ts**

Remove the `populateOrderBookingIds` import and call at the bottom (the Order dependency). Remove `orderId` from all booking records. Add the following fields to every booking:

- `shipper` — use `'COMFRUT S.A.'` for all records tied to Comfrut, appropriate shippers for others
- `consignee` — e.g. `'QUIRCH FOODS, LLC'` for US destinations, adjust per route
- `referenciaCliente` — e.g. `'1898001'` (make up plausible ones)
- `containerIds` — an array with one ID: `['CTR-' + booking.id.replace('BKG-', '')]`
- `containerCount: 1`
- `bookingFileName` — e.g. `'Booking SNG0502407 Comfrut.pdf'`
- `emissionType: 'Seawaybill'` (or `'BL'` as appropriate)

Keep all other fields unchanged (`status`, `etd`, `eta`, `cutOff`, `stackingFrom`, `stackingTo`, `containerType`, `isReefer`, `setpointC`, `vesselName`, `voyage`, `pol`, `polCoords`, `pod`, `podCoords`, `alertIds`, `costAtRiskUsd`, `siId`, `draftBlId`, `containerNumber` → move to containers.ts).

Remove `populateOrderBookingIds` from the bottom of the file entirely.

Update the exported helper functions — remove `getBookingsByOrderId` and `getBookingsByExporterId` (the latter used `orderId` for grouping). If `getBookingsByExporterId` is needed elsewhere, rewrite it to filter by `booking.shipper` instead, or just delete it for now.

- [ ] **Step 3: Create lib/mock-data/containers.ts**

Create one `Container` per existing booking. Use the `containerNumber`, `sealNumber`, `blNumber` that were previously on the booking records. Add plausible weight and cargo data:

```typescript
import type { Container } from '@/types';

export const containers: Container[] = [
  {
    id: 'CTR-SNG0502407',
    bookingId: 'BKG-SNG0502407',
    containerNumber: 'CGMU-9176432',
    sealNumber: 'CMA0418771',
    blNumber: 'CGMUSAI3052801',
    netWeightKg: 22_400,
    grossWeightKg: 24_800,
    cargoDescription: 'Fresh cherries, controlled atmosphere, -18°C',
  },
  // … one entry per booking in bookings.ts
  // For bookings that had no containerNumber yet (awaiting_si, etc.),
  // leave all fields undefined except id and bookingId
];

export function getContainersByBookingId(bookingId: string): Container[] {
  return containers.filter((c) => c.bookingId === bookingId);
}
```

- [ ] **Step 4: Delete orders.ts**

```bash
rm agora-app/lib/mock-data/orders.ts
```

- [ ] **Step 5: Run TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep "orders" | head -20
```

Expected: Errors about `orders` imports in page files — those get fixed in later tasks.

- [ ] **Step 6: Commit**

```bash
git add agora-app/lib/mock-data/
git commit -m "feat(mock-data): remove orders; add containers seed; update bookings with shipper/consignee/containerIds"
```

---

## Task 4: Update the demo store

**Files:**
- Modify: `agora-app/lib/hooks/useDemoStore.ts`

- [ ] **Step 1: Add Container to the store**

Update `DemoState` and add the three new exports:

```typescript
'use client';

import { useSyncExternalStore } from 'react';
import type { Booking, BookingStatus, Container } from '@/types';
import { getContainersByBookingId as getSeedContainers } from '@/lib/mock-data/containers';

interface DemoState {
  bookingOverrides: Record<string, Partial<Booking>>;
  newBookings: Booking[];
  newContainers: Container[];
}

const state: DemoState = {
  bookingOverrides: {},
  newBookings: [],
  newContainers: [],
};

// … existing subscribe / emit / snapshot unchanged …

export function addContainer(container: Container) {
  state.newContainers = [container, ...state.newContainers];
  emit();
}

export function getContainersByBookingId(bookingId: string): Container[] {
  const storeIds = new Set(state.newContainers.filter((c) => c.bookingId === bookingId).map((c) => c.id));
  const fromSeed = getSeedContainers(bookingId).filter((c) => !storeIds.has(c.id));
  return [...state.newContainers.filter((c) => c.bookingId === bookingId), ...fromSeed];
}

export function updateContainer(id: string, patch: Partial<Container>) {
  const existing = state.newContainers.find((c) => c.id === id);
  if (existing) {
    state.newContainers = state.newContainers.map((c) => (c.id === id ? { ...c, ...patch } : c));
  } else {
    // promote seed container to newContainers on first edit
    const seedEntry = getSeedContainers(patch.bookingId ?? '').find((c) => c.id === id);
    if (seedEntry) {
      state.newContainers = [{ ...seedEntry, ...patch }, ...state.newContainers];
    }
  }
  emit();
}
```

Note: `updateContainer` needs the `bookingId` in the patch to look up seed data. Alternatively, store containers indexed by id for O(1) lookup — but the linear scan is fine for a demo.

- [ ] **Step 2: Verify the store compiles**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep "useDemoStore"
```

Expected: No errors on this file.

- [ ] **Step 3: Commit**

```bash
git add agora-app/lib/hooks/useDemoStore.ts
git commit -m "feat(store): add Container support — addContainer, getContainersByBookingId, updateContainer"
```

---

## Task 5: Create the PDF parse API route

> @claude-api — use the Anthropic SDK with prompt caching where applicable.

**Files:**
- Create: `agora-app/app/api/bookings/parse/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { ContainerType, FreightTerm } from '@/types';
import { SCAC_TO_NAVIERA_ID } from '@/lib/mock-data/navieras';
import { POL, POD } from '@/lib/mock-data/lanes';

const client = new Anthropic();

function resolveCoords(portName: string, map: Record<string, { name: string; coords: [number, number] }>): [number, number] {
  const entry = Object.values(map).find(
    (p) => p.name.toLowerCase().includes(portName.toLowerCase()) || portName.toLowerCase().includes(p.name.toLowerCase().split(',')[0])
  );
  return entry?.coords ?? [0, 0];
}

function normalizeEmissionType(raw?: string): 'BL' | 'Seawaybill' {
  if (!raw) return 'BL';
  const lower = raw.toLowerCase();
  if (lower.includes('seaway')) return 'Seawaybill';
  return 'BL';
}

function normalizeFreightTerm(raw?: string): FreightTerm {
  if (!raw) return 'COLLECT';
  const upper = raw.toUpperCase();
  if (upper.includes('PREPAID')) return 'PREPAID';
  return 'COLLECT';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await (file as File).arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Extract the booking confirmation data from this PDF and return a JSON object with exactly this shape. Use null for fields not found. Dates should be ISO 8601 strings (YYYY-MM-DD or full ISO). Container count should be an integer.

{
  "bookingNumber": string,
  "scacCode": string,
  "shipper": string,
  "consignee": string,
  "referenciaCliente": string | null,
  "vesselName": string,
  "voyage": string,
  "pol": string,
  "pod": string,
  "transshipmentPort": string | null,
  "etd": string | null,
  "eta": string | null,
  "cutOff": string | null,
  "stackingFrom": string | null,
  "stackingTo": string | null,
  "containerType": "40RF" | "40HC" | "40DV" | "20RF" | "20DV",
  "containerCount": number,
  "isReefer": boolean,
  "setpointC": number | null,
  "ventilation": number | null,
  "freightTerm": "COLLECT" | "PREPAID" | null,
  "emissionType": string | null,
  "containers": [
    {
      "containerNumber": string | null,
      "cargoDescription": string | null
    }
  ]
}

Return ONLY the JSON object, no markdown, no explanation.`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const raw = JSON.parse(text);

    if (!raw.bookingNumber || !raw.scacCode) {
      return NextResponse.json({ error: 'Could not extract required fields from PDF' }, { status: 400 });
    }

    const navieraId = SCAC_TO_NAVIERA_ID[raw.scacCode] ?? 'NAV-UNKNOWN';
    const polCoords = resolveCoords(raw.pol ?? '', POL);
    const podCoords = resolveCoords(raw.pod ?? '', POD);

    const containers = (raw.containers ?? [{ containerNumber: null, cargoDescription: null }]).map(
      (c: { containerNumber: string | null; cargoDescription: string | null }) => ({
        containerNumber: c.containerNumber ?? undefined,
        cargoDescription: c.cargoDescription ?? undefined,
      })
    );

    if (containers.length === 0) {
      return NextResponse.json({ error: 'No containers found in PDF' }, { status: 400 });
    }

    return NextResponse.json({
      booking: {
        navieraId,
        bookingNumber: raw.bookingNumber,
        shipper: raw.shipper ?? '',
        consignee: raw.consignee ?? '',
        referenciaCliente: raw.referenciaCliente ?? undefined,
        vesselName: raw.vesselName ?? '',
        voyage: raw.voyage ?? '',
        pol: raw.pol ?? '',
        polCoords,
        pod: raw.pod ?? '',
        podCoords,
        transshipmentPort: raw.transshipmentPort ?? undefined,
        etd: raw.etd ?? undefined,
        eta: raw.eta ?? undefined,
        cutOff: raw.cutOff ?? undefined,
        stackingFrom: raw.stackingFrom ?? undefined,
        stackingTo: raw.stackingTo ?? undefined,
        containerType: (raw.containerType as ContainerType) ?? '40RF',
        isReefer: raw.isReefer ?? false,
        setpointC: raw.setpointC ?? undefined,
        ventilation: raw.ventilation ?? undefined,
        freightTerm: normalizeFreightTerm(raw.freightTerm),
        emissionType: normalizeEmissionType(raw.emissionType),
      },
      containers,
    });
  } catch (err) {
    console.error('[/api/bookings/parse]', err);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
  }
}
```

- [ ] **Step 2: Set the ANTHROPIC_API_KEY environment variable**

Create or update `agora-app/.env.local`:

```
ANTHROPIC_API_KEY=your_key_here
```

- [ ] **Step 3: Smoke test the route manually**

Start the dev server and test with the sample PDF:

```bash
cd agora-app && pnpm dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/bookings/parse \
  -F "file=@/Users/sebastian.ibanez/Downloads/Booking\ SNG0506037\ \ File\ 9844220\ Shipper\ COMFRUT\ S.A..pdf" \
  | python3 -m json.tool
```

Expected: JSON response with `booking` and `containers` fields populated from the PDF.

- [ ] **Step 4: Commit**

```bash
git add agora-app/app/api/bookings/parse/route.ts agora-app/.env.local
git commit -m "feat(api): add POST /api/bookings/parse — Claude PDF extraction for booking creation"
```

Note: Add `.env.local` to `.gitignore` if not already there.

---

## Task 6: Create ContainerCard

**Files:**
- Create: `agora-app/components/bookings/ContainerCard.tsx`
- Create: `agora-app/__tests__/bookings/container-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/bookings/container-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ContainerCard } from '@/components/bookings/ContainerCard';
import en from '@/messages/en.json';
import type { Container } from '@/types';

vi.mock('@/lib/hooks/useDemoStore', () => ({
  updateContainer: vi.fn(),
  useDemoStore: vi.fn(),
}));

const mockContainer: Container = {
  id: 'CTR-TEST',
  bookingId: 'BKG-TEST',
  containerNumber: 'CGMU-9176432',
  sealNumber: 'CMA0418771',
  netWeightKg: 22400,
  grossWeightKg: 24800,
  cargoDescription: 'Fresh cherries',
};

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('ContainerCard', () => {
  it('renders container number and weight', () => {
    wrap(<ContainerCard container={mockContainer} />);
    expect(screen.getByText('CGMU-9176432')).toBeInTheDocument();
    expect(screen.getByText('22400')).toBeInTheDocument();
  });

  it('shows notAssigned placeholder for empty fields', () => {
    const empty: Container = { id: 'CTR-EMPTY', bookingId: 'BKG-TEST' };
    wrap(<ContainerCard container={empty} />);
    expect(screen.getAllByText('Not yet assigned').length).toBeGreaterThan(0);
  });

  it('activates inline input on click', async () => {
    wrap(<ContainerCard container={mockContainer} />);
    const field = screen.getByText('CGMU-9176432');
    await userEvent.click(field);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/container-card.test.tsx
```

Expected: FAIL — `ContainerCard` not found.

- [ ] **Step 3: Implement ContainerCard**

```typescript
// components/bookings/ContainerCard.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { updateContainer } from '@/lib/hooks/useDemoStore';

interface Props {
  container: Container;
}

type EditableField = keyof Omit<Container, 'id' | 'bookingId'>;

const NUMERIC_FIELDS: EditableField[] = ['netWeightKg', 'grossWeightKg'];

export function ContainerCard({ container }: Props) {
  const t = useTranslations('containers');
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState('');

  function startEdit(field: EditableField) {
    const current = container[field];
    setDraft(current !== undefined ? String(current) : '');
    setEditing(field);
  }

  function commitEdit() {
    if (!editing) return;
    if (draft.trim() === '') {
      updateContainer(container.id, { [editing]: undefined, bookingId: container.bookingId });
    } else if (NUMERIC_FIELDS.includes(editing)) {
      const num = parseFloat(draft);
      if (!isNaN(num) && num >= 0) {
        updateContainer(container.id, { [editing]: num, bookingId: container.bookingId });
      }
    } else {
      updateContainer(container.id, { [editing]: draft.trim(), bookingId: container.bookingId });
    }
    setEditing(null);
  }

  function renderField(field: EditableField, labelKey: string, value: string | number | undefined) {
    const isActive = editing === field;
    const displayValue = value !== undefined ? String(value) : undefined;
    const isNumeric = NUMERIC_FIELDS.includes(field);

    return (
      <div key={field}>
        <dt className="text-ink-3">{t(labelKey as Parameters<typeof t>[0])}</dt>
        <dd>
          {isActive ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                type={isNumeric ? 'number' : 'text'}
                min={isNumeric ? 0 : undefined}
                step={isNumeric ? 0.01 : undefined}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                className="w-full rounded border border-[var(--line-soft)] bg-bg-2 px-1.5 py-0.5 text-xs text-ink-1 outline-none focus:border-mint-500"
              />
              {isNumeric && displayValue !== undefined && (
                <span className="shrink-0 text-ink-3">{t('unitKg')}</span>
              )}
            </span>
          ) : (
            <button
              onClick={() => startEdit(field)}
              className="text-left text-ink-1 hover:text-mint-500"
            >
              {displayValue !== undefined ? (
                <span>
                  {displayValue}
                  {isNumeric && <span className="ml-1 text-ink-3">{t('unitKg')}</span>}
                </span>
              ) : (
                <span className="italic text-ink-4">{t('notAssigned')}</span>
              )}
            </button>
          )}
        </dd>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--line-soft)] bg-bg-1 p-3">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        {renderField('containerNumber', 'containerNumber', container.containerNumber)}
        {renderField('sealNumber', 'sealNumber', container.sealNumber)}
        {renderField('blNumber', 'blNumber', container.blNumber)}
        {renderField('netWeightKg', 'netWeight', container.netWeightKg)}
        {renderField('grossWeightKg', 'grossWeight', container.grossWeightKg)}
        <div className="col-span-2">
          {renderField('cargoDescription', 'cargoDescription', container.cargoDescription)}
        </div>
      </dl>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/container-card.test.tsx
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/bookings/ContainerCard.tsx agora-app/__tests__/bookings/container-card.test.tsx
git commit -m "feat(ui): add ContainerCard with inline field editing"
```

---

## Task 7: Create UploadBookingDialog

**Files:**
- Create: `agora-app/components/bookings/UploadBookingDialog.tsx`
- Create: `agora-app/__tests__/bookings/upload-booking-dialog.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/bookings/upload-booking-dialog.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { UploadBookingDialog } from '@/components/bookings/UploadBookingDialog';
import en from '@/messages/en.json';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/hooks/useDemoStore', () => ({
  addBooking: vi.fn(),
  addContainer: vi.fn(),
}));

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:test');
global.URL.revokeObjectURL = vi.fn();

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('UploadBookingDialog', () => {
  it('renders trigger button with upload label', () => {
    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('shows dropzone after trigger click', async () => {
    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));
    expect(screen.getByText(/Drop a PDF/i)).toBeInTheDocument();
  });

  it('shows parse error when API returns 400', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'parse failed' }),
    });
    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, file);
    await waitFor(() => expect(screen.getByText(/Could not extract/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/upload-booking-dialog.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement UploadBookingDialog**

```typescript
// components/bookings/UploadBookingDialog.tsx
'use client';

import { useState, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { addBooking, addContainer } from '@/lib/hooks/useDemoStore';
import { navieras } from '@/lib/mock-data/navieras';
import type { Booking, Container, ContainerType, FreightTerm } from '@/types';
import { Loader2, Upload } from 'lucide-react';

interface ParseResponse {
  booking: {
    navieraId: string; bookingNumber: string; shipper: string; consignee: string;
    referenciaCliente?: string; vesselName: string; voyage: string;
    pol: string; polCoords: [number, number]; pod: string; podCoords: [number, number];
    transshipmentPort?: string; etd?: string; eta?: string; cutOff?: string;
    stackingFrom?: string; stackingTo?: string;
    containerType: ContainerType; isReefer: boolean; setpointC?: number; ventilation?: number;
    freightTerm: FreightTerm; emissionType: 'BL' | 'Seawaybill';
  };
  containers: Array<{ containerNumber?: string; cargoDescription?: string }>;
}

type Phase = 'idle' | 'loading' | 'review' | 'error';

export function UploadBookingDialog({ children }: { children: ReactNode }) {
  const t = useTranslations('bookings');
  const tDlg = useTranslations('bookings.uploadDialog');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [parsed, setParsed] = useState<ParseResponse | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // review form state (mirrors parsed.booking, editable)
  const [form, setForm] = useState<Partial<ParseResponse['booking']>>({});
  const [navieraId, setNavieraId] = useState('');

  function reset() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setPhase('idle');
    setParsed(null);
    setBlobUrl(null);
    setFileName('');
    setForm({});
    setNavieraId('');
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    setOpen(v);
  }

  async function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    setFileName(file.name);
    setPhase('loading');

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/bookings/parse', { method: 'POST', body: fd });
      if (!res.ok) { setPhase('error'); URL.revokeObjectURL(url); setBlobUrl(null); return; }
      const data: ParseResponse = await res.json();
      setParsed(data);
      setForm(data.booking);
      setNavieraId(data.booking.navieraId);
      setPhase('review');
    } catch {
      setPhase('error');
      URL.revokeObjectURL(url);
      setBlobUrl(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleConfirm() {
    if (!parsed || !form) return;
    const containerCount = parsed.containers.length;
    const bookingId = `BKG-${form.bookingNumber}`;
    const containerIds = parsed.containers.map((_, i) => `CTR-${form.bookingNumber}-${i}`);

    const booking: Booking = {
      id: bookingId,
      bookingNumber: form.bookingNumber ?? '',
      navieraId,
      shipper: form.shipper ?? '',
      consignee: form.consignee ?? '',
      referenciaCliente: form.referenciaCliente,
      vesselName: form.vesselName ?? '',
      voyage: form.voyage ?? '',
      pol: form.pol ?? '',
      polCoords: form.polCoords ?? [0, 0],
      pod: form.pod ?? '',
      podCoords: form.podCoords ?? [0, 0],
      transshipmentPort: form.transshipmentPort,
      etd: form.etd ?? new Date().toISOString(),
      eta: form.eta ?? new Date().toISOString(),
      cutOff: form.cutOff,
      stackingFrom: form.stackingFrom,
      stackingTo: form.stackingTo,
      containerType: form.containerType ?? '40RF',
      containerCount,
      isReefer: form.isReefer ?? false,
      setpointC: form.setpointC,
      ventilation: form.ventilation,
      freightTerm: form.freightTerm ?? 'COLLECT',
      emissionType: form.emissionType ?? 'BL',
      bookingFileUrl: blobUrl ?? undefined,
      bookingFileName: fileName,
      containerIds,
      status: 'awaiting_si',
      createdAt: new Date().toISOString(),
      alertIds: [],
      costAtRiskUsd: 0,
    };

    addBooking(booking);
    parsed.containers.forEach((c, i) => {
      const container: Container = {
        id: containerIds[i],
        bookingId,
        containerNumber: c.containerNumber,
        cargoDescription: c.cargoDescription,
      };
      addContainer(container);
    });

    toast.success(tDlg('toast', { number: booking.bookingNumber }));
    setOpen(false);
    router.push(`/bookings/${bookingId}`);
  }

  const canConfirm = !!(form.bookingNumber?.trim()) && navieraId !== 'NAV-UNKNOWN' && navieraId !== '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tDlg('title')}</DialogTitle>
        </DialogHeader>

        {phase === 'idle' && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--line-soft)] p-12 text-center hover:border-mint-500"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-ink-3" />
            <p className="text-sm text-ink-2">{tDlg('dropzone')}</p>
            <input
              ref={fileInputRef}
              data-testid="file-input"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleInputChange}
            />
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            <p className="text-sm text-ink-2">{tDlg('parsing')}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-severity-crit">{tDlg('parseError')}</p>
            <button
              onClick={() => { setPhase('idle'); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="rounded-md bg-bg-2 px-3 py-1.5 text-xs text-ink-1 hover:bg-bg-3"
            >
              {tDlg('tryAgain')}
            </button>
          </div>
        )}

        {phase === 'review' && parsed && (
          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
            {/* Section 1: Booking details */}
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
                {tDlg('section_booking')}
              </p>
              <p className="mb-3 text-xs text-ink-3">{tDlg('reviewHint')}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bn">{t('colNumber')}</Label>
                  <Input
                    id="bn"
                    value={form.bookingNumber ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, bookingNumber: e.target.value }))}
                    placeholder={tDlg('fieldPending')}
                  />
                </div>
                <div>
                  <Label htmlFor="carrier">{t('carrier')}</Label>
                  <select
                    id="carrier"
                    value={navieraId}
                    onChange={(e) => setNavieraId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    {navieraId === 'NAV-UNKNOWN' && (
                      <option value="NAV-UNKNOWN">{tDlg('unknownCarrier')}</option>
                    )}
                    {navieras.map((n) => (
                      <option key={n.id} value={n.id}>{n.shortName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="shipper">{t('shipper')}</Label>
                  <Input id="shipper" value={form.shipper ?? ''} onChange={(e) => setForm((f) => ({ ...f, shipper: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="consignee">{t('consignee')}</Label>
                  <Input id="consignee" value={form.consignee ?? ''} onChange={(e) => setForm((f) => ({ ...f, consignee: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="vessel">{t('vessel')}</Label>
                  <Input id="vessel" value={form.vesselName ?? ''} placeholder={tDlg('fieldPending')} onChange={(e) => setForm((f) => ({ ...f, vesselName: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="voyage">{t('voyage')}</Label>
                  <Input id="voyage" value={form.voyage ?? ''} placeholder={tDlg('fieldPending')} onChange={(e) => setForm((f) => ({ ...f, voyage: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="pol">{t('labelPolToPod')}</Label>
                  <Input id="pol" value={form.pol ?? ''} placeholder={tDlg('fieldPending')} onChange={(e) => setForm((f) => ({ ...f, pol: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="pod">{t('labelPolToPod')}</Label>
                  <Input id="pod" value={form.pod ?? ''} placeholder={tDlg('fieldPending')} onChange={(e) => setForm((f) => ({ ...f, pod: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="etd">{t('labelEtd')}</Label>
                  <Input id="etd" type="date" value={form.etd?.slice(0, 10) ?? ''} placeholder={tDlg('fieldPending')} onChange={(e) => setForm((f) => ({ ...f, etd: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="eta">{t('labelEta')}</Label>
                  <Input id="eta" type="date" value={form.eta?.slice(0, 10) ?? ''} placeholder={tDlg('fieldPending')} onChange={(e) => setForm((f) => ({ ...f, eta: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="cutoff">{t('labelCutoff')}</Label>
                  <Input id="cutoff" type="date" value={form.cutOff?.slice(0, 10) ?? ''} onChange={(e) => setForm((f) => ({ ...f, cutOff: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="freightTerm">{t('freightTerms')}</Label>
                  <select
                    id="freightTerm"
                    value={form.freightTerm ?? 'COLLECT'}
                    onChange={(e) => setForm((f) => ({ ...f, freightTerm: e.target.value as FreightTerm }))}
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    <option value="COLLECT">COLLECT</option>
                    <option value="PREPAID">PREPAID</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="emissionType">{t('emissionType')}</Label>
                  <select
                    id="emissionType"
                    value={form.emissionType ?? 'BL'}
                    onChange={(e) => setForm((f) => ({ ...f, emissionType: e.target.value as 'BL' | 'Seawaybill' }))}
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    <option value="BL">BL</option>
                    <option value="Seawaybill">Seawaybill</option>
                  </select>
                </div>
                {form.isReefer && (
                  <div>
                    <Label htmlFor="setpoint">Setpoint °C</Label>
                    <Input
                      id="setpoint"
                      type="number"
                      value={form.setpointC ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, setpointC: parseFloat(e.target.value) }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Containers (read-only) */}
            <div className="border-t border-[var(--line-soft)] pt-4">
              <p className="mb-3 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
                {tDlg('section_containers')}
              </p>
              {parsed.containers.map((c, i) => (
                <div key={i} className="rounded-md border border-[var(--line-soft)] bg-bg-2 p-3 text-xs text-ink-3">
                  Container {i + 1}: {c.containerNumber ?? <span className="italic">Not yet assigned</span>}
                  {c.cargoDescription && ` — ${c.cargoDescription}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'review' && (
          <DialogFooter>
            <DialogClose className="rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-xs text-ink-2 hover:text-ink-1">
              Cancel
            </DialogClose>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="rounded-md bg-mint-500 px-3 py-1.5 text-xs font-medium text-bg-0 hover:bg-mint-500/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tDlg('confirm')}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && pnpm vitest run __tests__/bookings/upload-booking-dialog.test.tsx
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/bookings/UploadBookingDialog.tsx agora-app/__tests__/bookings/upload-booking-dialog.test.tsx
git commit -m "feat(ui): add UploadBookingDialog — PDF drop zone, Claude extraction, review form"
```

---

## Task 8: Update Sidebar (remove Orders nav item)

**Files:**
- Modify: `agora-app/components/layout/Sidebar.tsx`

- [ ] **Step 1: Remove Orders from the NAV array**

Delete the line:
```typescript
{ href: '/orders', key: 'orders', Icon: ClipboardList },
```

Remove the `ClipboardList` import from lucide-react if it's no longer used.

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep "Sidebar"
```

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/layout/Sidebar.tsx
git commit -m "feat(nav): remove Orders nav item"
```

---

## Task 9: Update BookingHeader and BookingDetailClient

**Files:**
- Modify: `agora-app/components/bookings/BookingHeader.tsx`
- Modify: `agora-app/components/bookings/BookingDetailClient.tsx`
- Modify: `agora-app/app/[locale]/bookings/[id]/page.tsx`

- [ ] **Step 1: Update BookingHeader**

Remove the `Order` import and prop. Replace the order link with shipper/consignee display:

```typescript
import type { Booking, Exporter, Naviera } from '@/types';

interface Props {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
}

export function BookingHeader({ booking, exporter, naviera }: Props) {
  // …
  // Replace the order link with:
  // <span className="text-ink-2">{booking.shipper} → {booking.consignee}</span>
}
```

- [ ] **Step 2: Update BookingDetailClient**

- Remove `order: Order` from `Props` interface and all usages
- Remove `getOrderById` import
- Add `containers: Container[]` to `Props`
- Import `ContainerCard` from `@/components/bookings/ContainerCard`
- In the Overview tab, replace the container section's single-field display (`booking.containerNumber`, etc.) with:

```tsx
{containers.map((c) => (
  <ContainerCard key={c.id} container={c} />
))}
```

- Remove `booking.containerNumber`, `booking.sealNumber`, `booking.blNumber` references (they no longer exist on `Booking`)

- [ ] **Step 3: Update booking detail page.tsx**

This is a server component. Do two things:

**1. Exporter lookup (replace order lookup):**
```typescript
// Remove: const order = getOrderById(booking.orderId)
// Remove: const exporter = getExporterById(order.exporterId)
// Add:
const exporter = exporters.find(
  (e) => e.name === booking.shipper || e.legalName === booking.shipper
);
if (!exporter || !naviera) notFound();
```
Make sure mock bookings in Task 3 use exact shipper strings that match `exporter.name` or `exporter.legalName`.

**2. Do NOT pass containers as a prop to BookingDetailClient.** The `BookingDetailClient` is a client component and will call `getContainersByBookingId(booking.id)` from `useDemoStore` directly inside the component (the store function merges seed + session containers). Remove any `containers` prop from both the page and `BookingDetailClient`.

- [ ] **Step 4: Run TypeScript check on these files**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep -E "BookingHeader|BookingDetail|bookings/\[id\]"
```

Expected: No errors on these files.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/bookings/BookingHeader.tsx agora-app/components/bookings/BookingDetailClient.tsx agora-app/app/\[locale\]/bookings/\[id\]/page.tsx
git commit -m "feat(ui): update booking detail — remove Order, add ContainerCard, show shipper/consignee"
```

---

## Task 10: Update BookingsListClient and bookings page

**Files:**
- Modify: `agora-app/components/bookings/BookingsListClient.tsx`
- Modify: `agora-app/components/bookings/KanbanCard.tsx`
- Modify: `agora-app/components/bookings/BookingsViewClient.tsx`
- Modify: `agora-app/app/[locale]/bookings/page.tsx`

- [ ] **Step 1: Update ListRow and KanbanRow types**

In `BookingsListClient.tsx`, update `ListRow`:
- Remove `order: Order` field
- Add `shipper: string` field

In `KanbanCard.tsx`, update `KanbanRow`:
- Remove `order: Order` field  
- Add `shipper: string` field

- [ ] **Step 2: Update BookingsListClient table**

In the `<thead>`, replace `{t('colOrder')}` header with `{t('colShipper')}`.

In the row rendering, replace `row.order.orderNumber` with `row.booking.shipper`.

- [ ] **Step 3: Update KanbanCard**

Remove any usage of `row.order`. Replace with `row.booking.shipper` or `row.shipper` where the exporter name was displayed.

- [ ] **Step 4: Update BookingsViewClient.tsx**

Find the row assembly (where `ListRow`/`KanbanRow` is constructed) and remove the order lookup. Add `shipper: booking.shipper` directly.

- [ ] **Step 5: Update bookings/page.tsx**

Remove all Order-related imports and logic:
- Remove `import { orders } from '@/lib/mock-data/orders'`
- Remove `const orderMap = ...`
- Remove the `order = orderMap.get(booking.orderId)` lookup
- Remove the `if (!order || ...)` guard
- Derive exporter by matching `booking.shipper`:

```typescript
const exporter = exporters.find(
  (e) => e.name === booking.shipper || e.legalName === booking.shipper
);
if (!exporter || !naviera) return null;
```

- Add `shipper: booking.shipper` to the row object

- [ ] **Step 6: Run TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep -E "BookingsList|KanbanCard|BookingsView|bookings/page"
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add agora-app/components/bookings/ agora-app/app/\[locale\]/bookings/page.tsx
git commit -m "feat(ui): update bookings list/kanban — remove Order column, add Shipper"
```

---

## Task 11: Update Exporter detail page + add Upload button to Bookings page

**Files:**
- Modify: `agora-app/app/[locale]/exporters/[id]/page.tsx`
- Modify: `agora-app/app/[locale]/bookings/page.tsx` (add upload button)

- [ ] **Step 1: Update exporter detail page**

Replace the `activeOrders` section with an `activeBookings` section:

```typescript
// Remove orders import and exporterOrders logic
// Add:
const exporterBookings = allBookings.filter((b) => 
  b.shipper === exp.name || b.shipper === exp.legalName
);
const activeBookings = exporterBookings.filter((b) => 
  !['closed', 'cancelled', 'bl_released'].includes(b.status)
);
```

Replace the table that rendered orders with a simple booking list (booking number, POL→POD, naviera, status).

Replace `t('kpi_orders')` KPI with `t('kpi_containers')` or remove it. Replace `t('activeOrders')` section title with `t('activeBookings')`.

- [ ] **Step 2: Add Upload Booking button to bookings page**

In `app/[locale]/bookings/page.tsx`, the page renders `BookingsViewClient`. The upload button should live in the client view component or be passed down. The simplest approach: add the `UploadBookingDialog` to `BookingsViewClient`:

```tsx
import { UploadBookingDialog } from '@/components/bookings/UploadBookingDialog';

// In the header area of BookingsViewClient:
<UploadBookingDialog>
  <button className="rounded-md bg-mint-500 px-3 py-1.5 text-xs font-medium text-bg-0 hover:bg-mint-500/90">
    {t('upload')}
  </button>
</UploadBookingDialog>
```

- [ ] **Step 3: TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | grep -E "exporters|BookingsView"
```

- [ ] **Step 4: Commit**

```bash
git add agora-app/app/\[locale\]/exporters/ agora-app/components/bookings/BookingsViewClient.tsx
git commit -m "feat(ui): update exporter detail to show active bookings; add Upload Booking button"
```

---

## Task 12: Delete Orders routes and components

**Files:**
- Delete: `agora-app/app/[locale]/orders/page.tsx`
- Delete: `agora-app/app/[locale]/orders/[id]/page.tsx`
- Delete: `agora-app/components/bookings/CreateBookingDialog.tsx`
- Delete: `agora-app/components/orders/CreateOrderDialog.tsx`
- Delete: `agora-app/components/orders/OrdersListClient.tsx`

- [ ] **Step 1: Delete the files**

```bash
rm agora-app/app/\[locale\]/orders/page.tsx
rm agora-app/app/\[locale\]/orders/\[id\]/page.tsx
rm agora-app/components/bookings/CreateBookingDialog.tsx
rm -rf agora-app/components/orders/
```

- [ ] **Step 2: Check for any remaining imports of deleted files**

```bash
cd agora-app && grep -rn "CreateBookingDialog\|CreateOrderDialog\|OrdersListClient\|mock-data/orders\|from '@/types'.*Order" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v ".next"
```

Fix any remaining imports found.

- [ ] **Step 3: Full TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: Zero errors. Fix any remaining issues before continuing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove Orders — delete routes, components, and mock data"
```

---

## Task 13: Fix existing tests

**Files:**
- Modify: `agora-app/__tests__/bookings/kanban-card.test.tsx`
- Modify: `agora-app/__tests__/bookings/bookings-kanban-client.test.tsx`
- Modify: `agora-app/__tests__/bookings/lifecycle-pill.test.tsx` (if it references Order)
- Modify: `agora-app/__tests__/bookings/cutoff-countdown.test.tsx` (if it references Order)

- [ ] **Step 1: Update kanban-card.test.tsx**

Remove the `mockOrder` constant and `Order` type import. Remove `order` from `makeRow()`. Update `KanbanRow` construction to add `shipper: 'COMFRUT S.A.'` instead.

Update the `makeBooking()` helper to match the new `Booking` shape:
- Remove `orderId`
- Add `shipper: 'COMFRUT S.A.'`, `consignee: 'QUIRCH FOODS, LLC'`, `containerIds: ['CTR-TEST']`, `containerCount: 1`, `freightTerm: 'COLLECT'`, `emissionType: 'BL' as const`

- [ ] **Step 2: Update bookings-kanban-client.test.tsx similarly**

Apply the same mock shape changes.

- [ ] **Step 3: Run all tests**

```bash
cd agora-app && pnpm vitest run
```

Expected: All tests PASS. Fix any remaining failures.

- [ ] **Step 4: Commit**

```bash
git add agora-app/__tests__/
git commit -m "test: update booking mocks to remove Order; add shipper/consignee/containerIds"
```

---

## Task 14: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
cd agora-app && pnpm tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 2: Run all tests**

```bash
cd agora-app && pnpm vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Start dev server and manually test the full flow**

```bash
cd agora-app && pnpm dev
```

Test checklist:
- [ ] Nav no longer shows "Orders"
- [ ] Bookings list loads without errors; shows Shipper column
- [ ] "Upload Booking" button is visible on the Bookings page
- [ ] Clicking "Upload Booking" opens the dialog with drop zone
- [ ] Uploading the sample PDF (`Booking SNG0506037 File 9844220 Shipper COMFRUT S.A..pdf`) shows the review step with extracted fields
- [ ] Confirming creates the booking and navigates to its detail page
- [ ] Booking detail shows ContainerCard with extracted data
- [ ] ContainerCard fields are inline-editable
- [ ] Exporter detail no longer shows Orders section
- [ ] `/orders` returns 404 (expected)
- [ ] Switching locale (ES/EN) works on all updated pages

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: final cleanup after bookings+containers redesign verification"
```

# Booking Detail Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign everything below the lifecycle strip — remove tabs, add scrolling single-page layout with 4 info cards + activity log, document cards, and per-document popup with preview, history, extracted fields, and delete/replace flows.

**Architecture:** `BookingDetailClient` becomes the single-scroll orchestrator: Alertas → Ruta y Horario (info cards left / activity log right) → Contenedores → Documentos (4 cards). Clicking a document card opens `BookingDocumentPopup`. Activity timeline logic lives in `BookingActivityLog`, which is reused in both the booking-level sidebar and the popup's doc-history column. Info card sections live in `BookingInfoCards`. `SIViewer`, `DraftBLViewer`, and the tab system are deleted.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind v4, @base-ui/react, next-intl, Lucide icons, Vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-05-01-booking-detail-redesign.md`

---

## Codebase orientation (read before starting)

### Field name reconciliations (spec → actual code)

| Spec name | Actual `Booking` field | Status |
|---|---|---|
| `emision` | `emissionType: 'BL' \| 'Seawaybill'` | Already exists |
| `condicionPago` | `freightTerm: FreightTerm` | Already exists |
| `bookingDocumentUrl` | `bookingFileUrl?: string` | Already exists |
| `transshipmentPort` | `transshipmentPort?: string` | Already exists |
| `stackingFrom/To` | `stackingFrom?/stackingTo?` | Already exists |
| `ventilation` | `ventilation?: number` | Already exists |
| `diasLibresOrigen` | — | **Add** |
| `masterBl` | — | **Add** |
| `blInterglobo` | — | **Add** |
| `scacNaviera` | — | **Add** |
| `scacInterglobo` | — | **Add** |
| `depositoRetiro` | — | **Add** |
| `destinoUsa` | — | **Add** |

### ActivityEvent shape (actual, not spec)
```ts
// ACTUAL (types/index.ts:341-350):
interface ActivityEvent {
  id: string;
  bookingId: string;
  type: ActivityEventType;   // ← "type", not "kind"
  timestamp: string;
  actor: 'agent' | 'user' | 'system';
  actorName?: string;
  description: string;
  metadata?: Record<string, unknown>;  // ← extra data goes here
}
```
`document_replaced` and `document_deleted` become new `ActivityEventType` values.
Extra data (`documentType`, `replacedBy`, `deletedBy`, `changedFields`) goes in `metadata`.
`documentId?: string` is added as a top-level field for filtering.

### Validation check field
```ts
// ACTUAL (types/index.ts):
c.result === 'fail'   // ← "result", not "status"
```

### Test pattern
```tsx
// All component tests use:
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
function wrap(ui: React.ReactElement) {
  return render(<NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>);
}
```

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `types/index.ts` | Modify | Add 7 new Booking fields, ExporterBL type, extend ActivityEvent + ActivityEventType |
| `lib/hooks/useDemoStore.ts` | Modify | Add `updateBookingField` + `deleteBookingDocument` actions |
| `lib/mock-data/bookings.ts` | Modify | Add new fields to hero booking (BKG-SNG0502407) |
| `lib/mock-data/exporter-bls.ts` | Create | ExporterBL fixtures |
| `lib/mock-data/activity-events.ts` | Modify | Add `documentId` to SI/BL events + demo `document_replaced` event |
| `messages/en.json` | Modify | Add all new i18n keys under `bookings` namespace |
| `messages/es.json` | Modify | Mirror new keys in Spanish |
| `components/bookings/BookingInfoCards.tsx` | Create | 4 info card sections (Partes, Ruta, Referencias, Carga & Logística) |
| `components/bookings/BookingActivityLog.tsx` | Create | Vertical timeline component, used in both booking-level sidebar and doc popup |
| `components/bookings/BookingDocumentCard.tsx` | Create | Single document card for the Documentos grid |
| `components/bookings/BookingDocumentPopup.tsx` | Create | Full document popup (header, summary, body, footer, delete confirmation) |
| `components/bookings/BookingDetailClient.tsx` | Modify (rewrite) | Remove tabs, add new single-scroll layout |
| `app/[locale]/bookings/[id]/page.tsx` | Modify | Add `exporterBl` prop + lookup |
| `components/bookings/SIViewer.tsx` | Delete | Replaced by popup doc preview |
| `components/bookings/DraftBLViewer.tsx` | Delete | Replaced by popup doc preview |
| `components/bookings/BookingActivityFeed.tsx` | Delete | Replaced by BookingActivityLog |
| `__tests__/bookings/booking-activity-log.test.tsx` | Create | Tests for ActivityLog component |
| `__tests__/bookings/booking-document-card.test.tsx` | Create | Tests for DocumentCard component |
| `__tests__/bookings/booking-document-popup.test.tsx` | Create | Tests for popup open/close/delete |

---

## Task 1: Extend types/index.ts

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Add new Booking fields after `costAtRiskUsd`**

In `types/index.ts`, after line 129 (`costAtRiskUsd: number;`), add:

```ts
  // Extended fields (booking detail redesign)
  diasLibresOrigen?: number;
  masterBl?: string;
  blInterglobo?: string;
  scacNaviera?: string;
  scacInterglobo?: string;
  depositoRetiro?: string;
  destinoUsa?: boolean;
```

- [ ] **Step 2: Add ExporterBL type and ValidationCheck reference**

After the `DraftBL` interface (around line 253), add:

```ts
// ----------------------------------------------------------------------------
// Exporter BL - uploaded by the agent post-release, validated for accuracy.
// ----------------------------------------------------------------------------
export interface ExporterBL {
  id: string;
  bookingId: string;
  status: 'pending' | 'uploaded' | 'approved';
  uploadedAt?: string;
  fileUrl?: string;
  extractedFields?: Record<string, string>;
  validationResults?: ValidationCheck[];
}
```

- [ ] **Step 3: Extend ActivityEventType union**

In the `ActivityEventType` union (around line 322), append:

```ts
  | 'document_replaced'
  | 'document_deleted'
```

- [ ] **Step 4: Add `documentId` to ActivityEvent**

In the `ActivityEvent` interface, add after `bookingId`:

```ts
  documentId?: string;
```

- [ ] **Step 5: Run typecheck**

```bash
pnpm typecheck
```

Expected: no new errors (new optional fields shouldn't break existing code).

- [ ] **Step 6: Commit**

```bash
git add types/index.ts
git commit -m "feat(types): add ExporterBL, extend Booking + ActivityEvent for detail redesign"
```

---

## Task 2: Extend demo store

**Files:**
- Modify: `lib/hooks/useDemoStore.ts`

- [ ] **Step 1: Add `updateBookingField` action**

At the bottom of `lib/hooks/useDemoStore.ts`, before `export {`:

```ts
export function updateBookingField(
  bookingId: string,
  field: keyof Booking,
  value: unknown
): void {
  state = {
    ...state,
    bookingOverrides: {
      ...state.bookingOverrides,
      [bookingId]: {
        ...state.bookingOverrides[bookingId],
        [field]: value,
      },
    },
  };
  emit();
}
```

- [ ] **Step 2: Add `deleteBookingDocument` action**

```ts
export function deleteBookingDocument(
  bookingId: string,
  documentType: 'booking' | 'si' | 'bl' | 'exporterBl'
): void {
  const fieldMap: Record<typeof documentType, keyof Booking | null> = {
    booking: 'bookingFileUrl',
    si: 'siId',
    bl: 'draftBlId',
    exporterBl: null, // handled separately — no Booking field for ExporterBL
  };
  const field = fieldMap[documentType];

  state = {
    ...state,
    bookingOverrides: {
      ...state.bookingOverrides,
      [bookingId]: {
        ...state.bookingOverrides[bookingId],
        ...(field ? { [field]: undefined } : {}),
      },
    },
  };
  emit();
}
```

**Note on document_deleted event:** The spec says the store action should emit a `document_deleted` `ActivityEvent`, but the demo store has no activity-event storage. The `document_deleted` event is emitted from `BookingDetailClient` as local React state (see Task 9). This is a pragmatic demo deviation — the store only nulls the document field.

- [ ] **Step 3: Verify exports compile**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/useDemoStore.ts
git commit -m "feat(store): add updateBookingField and deleteBookingDocument actions"
```

---

## Task 3: Seed mock data

**Files:**
- Modify: `lib/mock-data/bookings.ts`
- Create: `lib/mock-data/exporter-bls.ts`
- Modify: `lib/mock-data/activity-events.ts`

- [ ] **Step 1: Add new fields to hero booking (BKG-SNG0502407)**

In `lib/mock-data/bookings.ts`, inside the first booking object, after `costAtRiskUsd: 0`:

```ts
    diasLibresOrigen: 5,
    masterBl: 'SNG0506037',
    blInterglobo: '9844220',
    scacNaviera: 'CMDU',
    scacInterglobo: 'ITGB',
    depositoRetiro: 'D&C TALCAHUANO',
    destinoUsa: false,
```

- [ ] **Step 2: Create `lib/mock-data/exporter-bls.ts`**

```ts
import type { ExporterBL } from '@/types';

export const exporterBls: ExporterBL[] = [
  {
    id: 'EBL-SNG0502407',
    bookingId: 'BKG-SNG0502407',
    status: 'approved',
    uploadedAt: '2026-04-23T10:00:00-04:00',
    fileUrl: undefined, // HTML-replica only in demo
    extractedFields: {},
    validationResults: [],
  },
];

export function getExporterBlByBookingId(bookingId: string): ExporterBL | undefined {
  return exporterBls.find((e) => e.bookingId === bookingId);
}
```

- [ ] **Step 3: Add `documentId` to existing SI/BL activity events**

In `lib/mock-data/activity-events.ts`, update the SI-related events for BKG-SNG0502407 to include `documentId: 'SI-SNG0502407'`:

Events to update: EVT-SNG-2 (`si_received`), EVT-SNG-3 (`si_validation_run`), EVT-SNG-4 (`si_validation_passed`), EVT-SNG-5 (`esi_generated`), EVT-SNG-6 (`esi_sent`).

Add `documentId: 'SI-SNG0502407'` to each of those objects.

For BL-related events, add `documentId: 'BL-SNG0502407'` to the draft_bl_received and validation events.

- [ ] **Step 4: Add a demo `document_replaced` event**

In `lib/mock-data/activity-events.ts`, append to the hero booking events:

```ts
  {
    id: 'EVT-SNG-DOC-REPLACED',
    bookingId: 'BKG-SNG0502407',
    documentId: 'SI-SNG0502407',
    type: 'document_replaced',
    timestamp: '2026-04-20T09:15:00-04:00',
    actor: 'user',
    actorName: 'Usuario Demo',
    description: 'SI re-uploaded after consignee address correction. Document re-scanned and validated successfully. Previous version archived.',
    metadata: {
      documentType: 'si',
      replacedBy: 'Usuario Demo',
      changedFields: [
        { field: 'consignee', before: 'QUIRCH FOODS', after: 'QUIRCH FOODS, LLC' },
      ],
    },
  },
```

- [ ] **Step 5: Run tests**

```bash
pnpm test
```

Expected: all tests pass (we only added data, didn't change logic).

- [ ] **Step 6: Commit**

```bash
git add lib/mock-data/bookings.ts lib/mock-data/exporter-bls.ts lib/mock-data/activity-events.ts
git commit -m "feat(data): seed new Booking fields and ExporterBL fixtures for redesign"
```

---

## Task 4: i18n keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/es.json`

The i18n test (`__tests__/i18n.test.ts`) enforces that `en` and `es` have identical key shapes. Add all keys to both files at the same time.

- [ ] **Step 1: Add new keys to `messages/en.json` under the `bookings` object**

Add the following block anywhere inside the `"bookings": { ... }` object (e.g. after `"alertsSection"`):

```json
"sectionPartes": "Parties",
"sectionRuta": "Route",
"sectionReferencias": "References",
"sectionCargaLogistica": "Cargo & Logistics",
"sectionActividades": "Activity",
"sectionDocumentos": "Documents",
"labelCondicionPago": "Payment terms",
"labelEmision": "Emission",
"labelDiasLibres": "Free days (origin)",
"labelMasterBl": "Master BL",
"labelBlInterglobo": "BL Interglobo",
"labelScacNaviera": "SCAC (carrier)",
"labelScacInterglobo": "SCAC (Interglobo)",
"labelDepositoRetiro": "Container depot",
"docBooking": "Booking",
"docSI": "Shipping Instruction",
"docDraftBL": "Draft BL",
"docExporterBL": "Exporter BL",
"docStatusOk": "OK",
"docStatusPending": "Pending",
"docStatusMissing": "Missing",
"docStatusReview": "Review",
"popupExpandPdf": "View full PDF",
"popupDownloadPdf": "Download",
"popupReplacePdf": "Replace",
"popupDeleteDoc": "Delete",
"popupReplaceNotice": "The document will be re-scanned. The history will record the replacement.",
"popupReplaceScanning": "Re-scanning document…",
"confirmDeleteTitle": "Delete document",
"confirmDeleteMessage": "This action is permanent and cannot be undone. The document and all extracted data will be removed.",
"confirmDeleteConfirm": "Yes, delete",
"confirmDeleteCancel": "Cancel",
"fieldsExtractedLabel": "Extracted fields — editable · Changes propagate platform-wide",
"fieldsTbdPlaceholder": "Fields for this document will be defined in a future task.",
"actorSystem": "System",
"actorAgent": "Agent",
"actorUser": "User",
"badgeRescanned": "Re-scanned",
"activityEmpty": "No activity recorded.",
"docHistoryEmpty": "No history for this document.",
"isfWarning": "ISF must be sent to the consignee 48 h before departure. Non-compliance may result in fines at destination.",
"uploadExporterBl": "Upload Exporter BL",
"labelTemperatura": "Temperature"
```

Note: The spec lists `labelShipper` and `labelConsignee` as new keys, but the existing `bookings.shipper` and `bookings.consignee` keys already exist and are reused in `BookingInfoCards`. No new keys needed for those two.

- [ ] **Step 2: Add matching keys to `messages/es.json`**

```json
"sectionPartes": "Partes",
"sectionRuta": "Ruta",
"sectionReferencias": "Referencias",
"sectionCargaLogistica": "Carga & Logística",
"sectionActividades": "Actividades",
"sectionDocumentos": "Documentos",
"labelCondicionPago": "Condición de pago",
"labelEmision": "Emisión",
"labelDiasLibres": "Días libres (origen)",
"labelMasterBl": "Master BL",
"labelBlInterglobo": "BL Interglobo",
"labelScacNaviera": "SCAC (naviera)",
"labelScacInterglobo": "SCAC (Interglobo)",
"labelDepositoRetiro": "Depósito retiro",
"docBooking": "Booking",
"docSI": "Shipping Instruction",
"docDraftBL": "Draft BL",
"docExporterBL": "Exporter BL",
"docStatusOk": "OK",
"docStatusPending": "Pendiente",
"docStatusMissing": "Sin documento",
"docStatusReview": "Revisión",
"popupExpandPdf": "Ver PDF completo",
"popupDownloadPdf": "Descargar",
"popupReplacePdf": "Reemplazar",
"popupDeleteDoc": "Eliminar",
"popupReplaceNotice": "El documento será re-escaneado. El historial registrará el reemplazo.",
"popupReplaceScanning": "Re-escaneando documento…",
"confirmDeleteTitle": "Eliminar documento",
"confirmDeleteMessage": "Esta acción es permanente y no se puede deshacer. Se eliminarán el documento y todos los datos extraídos.",
"confirmDeleteConfirm": "Sí, eliminar",
"confirmDeleteCancel": "Cancelar",
"fieldsExtractedLabel": "Campos extraídos — editables · Los cambios se propagan a toda la plataforma",
"fieldsTbdPlaceholder": "Los campos de este documento se definirán en una próxima tarea.",
"actorSystem": "Sistema",
"actorAgent": "Agente",
"actorUser": "Usuario",
"badgeRescanned": "Re-escaneado",
"activityEmpty": "Sin actividad registrada.",
"docHistoryEmpty": "Sin historial para este documento.",
"isfWarning": "ISF debe enviarse al recibidor 48 h antes del zarpe. El incumplimiento puede generar multas en destino.",
"uploadExporterBl": "Subir Exporter BL",
"labelTemperatura": "Temperatura"
```

- [ ] **Step 3: Run i18n tests**

```bash
pnpm test __tests__/i18n.test.ts
```

Expected: `es and en have identical key shapes` — PASS.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/es.json
git commit -m "feat(i18n): add booking detail redesign keys to en and es"
```

---

## Task 5: BookingActivityLog component

**Files:**
- Create: `components/bookings/BookingActivityLog.tsx`
- Create: `__tests__/bookings/booking-activity-log.test.tsx`

This component is reused in both the booking-level sidebar (Task 7) and the document popup history column (Task 10).

- [ ] **Step 1: Write failing test**

Create `__tests__/bookings/booking-activity-log.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingActivityLog } from '@/components/bookings/BookingActivityLog';
import en from '@/messages/en.json';
import type { ActivityEvent } from '@/types';

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

const baseEvent: ActivityEvent = {
  id: 'EVT-1',
  bookingId: 'BKG-1',
  type: 'booking_created',
  timestamp: '2026-04-09T15:20:00-04:00',
  actor: 'user',
  actorName: 'Felipe Donoso',
  description: 'Booking created.',
};

describe('BookingActivityLog', () => {
  it('renders the description of each event', () => {
    wrap(<BookingActivityLog events={[baseEvent]} />);
    expect(screen.getByText('Booking created.')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    wrap(<BookingActivityLog events={[]} />);
    expect(screen.getByText('No activity recorded.')).toBeInTheDocument();
  });

  it('filters by documentId when provided', () => {
    const withDoc: ActivityEvent = { ...baseEvent, id: 'EVT-2', documentId: 'SI-1', description: 'Doc event.' };
    const withoutDoc: ActivityEvent = { ...baseEvent, id: 'EVT-3', description: 'Booking event.' };
    wrap(<BookingActivityLog events={[withDoc, withoutDoc]} documentId="SI-1" />);
    expect(screen.getByText('Doc event.')).toBeInTheDocument();
    expect(screen.queryByText('Booking event.')).not.toBeInTheDocument();
  });

  it('renders actor badge', () => {
    wrap(<BookingActivityLog events={[baseEvent]} />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders Re-scanned badge for document_replaced events', () => {
    const replaced: ActivityEvent = { ...baseEvent, type: 'document_replaced', documentId: 'SI-1' };
    wrap(<BookingActivityLog events={[replaced]} />);
    expect(screen.getByText('Re-scanned')).toBeInTheDocument();
  });

  it('shows events with documentId when no documentId filter is applied (booking-level log)', () => {
    const withDoc: ActivityEvent = { ...baseEvent, id: 'EVT-4', documentId: 'SI-1', description: 'Has doc id.' };
    const withoutDoc: ActivityEvent = { ...baseEvent, id: 'EVT-5', description: 'No doc id.' };
    wrap(<BookingActivityLog events={[withDoc, withoutDoc]} />);
    expect(screen.getByText('Has doc id.')).toBeInTheDocument();
    expect(screen.getByText('No doc id.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test __tests__/bookings/booking-activity-log.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `BookingActivityLog`**

Create `components/bookings/BookingActivityLog.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import type { ActivityEvent } from '@/types';
import { formatTs } from '@/lib/utils/dates';

const DOT_CLASS: Record<string, string> = {
  alert_fired: 'bg-severity-watch border-severity-watch',
  document_replaced: 'bg-severity-watch border-severity-watch',
  document_deleted: 'bg-severity-crit border-severity-crit',
  si_validation_passed: 'bg-severity-ok border-severity-ok',
  draft_bl_validation_passed: 'bg-severity-ok border-severity-ok',
  bl_released_to_exporter: 'bg-severity-ok border-severity-ok',
  esi_acknowledged: 'bg-severity-ok border-severity-ok',
};

function dotClass(type: string, actor: ActivityEvent['actor']): string {
  if (DOT_CLASS[type]) return DOT_CLASS[type];
  if (actor === 'user') return 'bg-trace border-trace';
  if (actor === 'agent') return 'bg-severity-watch border-severity-watch';
  return 'bg-bg-3 border-line-mid';
}

interface Props {
  events: ActivityEvent[];
  documentId?: string; // when provided, filter to only events with this documentId
  emptyMessage?: string;
}

export function BookingActivityLog({ events, documentId, emptyMessage }: Props) {
  const t = useTranslations('bookings');

  const filtered = documentId
    ? events.filter((e) => e.documentId === documentId)
    : events;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const actorLabel: Record<ActivityEvent['actor'], string> = {
    system: t('actorSystem'),
    agent: t('actorAgent'),
    user: t('actorUser'),
  };

  const actorBadgeClass: Record<ActivityEvent['actor'], string> = {
    system: 'bg-severity-info/10 text-severity-info border border-severity-info/20',
    agent: 'bg-severity-ok/10 text-severity-ok border border-severity-ok/20',
    user: 'bg-trace/10 text-trace border border-trace/20',
  };

  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-ink-4">
        {emptyMessage ?? t('activityEmpty')}
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {sorted.map((event, idx) => (
        <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
          {/* Vertical line */}
          {idx < sorted.length - 1 && (
            <div className="absolute left-[5px] top-3 h-full w-px bg-line-soft" />
          )}
          {/* Dot */}
          <div
            className={`relative z-10 mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full border ${dotClass(event.type, event.actor)}`}
          />
          {/* Content */}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm font-medium leading-snug text-ink-1">{event.type.replace(/_/g, ' ')}</p>
            <p className="font-mono text-[10px] text-ink-4">{formatTs(event.timestamp)}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{event.description}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className={`inline-block rounded px-1.5 py-px font-mono text-[9px] uppercase tracking-wide ${actorBadgeClass[event.actor]}`}>
                {event.actorName ?? actorLabel[event.actor]}
              </span>
              {event.type === 'document_replaced' && (
                <span className="inline-block rounded border border-line-mid bg-ink-4/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wide text-ink-3">
                  {t('badgeRescanned')}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test __tests__/bookings/booking-activity-log.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/bookings/BookingActivityLog.tsx __tests__/bookings/booking-activity-log.test.tsx
git commit -m "feat(bookings): add BookingActivityLog vertical timeline component"
```

---

## Task 6: BookingInfoCards component

**Files:**
- Create: `components/bookings/BookingInfoCards.tsx`

No tests needed — pure display, no logic. Verified by visual inspection in Task 9.

- [ ] **Step 1: Create `components/bookings/BookingInfoCards.tsx`**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import type { Booking } from '@/types';
import { formatTs } from '@/lib/utils/dates';

interface Props {
  booking: Booking;
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line-soft bg-bg-2 p-3.5 flex flex-col gap-2.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-4">{title}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-ink-4">{label}</dt>
      <dd className="font-medium text-ink-1 truncate">{value ?? '—'}</dd>
    </div>
  );
}

export function BookingInfoCards({ booking }: Props) {
  const t = useTranslations('bookings');

  // Port flow: pol → transshipmentPort? → pod
  const portFlow = booking.transshipmentPort
    ? `${booking.pol.split(',')[0]} → ${booking.transshipmentPort} → ${booking.pod.split(',')[0]}`
    : `${booking.pol.split(',')[0]} → ${booking.pod.split(',')[0]}`;

  const stackingStr =
    booking.stackingFrom && booking.stackingTo
      ? `${formatTs(booking.stackingFrom)} → ${formatTs(booking.stackingTo)}`
      : '—';

  return (
    <>
      {/* Partes */}
      <InfoCard title={t('sectionPartes')}>
        <Field label={t('shipper')} value={booking.shipper} />
        <Field label={t('consignee')} value={booking.consignee} />
        <Field label={t('referenciaCliente')} value={booking.referenciaCliente} />
        <Field label={t('labelCondicionPago')} value={booking.freightTerm} />
        <Field label={t('labelEmision')} value={booking.emissionType} />
        <Field label={t('labelDiasLibres')} value={booking.diasLibresOrigen} />
      </InfoCard>

      {/* Ruta */}
      <InfoCard title={t('sectionRuta')}>
        <div className="col-span-2">
          <dt className="text-ink-4">{t('transshipmentPort')}</dt>
          <dd className="font-medium text-ink-1">{portFlow}</dd>
        </div>
        <Field label={t('vessel')} value={booking.vesselName} />
        <Field label={t('voyage')} value={booking.voyage} />
        <Field label={t('labelEtd')} value={formatTs(booking.etd)} />
        <Field label={t('labelEta')} value={formatTs(booking.eta)} />
      </InfoCard>

      {/* Referencias */}
      <InfoCard title={t('sectionReferencias')}>
        <Field label={t('colNumber')} value={booking.bookingNumber} />
        <Field label={t('labelMasterBl')} value={booking.masterBl} />
        <Field label={t('labelBlInterglobo')} value={booking.blInterglobo} />
        <Field label={t('labelScacNaviera')} value={booking.scacNaviera} />
        <Field label={t('labelScacInterglobo')} value={booking.scacInterglobo} />
        <Field label={t('labelDepositoRetiro')} value={booking.depositoRetiro} />
      </InfoCard>

      {/* Carga & Logística */}
      <InfoCard title={t('sectionCargaLogistica')}>
        <Field label={t('container')} value={booking.containerType} />
        {booking.isReefer && booking.setpointC !== undefined && (
          <Field label={t('labelTemperatura')} value={`${booking.setpointC} °C`} />
        )}
        {booking.ventilation !== undefined && (
          <Field label="Ventilación" value={`${booking.ventilation}%`} />
        )}
        <Field label={t('stacking')} value={stackingStr} />
        <Field label={t('labelCutoff')} value={formatTs(booking.cutOff ?? '')} />
        {booking.destinoUsa && (
          <div className="col-span-2 mt-1 rounded-md border border-severity-watch/25 border-l-[3px] border-l-severity-watch bg-severity-watch/8 px-2.5 py-1.5">
            <p className="text-[10px] leading-relaxed text-ink-2">{t('isfWarning')}</p>
          </div>
        )}
      </InfoCard>
    </>
  );
}
```

The `labelTemperatura` key is added in Task 4.

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add components/bookings/BookingInfoCards.tsx
git commit -m "feat(bookings): add BookingInfoCards component (4 info card sections)"
```

---

## Task 7: BookingDocumentCard component

**Files:**
- Create: `components/bookings/BookingDocumentCard.tsx`
- Create: `__tests__/bookings/booking-document-card.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/bookings/booking-document-card.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { BookingDocumentCard } from '@/components/bookings/BookingDocumentCard';
import en from '@/messages/en.json';

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

describe('BookingDocumentCard', () => {
  it('renders label and ok status', () => {
    wrap(<BookingDocumentCard label="Booking" status="ok" onClick={vi.fn()} />);
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders missing status with dimmed style', () => {
    const { container } = wrap(
      <BookingDocumentCard label="Exporter BL" status="missing" onClick={vi.fn()} />
    );
    expect(screen.getByText('Missing')).toBeInTheDocument();
    // missing cards have opacity class
    expect(container.firstChild).toHaveClass('opacity-[0.55]');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    wrap(<BookingDocumentCard label="SI" status="ok" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('still calls onClick for missing Exporter BL (upload mode)', async () => {
    const onClick = vi.fn();
    wrap(<BookingDocumentCard label="Exporter BL" status="missing" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test __tests__/bookings/booking-document-card.test.tsx
```

- [ ] **Step 3: Implement `BookingDocumentCard`**

Create `components/bookings/BookingDocumentCard.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';

export type DocumentStatus = 'ok' | 'warn' | 'missing';

interface Props {
  label: string;
  status: DocumentStatus;
  onClick: () => void;
}

const STATUS_BADGE: Record<DocumentStatus, { label: string; className: string }> = {
  ok: {
    label: 'Ok',
    className: 'bg-severity-ok/10 text-severity-ok border-severity-ok/25',
  },
  warn: {
    label: 'Review',
    className: 'bg-severity-watch/10 text-severity-watch border-severity-watch/25',
  },
  missing: {
    label: 'Missing',
    className: 'bg-ink-4/10 text-ink-3 border-line-mid',
  },
};

export function BookingDocumentCard({ label, status, onClick }: Props) {
  const t = useTranslations('bookings');

  const badge = STATUS_BADGE[status];

  // resolve label keys
  const statusLabel =
    status === 'ok'
      ? t('docStatusOk')
      : status === 'warn'
        ? t('docStatusReview')
        : t('docStatusMissing');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border border-line-soft bg-bg-2 p-4 text-left transition-colors hover:bg-bg-3 focus:outline-none focus:ring-2 focus:ring-ink-3/30 ${status === 'missing' ? 'opacity-[0.55]' : ''}`}
    >
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md border ${status === 'missing' ? 'border-dashed border-line-mid bg-bg-1' : 'border-line-soft bg-bg-1'}`}
      >
        <FileText className="h-4 w-4 text-ink-3" />
      </div>
      <p className="mb-1.5 text-sm font-medium text-ink-1">{label}</p>
      <span
        className={`inline-block rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-wide ${badge.className}`}
      >
        {statusLabel}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test __tests__/bookings/booking-document-card.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/bookings/BookingDocumentCard.tsx __tests__/bookings/booking-document-card.test.tsx
git commit -m "feat(bookings): add BookingDocumentCard component with status badge"
```

---

## Task 8: BookingDocumentPopup component

**Files:**
- Create: `components/bookings/BookingDocumentPopup.tsx`
- Create: `__tests__/bookings/booking-document-popup.test.tsx`

This is the largest component. Build it section by section.

- [ ] **Step 1: Write failing tests**

Create `__tests__/bookings/booking-document-popup.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { BookingDocumentPopup } from '@/components/bookings/BookingDocumentPopup';
import en from '@/messages/en.json';
import type { Booking, ActivityEvent } from '@/types';

vi.mock('@/lib/hooks/useDemoStore', () => ({
  updateBookingField: vi.fn(),
  deleteBookingDocument: vi.fn(),
}));

const mockBooking: Partial<Booking> = {
  id: 'BKG-1',
  bookingNumber: 'SNG0506037',
  shipper: 'Comfrut S.A.',
  consignee: 'QUIRCH FOODS, LLC',
  vesselName: 'Matthew Schulte',
  voyage: '0LI1YN1MA',
  pol: 'San Antonio, CL',
  pod: 'Charleston, US',
  etd: '2026-04-22T18:00:00-04:00',
  eta: '2026-05-06T08:00:00-04:00',
};

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

describe('BookingDocumentPopup', () => {
  it('renders popup with document name in header', () => {
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Booking')).toBeInTheDocument();
  });

  it('calls onClose when × button is clicked', async () => {
    const onClose = vi.fn();
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={onClose}
        onDelete={vi.fn()}
      />
    );
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows delete confirmation overlay when Eliminar is clicked', async () => {
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete document')).toBeInTheDocument();
    expect(screen.getByText('Yes, delete')).toBeInTheDocument();
  });

  it('calls onDelete and closes on confirm', async () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={onClose}
        onDelete={onDelete}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    await userEvent.click(screen.getByText('Yes, delete'));
    expect(onDelete).toHaveBeenCalledWith('booking');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides confirmation when Cancel is clicked', async () => {
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete document')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
pnpm test __tests__/bookings/booking-document-popup.test.tsx
```

- [ ] **Step 3: Implement `BookingDocumentPopup`**

Create `components/bookings/BookingDocumentPopup.tsx`:

```tsx
'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingActivityLog } from './BookingActivityLog';
import { updateBookingField, deleteBookingDocument } from '@/lib/hooks/useDemoStore';
import type { Booking, ActivityEvent, ExporterBL, ShippingInstruction, DraftBL } from '@/types';
import { formatTs } from '@/lib/utils/dates';

export type DocType = 'booking' | 'si' | 'bl' | 'exporterBl';

interface Props {
  docType: DocType;
  docId: string;
  booking: Booking;
  si?: ShippingInstruction;
  bl?: DraftBL;
  exporterBl?: ExporterBL;
  events: ActivityEvent[];
  onClose: () => void;
  onDelete: (docType: DocType) => void;
  // SI / BL primary action buttons (passed in to avoid coupling)
  primaryAction?: React.ReactNode;
}

const DOC_LABELS: Record<DocType, string> = {
  booking: 'Booking',
  si: 'Shipping Instruction',
  bl: 'Draft BL',
  exporterBl: 'Exporter BL',
};

const BOOKING_EXTRACTED_FIELDS: Array<{ label: string; field: keyof Booking }> = [
  { label: 'Embarcador', field: 'shipper' },
  { label: 'Consignatario', field: 'consignee' },
  { label: 'Booking #', field: 'bookingNumber' },
  { label: 'Master BL', field: 'masterBl' },
  { label: 'Nave', field: 'vesselName' },
  { label: 'Viaje', field: 'voyage' },
  { label: 'ETD', field: 'etd' },
  { label: 'ETA', field: 'eta' },
  { label: 'Pto. Embarque', field: 'pol' },
  { label: 'Pto. Transbordo', field: 'transshipmentPort' },
  { label: 'Pto. Descarga', field: 'pod' },
  { label: 'Depósito retiro', field: 'depositoRetiro' },
];

export function BookingDocumentPopup({
  docType,
  docId,
  booking,
  si,
  bl,
  exporterBl,
  events,
  onClose,
  onDelete,
  primaryAction,
}: Props) {
  const t = useTranslations('bookings');
  const [showConfirm, setShowConfirm] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceNotice, setReplaceNotice] = useState<'idle' | 'pending' | 'scanning'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docLabel = DOC_LABELS[docType];
  const fileUrl =
    docType === 'booking'
      ? booking.bookingFileUrl
      : docType === 'si'
        ? si?.sourceFileUrl
        : docType === 'bl'
          ? bl?.sourceFileUrl
          : exporterBl?.fileUrl;

  // Exporter BL upload mode
  const isUploadMode = docType === 'exporterBl' && !exporterBl;

  function handleBackdropClick(e: React.MouseEvent) {
    if (showConfirm) return;
    if (e.target === e.currentTarget) onClose();
  }

  function handleDelete() {
    deleteBookingDocument(booking.id, docType);
    onDelete(docType);
    onClose();
  }

  function handleReplaceClick() {
    setReplaceNotice('pending');
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setReplaceNotice('scanning');
    setReplacing(true);
    // Demo: simulate rescan
    setTimeout(() => {
      setReplacing(false);
      setReplaceNotice('idle');
    }, 2000);
  }

  const metaLine =
    docType === 'booking'
      ? `${booking.bookingNumber} · ${formatTs(booking.createdAt)}`
      : docType === 'si'
        ? `${booking.bookingNumber} · ${si?.receivedAt ? formatTs(si.receivedAt) : '—'}`
        : docType === 'bl'
          ? `${booking.bookingNumber} · ${bl?.receivedAt ? formatTs(bl.receivedAt) : '—'}`
          : `${booking.bookingNumber} · ${exporterBl?.uploadedAt ? formatTs(exporterBl.uploadedAt) : '—'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(43,31,18,0.45)] p-8 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-xl border border-line-mid bg-bg-1 shadow-[0_24px_60px_rgba(43,31,18,0.22)] max-h-[calc(100vh-64px)]">

        {/* Delete confirmation overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[rgba(248,242,228,0.88)] backdrop-blur-sm">
            <div className="flex w-[90%] max-w-sm flex-col gap-3 rounded-xl border border-line-mid bg-bg-1 p-6 shadow-lg">
              <p className="font-[Georgia] text-[16px] font-normal text-ink-1">{t('confirmDeleteTitle')}</p>
              <p className="text-xs leading-relaxed text-ink-3">{t('confirmDeleteMessage')}</p>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>
                  {t('confirmDeleteCancel')}
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  {t('confirmDeleteConfirm')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-line-mid p-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-[Georgia] text-[17px] font-normal tracking-[-0.01em] text-ink-1">
              {docLabel}
            </p>
            <p className="font-mono text-[10px] text-ink-4">{metaLine}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {primaryAction}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowConfirm(true)}
              aria-label="Delete document"
            >
              {t('popupDeleteDoc')}
            </Button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft bg-bg-3 text-ink-3 hover:bg-bg-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex flex-shrink-0 flex-col gap-2 border-b border-line-soft bg-bg-2 p-3">
          <div className="rounded-lg border border-line-soft bg-bg-1 p-[10px_13px]">
            <p className="text-xs leading-relaxed text-ink-2">
              {docType === 'booking' &&
                `Booking confirmation for ${booking.bookingNumber}. Vessel: ${booking.vesselName} / ${booking.voyage}. Route: ${booking.pol.split(',')[0]} → ${booking.pod.split(',')[0]}.`}
              {docType === 'si' &&
                (si
                  ? `Shipping Instruction received from ${booking.shipper}. Validation ${si.validationStatus === 'green' ? 'passed' : 'has issues'}.`
                  : 'No SI on file.')}
              {docType === 'bl' &&
                (bl
                  ? `Draft BL received from carrier. Validation ${bl.validationStatus === 'green' ? 'passed' : 'has issues'}.`
                  : 'No Draft BL on file.')}
              {docType === 'exporterBl' &&
                (exporterBl
                  ? `Exporter BL status: ${exporterBl.status}. Uploaded ${exporterBl.uploadedAt ? formatTs(exporterBl.uploadedAt) : '—'}.`
                  : 'No Exporter BL uploaded yet.')}
            </p>
          </div>
          {/* Alert chip — shown when SI/BL have validation fails */}
          {((docType === 'si' && si?.validationResults.some((c) => c.result === 'fail')) ||
            (docType === 'bl' && bl?.validationResults.some((c) => c.result === 'fail'))) && (
            <div className="flex items-start gap-2 rounded-lg border border-[rgba(185,122,31,0.25)] border-l-[3px] border-l-severity-watch bg-[rgba(185,122,31,0.08)] p-[7px_11px]">
              <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-severity-watch" />
              <div className="flex flex-col">
                <p className="text-[11px] font-semibold text-severity-watch">Validation issues found</p>
                <p className="text-[10px] text-ink-3">One or more checks failed. Review before proceeding.</p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {isUploadMode ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-line-mid bg-bg-2">
                <span className="text-2xl">↑</span>
              </div>
              <p className="text-sm font-medium text-ink-1">{t('uploadExporterBl')}</p>
              <label className="cursor-pointer rounded-lg border border-dashed border-line-mid bg-bg-2 px-6 py-3 text-xs text-ink-3 hover:bg-bg-3">
                <input type="file" accept=".pdf" className="sr-only" />
                Click to browse or drag PDF here
              </label>
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden">
            {/* Left: document preview */}
            <div className="flex flex-col gap-2.5 overflow-y-auto border-r border-line-soft p-3.5">
              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!fileUrl}
                  onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                >
                  {t('popupExpandPdf')}
                </Button>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    disabled={!fileUrl}
                    className="bg-severity-ok/10 text-severity-ok border border-severity-ok/25 hover:bg-severity-ok/18"
                    asChild={!!fileUrl}
                  >
                    {fileUrl ? (
                      <a href={fileUrl} download>{t('popupDownloadPdf')}</a>
                    ) : (
                      <span>{t('popupDownloadPdf')}</span>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    disabled={replacing}
                    className="bg-severity-watch/10 text-severity-watch border border-severity-watch/25 hover:bg-severity-watch/18"
                    onClick={handleReplaceClick}
                  >
                    {replacing ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> {t('popupReplaceScanning')}</>
                    ) : (
                      t('popupReplacePdf')
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileSelected}
                  />
                </div>
              </div>

              {replaceNotice !== 'idle' && (
                <p className="rounded-md border border-severity-watch/25 bg-severity-watch/8 px-2.5 py-1.5 text-[10px] text-ink-3">
                  {replaceNotice === 'pending' ? t('popupReplaceNotice') : t('popupReplaceScanning')}
                </p>
              )}

              {/* HTML replica */}
              <div className="rounded-sm bg-white shadow-sm">
                <BookingDocPreview docType={docType} booking={booking} si={si} bl={bl} />
              </div>
            </div>

            {/* Right: document history */}
            <div className="flex flex-col overflow-y-auto p-3.5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink-4">
                {t('sectionActividades')}
              </p>
              <BookingActivityLog
                events={events}
                documentId={docId}
                emptyMessage={t('docHistoryEmpty')}
              />
            </div>
          </div>
        )}

        {/* Footer — extracted fields */}
        {!isUploadMode && (
          <div className="flex-shrink-0 border-t border-line-mid bg-bg-2 p-3.5">
            {docType === 'booking' ? (
              <div className="flex flex-col gap-2.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-4">
                  {t('fieldsExtractedLabel')}
                </p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {BOOKING_EXTRACTED_FIELDS.map(({ label, field }) => (
                    <div key={field} className="flex flex-col gap-0.5">
                      <label className="font-mono text-[10px] text-ink-4">{label}</label>
                      <input
                        className="w-full rounded-[5px] border border-line-mid bg-bg-1 px-2 py-[5px] text-xs text-ink-1 focus:border-ink-3 focus:outline-none"
                        defaultValue={String(booking[field] ?? '')}
                        onChange={(e) => updateBookingField(booking.id, field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-ink-4">{t('fieldsTbdPlaceholder')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Minimal HTML replica ───────────────────────────────────────────────────────

function BookingDocPreview({
  docType,
  booking,
  si,
  bl,
}: {
  docType: DocType;
  booking: Booking;
  si?: ShippingInstruction;
  bl?: DraftBL;
}) {
  if (docType === 'booking') {
    return (
      <div className="space-y-3 p-4 text-[10px] text-gray-700">
        <div className="border-b pb-2 text-center">
          <p className="text-xs font-bold uppercase tracking-widest">Booking Confirmation</p>
          <p>{booking.bookingNumber}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          <dt className="font-semibold">Shipper</dt><dd>{booking.shipper}</dd>
          <dt className="font-semibold">Consignee</dt><dd>{booking.consignee}</dd>
          <dt className="font-semibold">Vessel</dt><dd>{booking.vesselName}</dd>
          <dt className="font-semibold">Voyage</dt><dd>{booking.voyage}</dd>
          <dt className="font-semibold">POL</dt><dd>{booking.pol}</dd>
          <dt className="font-semibold">POD</dt><dd>{booking.pod}</dd>
          <dt className="font-semibold">ETD</dt><dd>{booking.etd}</dd>
          <dt className="font-semibold">ETA</dt><dd>{booking.eta}</dd>
        </dl>
      </div>
    );
  }
  return (
    <div className="p-4 text-[10px] text-gray-500 italic">
      Preview not available for this document type.
    </div>
  );
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test __tests__/bookings/booking-document-popup.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Run typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add components/bookings/BookingDocumentPopup.tsx __tests__/bookings/booking-document-popup.test.tsx
git commit -m "feat(bookings): add BookingDocumentPopup with preview, history, fields, and delete confirmation"
```

---

## Task 9: Rewrite BookingDetailClient

**Files:**
- Modify: `components/bookings/BookingDetailClient.tsx`

This task replaces the tab-based layout with the single-scroll redesign.

- [ ] **Step 1: Replace full file content**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type {
  ActivityEvent,
  Alert,
  Booking,
  DraftBL,
  ExporterBL,
  Exporter,
  Naviera,
  ShippingInstruction,
} from '@/types';
import { ContainerCard } from './ContainerCard';
import { Button } from '@/components/ui/button';
import { BookingHeader } from './BookingHeader';
import { BookingLifecycleStrip } from './BookingLifecycleStrip';
import { BookingInfoCards } from './BookingInfoCards';
import { BookingActivityLog } from './BookingActivityLog';
import { BookingDocumentCard, type DocumentStatus } from './BookingDocumentCard';
import { BookingDocumentPopup, type DocType } from './BookingDocumentPopup';
import {
  useDemoStore,
  applyBookingOverride,
  transitionBooking,
  getNewBookingById,
  getContainersByBookingId,
} from '@/lib/hooks/useDemoStore';
import { toast } from '@/components/ui/toast';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { formatTs } from '@/lib/utils/dates';

interface Props {
  bookingId: string;
  booking?: Booking;
  exporter?: Exporter;
  naviera?: Naviera;
  si?: ShippingInstruction;
  bl?: DraftBL;
  exporterBl?: ExporterBL;
  alerts?: Alert[];
  events?: ActivityEvent[];
}

export function BookingDetailClient({
  bookingId,
  booking: initialBooking,
  exporter,
  naviera,
  si,
  bl,
  exporterBl: initialExporterBl,
  alerts = [],
  events = [],
}: Props) {
  const t = useTranslations('bookings');
  const locale = useLocale() as 'es' | 'en';
  const storeState = useDemoStore();

  const booking = useMemo(() => {
    const base = initialBooking ?? getNewBookingById(bookingId);
    if (!base) return null;
    return applyBookingOverride(base);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBooking, bookingId, storeState]);

  const [transmitting, setTransmitting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ type: DocType; id: string } | null>(null);
  // Local state for ExporterBL deletion (not on Booking type)
  const [exporterBl, setExporterBl] = useState<ExporterBL | undefined>(initialExporterBl);
  // Local events for demo actions (document_deleted). Merged with server events below.
  const [localEvents, setLocalEvents] = useState<ActivityEvent[]>([]);
  const allEvents = [...localEvents, ...events];

  const siHasFails = (si?.validationResults ?? []).some((c) => c.result === 'fail');
  const blHasFails = (bl?.validationResults ?? []).some((c) => c.result === 'fail');

  function handleGenerateEsi() {
    if (!booking || !si || siHasFails) return;
    setTransmitting(true);
    setTimeout(() => {
      transitionBooking(booking.id, 'esi_sent');
      toast.success(t('toasts.esiSent', { naviera: naviera?.shortName ?? '' }));
      setTransmitting(false);
    }, 1500);
  }

  function handleReleaseBl() {
    if (!booking || !bl || blHasFails) return;
    transitionBooking(booking.id, 'bl_released');
    toast.success(t('toasts.blReleased', { email: exporter?.contactEmail ?? '' }));
  }

  function handleDocDelete(docType: DocType) {
    if (docType === 'exporterBl') setExporterBl(undefined);
    // Emit document_deleted event into local state (store has no event storage)
    const deletedEvent: ActivityEvent = {
      id: `EVT-DEL-${Date.now()}`,
      bookingId: booking!.id,
      type: 'document_deleted',
      timestamp: new Date().toISOString(),
      actor: 'user',
      actorName: 'Usuario Demo',
      description: `${DOC_LABELS[docType]} document deleted.`,
      metadata: { documentType: docType, deletedBy: 'Usuario Demo' },
    };
    setLocalEvents((prev) => [deletedEvent, ...prev]);
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-3">
        {t('empty')}
      </div>
    );
  }

  // Used in handleDocDelete — defined here so it's in scope
  const DOC_LABELS: Record<DocType, string> = {
    booking: t('docBooking'),
    si: t('docSI'),
    bl: t('docDraftBL'),
    exporterBl: t('docExporterBL'),
  };

  // Document card statuses
  const bookingDocStatus: DocumentStatus = booking.bookingFileUrl ? 'ok' : 'missing';
  const siStatus: DocumentStatus = !si ? 'missing' : siHasFails ? 'warn' : 'ok';
  const blStatus: DocumentStatus = !bl ? 'missing' : blHasFails ? 'warn' : 'ok';
  const exporterBlStatus: DocumentStatus =
    !exporterBl || exporterBl.status === 'pending'
      ? 'missing'
      : exporterBl.status === 'uploaded'
        ? 'warn'
        : 'ok';

  // SI primary action for popup header
  const siPrimaryAction = (
    <Button
      size="sm"
      disabled={siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
      onClick={handleGenerateEsi}
    >
      {transmitting ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />{t('transmittingEsi')}</> : <><Send className="mr-1 h-3 w-3" />{t('generateEsi')}</>}
    </Button>
  );

  const blPrimaryAction = (
    <Button
      size="sm"
      disabled={blHasFails || booking.status === 'bl_released'}
      onClick={handleReleaseBl}
    >
      {t('releaseBl')}
    </Button>
  );

  return (
    <>
      <div className="flex min-h-screen flex-col gap-4 px-4 pt-4 pb-8">
        <BookingHeader booking={booking} exporter={exporter} naviera={naviera} />
        <BookingLifecycleStrip current={booking.status} />

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-4">
              <AlertTriangle className="h-3 w-3 text-severity-watch" />
              {t('alertsSection')}
            </div>
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-md border border-[rgba(185,122,31,0.25)] border-l-[3px] border-l-severity-watch bg-[rgba(185,122,31,0.06)] px-3 py-2.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink-1">
                      {locale === 'es' ? (a.titleEs ?? a.title) : a.title}
                    </p>
                    <p className="font-mono text-[10px] text-ink-3">
                      {locale === 'es' ? (a.agentNameEs ?? a.agentName) : a.agentName}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-2">
                    {locale === 'es' ? (a.messageEs ?? a.message) : a.message}
                  </p>
                  {a.suggestedAction && (
                    <p className="mt-1 text-xs text-severity-ok">
                      → {locale === 'es' ? (a.suggestedActionEs ?? a.suggestedAction) : a.suggestedAction}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ruta y Horario — 2-column: info cards (left) + activity log (right) */}
        <div className="grid grid-cols-2 items-stretch gap-3">
          {/* Left: 4 info cards */}
          <div className="flex flex-col gap-2.5">
            <BookingInfoCards booking={booking} />
          </div>

          {/* Right: Actividades log */}
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line-soft bg-bg-2">
            <p className="flex-shrink-0 border-b border-line-soft px-[14px] py-[9px] font-mono text-[10px] uppercase tracking-widest text-ink-4">
              {t('sectionActividades')}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto p-[14px_16px]">
              <BookingActivityLog events={allEvents} />
            </div>
          </div>
        </div>

        {/* Contenedores */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-4">
            {t('containers', { n: getContainersByBookingId(booking.id).length })}
          </p>
          <div className="flex flex-col gap-2">
            {getContainersByBookingId(booking.id).map((c) => (
              <ContainerCard key={c.id} container={c} />
            ))}
          </div>
        </div>

        {/* Documentos */}
        <div>
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-ink-4">
            {t('sectionDocumentos')}
          </p>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4">
            <BookingDocumentCard
              label={t('docBooking')}
              status={bookingDocStatus}
              onClick={() => setSelectedDoc({ type: 'booking', id: booking.id })}
            />
            <BookingDocumentCard
              label={t('docSI')}
              status={siStatus}
              onClick={() => si && setSelectedDoc({ type: 'si', id: si.id })}
            />
            <BookingDocumentCard
              label={t('docDraftBL')}
              status={blStatus}
              onClick={() => bl && setSelectedDoc({ type: 'bl', id: bl.id })}
            />
            <BookingDocumentCard
              label={t('docExporterBL')}
              status={exporterBlStatus}
              onClick={() =>
                setSelectedDoc({
                  type: 'exporterBl',
                  id: exporterBl?.id ?? booking.id,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Document popup */}
      {selectedDoc && (
        <BookingDocumentPopup
          docType={selectedDoc.type}
          docId={selectedDoc.id}
          booking={booking}
          si={si}
          bl={bl}
          exporterBl={exporterBl}
          events={allEvents}
          onClose={() => setSelectedDoc(null)}
          onDelete={handleDocDelete}
          primaryAction={
            selectedDoc.type === 'si'
              ? siPrimaryAction
              : selectedDoc.type === 'bl'
                ? blPrimaryAction
                : undefined
          }
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Fix any type errors before continuing.

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: all existing tests plus new tests pass. If any test relied on the tab structure, update it.

- [ ] **Step 4: Start dev server and do visual QA**

```bash
pnpm dev
```

Navigate to `/bookings/BKG-SNG0502407` and verify:
- [ ] No tabs visible, single scroll page
- [ ] Alertas section appears (if booking has alerts)
- [ ] Ruta y Horario: 4 cards left + activity log right, matched height, log scrolls
- [ ] Contenedores section unchanged
- [ ] Documentos: 4 cards with correct status badges
- [ ] Booking card click → popup opens with correct meta
- [ ] SI card click → popup opens with "Generar e-SI" in header
- [ ] BL card click → popup opens with "Liberar BL" in header
- [ ] Exporter BL card (approved) → popup opens with history log
- [ ] Delete → confirmation overlay → confirm → popup closes, card goes missing
- [ ] Reemplazar → file picker → loading state → returns

- [ ] **Step 5: Commit**

```bash
git add components/bookings/BookingDetailClient.tsx
git commit -m "feat(bookings): rewrite BookingDetailClient — remove tabs, add single-scroll redesign"
```

---

## Task 10: Wire up page.tsx + delete removed components

**Files:**
- Modify: `app/[locale]/bookings/[id]/page.tsx`
- Delete: `components/bookings/SIViewer.tsx`
- Delete: `components/bookings/DraftBLViewer.tsx`

- [ ] **Step 1: Add `exporterBl` lookup and prop to page.tsx**

In `app/[locale]/bookings/[id]/page.tsx`, add the import:

```ts
import { getExporterBlByBookingId } from '@/lib/mock-data/exporter-bls';
```

Inside the `if (booking)` block, after `const events = getActivityForBooking(id);`, add:

```ts
const exporterBl = getExporterBlByBookingId(id);
```

Then add `exporterBl={exporterBl}` to the `<BookingDetailClient>` props.

- [ ] **Step 2: Delete removed components**

```bash
rm components/bookings/SIViewer.tsx
rm components/bookings/DraftBLViewer.tsx
rm components/bookings/BookingActivityFeed.tsx
```

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

If any other file imports `SIViewer` or `DraftBLViewer`, remove those imports now.

- [ ] **Step 4: Run full test suite**

```bash
pnpm test
```

All tests should pass.

- [ ] **Step 5: Build**

```bash
pnpm build
```

Expected: clean build, no type errors, no missing imports.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/bookings/[id]/page.tsx
git rm components/bookings/SIViewer.tsx components/bookings/DraftBLViewer.tsx components/bookings/BookingActivityFeed.tsx
git commit -m "feat(bookings): wire exporterBl to page, delete SIViewer, DraftBLViewer, BookingActivityFeed"
```

---

## Done ✓

All tasks complete. The booking detail page is now:
- Single-scroll, no tabs
- Alertas immediately after lifecycle strip
- 4 info cards (Partes, Ruta, Referencias, Carga & Logística) + activity log sidebar
- Contenedores unchanged
- Documentos: 4 clickable cards with status badges
- Per-document popup: preview, history, extracted editable fields, delete confirmation, replace flow

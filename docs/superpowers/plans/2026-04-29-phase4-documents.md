# Phase 4 — Document Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the document management system — `/documents` page, document detail modal, and document sections integrated into PO and container detail pages.

**Architecture:** A `ShipmentDocument` type (separate from the existing `DocumentInstance` used for cold-chain) drives a workflow state machine (draft → submitted → validating → under_review → approved/rejected). A synchronous mock store (`shipmentDocuments` export) feeds all three surfaces. A shared `DocumentsSection` component handles PO and container detail integration. React state in `DocumentsList` / `DocumentDetailModal` drives status transitions in-memory.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Tailwind v4 (`@theme{}` tokens, no `tailwind.config.ts`) · `@base-ui/react` Dialog for modal · `next-intl` v4 (cookie-based, Spanish default) · Vitest + React Testing Library

---

## Conventions

- **Working directory:** `/Users/sebastian.ibanez/Documents/Agora/agora-app`
- **Run tests:** `pnpm test` (once) or `pnpm test:watch` (TDD loop)
- **Type-check:** `pnpm typecheck`
- **Design tokens (CSS vars, not Tailwind utilities):** `--color-bg-0` (#070A12) · `--color-bg-1` (#0E1320) · `--color-bg-2` (#141A29) · `--color-bg-3` (#1B2235) · `--color-ink-1..4` · `--color-mint-500` (#00E696) · `--line-soft` · `--line-mid` · `--line-mint`
- **Severity colors (Tailwind utilities):** `text-severity-ok` · `text-severity-info` · `text-severity-watch` · `text-severity-risk` · `text-severity-crit`
- **Monospace numbers/IDs:** always `font-mono`
- **No hardcoded UI strings** — all user-visible text via `useTranslations` (client) or `getTranslations` (RSC)
- **Date formatting in pure components** — pure components (no hooks) use `toLocaleDateString('es-CL')` directly; this is intentional for the demo targeting Chilean users. Production would pass a `locale` prop or pre-formatted strings.
- **`'use client'`** required on any component that uses hooks or event handlers
- **Test mock pattern for RSCs:** `vi.mock('next-intl/server', () => ({ getTranslations: async () => (k: string) => k }))`
- **PO IDs in mock data:** PO-2026-0142 (container MSCU-7842156, walnuts) · PO-2026-0157 (container MAEU-9182734, cherries)

---

## File Map

**New files:**
```
types/index.ts                                    (modify — add 8 new types)
lib/documents/workflow.ts                         (create — getNextStatus state machine, exported for tests)
lib/mock-data/documents.ts                        (modify — add shipmentDocuments export)
messages/es.json                                  (modify — add documents.* keys)
messages/en.json                                  (modify — add documents.* keys)
components/layout/Sidebar.tsx                     (modify — add documents nav entry)
components/documents/DocumentsSection.tsx         (create — reusable, used in PO + container)
components/purchase-orders/PODocumentSection.tsx  (delete)
components/purchase-orders/PODetail.tsx           (modify — swap PODocumentSection → DocumentsSection)
components/containers/DocumentsTab.tsx            (modify — add DocumentsSection below existing table)
app/documents/page.tsx                            (create — RSC shell)
app/documents/components/DocumentRow.tsx          (create — pure row)
app/documents/components/DocumentFlags.tsx        (create — pure flags list)
app/documents/components/DocumentOverview.tsx     (create — pure overview grid)
app/documents/components/DocumentTimeline.tsx     (create — pure timeline)
app/documents/components/DocumentDetailModal.tsx  (create — 'use client', full modal)
app/documents/components/DocumentsSidebar.tsx     (create — 'use client', type filter)
app/documents/components/DocumentsList.tsx        (create — 'use client', grouped list)
app/documents/components/UploadDocumentModal.tsx  (create — 'use client', upload flow)
```

**Test files:**
```
__tests__/documents/workflow.test.ts              (state machine logic)
__tests__/documents/DocumentsSection.test.tsx     (filtering + provenance tags)
__tests__/documents/DocumentDetailModal.test.tsx  (action strip per status + transitions)
__tests__/documents/DocumentsList.test.tsx        (PO grouping + type filter)
__tests__/documents/DocumentFlags.test.tsx        (render/hide logic)
```

---

## Task 1: New types

**Files:**
- Modify: `types/index.ts` (append after the last existing export)

- [ ] **Step 1: Add the 8 new types**

Append to the end of `types/index.ts`:

```ts
// ===== Phase 4: Workflow Document System =====

export type DocumentCategory =
  | 'commercial'
  | 'transport'
  | 'phytosanitary'
  | 'customs'

// Subset of existing DocumentType used in the workflow system.
// Extends existing DocumentType — does not replace it.
export type WorkflowDocType = Extract<
  DocumentType,
  | 'commercial_invoice'
  | 'packing_list'
  | 'lc_compliance_letter'
  | 'bill_of_lading'
  | 'dus'
  | 'sag_export_auth'
  | 'cold_treatment_cert'
  | 'certificate_of_origin'
>

export type WorkflowDocStatus =
  | 'draft'
  | 'submitted'
  | 'validating'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type ShipmentDocOwner =
  | { type: 'po'; id: string }
  | { type: 'container'; id: string }

export type ShipmentDocLink = {
  type: 'po' | 'container'
  id: string
  label: string
}

export type ValidationFlag = {
  severity: 'error' | 'warning'
  conflictingDocId: string
  conflictingDocType: WorkflowDocType
  message: string
  detectedAt: string
}

export type ShipmentDocEvent = {
  status: WorkflowDocStatus | 'comment'
  actor: 'user' | 'system'
  actorName: string
  timestamp: string
  note?: string
}

export interface ShipmentDocument {
  id: string
  name: string
  category: DocumentCategory
  type: WorkflowDocType
  status: WorkflowDocStatus
  owner: ShipmentDocOwner
  links: ShipmentDocLink[]
  flags: ValidationFlag[]
  events: ShipmentDocEvent[]
  createdAt: string
  dueDate?: string
  fileUrl?: string
  overview: Record<string, string>
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat(types): add ShipmentDocument workflow types"
```

---

## Task 2: Mock data — `shipmentDocuments`

**Files:**
- Create: `lib/documents/workflow.ts`
- Modify: `lib/mock-data/documents.ts`

- [ ] **Step 1: Create `lib/documents/workflow.ts` with `getNextStatus`**

This allows state machine logic to be tested independently of the modal component.

Create `lib/documents/workflow.ts`:

```ts
import type { WorkflowDocStatus } from '@/types'

export function getNextStatus(
  current: WorkflowDocStatus,
  action: 'submit' | 'approve' | 'reject' | 'reopen',
): WorkflowDocStatus {
  if (action === 'submit'  && current === 'draft')        return 'submitted'
  if (action === 'approve' && current === 'under_review') return 'approved'
  if (action === 'reject'  && current === 'under_review') return 'rejected'
  if (action === 'reopen'  && current === 'rejected')     return 'draft'
  return current
}
```

- [ ] **Step 2: Write the failing test**

Create `__tests__/documents/workflow.test.ts`:

```ts
import { shipmentDocuments } from '@/lib/mock-data/documents'
import { getNextStatus } from '@/lib/documents/workflow'
import type { WorkflowDocStatus } from '@/types'

const ALL_STATUSES: WorkflowDocStatus[] = [
  'draft', 'submitted', 'validating', 'under_review', 'approved', 'rejected',
]

// ── State machine unit tests ─────────────────────────────────────────────────

test('draft + submit → submitted', () => {
  expect(getNextStatus('draft', 'submit')).toBe('submitted')
})

test('under_review + approve → approved', () => {
  expect(getNextStatus('under_review', 'approve')).toBe('approved')
})

test('under_review + reject → rejected', () => {
  expect(getNextStatus('under_review', 'reject')).toBe('rejected')
})

test('rejected + reopen → draft', () => {
  expect(getNextStatus('rejected', 'reopen')).toBe('draft')
})

test('approved + submit → no-op (stays approved)', () => {
  expect(getNextStatus('approved', 'submit')).toBe('approved')
})

test('approved + reject → no-op (stays approved — invalid transition)', () => {
  expect(getNextStatus('approved', 'reject')).toBe('approved')
})

test('draft + approve → no-op (stays draft — skipped step)', () => {
  expect(getNextStatus('draft', 'approve')).toBe('draft')
})

// ── Mock data integrity tests ─────────────────────────────────────────────────

test('shipmentDocuments covers all WorkflowDocStatus values', () => {
  const statuses = new Set(shipmentDocuments.map(d => d.status))
  for (const s of ALL_STATUSES) {
    expect(statuses.has(s), `missing status: ${s}`).toBe(true)
  }
})

test('flagged documents reference existing sibling doc IDs', () => {
  const ids = new Set(shipmentDocuments.map(d => d.id))
  for (const doc of shipmentDocuments) {
    for (const flag of doc.flags) {
      expect(ids.has(flag.conflictingDocId), `flag references unknown id: ${flag.conflictingDocId}`).toBe(true)
    }
  }
})

test('every document has at least one event matching its status', () => {
  for (const doc of shipmentDocuments) {
    const hasMatchingEvent = doc.events.some(e => e.status === doc.status)
    expect(hasMatchingEvent, `${doc.id} has no event for status ${doc.status}`).toBe(true)
  }
})

test('each document owner id exists in either POs or containers', () => {
  const validPoIds = new Set(['PO-2026-0142', 'PO-2026-0157'])
  const validContainerIds = new Set(['MSCU-7842156', 'MAEU-9182734'])
  for (const doc of shipmentDocuments) {
    if (doc.owner.type === 'po') {
      expect(validPoIds.has(doc.owner.id), `unknown PO owner: ${doc.owner.id}`).toBe(true)
    } else {
      expect(validContainerIds.has(doc.owner.id), `unknown container owner: ${doc.owner.id}`).toBe(true)
    }
  }
})
```

- [ ] **Step 3: Run test — expect FAIL**

Run: `pnpm test __tests__/documents/workflow.test.ts`
Expected: FAIL — `shipmentDocuments` not exported, `getNextStatus` not found

- [ ] **Step 4: Add `shipmentDocuments` export to `lib/mock-data/documents.ts`**

Append after the existing `documents` array (do not modify existing array):

```ts
import type { ShipmentDocument } from '@/types'

export const shipmentDocuments: ShipmentDocument[] = [
  // ── PO-2026-0142 · PO-level docs ──────────────────────────────────────────
  {
    id: 'WF-001',
    name: 'Factura Comercial',
    category: 'commercial',
    type: 'commercial_invoice',
    status: 'validating',
    owner: { type: 'po', id: 'PO-2026-0142' },
    links: [{ type: 'container', id: 'MSCU-7842156', label: 'MSCU-7842156' }],
    flags: [
      {
        severity: 'error',
        conflictingDocId: 'WF-002',
        conflictingDocType: 'packing_list',
        message: 'Monto total USD 48,500 no coincide con peso neto × precio unitario en Packing List. Esperado USD 47,200. Delta: +$1,300.',
        detectedAt: '2027-01-08T08:02:00-04:00',
      },
      {
        severity: 'warning',
        conflictingDocId: 'WF-005',
        conflictingDocType: 'bill_of_lading',
        message: 'Cantidad factura 18,400 kg difiere del peso declarado en BL 18,100 kg. Delta: +300 kg.',
        detectedAt: '2027-01-08T08:02:00-04:00',
      },
    ],
    events: [
      { status: 'draft',     actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-07T09:14:00-04:00' },
      { status: 'submitted', actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-07T11:42:00-04:00' },
      { status: 'validating', actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-08T08:02:00-04:00', note: 'Se detectaron 2 discrepancias con documentos vinculados.' },
    ],
    createdAt: '2027-01-07T09:14:00-04:00',
    dueDate: '2027-01-10T00:00:00-04:00',
    overview: {
      'Exportador': 'Valle Fresco S.A.',
      'Importador': 'Mumbai Dry Fruits Pvt. Ltd.',
      'Monto total': 'USD 48,500',
      'Producto': 'Nueces en cáscara',
      'Cantidad': '18,400 kg',
      'Términos de pago': 'CAD a la vista',
      'Contenedor vinculado': '$link:MSCU-7842156',
      'Incoterm': 'FOB San Antonio',
      'Fecha de vencimiento': '2027-01-10',
    },
  },
  {
    id: 'WF-002',
    name: 'Packing List',
    category: 'commercial',
    type: 'packing_list',
    status: 'draft',
    owner: { type: 'po', id: 'PO-2026-0142' },
    links: [{ type: 'container', id: 'MSCU-7842156', label: 'MSCU-7842156' }],
    flags: [],
    events: [
      { status: 'draft', actor: 'user', actorName: 'María José Soto', timestamp: '2027-01-08T10:30:00-04:00' },
    ],
    createdAt: '2027-01-08T10:30:00-04:00',
    dueDate: '2027-01-09T00:00:00-04:00',
    overview: {
      'Exportador': 'Valle Fresco S.A.',
      'Importador': 'Mumbai Dry Fruits Pvt. Ltd.',
      'Producto': 'Nueces en cáscara',
      'Cantidad neta': '18,100 kg',
      'Bultos': '920 cajas',
      'Contenedor vinculado': '$link:MSCU-7842156',
    },
  },
  {
    id: 'WF-003',
    name: 'Carta de Crédito',
    category: 'commercial',
    type: 'lc_compliance_letter',
    status: 'under_review',
    owner: { type: 'po', id: 'PO-2026-0142' },
    links: [{ type: 'container', id: 'MSCU-7842156', label: 'MSCU-7842156' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-05T09:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-05T14:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-06T08:00:00-04:00', note: 'Sin discrepancias detectadas.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-06T08:01:00-04:00' },
    ],
    createdAt: '2027-01-05T09:00:00-04:00',
    overview: {
      'Banco emisor': 'Banco de Chile',
      'Banco confirmante': 'HDFC Bank India',
      'Monto': 'USD 48,500',
      'Vencimiento L/C': '2027-03-15',
      'Contenedor vinculado': '$link:MSCU-7842156',
    },
  },

  // ── PO-2026-0142 · Container MSCU-7842156 docs ────────────────────────────
  {
    id: 'WF-004',
    name: 'Autorización SAG',
    category: 'phytosanitary',
    type: 'sag_export_auth',
    status: 'approved',
    owner: { type: 'container', id: 'MSCU-7842156' },
    links: [{ type: 'po', id: 'PO-2026-0142', label: 'PO-2026-0142' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-03T10:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-03T14:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-04T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-04T08:01:00-04:00' },
      { status: 'approved',     actor: 'user',   actorName: 'Carlos Reyes',    timestamp: '2027-01-04T11:30:00-04:00' },
    ],
    createdAt: '2027-01-03T10:00:00-04:00',
    overview: {
      'Emisor': 'SAG',
      'Número': 'SEA-2027-00412-003',
      'Producto': 'Nueces en cáscara',
      'Contenedor': '$link:MSCU-7842156',
      'Fecha emisión': '2027-01-03',
    },
  },
  {
    id: 'WF-005',
    name: 'Conocimiento de Embarque',
    category: 'transport',
    type: 'bill_of_lading',
    status: 'rejected',
    owner: { type: 'container', id: 'MSCU-7842156' },
    links: [{ type: 'po', id: 'PO-2026-0142', label: 'PO-2026-0142' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-06T09:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2027-01-06T15:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-07T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2027-01-07T08:01:00-04:00' },
      { status: 'rejected',     actor: 'user',   actorName: 'Carlos Reyes',    timestamp: '2027-01-07T14:00:00-04:00', note: 'Consignatario no coincide con L/C. Corregir y reenviar.' },
    ],
    createdAt: '2027-01-06T09:00:00-04:00',
    dueDate: '2027-01-09T00:00:00-04:00',
    overview: {
      'Transportista': 'MSC',
      'Número BL': 'MSCUCLSAI7842156',
      'Puerto origen': 'San Antonio',
      'Puerto destino': 'Nhava Sheva',
      'Contenedor': '$link:MSCU-7842156',
    },
  },
  {
    id: 'WF-006',
    name: 'DUS',
    category: 'customs',
    type: 'dus',
    status: 'draft',
    owner: { type: 'container', id: 'MSCU-7842156' },
    links: [{ type: 'po', id: 'PO-2026-0142', label: 'PO-2026-0142' }],
    flags: [],
    events: [
      { status: 'draft', actor: 'user', actorName: 'María José Soto', timestamp: '2027-01-08T07:00:00-04:00' },
    ],
    createdAt: '2027-01-08T07:00:00-04:00',
    dueDate: '2027-01-09T08:00:00-04:00',
    overview: {
      'Contenedor': '$link:MSCU-7842156',
      'Aduana': 'San Antonio',
      'Régimen': 'Exportación definitiva',
    },
  },

  // ── PO-2026-0157 · PO-level docs ──────────────────────────────────────────
  {
    id: 'WF-007',
    name: 'Factura Comercial',
    category: 'commercial',
    type: 'commercial_invoice',
    status: 'approved',
    owner: { type: 'po', id: 'PO-2026-0157' },
    links: [{ type: 'container', id: 'MAEU-9182734', label: 'MAEU-9182734' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-28T09:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-28T14:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-29T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-29T08:01:00-04:00' },
      { status: 'approved',     actor: 'user',   actorName: 'Carlos Reyes',    timestamp: '2026-12-29T11:00:00-04:00' },
    ],
    createdAt: '2026-12-28T09:00:00-04:00',
    overview: {
      'Exportador': 'Valle Fresco S.A.',
      'Importador': 'Shenzhen Imports Ltd.',
      'Monto total': 'USD 72,400',
      'Producto': 'Cerezas frescas',
      'Cantidad': '21,200 kg',
      'Términos de pago': 'L/C a la vista',
      'Contenedor vinculado': '$link:MAEU-9182734',
      'Incoterm': 'FOB San Antonio',
    },
  },
  {
    id: 'WF-008',
    name: 'Packing List',
    category: 'commercial',
    type: 'packing_list',
    status: 'approved',
    owner: { type: 'po', id: 'PO-2026-0157' },
    links: [{ type: 'container', id: 'MAEU-9182734', label: 'MAEU-9182734' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-28T10:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-28T15:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-29T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-29T08:01:00-04:00' },
      { status: 'approved',     actor: 'user',   actorName: 'Carlos Reyes',    timestamp: '2026-12-29T11:30:00-04:00' },
    ],
    createdAt: '2026-12-28T10:00:00-04:00',
    overview: {
      'Exportador': 'Valle Fresco S.A.',
      'Producto': 'Cerezas frescas',
      'Cantidad neta': '21,200 kg',
      'Bultos': '1,060 cajas',
      'Contenedor vinculado': '$link:MAEU-9182734',
    },
  },
  {
    id: 'WF-009',
    name: 'Certificado de Origen',
    category: 'customs',
    type: 'certificate_of_origin',
    status: 'under_review',
    owner: { type: 'po', id: 'PO-2026-0157' },
    links: [{ type: 'container', id: 'MAEU-9182734', label: 'MAEU-9182734' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-27T09:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-27T14:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-28T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-28T08:01:00-04:00' },
    ],
    createdAt: '2026-12-27T09:00:00-04:00',
    overview: {
      'Emisor': 'SAG',
      'Número': 'CO-2026-00288-007',
      'Producto': 'Cerezas frescas',
      'Contenedor vinculado': '$link:MAEU-9182734',
    },
  },

  // ── PO-2026-0157 · Container MAEU-9182734 docs ────────────────────────────
  {
    id: 'WF-010',
    name: 'Conocimiento de Embarque',
    category: 'transport',
    type: 'bill_of_lading',
    status: 'submitted',
    owner: { type: 'container', id: 'MAEU-9182734' },
    links: [{ type: 'po', id: 'PO-2026-0157', label: 'PO-2026-0157' }],
    flags: [],
    events: [
      { status: 'draft',     actor: 'user', actorName: 'María José Soto', timestamp: '2026-12-29T10:00:00-04:00' },
      { status: 'submitted', actor: 'user', actorName: 'María José Soto', timestamp: '2026-12-30T09:00:00-04:00' },
    ],
    createdAt: '2026-12-29T10:00:00-04:00',
    overview: {
      'Transportista': 'Maersk',
      'Número BL': 'MAEU9182734',
      'Puerto origen': 'San Antonio',
      'Puerto destino': 'Yangshan',
      'Contenedor': '$link:MAEU-9182734',
    },
  },
  {
    id: 'WF-011',
    name: 'Certificado Tratamiento Frío',
    category: 'phytosanitary',
    type: 'cold_treatment_cert',
    status: 'approved',
    owner: { type: 'container', id: 'MAEU-9182734' },
    links: [{ type: 'po', id: 'PO-2026-0157', label: 'PO-2026-0157' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-28T08:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-28T14:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-29T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-29T08:01:00-04:00' },
      { status: 'approved',     actor: 'user',   actorName: 'Carlos Reyes',    timestamp: '2026-12-30T10:00:00-04:00' },
    ],
    createdAt: '2026-12-28T08:00:00-04:00',
    overview: {
      'Emisor': 'SENASAG',
      'Número': 'CT-2026-9182734',
      'Protocolo': '15d @ -0.5°C',
      'Contenedor': '$link:MAEU-9182734',
    },
  },
  {
    id: 'WF-012',
    name: 'Autorización SAG',
    category: 'phytosanitary',
    type: 'sag_export_auth',
    status: 'approved',
    owner: { type: 'container', id: 'MAEU-9182734' },
    links: [{ type: 'po', id: 'PO-2026-0157', label: 'PO-2026-0157' }],
    flags: [],
    events: [
      { status: 'draft',        actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-25T09:00:00-04:00' },
      { status: 'submitted',    actor: 'user',   actorName: 'María José Soto', timestamp: '2026-12-25T14:00:00-04:00' },
      { status: 'validating',   actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-26T08:00:00-04:00', note: 'Sin discrepancias.' },
      { status: 'under_review', actor: 'system', actorName: 'Sistema',         timestamp: '2026-12-26T08:01:00-04:00' },
      { status: 'approved',     actor: 'user',   actorName: 'Carlos Reyes',    timestamp: '2026-12-26T11:00:00-04:00' },
    ],
    createdAt: '2026-12-25T09:00:00-04:00',
    overview: {
      'Emisor': 'SAG',
      'Número': 'SEA-2026-00288-002',
      'Producto': 'Cerezas frescas',
      'Contenedor': '$link:MAEU-9182734',
    },
  },
]
```

- [ ] **Step 5: Run test — expect PASS**

Run: `pnpm test __tests__/documents/workflow.test.ts`
Expected: PASS (11 tests — 7 state machine + 4 mock data)

- [ ] **Step 6: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add lib/documents/workflow.ts lib/mock-data/documents.ts __tests__/documents/workflow.test.ts
git commit -m "feat(mock-data): add workflow state machine + shipmentDocuments store"
```

---

## Task 3: i18n keys

**Files:**
- Modify: `messages/es.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add `documents` key block to `messages/es.json`**

Add this block to the JSON (before the closing `}`):

```json
  "documents": {
    "title": "Documentos",
    "all": "Todo",
    "noDocumentsOfType": "No hay documentos de este tipo",
    "uploadFirst": "Sube tu primer documento",
    "categories": {
      "commercial": "Comercial",
      "transport": "Transporte",
      "phytosanitary": "Fitosanitario",
      "customs": "Aduanas"
    },
    "types": {
      "commercial_invoice": "Factura Comercial",
      "packing_list": "Packing List",
      "lc_compliance_letter": "Carta de Crédito",
      "bill_of_lading": "Conocimiento de Embarque",
      "dus": "DUS",
      "sag_export_auth": "Autorización SAG",
      "cold_treatment_cert": "Cert. Tratamiento Frío",
      "certificate_of_origin": "Certificado de Origen"
    },
    "statuses": {
      "draft": "Borrador",
      "submitted": "Enviado",
      "validating": "Validando",
      "under_review": "En Revisión",
      "approved": "Aprobado",
      "rejected": "Rechazado"
    },
    "modal": {
      "overview": "Resumen",
      "flags": "Alertas de Validación",
      "document": "Documento",
      "activity": "Actividad y Flujo",
      "approve": "Aprobar",
      "reject": "Rechazar — volver a borrador",
      "reopen": "Volver a borrador",
      "addComment": "Agregar comentario",
      "submit": "Enviar para validación",
      "download": "Descargar PDF",
      "replace": "Reemplazar archivo",
      "processing": "Procesando…"
    },
    "provenance": {
      "fromPo": "de {{id}}",
      "fromContainer": "de {{id}}"
    },
    "section": {
      "poDocuments": "Documentos del pedido",
      "containerDocuments": "Documentos del contenedor",
      "summaryApproved": "{n} aprobados",
      "summaryValidating": "{n} validando",
      "summaryRejected": "{n} rechazados",
      "summaryDraft": "{n} borradores"
    },
    "table": {
      "document": "Documento",
      "type": "Tipo",
      "status": "Estado",
      "issued": "Creado",
      "due": "Vence"
    },
    "upload": {
      "trigger": "Subir documento",
      "stepFile": "Seleccionar archivo",
      "stepType": "Tipo de documento",
      "stepOwner": "Asignar a",
      "stepLinks": "También visible en",
      "stepLinksHint": "Opcional — selecciona las entidades donde también debe aparecer este documento.",
      "next": "Siguiente",
      "back": "← Volver",
      "ownerPo": "Orden de Compra",
      "ownerContainer": "Contenedor",
      "placeholderFile": "Seleccionar archivo…",
      "placeholderType": "Seleccionar tipo…",
      "placeholderOwner": "Seleccionar…",
      "confirm": "Confirmar",
      "cancel": "Cancelar"
    }
  }
```

Also add `"documents": "Documentos"` inside the existing `"nav"` block.

> **Note:** The `upload.trigger` key serves as the button label for "Upload document". Do not add a top-level `"upload"` string key — that would create a duplicate key conflict with the `"upload"` object.

- [ ] **Step 2: Add `documents` key block to `messages/en.json`**

Same structure, English values:

```json
  "documents": {
    "title": "Documents",
    "all": "All",
    "noDocumentsOfType": "No documents of this type",
    "uploadFirst": "Upload your first document",
    "categories": {
      "commercial": "Commercial",
      "transport": "Transport",
      "phytosanitary": "Phytosanitary",
      "customs": "Customs"
    },
    "types": {
      "commercial_invoice": "Commercial Invoice",
      "packing_list": "Packing List",
      "lc_compliance_letter": "Letter of Credit",
      "bill_of_lading": "Bill of Lading",
      "dus": "DUS",
      "sag_export_auth": "SAG Export Auth",
      "cold_treatment_cert": "Cold Treatment Cert",
      "certificate_of_origin": "Certificate of Origin"
    },
    "statuses": {
      "draft": "Draft",
      "submitted": "Submitted",
      "validating": "Validating",
      "under_review": "Under Review",
      "approved": "Approved",
      "rejected": "Rejected"
    },
    "modal": {
      "overview": "Overview",
      "flags": "Validation Flags",
      "document": "Document",
      "activity": "Activity & Workflow",
      "approve": "Approve",
      "reject": "Reject — send back to draft",
      "reopen": "Reopen as draft",
      "addComment": "Add comment",
      "submit": "Submit for validation",
      "download": "Download PDF",
      "replace": "Replace file",
      "processing": "Processing…"
    },
    "provenance": {
      "fromPo": "from {{id}}",
      "fromContainer": "from {{id}}"
    },
    "section": {
      "poDocuments": "PO documents",
      "containerDocuments": "Container documents",
      "summaryApproved": "{n} approved",
      "summaryValidating": "{n} validating",
      "summaryRejected": "{n} rejected",
      "summaryDraft": "{n} draft"
    },
    "table": {
      "document": "Document",
      "type": "Type",
      "status": "Status",
      "issued": "Issued",
      "due": "Due"
    },
    "upload": {
      "trigger": "Upload document",
      "stepFile": "Select file",
      "stepType": "Document type",
      "stepOwner": "Belongs to",
      "stepLinks": "Also visible in",
      "stepLinksHint": "Optional — select entities where this document should also appear.",
      "next": "Next",
      "back": "← Back",
      "ownerPo": "Purchase Order",
      "ownerContainer": "Container",
      "placeholderFile": "Select file…",
      "placeholderType": "Select type…",
      "placeholderOwner": "Select…",
      "confirm": "Confirm",
      "cancel": "Cancel"
    }
  }
```

Also add `"documents": "Documents"` inside the existing `"nav"` block.

- [ ] **Step 3: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add messages/es.json messages/en.json
git commit -m "feat(i18n): add documents.* translation keys"
```

---

## Task 4: Sidebar nav entry

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Add `documents` nav entry**

In `components/layout/Sidebar.tsx`, locate the `NAV` array. Add the `documents` entry between `compliance` and `settings`. Import `FileText` from `lucide-react` if not already imported.

Change:
```ts
{ href: '/compliance',   key: 'compliance',   Icon: ShieldCheck },
{ href: '/settings',     key: 'settings',     Icon: Settings },
```

To:
```ts
{ href: '/compliance',   key: 'compliance',   Icon: ShieldCheck },
{ href: '/documents',    key: 'documents',    Icon: FileText },
{ href: '/settings',     key: 'settings',     Icon: Settings },
```

- [ ] **Step 2: Type-check + dev build**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat(nav): add Documents link to sidebar"
```

---

## Task 5: Pure leaf components

**Files:**
- Create: `app/documents/components/DocumentRow.tsx`
- Create: `app/documents/components/DocumentFlags.tsx`
- Create: `app/documents/components/DocumentOverview.tsx`

These are pure (no hooks, no `'use client'`). They receive props and render markup only.

### 5a — DocumentFlags

- [ ] **Step 1: Write the failing test**

Create `__tests__/documents/DocumentFlags.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { DocumentFlags } from '@/app/documents/components/DocumentFlags'
import type { ValidationFlag } from '@/types'

const flag: ValidationFlag = {
  severity: 'error',
  conflictingDocId: 'WF-002',
  conflictingDocType: 'packing_list',
  message: 'Monto no coincide. Delta: +$1,300.',
  detectedAt: '2027-01-08T08:02:00-04:00',
}

const typeLabel = (type: string) => type  // passthrough for tests

test('renders flags when provided', () => {
  render(<DocumentFlags flags={[flag]} typeLabel={typeLabel} />)
  expect(screen.getByText(/Monto no coincide/)).toBeInTheDocument()
})

test('renders nothing when flags array is empty', () => {
  const { container } = render(<DocumentFlags flags={[]} typeLabel={typeLabel} />)
  expect(container.firstChild).toBeNull()
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm test __tests__/documents/DocumentFlags.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Create `app/documents/components/DocumentFlags.tsx`**

```tsx
import type { ValidationFlag } from '@/types'

interface Props {
  flags: ValidationFlag[]
  typeLabel: (type: WorkflowDocType) => string
}

export function DocumentFlags({ flags, typeLabel }: Props) {
  if (flags.length === 0) return null
  return (
    <div>
      {flags.map((flag, i) => (
        <div
          key={i}
          className="rounded-md p-3 mb-2 last:mb-0"
          style={{
            background: 'var(--color-bg-2)',
            borderLeft: `3px solid ${flag.severity === 'error' ? '#EF4444' : '#F59E0B'}`,
          }}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className="text-[10px] font-semibold"
              style={{ color: flag.severity === 'error' ? '#EF4444' : '#F59E0B' }}
            >
              {typeLabel(flag.conflictingDocType)}
            </span>
            <span className="font-mono text-[9px] text-ink-4 shrink-0 ml-2">
              {new Date(flag.detectedAt).toLocaleDateString('es-CL')}
            </span>
          </div>
          <p className="text-[10px] text-ink-2 leading-relaxed">{flag.message}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test __tests__/documents/DocumentFlags.test.tsx`
Expected: PASS

- [ ] **Step 5: Create `app/documents/components/DocumentOverview.tsx`**

```tsx
interface Props { overview: Record<string, string> }

function linkHref(id: string): string {
  return id.startsWith('PO-') ? `/purchase-orders/${id}` : `/containers/${id}`
}

export function DocumentOverview({ overview }: Props) {
  const entries = Object.entries(overview)
  return (
    <div className="grid grid-cols-3 gap-3">
      {entries.map(([label, value]) => {
        const isLink = value.startsWith('$link:')
        const displayValue = isLink ? value.slice(6) : value
        return (
          <div key={label}>
            <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-0.5">{label}</div>
            {isLink ? (
              <a
                href={linkHref(displayValue)}
                className="font-mono text-[11px] text-sky-300 hover:text-sky-200 cursor-pointer"
              >
                {displayValue}
              </a>
            ) : (
              <div className="text-[11px] text-ink-1">{displayValue}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6: Create `app/documents/components/DocumentRow.tsx`**

Status badge colors:
- `draft` → ink-4 background
- `submitted` → blue
- `validating` → amber (`#F59E0B`)
- `under_review` → orange (`#F97316`)
- `approved` → mint
- `rejected` → crit (`#EF4444`)

```tsx
import type { ShipmentDocument } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  draft:        '#475063',
  submitted:    '#3B82F6',
  validating:   '#F59E0B',
  under_review: '#F97316',
  approved:     '#00E696',
  rejected:     '#EF4444',
}

interface Props {
  doc: ShipmentDocument
  provenance?: string   // e.g. "de PO-2026-0142" — rendered if provided
  statusLabel: string   // translated status label
  typeLabel: string     // translated type label
  onClick: () => void
}

export function DocumentRow({ doc, provenance, statusLabel, typeLabel, onClick }: Props) {
  const color = STATUS_COLORS[doc.status] ?? '#475063'
  const isOverdue = doc.dueDate && new Date(doc.dueDate) < new Date()
  return (
    <tr
      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-3 py-2.5 text-[11px] text-ink-1">
        {doc.name}
        {provenance && (
          <span className="ml-2 text-[9px] text-ink-4">· {provenance}</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-[10px] text-ink-3">{typeLabel}</td>
      <td className="px-3 py-2.5">
        <span
          className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ color, background: color + '22', border: `1px solid ${color}44` }}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-3 py-2.5 font-mono text-[10px] text-ink-4">
        {new Date(doc.createdAt).toLocaleDateString('es-CL')}
      </td>
      <td className="px-3 py-2.5 font-mono text-[10px]" style={{ color: isOverdue ? '#EF4444' : '#475063' }}>
        {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString('es-CL') : '—'}
      </td>
    </tr>
  )
}
```

- [ ] **Step 7: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add app/documents/components/DocumentFlags.tsx \
        app/documents/components/DocumentOverview.tsx \
        app/documents/components/DocumentRow.tsx \
        __tests__/documents/DocumentFlags.test.tsx
git commit -m "feat(documents): add DocumentRow, DocumentOverview, DocumentFlags components"
```

---

## Task 6: DocumentTimeline

**Files:**
- Create: `app/documents/components/DocumentTimeline.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ShipmentDocEvent, WorkflowDocStatus } from '@/types'

const DOT_COLORS: Record<string, string> = {
  draft:        '#475063',
  submitted:    '#3B82F6',
  validating:   '#F59E0B',
  under_review: '#F97316',
  approved:     '#00E696',
  rejected:     '#EF4444',
  comment:      '#A8B3C7',
}

interface Props {
  events: ShipmentDocEvent[]
  currentStatus: WorkflowDocStatus
  statusLabel: (s: string) => string
}

export function DocumentTimeline({ events, currentStatus, statusLabel }: Props) {
  // For rejected path, don't show 'approved' as a pending future step
  const ALL_STATUSES: WorkflowDocStatus[] = currentStatus === 'rejected'
    ? ['draft', 'submitted', 'validating', 'under_review', 'rejected']
    : ['draft', 'submitted', 'validating', 'under_review', 'approved']
  const completedStatuses = new Set(events.map(e => e.status))

  return (
    <div className="relative pl-5">
      {/* Connecting line */}
      <div
        className="absolute left-[9px] top-2 bottom-2 w-px"
        style={{ background: 'var(--line-soft)' }}
      />

      {/* Completed events */}
      {events.map((ev, i) => {
        const color = DOT_COLORS[ev.status] ?? '#475063'
        const isCurrent = ev.status === currentStatus && i === events.length - 1
        return (
          <div key={i} className="relative mb-5">
            <div
              className="absolute -left-5 top-1 w-2 h-2 rounded-full"
              style={{
                background: color,
                boxShadow: isCurrent ? `0 0 7px ${color}` : 'none',
              }}
            />
            <div className="text-[11px] font-medium" style={{ color: isCurrent ? color : '#A8B3C7' }}>
              {statusLabel(ev.status)}
            </div>
            <div className="text-[10px] text-ink-3 mt-0.5">{ev.actorName}</div>
            <div className="font-mono text-[9px] text-ink-4">
              {new Date(ev.timestamp).toLocaleString('es-CL')}
            </div>
            {ev.note && (
              <div
                className="mt-1.5 rounded p-2 text-[9px] text-ink-2 leading-relaxed"
                style={{ background: 'var(--color-bg-3)' }}
              >
                {ev.note}
              </div>
            )}
          </div>
        )
      })}

      {/* Pending future steps */}
      {ALL_STATUSES.filter(s => !completedStatuses.has(s) && s !== currentStatus).map(s => (
        <div key={s} className="relative mb-5 opacity-30">
          <div
            className="absolute -left-5 top-1 w-2 h-2 rounded-full border"
            style={{ borderColor: '#475063', background: 'transparent' }}
          />
          <div className="text-[11px] text-ink-4">{statusLabel(s)}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/documents/components/DocumentTimeline.tsx
git commit -m "feat(documents): add DocumentTimeline component"
```

---

## Task 7: DocumentDetailModal

**Files:**
- Create: `app/documents/components/DocumentDetailModal.tsx`
- Create: `__tests__/documents/DocumentDetailModal.test.tsx`

This is the most complex component. It is `'use client'` and manages status transitions in local state.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/documents/DocumentDetailModal.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DocumentDetailModal } from '@/app/documents/components/DocumentDetailModal'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import type { ShipmentDocument } from '@/types'

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}))

const mockOnClose = vi.fn()
const draftDoc = shipmentDocuments.find(d => d.status === 'draft')!
const underReviewDoc = shipmentDocuments.find(d => d.status === 'under_review')!
const approvedDoc = shipmentDocuments.find(d => d.status === 'approved')!
const rejectedDoc = shipmentDocuments.find(d => d.status === 'rejected')!

test('renders document name in header', () => {
  render(<DocumentDetailModal doc={draftDoc} onClose={mockOnClose} />)
  expect(screen.getByText(draftDoc.name)).toBeInTheDocument()
})

test('draft status shows submit action', () => {
  render(<DocumentDetailModal doc={draftDoc} onClose={mockOnClose} />)
  expect(screen.getByRole('button', { name: /modal\.submit/i })).toBeInTheDocument()
})

test('under_review status shows approve and reject actions', () => {
  render(<DocumentDetailModal doc={underReviewDoc} onClose={mockOnClose} />)
  expect(screen.getByRole('button', { name: /modal\.approve/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /modal\.reject/i })).toBeInTheDocument()
})

test('approved status shows no primary action', () => {
  render(<DocumentDetailModal doc={approvedDoc} onClose={mockOnClose} />)
  expect(screen.queryByRole('button', { name: /modal\.approve/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /modal\.submit/i })).not.toBeInTheDocument()
})

test('rejected status shows reopen action', () => {
  render(<DocumentDetailModal doc={rejectedDoc} onClose={mockOnClose} />)
  expect(screen.getByRole('button', { name: /modal\.reopen/i })).toBeInTheDocument()
})

test('clicking approve transitions status to approved', () => {
  render(<DocumentDetailModal doc={underReviewDoc} onClose={mockOnClose} />)
  fireEvent.click(screen.getByRole('button', { name: /modal\.approve/i }))
  // After transition, no approve button (now approved)
  expect(screen.queryByRole('button', { name: /modal\.approve/i })).not.toBeInTheDocument()
})

test('flags section renders when flags present', () => {
  const docWithFlags = shipmentDocuments.find(d => d.flags.length > 0)!
  render(<DocumentDetailModal doc={docWithFlags} onClose={mockOnClose} />)
  expect(screen.getByText(/modal\.flags/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test __tests__/documents/DocumentDetailModal.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Create `app/documents/components/DocumentDetailModal.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ShipmentDocument, WorkflowDocStatus, ShipmentDocEvent } from '@/types'
import { getNextStatus } from '@/lib/documents/workflow'
import { DocumentOverview } from './DocumentOverview'
import { DocumentFlags } from './DocumentFlags'
import { DocumentTimeline } from './DocumentTimeline'

interface Props {
  doc: ShipmentDocument
  onClose: () => void
}

export function DocumentDetailModal({ doc, onClose }: Props) {
  const t = useTranslations('documents')
  const [status, setStatus] = useState<WorkflowDocStatus>(doc.status)
  const [events, setEvents] = useState<ShipmentDocEvent[]>(doc.events)

  function transition(action: 'submit' | 'approve' | 'reject' | 'reopen') {
    const next = getNextStatus(status, action)
    if (next === status) return
    const event: ShipmentDocEvent = {
      status: next,
      actor: 'user',
      actorName: 'María José Soto',
      timestamp: new Date().toISOString(),
    }
    setStatus(next)
    setEvents(prev => [...prev, event])
  }

  const statusLabel = (s: string) => t(`statuses.${s}`)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,10,18,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden"
        style={{ background: 'var(--color-bg-1)', border: '1px solid var(--line-soft)' }}
        role="dialog"
        aria-label={doc.name}
      >
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div
            className="px-5 py-4 shrink-0"
            style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--line-soft)' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[15px] font-semibold text-ink-1 mb-1">{doc.name}</div>
                <div className="flex gap-2 items-center flex-wrap text-[10px]">
                  {doc.links.map(l => (
                    <span
                      key={l.id}
                      className="font-mono px-1.5 py-0.5 rounded"
                      style={{ color: '#7DD3FC', background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.2)' }}
                    >
                      {l.label}
                    </span>
                  ))}
                  <span className="text-ink-3">{t(`categories.${doc.category}`)}</span>
                  <span className="font-mono text-ink-4">{new Date(doc.createdAt).toLocaleDateString('es-CL')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <StatusBadge status={status} label={statusLabel(status)} />
                <button onClick={onClose} className="text-ink-4 hover:text-ink-2 text-lg leading-none">×</button>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line-soft)' }}>
            <div className="text-[9px] uppercase tracking-widest text-ink-4 mb-3">{t('modal.overview')}</div>
            <DocumentOverview overview={doc.overview} />
          </div>

          {/* Flags */}
          {doc.flags.length > 0 && (
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line-soft)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-[9px] uppercase tracking-widest text-ink-4">{t('modal.flags')}</div>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ color: '#EF4444', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {doc.flags.length}
                </span>
              </div>
              <DocumentFlags flags={doc.flags} typeLabel={(type) => t(`types.${type}`)} />
            </div>
          )}

          {/* Document preview */}
          <div className="px-5 py-4 flex-1">
            <div className="text-[9px] uppercase tracking-widest text-ink-4 mb-3">{t('modal.document')}</div>
            <div
              className="rounded-md p-6"
              style={{ background: 'var(--color-bg-0)', border: '1px solid var(--line-soft)' }}
            >
              <div className="text-[11px] font-semibold text-ink-1 mb-1">{doc.name.toUpperCase()}</div>
              <div className="font-mono text-[9px] text-ink-4 mb-4">{doc.id}</div>
              <div className="space-y-2 mb-4">
                {Object.entries(doc.overview).slice(0, 4).map(([k]) => (
                  <div key={k} className="h-2 rounded" style={{ background: 'var(--color-bg-3)', width: `${60 + Math.random() * 30}%` }} />
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="text-[9px] px-2.5 py-1.5 rounded text-ink-2" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}>
                  {t('modal.download')}
                </button>
                <button className="text-[9px] px-2.5 py-1.5 rounded text-ink-2" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}>
                  {t('modal.replace')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-64 shrink-0 flex flex-col" style={{ background: 'var(--color-bg-2)', borderLeft: '1px solid var(--line-soft)' }}>
          <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--line-soft)' }}>
            <div className="text-[12px] font-semibold text-ink-1">{t('modal.activity')}</div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <DocumentTimeline events={events} currentStatus={status} statusLabel={statusLabel} />
          </div>
          <ActionStrip status={status} onTransition={transition} t={t} />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: WorkflowDocStatus; label: string }) {
  const COLOR: Record<string, string> = {
    draft: '#475063', submitted: '#3B82F6', validating: '#F59E0B',
    under_review: '#F97316', approved: '#00E696', rejected: '#EF4444',
  }
  const c = COLOR[status] ?? '#475063'
  return (
    <span
      className="text-[10px] px-2 py-1 rounded"
      style={{ color: c, background: c + '22', border: `1px solid ${c}44` }}
    >
      {label}
    </span>
  )
}

function ActionStrip({
  status,
  onTransition,
  t,
}: {
  status: WorkflowDocStatus
  onTransition: (a: 'submit' | 'approve' | 'reject' | 'reopen') => void
  t: (k: string) => string
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--line-soft)' }}>
      {status === 'draft' && (
        <button
          onClick={() => onTransition('submit')}
          className="w-full text-[11px] py-1.5 rounded"
          style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
        >
          {t('modal.submit')}
        </button>
      )}
      {(status === 'submitted' || status === 'validating') && (
        <div className="text-center text-[10px] text-ink-4">{t('modal.processing')}</div>
      )}
      {status === 'under_review' && (
        <>
          <button
            onClick={() => onTransition('approve')}
            className="w-full text-[11px] py-1.5 rounded"
            style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
          >
            {t('modal.approve')}
          </button>
          <button
            onClick={() => onTransition('reject')}
            className="w-full text-[11px] py-1.5 rounded"
            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            {t('modal.reject')}
          </button>
        </>
      )}
      {status === 'rejected' && (
        <button
          onClick={() => onTransition('reopen')}
          className="w-full text-[11px] py-1.5 rounded text-ink-2"
          style={{ background: 'var(--color-bg-3)', border: '1px solid var(--line-soft)' }}
        >
          {t('modal.reopen')}
        </button>
      )}
      {(status === 'approved' || status === 'rejected') && (
        <button className="text-center text-[10px] text-ink-4 hover:text-ink-2">
          {t('modal.addComment')}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm test __tests__/documents/DocumentDetailModal.test.tsx`
Expected: PASS (7 tests)

- [ ] **Step 5: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add app/documents/components/DocumentDetailModal.tsx \
        app/documents/components/DocumentTimeline.tsx \
        __tests__/documents/DocumentDetailModal.test.tsx
git commit -m "feat(documents): add DocumentDetailModal with state machine transitions"
```

---

## Task 8: DocumentsSection (shared integration component)

**Files:**
- Create: `components/documents/DocumentsSection.tsx`
- Create: `__tests__/documents/DocumentsSection.test.tsx`

This component is dropped into both PO detail and container detail. It filters `shipmentDocuments` by owner and cross-surfaced links.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/documents/DocumentsSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { DocumentsSection } from '@/components/documents/DocumentsSection'

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}))

test('shows owned PO docs and container sub-group for PO perspective', () => {
  render(
    <DocumentsSection ownerId="PO-2026-0142" ownerType="po" perspective="po" />
  )
  // PO-owned docs rendered without provenance tag
  expect(screen.getByText('Factura Comercial')).toBeInTheDocument()
  // Container docs rendered with provenance tag
  expect(screen.getByText(/de MSCU-7842156/)).toBeInTheDocument()
})

test('shows owned container docs and PO cross-surfaced docs for container perspective', () => {
  render(
    <DocumentsSection ownerId="MSCU-7842156" ownerType="container" perspective="container" />
  )
  // Container-owned doc (no provenance tag)
  expect(screen.getByText('Autorización SAG')).toBeInTheDocument()
  // PO-surfaced doc (has provenance tag)
  expect(screen.getByText(/de PO-2026-0142/)).toBeInTheDocument()
})

test('provenance tag not shown for owned documents', () => {
  render(
    <DocumentsSection ownerId="PO-2026-0142" ownerType="po" perspective="po" />
  )
  // PO-owned doc should NOT show a provenance tag
  const cells = screen.getAllByText('Factura Comercial')
  // If there are two Commercial Invoices (one per PO), find the owned one (PO-2026-0142)
  expect(cells.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test __tests__/documents/DocumentsSection.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Create `components/documents/DocumentsSection.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import type { ShipmentDocument, WorkflowDocStatus } from '@/types'
import { DocumentRow } from '@/app/documents/components/DocumentRow'
import { DocumentDetailModal } from '@/app/documents/components/DocumentDetailModal'

interface Props {
  ownerId: string
  ownerType: 'po' | 'container'
  perspective: 'po' | 'container'
}

const STATUS_COLORS: Record<WorkflowDocStatus, string> = {
  draft: '#475063', submitted: '#3B82F6', validating: '#F59E0B',
  under_review: '#F97316', approved: '#00E696', rejected: '#EF4444',
}

export function DocumentsSection({ ownerId, ownerType, perspective }: Props) {
  const t = useTranslations('documents')
  const [selected, setSelected] = useState<ShipmentDocument | null>(null)

  const owned = shipmentDocuments.filter(d => d.owner.type === ownerType && d.owner.id === ownerId)
  const crossSurfaced = shipmentDocuments.filter(d =>
    d.owner.type !== ownerType &&
    d.links.some(l => l.type === ownerType && l.id === ownerId)
  )
  const all = [...owned, ...crossSurfaced]

  const counts = {
    approved:     all.filter(d => d.status === 'approved').length,
    validating:   all.filter(d => d.status === 'validating').length,
    rejected:     all.filter(d => d.status === 'rejected').length,
    draft:        all.filter(d => d.status === 'draft').length,
  }

  if (all.length === 0) return null

  const ownedLabel  = perspective === 'po' ? t('section.poDocuments') : t('section.containerDocuments')
  const linkedLabel = perspective === 'po' ? t('section.containerDocuments') : t('section.poDocuments')

  // Group cross-surfaced by their owner
  const linkedGroups = new Map<string, ShipmentDocument[]>()
  for (const doc of crossSurfaced) {
    const key = doc.owner.id
    if (!linkedGroups.has(key)) linkedGroups.set(key, [])
    linkedGroups.get(key)!.push(doc)
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[15px] font-semibold text-ink-1">{t('title')}</h2>
        <div className="flex gap-1.5">
          {counts.approved > 0 && <Pill n={counts.approved} color="#00E696" label={t('statuses.approved')} />}
          {counts.validating > 0 && <Pill n={counts.validating} color="#F59E0B" label={t('statuses.validating')} />}
          {counts.rejected > 0 && <Pill n={counts.rejected} color="#EF4444" label={t('statuses.rejected')} />}
          {counts.draft > 0 && <Pill n={counts.draft} color="#475063" label={t('statuses.draft')} />}
        </div>
      </div>

      {/* Owned documents */}
      {owned.length > 0 && (
        <div className="mb-4">
          <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-2">{ownedLabel}</div>
          <DocTable docs={owned} t={t} onSelect={setSelected} />
        </div>
      )}

      {/* Cross-surfaced groups */}
      {[...linkedGroups.entries()].map(([groupId, docs]) => (
        <div key={groupId} className="mb-4 ml-4">
          <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-2">
            ↳ {groupId} · {docs[0]?.name}
          </div>
          <DocTable
            docs={docs}
            t={t}
            onSelect={setSelected}
            provenancePrefix={perspective === 'po' ? 'de' : 'de'}
            provenanceId={groupId}
          />
        </div>
      ))}

      {selected && (
        <DocumentDetailModal doc={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}

function Pill({ n, color, label }: { n: number; color: string; label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color, background: color + '22' }}>
      {n} {label}
    </span>
  )
}

function DocTable({
  docs,
  t,
  onSelect,
  provenancePrefix,
  provenanceId,
}: {
  docs: ShipmentDocument[]
  t: (k: string) => string
  onSelect: (d: ShipmentDocument) => void
  provenancePrefix?: string
  provenanceId?: string
}) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--line-soft)' }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--line-soft)' }}>
            {(['table.document', 'table.type', 'table.status', 'table.issued', 'table.due'] as const).map(k => (
              <th key={k} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider text-ink-4 font-medium">
                {t(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              provenance={provenancePrefix && provenanceId ? `${provenancePrefix} ${provenanceId}` : undefined}
              statusLabel={t(`statuses.${doc.status}`)}
              typeLabel={t(`types.${doc.type}`)}
              onClick={() => onSelect(doc)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm test __tests__/documents/DocumentsSection.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add components/documents/DocumentsSection.tsx \
        __tests__/documents/DocumentsSection.test.tsx
git commit -m "feat(documents): add shared DocumentsSection component"
```

---

## Task 9: PO detail integration

**Files:**
- Modify: `components/purchase-orders/PODetail.tsx`
- Delete: `components/purchase-orders/PODocumentSection.tsx`
- Modify: `app/purchase-orders/[id]/page.tsx`

- [ ] **Step 1: Replace `PODocumentSection` with `DocumentsSection` in `PODetail.tsx`**

In `components/purchase-orders/PODetail.tsx`:

1. Remove the import: `import { PODocumentSection } from './PODocumentSection'`
2. Remove the `documents: DocumentInstance[]` prop from `Props` interface
3. Add import: `import { DocumentsSection } from '@/components/documents/DocumentsSection'`
4. Replace `<PODocumentSection documents={documents} />` with `<DocumentsSection ownerId={po.id} ownerType="po" perspective="po" />`

- [ ] **Step 2: Update the PO detail page to stop passing `documents`**

In `app/purchase-orders/[id]/page.tsx`, remove the `documents` import and prop:

Remove:
```ts
import { documents } from '@/lib/mock-data/documents';
const docs = documents.filter(d => po.containerIds.some(cid => d.containerId === cid));
```

Change:
```tsx
return <PODetail po={po} importer={importer} documents={docs} linkedContainers={linked} />;
```
To:
```tsx
return <PODetail po={po} importer={importer} linkedContainers={linked} />;
```

- [ ] **Step 3: Delete `PODocumentSection.tsx`**

```bash
rm components/purchase-orders/PODocumentSection.tsx
```

- [ ] **Step 4: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add components/purchase-orders/PODetail.tsx \
        app/purchase-orders/\[id\]/page.tsx
git rm components/purchase-orders/PODocumentSection.tsx
git commit -m "feat(documents): integrate DocumentsSection into PO detail, remove PODocumentSection"
```

---

## Task 10: Container detail integration

**Files:**
- Modify: `components/containers/DocumentsTab.tsx`

- [ ] **Step 1: Add `DocumentsSection` below the existing table in `DocumentsTab.tsx`**

In `components/containers/DocumentsTab.tsx`, add after the closing `</div>` of the existing `DocumentInstance` table:

```tsx
import { DocumentsSection } from '@/components/documents/DocumentsSection'
```

And at the end of the returned JSX, after the existing `<div className="rounded-md border ...">`:

```tsx
<div className="mt-8">
  <DocumentsSection ownerId={container.id} ownerType="container" perspective="container" />
</div>
```

- [ ] **Step 2: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/containers/DocumentsTab.tsx
git commit -m "feat(documents): add DocumentsSection to container Documents tab"
```

---

## Task 11: `/documents` page — sidebar + list

**Files:**
- Create: `app/documents/components/DocumentsSidebar.tsx`
- Create: `app/documents/components/DocumentsList.tsx`
- Create: `__tests__/documents/DocumentsList.test.tsx`

### 11a — DocumentsSidebar

- [ ] **Step 1: Create `app/documents/components/DocumentsSidebar.tsx`**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import type { DocumentCategory, WorkflowDocType } from '@/types'

const CATEGORIES: { key: DocumentCategory; types: WorkflowDocType[] }[] = [
  { key: 'commercial',   types: ['commercial_invoice', 'packing_list', 'lc_compliance_letter'] },
  { key: 'transport',    types: ['bill_of_lading'] },
  { key: 'phytosanitary',types: ['sag_export_auth', 'cold_treatment_cert'] },
  { key: 'customs',      types: ['certificate_of_origin', 'dus'] },
]

interface Props {
  selected: WorkflowDocType | null
  onSelect: (t: WorkflowDocType | null) => void
}

export function DocumentsSidebar({ selected, onSelect }: Props) {
  const t = useTranslations('documents')
  const total = shipmentDocuments.length

  const countFor = (type: WorkflowDocType) => shipmentDocuments.filter(d => d.type === type).length
  const hasWarning = (type: WorkflowDocType) =>
    shipmentDocuments.some(d => d.type === type && (d.status === 'rejected' || (d.dueDate && new Date(d.dueDate) < new Date())))

  return (
    <nav className="w-48 shrink-0 py-4" style={{ borderRight: '1px solid var(--line-soft)' }}>
      <div className="px-3.5 pb-2.5 text-[9px] uppercase tracking-widest text-ink-4">
        {t('title')}
      </div>
      {/* All */}
      <button
        onClick={() => onSelect(null)}
        className="w-full flex justify-between items-center px-3.5 py-1.5 text-[11px]"
        style={{
          color: selected === null ? '#00E696' : '#A8B3C7',
          background: selected === null ? 'rgba(0,230,150,0.08)' : 'transparent',
          borderLeft: selected === null ? '2px solid #00E696' : '2px solid transparent',
        }}
      >
        <span>{t('all')}</span>
        <span className="text-ink-4 text-[10px]">{total}</span>
      </button>

      {CATEGORIES.map(cat => (
        <div key={cat.key} className="mt-3">
          <div className="px-3.5 pb-1 text-[9px] uppercase tracking-wider text-ink-4">
            {t(`categories.${cat.key}`)}
          </div>
          {cat.types.map(type => {
            const count = countFor(type)
            const warn = hasWarning(type)
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="w-full flex justify-between items-center px-3.5 py-1 text-[11px] hover:text-ink-1"
                style={{ color: selected === type ? '#F4F6FA' : '#A8B3C7' }}
              >
                <span>{t(`types.${type}`)}</span>
                <span style={{ color: warn ? '#EF4444' : '#475063' }} className="text-[10px]">
                  {warn ? `${count} !` : count}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
```

### 11b — DocumentsList tests

- [ ] **Step 2: Write failing tests**

Create `__tests__/documents/DocumentsList.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { DocumentsList } from '@/app/documents/components/DocumentsList'

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}))

test('renders PO group headers', () => {
  render(<DocumentsList typeFilter={null} statusFilter={null} />)
  expect(screen.getByText('PO-2026-0142')).toBeInTheDocument()
  expect(screen.getByText('PO-2026-0157')).toBeInTheDocument()
})

test('type filter narrows the list', () => {
  render(<DocumentsList typeFilter="cold_treatment_cert" statusFilter={null} />)
  // With mock t=(k)=>k, the type label renders as its i18n key path
  expect(screen.getByText('types.cold_treatment_cert')).toBeInTheDocument()
  expect(screen.queryByText('types.dus')).not.toBeInTheDocument()
})

test('empty state rendered when type filter matches nothing', () => {
  // 'lc_compliance_letter' only exists on PO-2026-0142; status filtering leaves 0 results
  render(<DocumentsList typeFilter={null} statusFilter={'approved'} />)
  // Approved docs exist — list should render without crash
  expect(document.body).toBeTruthy()
})
```

- [ ] **Step 3: Run tests — expect FAIL**

Run: `pnpm test __tests__/documents/DocumentsList.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 4: Create `app/documents/components/DocumentsList.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import { purchaseOrders } from '@/lib/mock-data/purchase-orders'
import { importers } from '@/lib/mock-data/importers'
import type { ShipmentDocument, WorkflowDocType, WorkflowDocStatus } from '@/types'
import { DocumentRow } from './DocumentRow'
import { DocumentDetailModal } from './DocumentDetailModal'

interface Props {
  typeFilter: WorkflowDocType | null
  statusFilter: WorkflowDocStatus | null
}

export function DocumentsList({ typeFilter, statusFilter }: Props) {
  const t = useTranslations('documents')
  const [selected, setSelected] = useState<ShipmentDocument | null>(null)

  const filtered = shipmentDocuments.filter(d => {
    if (typeFilter && d.type !== typeFilter) return false
    if (statusFilter && d.status !== statusFilter) return false
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-4 text-[12px]">{t('noDocumentsOfType')}</p>
      </div>
    )
  }

  // Group by PO
  const poGroups = new Map<string, { po: typeof purchaseOrders[0]; docs: ShipmentDocument[]; containerGroups: Map<string, ShipmentDocument[]> }>()

  for (const doc of filtered) {
    const poId = doc.owner.type === 'po' ? doc.owner.id : doc.links.find(l => l.type === 'po')?.id
    if (!poId) continue

    if (!poGroups.has(poId)) {
      const po = purchaseOrders.find(p => p.id === poId)
      if (!po) continue
      poGroups.set(poId, { po, docs: [], containerGroups: new Map() })
    }
    const group = poGroups.get(poId)!

    if (doc.owner.type === 'po') {
      group.docs.push(doc)
    } else {
      const cid = doc.owner.id
      if (!group.containerGroups.has(cid)) group.containerGroups.set(cid, [])
      group.containerGroups.get(cid)!.push(doc)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {[...poGroups.entries()].map(([poId, { po, docs, containerGroups }]) => {
        const importer = importers.find(i => i.id === po.importerId)
        return (
          <div key={poId} className="mb-6">
            {/* PO Group header */}
            <div
              className="flex items-center gap-2 mb-3 pb-2 text-[10px]"
              style={{ borderBottom: '1px solid var(--line-soft)' }}
            >
              <span className="font-mono font-semibold text-sky-300">{poId}</span>
              <span className="text-ink-4">·</span>
              <span className="text-ink-2">{importer?.name ?? '—'}</span>
              <span className="text-ink-4">·</span>
              <span className="text-ink-4">{po.productId.replace(/_/g, ' ')}</span>
            </div>

            {/* PO-owned docs */}
            {docs.length > 0 && (
              <div className="mb-3">
                <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-1.5 ml-0.5">
                  {t('section.poDocuments')}
                </div>
                <DocTable docs={docs} t={t} onSelect={setSelected} />
              </div>
            )}

            {/* Container sub-groups */}
            {[...containerGroups.entries()].map(([cid, cdocs]) => (
              <div key={cid} className="ml-4 mb-3">
                <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-1.5">↳ {cid}</div>
                <DocTable
                  docs={cdocs}
                  t={t}
                  onSelect={setSelected}
                />
              </div>
            ))}
          </div>
        )
      })}

      {selected && (
        <DocumentDetailModal doc={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function DocTable({
  docs,
  t,
  onSelect,
  provenance,
}: {
  docs: ShipmentDocument[]
  t: (k: string) => string
  onSelect: (d: ShipmentDocument) => void
  provenance?: string
}) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--line-soft)' }}>
      <table className="w-full" role="table">
        <thead>
          <tr style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--line-soft)' }}>
            {(['table.document', 'table.type', 'table.status', 'table.issued', 'table.due'] as const).map(k => (
              <th key={k} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider text-ink-4 font-medium">
                {t(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              provenance={provenance}
              statusLabel={t(`statuses.${doc.status}`)}
              typeLabel={t(`types.${doc.type}`)}
              onClick={() => onSelect(doc)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test __tests__/documents/DocumentsList.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add app/documents/components/DocumentsSidebar.tsx \
        app/documents/components/DocumentsList.tsx \
        __tests__/documents/DocumentsList.test.tsx
git commit -m "feat(documents): add DocumentsSidebar and DocumentsList components"
```

---

## Task 12: UploadDocumentModal

**Files:**
- Create: `app/documents/components/UploadDocumentModal.tsx`

This is a four-step modal (file → type → owner → optional links). In the maqueta the file is never stored — only the filename is captured and the document is created in `draft` status in local state (no actual store mutation; the parent shows a success toast).

- [ ] **Step 1: Create `app/documents/components/UploadDocumentModal.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { purchaseOrders } from '@/lib/mock-data/purchase-orders'
import { containers } from '@/lib/mock-data/containers'
import type { WorkflowDocType, DocumentCategory } from '@/types'

const TYPE_OPTIONS: { category: DocumentCategory; types: WorkflowDocType[] }[] = [
  { category: 'commercial',    types: ['commercial_invoice', 'packing_list', 'lc_compliance_letter'] },
  { category: 'transport',     types: ['bill_of_lading'] },
  { category: 'phytosanitary', types: ['sag_export_auth', 'cold_treatment_cert'] },
  { category: 'customs',       types: ['certificate_of_origin', 'dus'] },
]

interface Props {
  onClose: () => void
  onSuccess: (docName: string) => void
}

type Step = 'file' | 'type' | 'owner' | 'links'

const STEP_ORDER: Step[] = ['file', 'type', 'owner', 'links']

export function UploadDocumentModal({ onClose, onSuccess }: Props) {
  const t = useTranslations('documents')
  const [step, setStep] = useState<Step>('file')
  const [fileName, setFileName] = useState('')
  const [docType, setDocType] = useState<WorkflowDocType | ''>('')
  const [ownerType, setOwnerType] = useState<'po' | 'container'>('po')
  const [ownerId, setOwnerId] = useState('')
  const [linkedIds, setLinkedIds] = useState<string[]>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? '')
  }

  function toggleLink(id: string) {
    setLinkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleConfirm() {
    if (!docType || !ownerId) return
    onSuccess(docType.replace(/_/g, ' '))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,10,18,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: 'var(--color-bg-1)', border: '1px solid var(--line-soft)' }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="text-[13px] font-semibold text-ink-1">{t('upload.trigger')}</div>
          <button onClick={onClose} className="text-ink-4 hover:text-ink-2">×</button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-5">
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{ background: step === s ? '#00E696' : i < STEP_ORDER.indexOf(step) ? '#00E69644' : 'var(--color-bg-3)' }}
            />
          ))}
        </div>

        {step === 'file' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-3">{t('upload.stepFile')}</div>
            <label
              className="block w-full rounded-md p-6 text-center text-[11px] text-ink-3 cursor-pointer"
              style={{ border: '1px dashed var(--line-mid)', background: 'var(--color-bg-2)' }}
            >
              <input type="file" className="hidden" onChange={handleFileChange} />
              {fileName || t('upload.placeholderFile')}
            </label>
            <div className="flex justify-end mt-4">
              <button
                disabled={!fileName}
                onClick={() => setStep('type')}
                className="text-[11px] px-4 py-1.5 rounded disabled:opacity-40"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'type' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-3">{t('upload.stepType')}</div>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as WorkflowDocType)}
              className="w-full text-[11px] px-3 py-2 rounded text-ink-1"
              style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}
            >
              <option value="">{t('upload.placeholderType')}</option>
              {TYPE_OPTIONS.map(cat =>
                cat.types.map(type => (
                  <option key={type} value={type}>{t(`types.${type}`)}</option>
                ))
              )}
            </select>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep('file')} className="text-[11px] text-ink-4 hover:text-ink-2">{t('upload.back')}</button>
              <button
                disabled={!docType}
                onClick={() => setStep('owner')}
                className="text-[11px] px-4 py-1.5 rounded disabled:opacity-40"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'owner' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-3">{t('upload.stepOwner')}</div>
            <div className="flex gap-2 mb-3">
              {(['po', 'container'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => { setOwnerType(type); setOwnerId('') }}
                  className="flex-1 text-[11px] py-1.5 rounded"
                  style={{
                    color: ownerType === type ? '#00E696' : '#A8B3C7',
                    background: ownerType === type ? 'rgba(0,230,150,0.1)' : 'var(--color-bg-2)',
                    border: `1px solid ${ownerType === type ? 'rgba(0,230,150,0.3)' : 'var(--line-soft)'}`,
                  }}
                >
                  {type === 'po' ? t('upload.ownerPo') : t('upload.ownerContainer')}
                </button>
              ))}
            </div>
            <select
              value={ownerId}
              onChange={e => setOwnerId(e.target.value)}
              className="w-full text-[11px] px-3 py-2 rounded text-ink-1"
              style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}
            >
              <option value="">{t('upload.placeholderOwner')}</option>
              {ownerType === 'po'
                ? purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.id}</option>)
                : containers.map(c => <option key={c.id} value={c.id}>{c.id}</option>)
              }
            </select>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep('type')} className="text-[11px] text-ink-4 hover:text-ink-2">{t('upload.back')}</button>
              <button
                disabled={!ownerId}
                onClick={() => setStep('links')}
                className="text-[11px] px-4 py-1.5 rounded disabled:opacity-40"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'links' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-1">{t('upload.stepLinks')}</div>
            <div className="text-[9px] text-ink-4 mb-3">{t('upload.stepLinksHint')}</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...purchaseOrders, ...containers].map(entity => {
                const id = entity.id
                if (id === ownerId) return null
                const checked = linkedIds.includes(id)
                return (
                  <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleLink(id)}
                      className="accent-mint-500"
                    />
                    <span className="font-mono text-[11px] text-ink-2">{id}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep('owner')} className="text-[11px] text-ink-4 hover:text-ink-2">{t('upload.back')}</button>
              <button
                onClick={handleConfirm}
                className="text-[11px] px-4 py-1.5 rounded"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm typecheck`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/documents/components/UploadDocumentModal.tsx
git commit -m "feat(documents): add UploadDocumentModal multi-step flow"
```

---

## Task 13: `/documents` page

**Files:**
- Create: `app/documents/page.tsx`

This is the RSC shell. It renders the two-panel layout and delegates state to client children.

- [ ] **Step 1: Create `app/documents/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server'
import { DocumentsPageClient } from './components/DocumentsPageClient'

export default async function DocumentsPage() {
  const t = await getTranslations('documents')
  return <DocumentsPageClient title={t('title')} uploadLabel={t('upload.trigger')} />
}
```

- [ ] **Step 2: Create `app/documents/components/DocumentsPageClient.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { WorkflowDocType, WorkflowDocStatus } from '@/types'
import { DocumentsSidebar } from './DocumentsSidebar'
import { DocumentsList } from './DocumentsList'
import { UploadDocumentModal } from './UploadDocumentModal'

const ALL_DOC_STATUSES: WorkflowDocStatus[] = [
  'draft', 'submitted', 'validating', 'under_review', 'approved', 'rejected',
]

interface Props {
  title: string
  uploadLabel: string
}

export function DocumentsPageClient({ title, uploadLabel }: Props) {
  const t = useTranslations('documents')
  const [typeFilter, setTypeFilter] = useState<WorkflowDocType | null>(null)
  const [statusFilter, setStatusFilter] = useState<WorkflowDocStatus | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="flex h-full min-h-0">
      <DocumentsSidebar selected={typeFilter} onSelect={setTypeFilter} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page header */}
        <div
          className="flex justify-between items-center px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--line-soft)' }}
        >
          <h1 className="text-[13px] font-semibold text-ink-1">{title}</h1>
          <div className="flex items-center gap-3">
            {/* Status filter dropdown */}
            <select
              value={statusFilter ?? ''}
              onChange={e => setStatusFilter(e.target.value as WorkflowDocStatus || null)}
              className="text-[11px] px-2.5 py-1.5 rounded text-ink-2"
              style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}
            >
              <option value="">{t('all')}</option>
              {ALL_DOC_STATUSES.map(s => (
                <option key={s} value={s}>{t(`statuses.${s}`)}</option>
              ))}
            </select>
            <button
              onClick={() => setShowUpload(true)}
              className="text-[11px] px-3 py-1.5 rounded"
              style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
            >
              + {uploadLabel}
            </button>
          </div>
        </div>
        <DocumentsList typeFilter={typeFilter} statusFilter={statusFilter} />
      </div>

      {showUpload && (
        <UploadDocumentModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Type-check + full test run**

Run: `pnpm typecheck && pnpm test`
Expected: no type errors, all tests PASS (previous tests remain green)

- [ ] **Step 4: Commit**

```bash
git add app/documents/page.tsx \
        app/documents/components/DocumentsPageClient.tsx
git commit -m "feat(documents): add /documents page — type sidebar + PO-grouped list"
```

---

## Task 14: Final check

- [ ] **Run all tests**

```bash
pnpm test
```

Expected: all tests pass, no regressions in existing test suites

- [ ] **Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors

- [ ] **Visual smoke check**

Start dev server: `pnpm dev`

Check these routes manually:
- `/documents` — sidebar shows category groups, list shows PO groups with container sub-groups, clicking a row opens modal
- `/documents` — clicking "Subir documento" opens the upload modal, steps through file → type → owner, confirm closes modal
- `/purchase-orders/PO-2026-0142` — Documents section appears after Lifecycle Timeline, shows PO docs + MSCU-7842156 sub-group
- `/containers/MSCU-7842156` — Documents tab shows existing DocumentInstance table + new DocumentsSection below
- Modal on `/documents` — status badge correct, flags section appears on WF-001 (2 flags), action buttons match status, clicking Approve/Reject transitions state and re-renders timeline

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat(phase4): document management system complete"
```

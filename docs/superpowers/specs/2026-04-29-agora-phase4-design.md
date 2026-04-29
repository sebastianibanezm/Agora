# Agora Phase 4 — Document Management Design Spec

**Date:** 2026-04-29
**Status:** Approved — ready for implementation planning
**Surfaces:** `/documents` page, document detail modal, PO detail integration, container detail integration

---

## 0. What This Covers

Phase 4 builds the document management system for Agora. Documents are owned at their natural level (PO or container) and cross-surfaced in both, with provenance indicators. A new `/documents` route provides an aggregated view across all shipments. A full workflow state machine governs each document from draft through approval, including a system-driven validation step that cross-checks values across linked documents.

This feature is designed with production transition in mind: the data model uses clean type boundaries and mock data is structured to match API response shapes, so the UI layer can be connected to a real backend without structural refactoring.

**Phase 4 is not in scope:** Performance & ROI page (`/performance`) — deferred to Phase 5.

---

## 1. Tech Stack (unchanged)

- Next.js 16 App Router, React 19, TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- Tailwind CSS v4 via `@theme {}` in `app/globals.css` — no `tailwind.config.ts`
- `@base-ui/react` for interactive primitives (modal, dropdown)
- `next-intl v4` — cookie-based locale, Spanish default
- Vitest + `@testing-library/react`
- Demo date anchor: `getTodayDemo()` → `new Date('2027-01-09T10:00:00-04:00')`

---

## 2. Data Model

### 2.1 Type strategy

Phase 4 introduces a workflow layer on top of the existing document type system. The existing types are **kept unchanged**:

- `DocumentType` (19 members in `types/index.ts`) — the document vocabulary. Phase 4 uses a subset of these existing members; no new members are added.
- `DocStatus` — the simple per-`DocumentInstance` status used in container detail cold-chain logic. Kept as-is; not replaced.
- `DocumentInstance` — kept as-is; used in container cold-chain. Not affected by Phase 4.

Phase 4 adds a **parallel workflow system** (`ShipmentDocument`) that sits alongside `DocumentInstance` and is not used by cold-chain logic.

### 2.2 New types (add to `types/index.ts`)

```ts
export type DocumentCategory =
  | 'commercial'
  | 'transport'
  | 'phytosanitary'
  | 'customs'

// Subset of existing DocumentType used in the workflow system.
// Uses existing DocumentType member names — no new members.
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
  label: string  // e.g. "PO-2027-001" or "MAEU-9182734"
}

export type ValidationFlag = {
  severity: 'error' | 'warning'
  conflictingDocId: string
  conflictingDocType: WorkflowDocType
  message: string
  detectedAt: string  // ISO
}

export type ShipmentDocEvent = {
  status: WorkflowDocStatus | 'comment'
  actor: 'user' | 'system'
  actorName: string
  timestamp: string  // ISO
  note?: string
}

export interface ShipmentDocument {
  id: string
  name: string
  category: DocumentCategory
  type: WorkflowDocType
  status: WorkflowDocStatus
  owner: ShipmentDocOwner
  links: ShipmentDocLink[]         // related entities where this doc is cross-surfaced
  flags: ValidationFlag[]          // populated by system during 'validating' step
  events: ShipmentDocEvent[]
  createdAt: string                // ISO
  dueDate?: string                 // ISO
  fileUrl?: string                 // mock: static path or undefined
  overview: Record<string, string> // key-value pairs rendered in the Overview grid
}
```

**`overview` field:** auto-populated at document creation from the owning entity's data. The system builds the map — the upload flow does not ask the user to fill it in. Values that represent linked entity IDs are prefixed with `"$link:"` (e.g. `"$link:MAEU-9182734"`) so the UI can render them as clickable sky-colored links navigating to that entity's detail page.

### 2.3 State machine

```
draft → submitted → validating → under_review → approved
                                              ↘ rejected → draft (user reopens)
```

| Status | Actor | Description |
|---|---|---|
| `draft` | User | Document created, returned after rejection, or reopened. Editable. |
| `submitted` | User | User submits for validation. No further edits. |
| `validating` | System | Automated cross-check against linked documents. Flags raised if mismatches found. Completes automatically. |
| `under_review` | User | Human review. Actions: Approve or Reject. |
| `approved` | User | Final accepted state. Read-only. |
| `rejected` | User | Reviewer rejects. User can reopen to draft via "Reopen as draft" action. |

The `validating → under_review` transition is system-driven; in the maqueta it is immediate (pre-computed in mock data). The `rejected → draft` transition is user-triggered via the "Reopen as draft" action in the modal.

### 2.4 Mock data (`lib/mock-data/documents.ts` — new file)

12 `ShipmentDocument` objects across the two active POs and their containers, covering all statuses and document types:

| Document | Type | Owner | Status | Flags |
|---|---|---|---|---|
| Commercial Invoice | `commercial_invoice` | PO-2027-001 | `validating` | 2 — amount mismatch vs Packing List, qty mismatch vs BL |
| Packing List | `packing_list` | PO-2027-001 | `draft` | — |
| Letter of Credit | `lc_compliance_letter` | PO-2027-001 | `under_review` | — |
| Bill of Lading | `bill_of_lading` | MAEU-9182734 | `rejected` | — |
| Cold Treatment Certificate | `cold_treatment_cert` | MAEU-9182734 | `approved` | — |
| Phytosanitary Certificate | `sag_export_auth` | MAEU-9182734 | `approved` | — |
| Commercial Invoice | `commercial_invoice` | PO-2027-002 | `approved` | — |
| Packing List | `packing_list` | PO-2027-002 | `approved` | — |
| Certificate of Origin | `certificate_of_origin` | PO-2027-002 | `under_review` | — |
| Bill of Lading | `bill_of_lading` | MSCU-7842156 | `submitted` | — |
| DUS | `dus` | MSCU-7842156 | `draft` | — |
| SAG Export Auth | `sag_export_auth` | MSCU-7842156 | `approved` | — |

Each document has a realistic `events[]` array consistent with its current status. The two flagged documents have `ValidationFlag` entries with `conflictingDocId` pointing to sibling documents. **Validation flags are rendered in the modal whenever `flags.length > 0`, regardless of status** — the `validating` Commercial Invoice shows its flags as soon as they are raised.

---

## 3. Routes & Navigation

**New route:** `/documents`

**Sidebar nav:** Add `documents` entry between `compliance` and `settings`.
- i18n key `nav.documents`: `"Documentos"` (es) / `"Documents"` (en)
- Icon: `lucide-react` `FileText`

---

## 4. Surface: `/documents` Page

### Layout

Two-panel, full-height:

```
[ Type Sidebar 190px ] [ Main Content area — flex:1 ]
```

**No loading states needed** — the document store is a synchronous mock module. All data is available at render time.

### Type Sidebar

- **All** entry at top — shows total document count, selected by default with mint left border accent
- Grouped by category (Commercial, Transport, Phytosanitary, Customs), each group has an uppercase 9px ink-4 label
- Each document type entry: name (ink-2, 11px) + count badge (ink-4, 10px)
- Entries with any document in `rejected` status or with a past-due `dueDate` show a warning dot (severity-crit color)
- Clicking a type filters the main list; "All" clears the filter

**Empty state:** if no documents exist for a selected type, show a centered ink-4 message: "No hay documentos de este tipo" / "No documents of this type."

### Main Content

**Page header:**
- Left: "Documents" (13px semibold ink-1) + total count (ink-4)
- Right: Status filter dropdown + "Upload document" button (mint outline)

**Document list — grouped by PO:**

Each PO group:
- Group header (full-width, `border-bottom: var(--line-soft)`): PO ID in sky monospace + importer name + product + market — all ink-2/ink-3
- **PO documents** sub-label (9px uppercase ink-4) followed by table rows for PO-owned documents
- One **container sub-group** per linked container, indented 16px, headed with `↳ CONTAINER-ID · Product` (9px uppercase ink-4)
- PO groups where all documents are `approved` are collapsed by default; all others expanded

**Document row columns:** Name (ink-1) · Type (ink-3, 10px) · Status badge · Created date (monospace ink-4) · Due date (monospace — ink-4 if ok, severity-crit if past due)

**Empty state (no documents at all):** centered illustration placeholder + "Sube tu primer documento" / "Upload your first document" + Upload button.

Clicking any row opens the Document Detail Modal.

### Upload flow

Opens a modal with these steps:
1. File picker (simulated — accepts any file, stores filename only in mock)
2. Document type selector (dropdown, grouped by category)
3. Owner selector — "This document belongs to:" — choose PO or Container from a list
4. Optional additional links — "Also visible in:" multi-select of related POs/containers
5. Confirm

On confirm: document created with `status: 'draft'`, `overview` auto-populated from the owning entity's data, inserted into the list under its owner group.

---

## 5. Surface: Document Detail Modal

Opens from any document row click across the app. Dismisses on backdrop click or Escape.

### Shell

Full-screen overlay (backdrop: `rgba(7, 10, 18, 0.85)`). Inner panel: `background: #0E1320`, `border: 1px solid var(--line-soft)`, `border-radius: 10px`. Two columns side by side. No loading state — synchronous mock data.

### Left Column (flex: 1, scrollable)

**1. Header** (`background: #141A29`, `border-bottom: var(--line-soft)`)
- Document name (15px semibold ink-1)
- Status badge (severity color per status: draft=ink-4, submitted=blue, validating=amber, under_review=orange, approved=mint, rejected=crit)
- Metadata row: linked PO pill (sky, `rgba(125,211,252,0.1)` bg), category label (ink-3), created date (monospace ink-4)

**2. Overview** (padding 16px 20px)
- Section label: `OVERVIEW` (9px uppercase ink-4)
- 3-column key-value grid. Labels: 9px uppercase ink-4. Values: 11px ink-1. Amounts: monospace mint. Dates: monospace ink-2. `$link:` prefixed values: sky, `cursor: pointer`, clicking navigates to that entity's detail page.

**3. Validation Flags** (only rendered if `flags.length > 0` — shown at any status, not only `under_review`)
- Section label: `VALIDATION FLAGS` (9px uppercase ink-4) + red count badge
- Each flag: `#141A29` card, colored left border (3px — crit for error, watch for warning), severity-colored title, description with conflicting values in monospace, timestamp (monospace ink-4, right-aligned)

**4. Document** (`#070A12` well)
- Section label: `DOCUMENT` (9px uppercase ink-4)
- Mock: structured placeholder showing key fields from `overview` in a document-like layout
- Actions below: "Download PDF" + "Replace file" (`#141A29` buttons, ink-2)

### Right Column (260px fixed, `background: #141A29`)

**Header:** "Activity & Workflow" (12px semibold ink-1, `border-bottom: var(--line-soft)`)

**Timeline** (vertical, `padding-left: 20px`, connecting line `var(--line-soft)`):
- Completed steps: solid filled dot (color per status), actor name (ink-3 10px), timestamp (monospace ink-4 9px), optional note card (`#1B2235` bg)
- Current step: glowing dot (`box-shadow: 0 0 7px <status-color>`)
- Future steps: empty circle `border: 1px solid #475063`, label ink-4, opacity 0.3

**Action strip** (bottom, `border-top: var(--line-soft)`), context-sensitive:

| Status | Actions |
|---|---|
| `draft` | "Submit for validation" (mint outline primary) |
| `submitted` | — (no user action; system processing label in ink-4) |
| `validating` | — (no user action; system processing label in ink-4) |
| `under_review` | "Approve" (mint) + "Reject — send back to draft" (crit outline) |
| `approved` | "Add comment" (ink-3 text link only) |
| `rejected` | "Reopen as draft" (ink-3 outline) + "Add comment" (ink-4 text link) |

In the maqueta, all actions trigger an immediate state transition on the mock document and re-render the modal to reflect the new status.

---

## 6. Integration: PO Detail (`/purchase-orders/[id]`)

**Replaces** the existing Phase 3 document cards section (grouped by Listo / En Revisión / Pendiente). The Phase 3 section used static `DocumentInstance` data; Phase 4 replaces it with the `DocumentsSection` component using `ShipmentDocument` data.

**Position:** after the Lifecycle Timeline, before the Activity Feed.

**Section header:** "Documents" + status summary pills (e.g. `3 approved · 2 validating · 1 rejected` in severity colors)

**Sub-groups:**
1. **PO Documents** — documents where `owner.type === 'po' && owner.id === po.id`. No provenance indicator (home entity).
2. One sub-group per linked container — documents where `owner.type === 'container'` and the container belongs to this PO. Each row has a faint provenance tag `· from CONTAINER-ID` (ink-4, 9px) after the type label.

Uses `<DocumentsSection ownerId={po.id} ownerType="po" perspective="po" />`.

Row structure and click behavior identical to `/documents`.

---

## 7. Integration: Container Detail (`/containers/[id]`)

Add a **Documents** section after the Cold Chain section (or at the end of the page if cold chain is absent). Does **not** replace `DocumentInstance`-based cold-chain logic — those remain unchanged.

**Section header:** "Documents" + status summary pills

**Sub-groups:**
1. **Container Documents** — documents where `owner.type === 'container' && owner.id === container.id`. No provenance indicator (home entity).
2. **PO Documents** — documents where `owner.type === 'po'` and the PO is the parent of this container. Each row has a faint provenance tag `· from PO-XXXX` (ink-4, 9px) after the type label.

Uses `<DocumentsSection ownerId={container.id} ownerType="container" perspective="container" />`.

---

## 8. `DocumentsSection` Component Props

```ts
interface DocumentsSectionProps {
  ownerId: string
  ownerType: 'po' | 'container'
  // perspective controls provenance tag direction:
  // 'po'        → container sub-group rows show "· from CONTAINER-ID"
  // 'container' → PO sub-group rows show "· from PO-XXXX"
  perspective: 'po' | 'container'
}
```

The component filters the mock document store to find:
- Documents where `owner.id === ownerId && owner.type === ownerType` (owned — no tag)
- Documents linked via `links[]` to this entity (cross-surfaced — with provenance tag)

---

## 9. i18n Keys

New keys in `messages/es.json` and `messages/en.json`. Each file contains only its own language value (the notation below shows `es / en` as documentation shorthand only).

```
documents.title              Documentos / Documents
documents.upload             Subir documento / Upload document
documents.noDocumentsOfType  No hay documentos de este tipo / No documents of this type
documents.uploadFirst        Sube tu primer documento / Upload your first document
documents.categories.*       (commercial, transport, phytosanitary, customs)
documents.types.*            (commercial_invoice, packing_list, lc_compliance_letter,
                              bill_of_lading, dus, sag_export_auth,
                              cold_treatment_cert, certificate_of_origin)
documents.statuses.*         (draft, submitted, validating, under_review, approved, rejected)
documents.modal.overview     Resumen / Overview
documents.modal.flags        Alertas de Validación / Validation Flags
documents.modal.document     Documento / Document
documents.modal.activity     Actividad y Flujo / Activity & Workflow
documents.modal.approve      Aprobar / Approve
documents.modal.reject       Rechazar — volver a borrador / Reject — send back to draft
documents.modal.reopen       Volver a borrador / Reopen as draft
documents.modal.addComment   Agregar comentario / Add comment
documents.modal.submit       Enviar para validación / Submit for validation
documents.modal.download     Descargar PDF / Download PDF
documents.modal.replace      Reemplazar archivo / Replace file
documents.modal.processing   Procesando… / Processing…
documents.provenance.fromPo        de {{id}} / from {{id}}
documents.provenance.fromContainer de {{id}} / from {{id}}
documents.section.poDocuments        Documentos del pedido / PO documents
documents.section.containerDocuments Documentos del contenedor / Container documents
nav.documents                Documentos / Documents
```

---

## 10. Component Tree

```
app/documents/
  page.tsx                         RSC — loads all ShipmentDocuments, renders shell
  components/
    DocumentsSidebar.tsx           'use client' — type filter nav
    DocumentsList.tsx              'use client' — PO-grouped list, manages modal open state
    DocumentRow.tsx                pure — single document row
    DocumentDetailModal.tsx        'use client' — full modal, handles state transitions
    DocumentOverview.tsx           pure — 3-col key-value grid
    DocumentFlags.tsx              pure — validation flag cards
    DocumentTimeline.tsx           pure — right-column activity timeline
    UploadDocumentModal.tsx        'use client' — multi-step upload flow

components/documents/
  DocumentsSection.tsx             'use client' — reusable; used in PO detail + container detail
    Props: { ownerId, ownerType, perspective }
    Internally uses: DocumentRow, DocumentDetailModal
```

`DocumentsSection` is the integration point for PO detail and container detail. It owns no state beyond modal open/selected document — all document data comes from the mock store.

---

## 11. Testing

- Unit: state machine transitions — valid paths and invalid transitions (e.g. `approved → submitted` must not be allowed)
- Unit: `DocumentsSection` filtering — owned docs vs cross-surfaced docs; correct provenance tag rendered per `perspective`
- Component: `DocumentDetailModal` — correct action buttons per each of the 6 statuses; state transition updates displayed status and timeline
- Component: `DocumentsList` — PO grouping correct; container sub-groups indented under correct PO; type sidebar filter narrows list
- Component: `DocumentFlags` — renders when `flags.length > 0` at any status, hidden when empty
- No tests for the file picker simulation (mock-only, no real file handling)

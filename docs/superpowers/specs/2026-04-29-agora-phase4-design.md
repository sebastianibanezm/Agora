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

### 2.1 Core types (add to `types/index.ts`)

```ts
export type DocumentCategory =
  | 'commercial'
  | 'transport'
  | 'phytosanitary'
  | 'customs'

export type DocumentType =
  | 'invoice'
  | 'packing_list'
  | 'lc'
  | 'bl'
  | 'dus'
  | 'sag_cert'
  | 'cold_treatment'
  | 'certificate_of_origin'

export type DocumentStatus =
  | 'draft'
  | 'submitted'
  | 'validating'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type DocumentOwner =
  | { type: 'po'; id: string }
  | { type: 'container'; id: string }

export type DocumentLink = {
  type: 'po' | 'container'
  id: string
  label: string  // e.g. "PO-2027-001" or "MAEU-9182734"
}

export type ValidationFlag = {
  severity: 'error' | 'warning'
  conflictingDocId: string
  conflictingDocType: DocumentType
  message: string
  detectedAt: string  // ISO
}

export type DocumentEvent = {
  status: DocumentStatus | 'comment'
  actor: 'user' | 'system'
  actorName: string
  timestamp: string  // ISO
  note?: string
}

export type Document = {
  id: string
  name: string
  category: DocumentCategory
  type: DocumentType
  status: DocumentStatus
  owner: DocumentOwner
  links: DocumentLink[]      // related entities where this doc is cross-surfaced
  flags: ValidationFlag[]
  events: DocumentEvent[]
  createdAt: string          // ISO
  dueDate?: string           // ISO
  fileUrl?: string           // mock: static path or undefined
  overview: Record<string, string>  // key-value pairs rendered in the Overview grid
}
```

**`overview` convention:** flexible key-value map so each document type surfaces its own relevant fields. Values that represent amounts use the `"USD X,XXX"` format string. Values that represent IDs or container codes are prefixed with `"$link:"` so the UI can render them as clickable sky-colored links (e.g. `"$link:MAEU-9182734"`).

### 2.2 State machine

```
draft → submitted → validating → under_review → approved
                                              ↘ rejected → draft
```

| Status | Actor | Description |
|---|---|---|
| `draft` | User | Document created or returned after rejection. Editable. |
| `submitted` | User | User submits for validation. No further edits. |
| `validating` | System | Automated cross-check against linked documents. Flags raised if mismatches found. |
| `under_review` | User | Human review. Actions: Approve or Reject. |
| `approved` | User | Final state. Read-only. |
| `rejected` | User | Returned to draft with a rejection note. |

The `validating` step is always system-driven. In the maqueta it is pre-computed in mock data. In production it will be an async backend process.

### 2.3 Mock data (`lib/mock-data/documents.ts` — new file)

12 documents across the two active POs and their containers, covering all statuses and document types:

| Document | Type | Owner | Status | Flags |
|---|---|---|---|---|
| Commercial Invoice | `invoice` | PO-2027-001 | `validating` | 2 — amount mismatch vs Packing List, qty mismatch vs BL |
| Packing List | `packing_list` | PO-2027-001 | `draft` | — |
| Letter of Credit | `lc` | PO-2027-001 | `under_review` | — |
| Bill of Lading | `bl` | MAEU-9182734 | `rejected` | — |
| Cold Treatment Certificate | `cold_treatment` | MAEU-9182734 | `approved` | — |
| Phytosanitary Certificate | `sag_cert` | MAEU-9182734 | `approved` | — |
| Commercial Invoice | `invoice` | PO-2027-002 | `approved` | — |
| Packing List | `packing_list` | PO-2027-002 | `approved` | — |
| Certificate of Origin | `certificate_of_origin` | PO-2027-002 | `under_review` | — |
| Bill of Lading | `bl` | MSCU-7842156 | `submitted` | — |
| DUS | `dus` | MSCU-7842156 | `draft` | — |
| SAG Certificate | `sag_cert` | MSCU-7842156 | `approved` | — |

Each document has a realistic `events[]` array consistent with its current status. The two flagged documents have `ValidationFlag` entries with `conflictingDocId` pointing to the relevant sibling document.

---

## 3. Routes & Navigation

**New route:** `/documents`

**Sidebar nav:** Add `documents` entry between `compliance` and `settings`.
- i18n key `nav.documents`: `"Documentos"` / `"Documents"`
- Icon: `lucide-react` `FileText`

---

## 4. Surface: `/documents` Page

### Layout

Two-panel, full-height:

```
[ Type Sidebar 190px ] [ Main Content area — flex:1 ]
```

### Type Sidebar

- **All** entry at top — shows total document count, selected by default with mint left border accent
- Grouped by category (Commercial, Transport, Phytosanitary, Customs), each group has an uppercase 9px ink-4 label
- Each document type entry: name (ink-2, 11px) + count badge (ink-4, 10px)
- Entries with any document in `rejected` status or with a past-due `dueDate` show a warning dot (severity-crit color)
- Selecting a type filters the main list; "All" clears the filter

### Main Content

**Page header:**
- Left: "Documents" (13px semibold ink-1) + total count (ink-4)
- Right: Status filter dropdown + "Upload document" button (mint outline)

**Document list — grouped by PO:**

Each PO group:
- Group header (full-width, `border-bottom: var(--line-soft)`): PO ID in sky monospace + importer name + product + market — all ink-2/ink-3
- **PO documents** sub-label (9px uppercase ink-4) followed by a table of PO-owned documents
- One **container sub-group** per linked container, indented 16px, headed with `↳ CONTAINER-ID · Product` (9px uppercase ink-4)
- PO groups with all documents `approved` are collapsed by default; all others expanded

**Document row columns:** Name (ink-1) · Type (ink-3, 10px) · Status badge · Created date (monospace ink-4) · Due date (monospace — ink-4 if ok, severity-crit if past due)

Clicking any row opens the Document Detail Modal.

**Upload flow:**
1. Modal: file picker (simulated — accepts any file, stores name only)
2. Document type selector (dropdown)
3. Owner selector — "This belongs to:" — PO or Container selector
4. Optional additional links — "Also visible in:" multi-select of related POs/containers
5. Confirm → document created in `draft` status, inserted into list under its owner

---

## 5. Surface: Document Detail Modal

Opens from any document row click across the app. Dismisses on backdrop click or Escape.

### Shell

Full-screen overlay (backdrop: `rgba(7, 10, 18, 0.85)`). Inner panel: `background: #0E1320`, `border: 1px solid var(--line-soft)`, `border-radius: 10px`. Two columns, side by side.

### Left Column (flex: 1, scrollable)

**1. Header** (`background: #141A29`, `border-bottom: var(--line-soft)`)
- Document name (15px semibold ink-1)
- Status badge (severity color matching current status)
- Metadata row: linked PO pill (sky, `rgba(125,211,252,0.1)` bg), category label (ink-3), created date (monospace ink-4)

**2. Overview** (padding 16px 20px)
- Section label: `OVERVIEW` (9px uppercase ink-4)
- 3-column key-value grid. Labels: 9px uppercase ink-4. Values: 11px ink-1. Amounts: monospace mint. Dates: monospace ink-2. `$link:` prefixed values: sky, `cursor: pointer`, clicking navigates to that entity's detail page

**3. Validation Flags** (only rendered if `flags.length > 0`)
- Section label + red count badge
- Each flag: `#141A29` card, colored left border (3px — red for error, amber for warning), severity-colored title, description with conflicting values in monospace, timestamp (monospace ink-4, right-aligned)

**4. Document** (`background: #070A12` well)
- Section label: `DOCUMENT` (9px uppercase ink-4)
- Mock: structured placeholder showing key fields from `overview`; in production this will be a PDF iframe
- Actions below: "Download PDF" + "Replace file" (both `#141A29` buttons, ink-2)

### Right Column (260px fixed, `background: #141A29`)

**Header:** "Activity & Workflow" (12px semibold ink-1)

**Timeline** (vertical, `padding-left: 20px`, connecting line `var(--line-soft)`):
- Completed steps: solid filled dot (color matches status), actor name (ink-3 10px), timestamp (monospace ink-4 9px), optional note card (`#1B2235` bg) for flags or comments
- Current step: glowing dot (`box-shadow: 0 0 7px <status-color>`)
- Future steps: empty circle with `border: 1px solid ink-4`, label ink-4, opacity 0.3

**Action strip** (bottom, `border-top: var(--line-soft)`), context-sensitive:

| Current status | Actions shown |
|---|---|
| `draft` | "Submit for validation" (mint outline button) |
| `submitted` | — (system processing, no user action) |
| `validating` | — (system processing, no user action) |
| `under_review` | "Approve" (mint) + "Reject — send back to draft" (red outline) |
| `approved` | Read-only — "Add comment" text link only |
| `rejected` | Read-only — "Add comment" text link only |

"Add comment" is always available as a secondary text action in all states. In the maqueta, all actions trigger a state transition on the mock document and re-render the modal.

---

## 6. Integration: PO Detail (`/purchase-orders/[id]`)

Add a **Documents** section after the existing Lifecycle Timeline, before the Activity Feed.

**Section header:** "Documents" + status summary pills (e.g. `3 approved · 2 validating · 1 rejected` in severity colors)

**Sub-groups:**
1. **PO Documents** — documents where `owner.type === 'po' && owner.id === po.id`. No provenance indicator (this is the document's home).
2. One sub-group per linked container — documents where `owner.type === 'container'` and the container belongs to this PO. Each row has a faint provenance tag `· from CONTAINER-ID` (ink-4, 9px) after the type label.

Row structure and click behavior identical to `/documents`.

---

## 7. Integration: Container Detail (`/containers/[id]`)

Add a **Documents** section to the existing container detail page. Position: after the Cold Chain section (or at the bottom of the page if cold chain is not present).

**Section header:** "Documents" + status summary pills

**Sub-groups:**
1. **Container Documents** — documents where `owner.type === 'container' && owner.id === container.id`. No provenance indicator.
2. **PO Documents** — documents where `owner.type === 'po'` and the PO is the parent of this container. Each row has a faint provenance tag `· from PO-XXXX` (ink-4, 9px).

Row structure and click behavior identical to `/documents`.

---

## 8. i18n Keys

New keys in `messages/es.json` and `messages/en.json` under `documents.*`:

```json
{
  "documents": {
    "title": "Documentos / Documents",
    "upload": "Subir documento / Upload document",
    "categories": {
      "commercial": "Comercial / Commercial",
      "transport": "Transporte / Transport",
      "phytosanitary": "Fitosanitario / Phytosanitary",
      "customs": "Aduanas / Customs"
    },
    "types": {
      "invoice": "Factura Comercial / Commercial Invoice",
      "packing_list": "Lista de Empaque / Packing List",
      "lc": "Carta de Crédito / Letter of Credit",
      "bl": "Conocimiento de Embarque / Bill of Lading",
      "dus": "DUS",
      "sag_cert": "Certificado SAG / SAG Certificate",
      "cold_treatment": "Certificado Tratamiento Frío / Cold Treatment Certificate",
      "certificate_of_origin": "Certificado de Origen / Certificate of Origin"
    },
    "statuses": {
      "draft": "Borrador / Draft",
      "submitted": "Enviado / Submitted",
      "validating": "Validando / Validating",
      "under_review": "En Revisión / Under Review",
      "approved": "Aprobado / Approved",
      "rejected": "Rechazado / Rejected"
    },
    "modal": {
      "overview": "Resumen / Overview",
      "flags": "Alertas de Validación / Validation Flags",
      "document": "Documento / Document",
      "activity": "Actividad y Flujo / Activity & Workflow",
      "approve": "Aprobar / Approve",
      "reject": "Rechazar — volver a borrador / Reject — send back to draft",
      "addComment": "Agregar comentario / Add comment",
      "submit": "Enviar para validación / Submit for validation",
      "download": "Descargar PDF / Download PDF",
      "replace": "Reemplazar archivo / Replace file"
    },
    "provenance": {
      "fromPo": "de {{id}} / from {{id}}",
      "fromContainer": "de {{id}} / from {{id}}"
    },
    "section": {
      "poDocuments": "Documentos del pedido / PO documents",
      "containerDocuments": "Documentos del contenedor / Container documents"
    }
  },
  "nav": {
    "documents": "Documentos / Documents"
  }
}
```

---

## 9. Component Tree

```
app/documents/
  page.tsx                         RSC — fetches all documents, renders shell
  components/
    DocumentsSidebar.tsx           'use client' — type filter nav
    DocumentsList.tsx              'use client' — grouped list, manages modal state
    DocumentRow.tsx                pure — single document row
    DocumentDetailModal.tsx        'use client' — full modal, handles state transitions
    DocumentOverview.tsx           pure — 3-col key-value grid
    DocumentFlags.tsx              pure — validation flag cards
    DocumentTimeline.tsx           pure — right-column activity timeline
    UploadDocumentModal.tsx        'use client' — upload flow

components/documents/
  DocumentsSection.tsx             'use client' — reusable section used in PO + container detail
    (uses DocumentRow + DocumentDetailModal internally)
```

`DocumentsSection` accepts `ownerId` + `ownerType` + `linkedIds` props and filters the mock document store accordingly. This is the component dropped into PO detail and container detail.

---

## 10. Testing

- Unit tests for state machine transitions (valid and invalid)
- Unit tests for `DocumentsSection` filtering logic (owned vs linked docs, provenance tags)
- Component tests for `DocumentDetailModal` — renders correct action buttons per status, status transitions update displayed status
- Component tests for `DocumentsList` — PO grouping, container sub-groups, type filter
- No tests for the upload file picker simulation (it's mock-only)

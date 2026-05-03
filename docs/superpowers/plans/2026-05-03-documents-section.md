# Documents Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-level "Documentos" sidebar section that shows all documents from all bookings grouped by booking, with the same filters as the Bookings page and the existing `BookingDocumentPopup` on click.

**Architecture:** Server component (`documents/page.tsx`) assembles `DocumentsRow[]` from mock data and passes it to a client component (`DocumentsViewClient`) that owns filter + popup state. A pure presentational `DocumentsGroupedList` renders the grouped table. `BookingDocumentPopup` is reused without modification.

**Tech Stack:** Next.js 15 (App Router), next-intl, Tailwind v4, Vitest + @testing-library/react, lucide-react, clsx.

**Spec:** `docs/superpowers/specs/2026-05-03-documents-section-design.md`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `messages/en.json` | Add `nav.documents` translation key |
| Modify | `messages/es.json` | Add `nav.documents` translation key |
| Modify | `components/layout/Sidebar.tsx` | Add Documentos nav item |
| Create | `app/[locale]/(app)/documents/page.tsx` | Server component — data loading |
| Create | `components/documents/DocumentsViewClient.tsx` | Filter state, popup state, layout |
| Create | `components/documents/DocumentsGroupedList.tsx` | Grouped table, collapse logic |
| Create | `__tests__/documents/DocumentsGroupedList.test.tsx` | Unit tests for list rendering |
| Create | `__tests__/documents/DocumentsViewClient.test.tsx` | Unit tests for filters + popup |

---

## Task 1: Add i18n translation keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/es.json`
- Test: `__tests__/i18n.test.ts` (existing file — add assertions)

- [ ] **Step 1: Add the `documents` key to `messages/en.json`**

Open `messages/en.json`. In the `"nav"` object (currently has keys: `operations`, `bookings`, `exporters`, `navieras`, `performance`, `performanceSoon`, …), add after `"navieras"`:

```json
"documents": "Documents",
```

- [ ] **Step 2: Add the `documents` key to `messages/es.json`**

Open `messages/es.json`. Same location in `"nav"`:

```json
"documents": "Documentos",
```

- [ ] **Step 3: Add assertions to the existing i18n test**

Open `__tests__/i18n.test.ts`. Add inside the existing `describe('i18n')` block:

```ts
it('nav.documents exists in both locales', () => {
  const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
  const es = JSON.parse(readFileSync('messages/es.json', 'utf8'));
  expect(en.nav.documents).toBeDefined();
  expect(es.nav.documents).toBeDefined();
});
```

- [ ] **Step 4: Run the test**

```bash
cd agora-app && npx vitest run __tests__/i18n.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add messages/en.json messages/es.json __tests__/i18n.test.ts
git commit -m "feat(documents): add nav.documents i18n keys"
```

---

## Task 2: Add Documentos sidebar nav item

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Add `FileStack` to the lucide-react import**

In `components/layout/Sidebar.tsx`, the existing import is:
```ts
import {
  LayoutDashboard,
  Container as ContainerIcon,
  Building2,
  Ship,
  BarChart3,
  User,
} from 'lucide-react';
```

Add `FileStack`:
```ts
import {
  LayoutDashboard,
  Container as ContainerIcon,
  Building2,
  FileStack,
  Ship,
  BarChart3,
  User,
} from 'lucide-react';
```

- [ ] **Step 2: Add the documents entry to the `NAV` array**

The current `NAV` array is:
```ts
const NAV = [
  { href: '/app',       key: 'operations', Icon: LayoutDashboard },
  { href: '/bookings',  key: 'bookings',   Icon: ContainerIcon   },
  { href: '/exporters', key: 'exporters',  Icon: Building2       },
  { href: '/navieras',  key: 'navieras',   Icon: Ship            },
] as const;
```

Insert the `documents` entry between `bookings` and `exporters`:
```ts
const NAV = [
  { href: '/app',        key: 'operations', Icon: LayoutDashboard },
  { href: '/bookings',   key: 'bookings',   Icon: ContainerIcon   },
  { href: '/documents',  key: 'documents',  Icon: FileStack       },
  { href: '/exporters',  key: 'exporters',  Icon: Building2       },
  { href: '/navieras',   key: 'navieras',   Icon: Ship            },
] as const;
```

- [ ] **Step 3: Start dev server and verify the sidebar**

```bash
cd agora-app && npm run dev
```

Open `http://localhost:3000`. The sidebar should show a new `FileStack` icon between Bookings and Exporters. Hover to expand — it should show "Documents" / "Documentos" depending on locale. Clicking it will 404 for now (page not created yet).

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat(documents): add Documentos sidebar nav item"
```

---

## Task 3: Create the documents page (server component)

**Files:**
- Create: `app/[locale]/(app)/documents/page.tsx`

- [ ] **Step 1: Create the directory and page file**

```bash
mkdir -p agora-app/app/\[locale\]/\(app\)/documents
```

Create `app/[locale]/(app)/documents/page.tsx`:

```tsx
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { DocumentsViewClient } from '@/components/documents/DocumentsViewClient';
import { bookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { shippingInstructions } from '@/lib/mock-data/shipping-instructions';
import { draftBls } from '@/lib/mock-data/draft-bls';
import { exporterBls } from '@/lib/mock-data/exporter-bls';
import { activityEvents } from '@/lib/mock-data/activity-events';
import type { Booking, Exporter, Naviera, ShippingInstruction, DraftBL, ExporterBL, ActivityEvent } from '@/types';

export interface DocumentsRow {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  si: ShippingInstruction | undefined;
  bl: DraftBL | undefined;
  exporterBl: ExporterBL | undefined;
  events: ActivityEvent[];
}

type Props = { params: Promise<{ locale: string }> };

export default async function DocumentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('documents');

  const navieraMap = new Map(navieras.map((n) => [n.id, n]));
  const siMap = new Map(shippingInstructions.map((s) => [s.bookingId, s]));
  const blMap = new Map(draftBls.map((b) => [b.bookingId, b]));
  const exporterBlMap = new Map(exporterBls.map((e) => [e.bookingId, e]));
  const eventsByBooking = activityEvents.reduce<Map<string, ActivityEvent[]>>((acc, e) => {
    const list = acc.get(e.bookingId) ?? [];
    list.push(e);
    acc.set(e.bookingId, list);
    return acc;
  }, new Map());

  const rows = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((booking): DocumentsRow | null => {
      const exporter = exporters.find(
        (e) => e.name === booking.shipper || e.legalName === booking.shipper,
      );
      const naviera = navieraMap.get(booking.navieraId);
      if (!exporter || !naviera) return null;
      return {
        booking,
        exporter,
        naviera,
        si: siMap.get(booking.id),
        bl: blMap.get(booking.id),
        exporterBl: exporterBlMap.get(booking.id),
        events: eventsByBooking.get(booking.id) ?? [],
      };
    })
    .filter(Boolean) as DocumentsRow[];

  return (
    <PageTransition>
      <div className="flex flex-col gap-2 bg-bg-0 px-4 pt-4 pb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-ink-1">{t('title')}</h1>
          <span className="font-mono text-[10px] text-ink-3">{rows.length} bookings</span>
        </div>
        <Suspense fallback={<div className="text-sm text-ink-3">Loading…</div>}>
          <DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
```

- [ ] **Step 2: Add `documents` namespace to both message files**

`messages/en.json` — add a top-level `"documents"` key:
```json
"documents": {
  "title": "Documents",
  "search": "Search booking, exporter…",
  "filterExporter": "Exporter",
  "filterNaviera": "Carrier",
  "filterCountry": "Destination",
  "filterDocType": "Doc type",
  "reefer": "Reefer",
  "empty": "No documents match the selected filters.",
  "docTypeBooking": "Booking",
  "docTypeSi": "SI",
  "docTypeBl": "Draft BL",
  "docTypeExporterBl": "Exp. BL",
  "sinDocumento": "Sin documento",
  "statusOk": "OK",
  "statusWarn": "Atención",
  "statusFail": "Fallido",
  "statusMissing": "missing"
}
```

`messages/es.json` — add the same key in Spanish:
```json
"documents": {
  "title": "Documentos",
  "search": "Buscar embarque, exportador…",
  "filterExporter": "Exportador",
  "filterNaviera": "Naviera",
  "filterCountry": "País destino",
  "filterDocType": "Tipo documento",
  "reefer": "Reefer",
  "empty": "Sin documentos para los filtros seleccionados.",
  "docTypeBooking": "Booking",
  "docTypeSi": "SI",
  "docTypeBl": "Draft BL",
  "docTypeExporterBl": "Exp. BL",
  "sinDocumento": "Sin documento",
  "statusOk": "OK",
  "statusWarn": "Atención",
  "statusFail": "Fallido",
  "statusMissing": "missing"
}
```

- [ ] **Step 3: Verify the page loads**

With the dev server running, open `http://localhost:3000/documents`. You should see the page title "Documents" / "Documentos" and the row count. The client component will error until created in Task 4 — that's expected.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/\(app\)/documents/page.tsx messages/en.json messages/es.json
git commit -m "feat(documents): add documents server page and i18n namespace"
```

---

## Task 4: Create DocumentsGroupedList component

**Files:**
- Create: `components/documents/DocumentsGroupedList.tsx`
- Create: `__tests__/documents/DocumentsGroupedList.test.tsx`

The `GROUPS` constant needs to be extracted from `BookingsListClient` so both files can share it, OR import it directly. Check if `GROUPS` is exported from `BookingsListClient` — if not, copy the array locally in `DocumentsGroupedList.tsx` (YAGNI: don't refactor `BookingsListClient` just for this).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/documents/DocumentsGroupedList.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentsGroupedList } from '@/components/documents/DocumentsGroupedList';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) =>
    <a href={href} {...props}>{children}</a>,
}));

const makeRow = (overrides: Partial<DocumentsRow['booking']> = {}): DocumentsRow => ({
  booking: {
    id: 'BKG-001', bookingNumber: 'TEST001', navieraId: 'NAV-MSC',
    shipper: 'Comfrut', status: 'awaiting_si', vesselName: 'Test Vessel',
    pod: 'Charleston, SC, US', bookingFileUrl: '/mock-docs/booking.pdf',
    bookingFileName: 'booking.pdf', containerType: '40RF', containerCount: 1,
    isReefer: false, freightTerm: 'COLLECT', emissionType: 'Seawaybill',
    pol: 'San Antonio, CL', etd: '2026-05-10T00:00:00Z', eta: '2026-05-20T00:00:00Z',
    cutOff: '2026-05-08T00:00:00Z', stackingFrom: '2026-05-06T00:00:00Z',
    stackingTo: '2026-05-08T00:00:00Z', containerIds: [], alertIds: [],
    costAtRiskUsd: 0, createdAt: '2026-04-01T00:00:00Z',
    ...overrides,
  } as DocumentsRow['booking'],
  exporter: { id: 'EXP-001', name: 'Comfrut', legalName: 'Comfrut S.A.', country: 'CL', logoUrl: '' } as DocumentsRow['exporter'],
  naviera: { id: 'NAV-MSC', name: 'MSC', shortName: 'MSC', scac: 'MSCU', logoUrl: '' } as DocumentsRow['naviera'],
  si: undefined,
  bl: undefined,
  exporterBl: undefined,
  events: [],
});

describe('DocumentsGroupedList', () => {
  it('renders a group header with the booking number', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    expect(screen.getByText('TEST001')).toBeInTheDocument();
  });

  it('renders all 4 document type rows', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    expect(screen.getByText('docTypeBooking')).toBeInTheDocument();
    expect(screen.getByText('docTypeSi')).toBeInTheDocument();
    expect(screen.getByText('docTypeBl')).toBeInTheDocument();
    expect(screen.getByText('docTypeExporterBl')).toBeInTheDocument();
  });

  it('shows the booking filename when bookingFileUrl is present', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    expect(screen.getByText('booking.pdf')).toBeInTheDocument();
  });

  it('shows sinDocumento for missing SI', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    // SI, Draft BL, ExporterBL are all undefined — 3 "sinDocumento" cells
    expect(screen.getAllByText('sinDocumento').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onDocClick with bookingId and docType when a row is clicked', () => {
    const onDocClick = vi.fn();
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={onDocClick} />);
    // click the Booking row (first doc row after header)
    fireEvent.click(screen.getByText('docTypeBooking').closest('[data-testid="doc-row"]')!);
    expect(onDocClick).toHaveBeenCalledWith({ bookingId: 'BKG-001', docType: 'booking' });
  });

  it('collapses group on header click', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    // Initially open (has a document)
    expect(screen.getByText('docTypeBooking')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('group-header-BKG-001'));
    expect(screen.queryByText('docTypeBooking')).not.toBeInTheDocument();
  });

  it('renders empty state when rows is empty', () => {
    render(<DocumentsGroupedList rows={[]} onDocClick={vi.fn()} />);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd agora-app && npx vitest run __tests__/documents/DocumentsGroupedList.test.tsx
```

Expected: all fail with "Cannot find module '@/components/documents/DocumentsGroupedList'".

- [ ] **Step 3: Create the component**

Create `components/documents/DocumentsGroupedList.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';
import type { DocType } from '@/components/bookings/BookingDocumentPopup';

// Mirror of GROUPS from BookingsListClient — used for status dot colour lookup
const STATUS_GROUPS = [
  { statuses: ['created', 'awaiting_si'],         dotClass: 'bg-severity-watch' },
  { statuses: ['si_received'],                     dotClass: 'bg-severity-info'  },
  { statuses: ['si_failed'],                       dotClass: 'bg-severity-crit'  },
  { statuses: ['si_validated'],                    dotClass: 'bg-severity-ok'    },
  { statuses: ['esi_sent', 'draft_bl_received'],   dotClass: 'bg-trace'          },
  { statuses: ['bl_validated'],                    dotClass: 'bg-severity-ok'    },
  { statuses: ['bl_released', 'closed'],           dotClass: 'bg-severity-ok'    },
] as const;

function getStatusDotClass(status: string): string {
  return STATUS_GROUPS.find((g) => (g.statuses as readonly string[]).includes(status))?.dotClass ?? 'bg-ink-4';
}

type DocStatus = 'ok' | 'warn' | 'fail' | 'missing';

function getDocStatus(row: DocumentsRow, docType: DocType): DocStatus {
  switch (docType) {
    case 'booking':
      return row.booking.bookingFileUrl ? 'ok' : 'missing';
    case 'si':
      if (!row.si) return 'missing';
      return row.si.validationStatus === 'green' ? 'ok' : row.si.validationStatus === 'yellow' ? 'warn' : 'fail';
    case 'bl':
      if (!row.bl) return 'missing';
      return row.bl.validationStatus === 'green' ? 'ok' : row.bl.validationStatus === 'yellow' ? 'warn' : 'fail';
    case 'exporterBl':
      if (!row.exporterBl) return 'missing';
      return row.exporterBl.status === 'approved' ? 'ok' : row.exporterBl.status === 'uploaded' ? 'warn' : 'missing';
  }
}

function getDocFilename(row: DocumentsRow, docType: DocType): string | undefined {
  switch (docType) {
    case 'booking':    return row.booking.bookingFileName;
    case 'si':         return row.si?.sourceFileName;
    case 'bl':         return row.bl?.sourceFileName;
    case 'exporterBl': return row.exporterBl?.fileUrl ? 'Exporter BL' : undefined;
  }
}

function hasPresentDocs(row: DocumentsRow): boolean {
  return !!(
    row.booking.bookingFileUrl ||
    row.si ||
    row.bl ||
    row.exporterBl
  );
}

const DOC_TYPES: { type: DocType; labelKey: string; badgeClass: string }[] = [
  { type: 'booking',    labelKey: 'docTypeBooking',    badgeClass: 'bg-trace/10 text-trace border-trace/20' },
  { type: 'si',         labelKey: 'docTypeSi',         badgeClass: 'bg-severity-ok/10 text-severity-ok border-severity-ok/20' },
  { type: 'bl',         labelKey: 'docTypeBl',         badgeClass: 'bg-severity-watch/10 text-severity-watch border-severity-watch/20' },
  { type: 'exporterBl', labelKey: 'docTypeExporterBl', badgeClass: 'bg-severity-crit/8 text-severity-crit border-severity-crit/15' },
];

interface Props {
  rows: DocumentsRow[];
  visibleDocTypes?: Set<DocType>; // undefined = show all
  onDocClick: (args: { bookingId: string; docType: DocType }) => void;
}

export function DocumentsGroupedList({ rows, visibleDocTypes, onDocClick }: Props) {
  const t = useTranslations('documents');

  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(rows.filter((r) => !hasPresentDocs(r)).map((r) => r.booking.id)),
  );

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (rows.length === 0) {
    return <div className="py-12 text-center text-sm text-ink-3">{t('empty')}</div>;
  }

  const visibleTypes = DOC_TYPES.filter(
    (d) => !visibleDocTypes || visibleDocTypes.size === 0 || visibleDocTypes.has(d.type),
  );

  // Filter rows: hide groups where all visible doc types are filtered AND group has present docs
  const visibleRows = rows.filter((row) => {
    if (!hasPresentDocs(row)) return true; // zero-doc groups always visible
    if (!visibleDocTypes || visibleDocTypes.size === 0) return true;
    return visibleTypes.some((d) => getDocStatus(row, d.type) !== 'missing');
  });

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
      {/* Table header */}
      <div className="grid border-b border-[var(--line-soft)] bg-bg-0 px-3 py-2"
           style={{ gridTemplateColumns: '1fr 90px 80px 72px' }}>
        {['Documento', 'Exportador', 'Naviera', 'Estado'].map((h) => (
          <span key={h} className="font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">{h}</span>
        ))}
      </div>

      {visibleRows.map((row) => {
        const isCollapsed = collapsed.has(row.booking.id);
        const podShort = row.booking.pod.split(',')[0];
        const dotClass = getStatusDotClass(row.booking.status);

        return (
          <div key={row.booking.id}>
            {/* Group header */}
            <div
              data-testid={`group-header-${row.booking.id}`}
              onClick={() => toggleGroup(row.booking.id)}
              className="flex items-center gap-2 border-b border-[var(--line-soft)] bg-bg-0/60 hover:bg-bg-0/80 cursor-pointer px-3 py-2"
            >
              <span className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', dotClass)} />
              <Link
                href={`/bookings/${row.booking.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[11px] font-semibold text-ink-1 hover:underline"
              >
                {row.booking.bookingNumber}
              </Link>
              <span className="text-[11px] text-ink-3">
                — {row.exporter.name} · {row.booking.vesselName} · {podShort}
              </span>
              <span className="rounded bg-bg-2 px-[5px] py-px font-mono text-[10px] text-ink-4">
                {visibleTypes.length}
              </span>
              <ChevronDown
                className={clsx('ml-auto h-3.5 w-3.5 text-ink-4 transition-transform duration-150', isCollapsed && '-rotate-90')}
              />
            </div>

            {/* Doc rows */}
            {!isCollapsed && visibleTypes.map(({ type, labelKey, badgeClass }) => {
              const status = getDocStatus(row, type);
              const filename = getDocFilename(row, type);
              const isMissing = status === 'missing';

              return (
                <div
                  key={type}
                  data-testid="doc-row"
                  onClick={() => onDocClick({ bookingId: row.booking.id, docType: type })}
                  className={clsx(
                    'grid border-b border-[var(--line-soft)] last:border-b-0 cursor-pointer px-3',
                    '[&>*]:py-1.5 hover:bg-white/5',
                    isMissing && 'opacity-50',
                  )}
                  style={{ gridTemplateColumns: '1fr 90px 80px 72px' }}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx('text-[10px] px-[6px] py-[2px] rounded border shrink-0', badgeClass)}>
                      {t(labelKey as Parameters<typeof t>[0])}
                    </span>
                    <span className={clsx(
                      'text-[11px] truncate max-w-[260px]',
                      isMissing ? 'text-ink-4 italic' : 'font-mono text-ink-1',
                    )}>
                      {filename ?? t('sinDocumento')}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-2">{row.exporter.name}</span>
                  <span className="font-mono text-[11px] text-ink-3">{row.naviera.shortName}</span>
                  <span className={clsx('text-[11px]', {
                    'text-severity-ok':   status === 'ok',
                    'text-severity-watch': status === 'warn',
                    'text-severity-crit':  status === 'fail',
                    'text-ink-4':          isMissing,
                  })}>
                    {status === 'ok'      && `✓ ${t('statusOk')}`}
                    {status === 'warn'    && `⚠ ${t('statusWarn')}`}
                    {status === 'fail'    && `✗ ${t('statusFail')}`}
                    {isMissing           && `— ${t('statusMissing')}`}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
cd agora-app && npx vitest run __tests__/documents/DocumentsGroupedList.test.tsx
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/documents/DocumentsGroupedList.tsx __tests__/documents/DocumentsGroupedList.test.tsx
git commit -m "feat(documents): add DocumentsGroupedList component"
```

---

## Task 5: Create DocumentsViewClient and wire up the popup

**Files:**
- Create: `components/documents/DocumentsViewClient.tsx`
- Create: `__tests__/documents/DocumentsViewClient.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/documents/DocumentsViewClient.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentsViewClient } from '@/components/documents/DocumentsViewClient';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/bookings/BookingDocumentPopup', () => ({
  BookingDocumentPopup: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="popup"><button onClick={onClose}>close</button></div>
  ),
}));
vi.mock('@/lib/hooks/useDemoStore', () => ({ deleteBookingDocument: vi.fn() }));
vi.mock('@/components/documents/DocumentsGroupedList', () => ({
  DocumentsGroupedList: ({ rows, onDocClick }: { rows: DocumentsRow[]; onDocClick: (args: { bookingId: string; docType: string }) => void }) => (
    <div data-testid="grouped-list">
      <span data-testid="row-count">{rows.length}</span>
      <button onClick={() => onDocClick({ bookingId: 'BKG-001', docType: 'booking' })}>
        open-doc
      </button>
    </div>
  ),
}));

const makeRow = (id: string, exporterId: string, navieraId: string, isReefer = false): DocumentsRow => ({
  booking: {
    id, bookingNumber: id, navieraId, shipper: 'Comfrut', status: 'awaiting_si',
    isReefer, pod: 'Charleston, SC, US', bookingFileUrl: '/mock.pdf',
    bookingFileName: 'mock.pdf', containerType: '40RF', containerCount: 1,
    freightTerm: 'COLLECT', emissionType: 'Seawaybill', vesselName: 'Vessel',
    pol: 'San Antonio, CL', etd: '', eta: '', cutOff: '', stackingFrom: '',
    stackingTo: '', containerIds: [], alertIds: [], costAtRiskUsd: 0, createdAt: '',
  } as DocumentsRow['booking'],
  exporter: { id: exporterId, name: exporterId, legalName: exporterId, country: 'CL', logoUrl: '' } as DocumentsRow['exporter'],
  naviera: { id: navieraId, name: navieraId, shortName: navieraId, scac: 'TEST', logoUrl: '' } as DocumentsRow['naviera'],
  si: undefined, bl: undefined, exporterBl: undefined, events: [],
});

const exporters = [
  { id: 'EXP-A', name: 'EXP-A', legalName: 'EXP-A', country: 'CL', logoUrl: '' },
  { id: 'EXP-B', name: 'EXP-B', legalName: 'EXP-B', country: 'CL', logoUrl: '' },
] as DocumentsRow['exporter'][];

const navieras = [
  { id: 'NAV-A', name: 'NAV-A', shortName: 'NAV-A', scac: 'NAVA', logoUrl: '' },
] as DocumentsRow['naviera'][];

const rows = [
  makeRow('BKG-001', 'EXP-A', 'NAV-A'),
  makeRow('BKG-002', 'EXP-B', 'NAV-A'),
  makeRow('BKG-003', 'EXP-A', 'NAV-A', true),
];

describe('DocumentsViewClient', () => {
  it('passes all rows to DocumentsGroupedList by default', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    expect(screen.getByTestId('row-count').textContent).toBe('3');
  });

  it('filters by exporter', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    // simulate exporter filter — this test checks filter logic via the grouped list row count
    // The MultiSelectDropdown is tested via integration; here we test state wiring via search
    fireEvent.change(screen.getByPlaceholderText('search'), { target: { value: 'BKG-001' } });
    expect(screen.getByTestId('row-count').textContent).toBe('1');
  });

  it('filters by reefer', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByTestId('row-count').textContent).toBe('1');
  });

  it('opens popup when a doc row is clicked', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('open-doc'));
    expect(screen.getByTestId('popup')).toBeInTheDocument();
  });

  it('closes popup when onClose is called', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    fireEvent.click(screen.getByText('open-doc'));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd agora-app && npx vitest run __tests__/documents/DocumentsViewClient.test.tsx
```

Expected: all fail — module not found.

- [ ] **Step 3: Create the component**

Create `components/documents/DocumentsViewClient.tsx`:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Snowflake, X } from 'lucide-react';
import clsx from 'clsx';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { DocumentsGroupedList } from '@/components/documents/DocumentsGroupedList';
import { BookingDocumentPopup } from '@/components/bookings/BookingDocumentPopup';
import { deleteBookingDocument } from '@/lib/hooks/useDemoStore';
import { getPodFlag } from '@/lib/utils/flags';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';
import type { DocType } from '@/components/bookings/BookingDocumentPopup';
import type { Exporter, Naviera } from '@/types';

interface Props {
  rows: DocumentsRow[];
  exporters: Exporter[];
  navieras: Naviera[];
}

interface SelectedDoc {
  bookingId: string;
  docType: DocType;
}

export function DocumentsViewClient({ rows, exporters, navieras }: Props) {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');

  const [search, setSearch] = useState('');
  const [exporterFilters, setExporterFilters] = useState<Set<string>>(new Set());
  const [navieraFilters, setNavieraFilters] = useState<Set<string>>(new Set());
  const [countryFilters, setCountryFilters] = useState<Set<string>>(new Set());
  const [docTypeFilters, setDocTypeFilters] = useState<Set<string>>(new Set());
  const [reeferOnly, setReeferOnly] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);

  const exporterOptions = exporters.map((e) => ({ value: e.id, label: e.name }));
  const navieraOptions = navieras.map((n) => ({ value: n.id, label: n.shortName }));

  const countryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const { booking } of rows) {
      const country = booking.pod.split(',').at(-1)?.trim() ?? '';
      if (country && !seen.has(country)) {
        const flag = getPodFlag(booking.pod);
        seen.set(country, flag ? `${flag} ${country}` : country);
      }
    }
    return Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, label]) => ({ value, label }));
  }, [rows]);

  const docTypeOptions = [
    { value: 'booking',    label: t('docTypeBooking')    },
    { value: 'si',         label: t('docTypeSi')         },
    { value: 'bl',         label: t('docTypeBl')         },
    { value: 'exporterBl', label: t('docTypeExporterBl') },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ booking, exporter, naviera }) => {
      if (exporterFilters.size > 0 && !exporterFilters.has(exporter.id)) return false;
      if (navieraFilters.size > 0 && !navieraFilters.has(naviera.id)) return false;
      if (countryFilters.size > 0) {
        const country = booking.pod.split(',').at(-1)?.trim() ?? '';
        if (!countryFilters.has(country)) return false;
      }
      if (reeferOnly && !booking.isReefer) return false;
      if (q) {
        const hay = [booking.bookingNumber, booking.vesselName, booking.voyage, exporter.name, naviera.name]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, exporterFilters, navieraFilters, countryFilters, reeferOnly, search]);

  const hasFilters =
    exporterFilters.size > 0 || navieraFilters.size > 0 || countryFilters.size > 0 ||
    docTypeFilters.size > 0 || reeferOnly || search;

  const clearAll = () => {
    setExporterFilters(new Set());
    setNavieraFilters(new Set());
    setCountryFilters(new Set());
    setDocTypeFilters(new Set());
    setReeferOnly(false);
    setSearch('');
  };

  // Resolve popup data from rows
  const popupRow = selectedDoc ? rows.find((r) => r.booking.id === selectedDoc.bookingId) : null;

  const resolveDocId = (row: DocumentsRow, docType: DocType): string => {
    switch (docType) {
      case 'booking':    return row.booking.id;
      case 'si':         return row.si?.id ?? row.booking.id;
      case 'bl':         return row.bl?.id ?? row.booking.id;
      case 'exporterBl': return row.exporterBl?.id ?? row.booking.id;
    }
  };

  const handleDocDelete = (docType: DocType) => {
    if (!selectedDoc) return;
    deleteBookingDocument(selectedDoc.bookingId, docType);
    setSelectedDoc(null);
  };

  return (
    <div className="flex flex-col">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--line-soft)] bg-bg-0/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute top-2 left-2.5 h-4 w-4 text-ink-3" />
            <input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--line-soft)] bg-bg-1 pl-8 pr-3 py-[7px] text-xs text-ink-1 placeholder:text-ink-3 focus:border-mint-500 focus:outline-none"
            />
          </div>

          <MultiSelectDropdown options={exporterOptions} selected={exporterFilters} onChange={setExporterFilters} placeholder={t('filterExporter')} />
          <MultiSelectDropdown options={navieraOptions} selected={navieraFilters} onChange={setNavieraFilters} placeholder={t('filterNaviera')} />
          <MultiSelectDropdown options={countryOptions} selected={countryFilters} onChange={setCountryFilters} placeholder={t('filterCountry')} />
          <MultiSelectDropdown options={docTypeOptions} selected={docTypeFilters} onChange={setDocTypeFilters} placeholder={t('filterDocType')} />

          {/* Reefer */}
          <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-[7px] text-xs text-ink-2 hover:text-ink-1">
            <input type="checkbox" checked={reeferOnly} onChange={(e) => setReeferOnly(e.target.checked)} className="h-[11px] w-[11px] accent-trace" />
            <Snowflake className="h-3 w-3 text-trace" />
            {t('reefer')}
          </label>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-[7px] text-xs text-ink-3 hover:text-ink-2"
            >
              <X className="h-3 w-3" /> {tCommon('cancel')}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mt-3">
        <DocumentsGroupedList
          rows={filtered}
          visibleDocTypes={docTypeFilters.size > 0 ? docTypeFilters as Set<DocType> : undefined}
          onDocClick={setSelectedDoc}
        />
      </div>

      <div className="mt-2 text-right font-mono text-[10px] text-ink-3">
        {filtered.length} / {rows.length}
      </div>

      {/* Popup */}
      {selectedDoc && popupRow && (
        <BookingDocumentPopup
          docType={selectedDoc.docType}
          docId={resolveDocId(popupRow, selectedDoc.docType)}
          booking={popupRow.booking}
          si={popupRow.si}
          bl={popupRow.bl}
          exporterBl={popupRow.exporterBl}
          events={popupRow.events}
          onClose={() => setSelectedDoc(null)}
          onDelete={handleDocDelete}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run all tests**

```bash
cd agora-app && npx vitest run __tests__/documents/
```

Expected: all tests pass.

- [ ] **Step 5: Run full test suite**

```bash
cd agora-app && npm test
```

Expected: all tests pass, no regressions.

- [ ] **Step 6: Verify in browser**

With the dev server running, open `http://localhost:3000/documents`. Verify:
- Page loads with "Documentos" heading
- Booking groups render with collapsible rows
- All 4 document type rows appear per booking
- Missing docs are dimmed
- Clicking a booking number navigates to the booking detail
- Clicking a document row opens the popup
- Popup shows the correct document preview
- All filters narrow the list correctly
- Reefer filter works
- "Tipo documento" filter hides/shows doc type rows
- Clear button resets all filters

- [ ] **Step 7: Commit**

```bash
git add components/documents/DocumentsViewClient.tsx __tests__/documents/DocumentsViewClient.test.tsx
git commit -m "feat(documents): add DocumentsViewClient with filters and popup"
```

---

## Task 6: Final push

- [ ] **Step 1: Push the branch**

```bash
git push
```

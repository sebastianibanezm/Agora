'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';
import type { DocType } from '@/components/bookings/BookingDocumentPopup';
import type { BookingStatus } from '@/types';

// ---------------------------------------------------------------------------
// Status → dot color mapping (local copy — do NOT re-export or modify source)
// ---------------------------------------------------------------------------
const STATUS_GROUPS = [
  { statuses: ['created', 'awaiting_si'],         dotClass: 'bg-severity-watch' },
  { statuses: ['si_received'],                     dotClass: 'bg-severity-info'  },
  { statuses: ['si_failed'],                       dotClass: 'bg-severity-crit'  },
  { statuses: ['si_validated'],                    dotClass: 'bg-severity-ok'    },
  { statuses: ['esi_sent', 'draft_bl_received'],   dotClass: 'bg-trace'          },
  { statuses: ['bl_validated'],                    dotClass: 'bg-severity-ok'    },
  { statuses: ['bl_released', 'closed'],           dotClass: 'bg-severity-ok'    },
] as const;

function getDotClass(status: BookingStatus): string {
  for (const g of STATUS_GROUPS) {
    if ((g.statuses as readonly string[]).includes(status)) return g.dotClass;
  }
  return 'bg-ink-4';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function hasPresentDocs(row: DocumentsRow): boolean {
  return !!(row.booking.bookingFileUrl || row.si || row.bl || row.exporterBl);
}

function getFilename(docType: DocType, row: DocumentsRow): string | undefined {
  switch (docType) {
    case 'booking':    return row.booking.bookingFileName;
    case 'si':         return row.si?.sourceFileName;
    case 'bl':         return row.bl
                         ? row.bl.sourceFileUrl.split('/').pop() ?? 'draft-bl.pdf'
                         : undefined;
    case 'exporterBl': return row.exporterBl?.fileUrl ? 'Exporter BL' : undefined;
  }
}

type DocStatus = 'ok' | 'warn' | 'fail' | 'missing';

function getDocStatus(docType: DocType, row: DocumentsRow): DocStatus {
  switch (docType) {
    case 'booking':
      return row.booking.bookingFileUrl ? 'ok' : 'missing';
    case 'si': {
      if (!row.si) return 'missing';
      const v = row.si.validationStatus;
      if (v === 'green') return 'ok';
      if (v === 'yellow') return 'warn';
      if (v === 'red') return 'fail';
      return 'missing';
    }
    case 'bl': {
      if (!row.bl) return 'missing';
      const v = row.bl.validationStatus;
      if (v === 'green') return 'ok';
      if (v === 'yellow') return 'warn';
      if (v === 'red') return 'fail';
      return 'missing';
    }
    case 'exporterBl': {
      if (!row.exporterBl) return 'missing';
      if (row.exporterBl.status === 'approved') return 'ok';
      if (row.exporterBl.status === 'uploaded') return 'warn';
      return 'missing';
    }
  }
}

const DOC_TYPES: DocType[] = ['booking', 'si', 'bl', 'exporterBl'];

const TYPE_LABEL_KEY: Record<DocType, string> = {
  booking:    'docTypeBooking',
  si:         'docTypeSi',
  bl:         'docTypeBl',
  exporterBl: 'docTypeExporterBl',
};

const TYPE_BADGE_CLASS: Record<DocType, string> = {
  booking:    'bg-trace/10 text-trace border-trace/20',
  si:         'bg-severity-ok/10 text-severity-ok border-severity-ok/20',
  bl:         'bg-severity-watch/10 text-severity-watch border-severity-watch/20',
  exporterBl: 'bg-severity-crit/8 text-severity-crit border-severity-crit/15',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  rows: DocumentsRow[];
  visibleDocTypes?: Set<DocType>;
  onDocClick: (args: { bookingId: string; docType: DocType }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function DocumentsGroupedList({ rows, visibleDocTypes, onDocClick }: Props) {
  const t = useTranslations('documents');

  // Groups with no present docs start collapsed
  const initialCollapsed = new Set(
    rows.filter((r) => !hasPresentDocs(r)).map((r) => r.booking.id),
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(initialCollapsed);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (rows.length === 0) {
    return <div className="py-12 text-center text-sm text-ink-3">{t('empty')}</div>;
  }

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
      {/* Table header */}
      <div
        className="grid gap-3 px-4 py-2 border-b border-[var(--line-soft)]"
        style={{ gridTemplateColumns: '1fr 90px 80px 72px' }}
      >
        <span className="font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">Documento</span>
        <span className="font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">Exportador</span>
        <span className="font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">Naviera</span>
        <span className="font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">Estado</span>
      </div>

      {rows.map((row) => {
        const isCollapsed = collapsed.has(row.booking.id);
        const dotClass = getDotClass(row.booking.status);

        // Determine which doc types to render after visibleDocTypes filter
        const visibleTypes = visibleDocTypes
          ? DOC_TYPES.filter((dt) => visibleDocTypes.has(dt))
          : DOC_TYPES;

        // If visibleDocTypes is set, hide groups where ALL visible rows are missing
        // (unless the group has zero docs overall — those stay visible)
        if (visibleDocTypes && hasPresentDocs(row)) {
          const allMissing = visibleTypes.every((dt) => getDocStatus(dt, row) === 'missing');
          if (allMissing) return null;
        }

        return (
          <div key={row.booking.id} className="border-b border-[var(--line-soft)] last:border-0">
            {/* Group header */}
            <button
              data-testid={`group-header-${row.booking.id}`}
              onClick={() => toggleCollapse(row.booking.id)}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-bg-2 transition-colors text-left"
            >
              <span className={clsx('w-2 h-2 rounded-full shrink-0', dotClass)} />
              <Link
                href={`/bookings/${row.booking.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[11px] font-semibold text-ink-1 hover:underline"
              >
                {row.booking.bookingNumber}
              </Link>
              <span className="ml-auto text-ink-3 flex items-center">
                <ChevronDown
                  size={14}
                  className={clsx('transition-transform', isCollapsed && '-rotate-90')}
                />
              </span>
            </button>

            {/* Doc rows */}
            {!isCollapsed && visibleTypes.map((docType) => {
              const filename = getFilename(docType, row);
              const status = getDocStatus(docType, row);
              const isMissing = !filename;

              const statusLabel =
                status === 'ok'      ? `✓ ${t('statusOk')}` :
                status === 'warn'    ? `⚠ ${t('statusWarn')}` :
                status === 'fail'    ? `✗ ${t('statusFail')}` :
                                       `— ${t('statusMissing')}`;

              return (
                <div
                  key={docType}
                  data-testid="doc-row"
                  role="button"
                  tabIndex={0}
                  onClick={() => onDocClick({ bookingId: row.booking.id, docType })}
                  onKeyDown={(e) => e.key === 'Enter' && onDocClick({ bookingId: row.booking.id, docType })}
                  className={clsx(
                    'grid gap-3 px-4 py-2 cursor-pointer hover:bg-bg-2 transition-colors items-center',
                    isMissing && 'opacity-50',
                  )}
                  style={{ gridTemplateColumns: '1fr 90px 80px 72px' }}
                >
                  {/* Document type + filename */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={clsx(
                        'shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-mono font-medium',
                        TYPE_BADGE_CLASS[docType],
                      )}
                    >
                      {t(TYPE_LABEL_KEY[docType])}
                    </span>
                    {filename ? (
                      <span className="font-mono text-[11px] text-ink-1 truncate max-w-[260px]">
                        {filename}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-ink-4 italic">
                        {t('sinDocumento')}
                      </span>
                    )}
                  </div>

                  {/* Exporter */}
                  <span className="text-[11px] text-ink-2 truncate">{row.exporter.name}</span>

                  {/* Naviera */}
                  <span className="text-[11px] text-ink-2 truncate">{row.naviera.shortName}</span>

                  {/* Status */}
                  <span className="font-mono text-[10px] text-ink-2">{statusLabel}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Snowflake, X } from 'lucide-react';
import type { Exporter, Naviera } from '@/types';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';
import type { DocType } from '@/components/bookings/BookingDocumentPopup';
import { BookingDocumentPopup } from '@/components/bookings/BookingDocumentPopup';
import { DocumentsGroupedList, type DocStatus } from '@/components/documents/DocumentsGroupedList';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { deleteBookingDocument } from '@/lib/hooks/useDemoStore';
import { getPodFlag } from '@/lib/utils/flags';

interface Props {
  rows: DocumentsRow[];
  exporters: Exporter[];
  navieras: Naviera[];
}

interface SelectedDoc {
  bookingId: string;
  docType: DocType;
}

function resolveDocId(row: DocumentsRow, docType: DocType): string {
  switch (docType) {
    case 'booking':    return row.booking.id;
    case 'si':         return row.si?.id ?? row.booking.id;
    case 'bl':         return row.bl?.id ?? row.booking.id;
    case 'exporterBl': return row.exporterBl?.id ?? row.booking.id;
  }
}

export function DocumentsViewClient({ rows, exporters, navieras }: Props) {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');

  const [search, setSearch] = useState('');
  const [exporterFilters, setExporterFilters] = useState<Set<string>>(new Set());
  const [navieraFilters, setNavieraFilters] = useState<Set<string>>(new Set());
  const [countryFilters, setCountryFilters] = useState<Set<string>>(new Set());
  const [docTypeFilters, setDocTypeFilters] = useState<Set<string>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [reeferOnly, setReeferOnly] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDoc | null>(null);

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
        const hay = [
          booking.bookingNumber,
          booking.vesselName,
          booking.voyage,
          exporter.name,
          naviera.name,
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, exporterFilters, navieraFilters, countryFilters, reeferOnly, search]);

  const clearAll = () => {
    setSearch('');
    setExporterFilters(new Set());
    setNavieraFilters(new Set());
    setCountryFilters(new Set());
    setDocTypeFilters(new Set());
    setStatusFilters(new Set());
    setReeferOnly(false);
  };

  const hasFilters =
    search ||
    exporterFilters.size > 0 ||
    navieraFilters.size > 0 ||
    countryFilters.size > 0 ||
    docTypeFilters.size > 0 ||
    statusFilters.size > 0 ||
    reeferOnly;

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

  const docTypeOptions: { value: string; label: string }[] = [
    { value: 'booking', label: t('docTypeBooking') },
    { value: 'si', label: t('docTypeSi') },
    { value: 'bl', label: t('docTypeBl') },
    { value: 'exporterBl', label: t('docTypeExporterBl') },
  ];

  const statusOptions: { value: string; label: string }[] = [
    { value: 'ok',      label: `✓ ${t('statusOk')}` },
    { value: 'warn',    label: `⚠ ${t('statusWarn')}` },
    { value: 'fail',    label: `✗ ${t('statusFail')}` },
    { value: 'missing', label: `— ${t('statusMissing')}` },
  ];

  const visibleDocTypes = docTypeFilters.size > 0
    ? (docTypeFilters as Set<DocType>)
    : undefined;

  const activeStatusFilter = statusFilters.size > 0
    ? (statusFilters as Set<DocStatus>)
    : undefined;

  // Resolve popup row and docId
  const popupRow = selectedDoc
    ? rows.find((r) => r.booking.id === selectedDoc.bookingId) ?? null
    : null;

  function handleDocDelete(docType: DocType) {
    if (!selectedDoc) return;
    deleteBookingDocument(selectedDoc.bookingId, docType);
    setSelectedDoc(null);
  }

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

          <MultiSelectDropdown
            options={exporterOptions}
            selected={exporterFilters}
            onChange={setExporterFilters}
            placeholder={t('filterExporter')}
          />

          <MultiSelectDropdown
            options={navieraOptions}
            selected={navieraFilters}
            onChange={setNavieraFilters}
            placeholder={t('filterNaviera')}
          />

          <MultiSelectDropdown
            options={countryOptions}
            selected={countryFilters}
            onChange={setCountryFilters}
            placeholder={t('filterCountry')}
          />

          <MultiSelectDropdown
            options={docTypeOptions}
            selected={docTypeFilters}
            onChange={setDocTypeFilters}
            placeholder={t('filterDocType')}
          />

          <MultiSelectDropdown
            options={statusOptions}
            selected={statusFilters}
            onChange={setStatusFilters}
            placeholder={t('filterStatus')}
          />

          {/* Reefer */}
          <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-[7px] text-xs text-ink-2 transition-colors hover:text-ink-1">
            <input
              type="checkbox"
              checked={reeferOnly}
              onChange={(e) => setReeferOnly(e.target.checked)}
              className="h-[11px] w-[11px] accent-trace"
            />
            <Snowflake className="h-3 w-3 text-trace" />
            {t('reefer')}
          </label>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-[7px] text-xs text-ink-3 transition-colors hover:text-ink-2"
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
          visibleDocTypes={visibleDocTypes}
          statusFilter={activeStatusFilter}
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

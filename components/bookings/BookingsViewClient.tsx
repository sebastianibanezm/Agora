'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Exporter, Naviera } from '@/types';
import type { ListRow } from '@/components/bookings/BookingsListClient';
import { BookingsListClient } from '@/components/bookings/BookingsListClient';
import { BookingsKanbanClient } from '@/components/bookings/BookingsKanbanClient';
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown';
import { UploadBookingDialog } from '@/components/bookings/UploadBookingDialog';
import { getTodayDemo } from '@/lib/mock-data/today';
import { Search, Snowflake, X } from 'lucide-react';
import clsx from 'clsx';

export type { ListRow as Row };

const URGENT_MS = 24 * 3_600_000;

interface Props {
  rows: ListRow[];
  exporters: Exporter[];
  navieras: Naviera[];
}

export function BookingsViewClient({ rows, exporters, navieras }: Props) {
  const t = useTranslations('bookings');
  const tKanban = useTranslations('bookings.kanban');
  const tCommon = useTranslations('common');
  const sp = useSearchParams();

  const [view, setView] = useState<'board' | 'list'>('board');

  const initialPol = sp.get('pol') ?? '';
  const initialPod = sp.get('pod') ?? '';

  const [search, setSearch] = useState('');
  const [exporterFilters, setExporterFilters] = useState<Set<string>>(new Set());
  const [navieraFilters, setNavieraFilters] = useState<Set<string>>(new Set());
  const [reeferOnly, setReeferOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const now = useMemo(() => getTodayDemo().getTime(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ booking, exporter, naviera, highestAlertSeverity }) => {
      if (exporterFilters.size > 0 && !exporterFilters.has(exporter.id)) return false;
      if (navieraFilters.size > 0 && !navieraFilters.has(naviera.id)) return false;
      if (reeferOnly && !booking.isReefer) return false;
      if (initialPol && booking.pol !== initialPol) return false;
      if (initialPod && booking.pod !== initialPod) return false;
      if (urgentOnly) {
        const isNearCutoff = new Date(booking.cutOff ?? '').getTime() - now < URGENT_MS;
        const isCritical = highestAlertSeverity === 'critical';
        if (!isNearCutoff && !isCritical) return false;
      }
      if (q) {
        const hay = [
          booking.bookingNumber,
          booking.vesselName, booking.voyage, exporter.name, naviera.name,
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, exporterFilters, navieraFilters, reeferOnly, urgentOnly, search, initialPol, initialPod, now]);

  const clearAll = () => {
    setExporterFilters(new Set());
    setNavieraFilters(new Set());
    setReeferOnly(false);
    setUrgentOnly(false);
    setSearch('');
  };

  const hasFilters = exporterFilters.size > 0 || navieraFilters.size > 0 || reeferOnly || urgentOnly || search;

  const exporterOptions = exporters.map((e) => ({ value: e.id, label: e.name }));
  const navieraOptions = navieras.map((n) => ({ value: n.id, label: n.shortName }));

  return (
    <div className="flex flex-col">
      {/* sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--line-soft)] bg-bg-0/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <UploadBookingDialog>
            <button className="shrink-0 rounded-md bg-mint-500 px-3 py-[7px] text-xs font-medium text-bg-0 hover:bg-mint-500/90 transition-colors">
              {t('upload')}
            </button>
          </UploadBookingDialog>

          {/* search */}
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

          {/* reefer */}
          <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-[7px] text-xs text-ink-2 transition-colors hover:text-ink-1">
            <input type="checkbox" checked={reeferOnly} onChange={(e) => setReeferOnly(e.target.checked)} className="h-[11px] w-[11px] accent-trace" />
            <Snowflake className="h-3 w-3 text-trace" />
            {t('reefer')}
          </label>

          {/* urgent only — board view only */}
          {view === 'board' && (
            <button
              onClick={() => setUrgentOnly((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 rounded-md border px-2 py-[7px] text-xs transition-colors',
                urgentOnly
                  ? 'border-severity-watch bg-severity-watch/8 text-severity-watch'
                  : 'border-[var(--line-soft)] bg-bg-1 text-ink-2 hover:text-ink-1',
              )}
            >
              <span className={clsx('h-[7px] w-[7px] rounded-full', urgentOnly ? 'bg-severity-watch' : 'bg-ink-4')} />
              {tKanban('filterUrgentOnly')}
            </button>
          )}

          {/* clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-[7px] text-xs text-ink-3 transition-colors hover:text-ink-2"
            >
              <X className="h-3 w-3" /> {tCommon('cancel')}
            </button>
          )}

          {/* view toggle */}
          <div className="ml-auto flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-2 p-0.5">
            <button
              onClick={() => setView('board')}
              className={clsx('rounded px-2 py-1 text-[10px] font-medium', view === 'board' ? 'bg-bg-3 text-ink-1' : 'text-ink-3')}
            >
              {tKanban('viewBoard')}
            </button>
            <button
              onClick={() => { setView('list'); setUrgentOnly(false); }}
              className={clsx('rounded px-2 py-1 text-[10px] font-medium', view === 'list' ? 'bg-bg-3 text-ink-1' : 'text-ink-3')}
            >
              {tKanban('viewList')}
            </button>
          </div>
        </div>
      </div>

      {/* view */}
      <div className="mt-3">
        {view === 'board' ? (
          <BookingsKanbanClient rows={filtered} />
        ) : (
          <BookingsListClient rows={filtered} />
        )}
      </div>

      <div className="mt-2 text-right font-mono text-[10px] text-ink-3">
        {filtered.length} / {rows.length}
      </div>
    </div>
  );
}

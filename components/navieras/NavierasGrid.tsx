'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Naviera } from '@/types';
import { Search, Ship } from 'lucide-react';

export function NavierasGrid({ navieras }: { navieras: Naviera[] }) {
  const t = useTranslations('navieras');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return navieras;
    return navieras.filter((n) =>
      [n.name, n.shortName, n.code, n.apiCapability].join(' ').toLowerCase().includes(q),
    );
  }, [navieras, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-ink-3" />
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-[var(--line-soft)] bg-bg-1 pl-8 pr-3 py-2 text-sm text-ink-1 placeholder:text-ink-3 focus:border-mint-500 focus:outline-none"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 px-6 py-12 text-center text-sm text-ink-3">
          {t('noMatches')}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((n) => (
            <Link
              key={n.id}
              href={`/navieras/${n.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-[var(--line-soft)] bg-bg-1 p-4 transition-colors hover:border-[var(--line-mid)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/5 overflow-hidden">
                  {n.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.logoUrl} alt={n.shortName} className="h-full w-full object-contain" />
                  ) : (
                    <span className="font-mono text-[10px] font-semibold text-ink-2 group-hover:text-ink-1">
                      {n.code}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink-1">{n.shortName}</div>
                  <div className="truncate text-xs text-ink-3">{n.name}</div>
                </div>
                <Ship className="h-4 w-4 text-ink-3 group-hover:text-ink-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-sm bg-trace/15 px-1.5 py-0.5 text-[10px] text-trace">
                  {t(`apiCapability_${n.apiCapability}`)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[var(--line-soft)] pt-3 text-[11px]">
                <Stat label={t('kpi_bookings')} value={String(n.totalBookings)} />
                <Stat label={t('kpi_blTurnaround')} value={`${n.avgDraftBlTurnaroundHours}h`} />
                <Stat label={t('kpi_siRejection')} value={`${n.siRejectionRate.toFixed(1)}%`} />
                <Stat label={t('kpi_cutoffDiscipline')} value={`${n.cutoffDisciplineRate.toFixed(1)}%`} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-wider text-ink-3 uppercase">{label}</div>
      <div className="font-mono text-ink-1">{value}</div>
    </div>
  );
}

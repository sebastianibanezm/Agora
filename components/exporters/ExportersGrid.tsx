'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Exporter } from '@/types';
import { MarketChip } from '@/components/shared/MarketChip';
import { Search, Building2 } from 'lucide-react';

export function ExportersGrid({ exporters }: { exporters: Exporter[] }) {
  const t = useTranslations('exporters');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exporters;
    return exporters.filter((e) =>
      [e.name, e.legalName, e.country, e.city, e.contactName, ...e.primaryProducts]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [exporters, search]);

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exp) => (
            <Link
              key={exp.id}
              href={`/exporters/${exp.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-[var(--line-soft)] bg-bg-1 p-4 transition-colors hover:border-[var(--line-mid)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/5 text-ink-2 group-hover:text-ink-1">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink-1">{exp.name}</div>
                  <div className="truncate text-xs text-ink-3">{exp.city}, {exp.country}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {exp.primaryMarkets.map((m) => (
                  <MarketChip key={m} market={m} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[var(--line-soft)] pt-3 text-[11px]">
                <Stat label={t('kpi_orders')} value={String(exp.totalOrders)} />
                <Stat label={t('kpi_containers')} value={String(exp.totalContainers)} />
                <Stat label={t('kpi_onTimeSi')} value={`${exp.onTimeSiRate.toFixed(1)}%`} />
                <Stat label={t('kpi_quality')} value={`${exp.siQualityScore}/100`} />
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

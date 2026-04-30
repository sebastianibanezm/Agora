'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ActivityEvent } from '@/types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatTs } from '@/lib/utils/dates';
import clsx from 'clsx';

const TYPE_LABELS: Record<ActivityEvent['type'], string> = {
  booking_created: 'Booking created',
  si_received: 'SI received',
  si_validation_run: 'SI validation run',
  si_validation_passed: 'SI validation passed',
  si_validation_failed: 'SI validation failed',
  esi_generated: 'e-SI generated',
  esi_sent: 'e-SI sent',
  esi_acknowledged: 'e-SI acknowledged',
  draft_bl_received: 'Draft BL received',
  draft_bl_validation_run: 'BL validation run',
  draft_bl_validation_passed: 'BL validation passed',
  draft_bl_validation_failed: 'BL validation failed',
  bl_released_to_exporter: 'BL released',
  alert_fired: 'Alert fired',
  alert_dismissed: 'Alert dismissed',
  note_added: 'Note added',
  manual_override: 'Manual override',
};

const TYPE_COLORS: Record<ActivityEvent['type'], string> = {
  booking_created: 'bg-ink-3',
  si_received: 'bg-severity-info',
  si_validation_run: 'bg-severity-info',
  si_validation_passed: 'bg-mint-500',
  si_validation_failed: 'bg-severity-crit',
  esi_generated: 'bg-trace',
  esi_sent: 'bg-trace',
  esi_acknowledged: 'bg-trace',
  draft_bl_received: 'bg-severity-info',
  draft_bl_validation_run: 'bg-severity-info',
  draft_bl_validation_passed: 'bg-mint-500',
  draft_bl_validation_failed: 'bg-severity-crit',
  bl_released_to_exporter: 'bg-mint-500',
  alert_fired: 'bg-severity-watch',
  alert_dismissed: 'bg-ink-3',
  note_added: 'bg-ink-3',
  manual_override: 'bg-severity-watch',
};

const FILTER_IDS = ['all', 'agent', 'system', 'user'] as const;

export function BookingActivityFeed({ events }: { events: ActivityEvent[] }) {
  const t = useTranslations('bookings');
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState<typeof FILTER_IDS[number]>('all');

  const FILTER_LABELS: Record<typeof FILTER_IDS[number], string> = {
    all: t('activityFilterAll'),
    agent: t('activityFilterAgent'),
    system: t('activityFilterSystem'),
    user: t('activityFilterUser'),
  };

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (actor !== 'all' && e.actor !== actor) return false;
      if (search && !`${e.description} ${e.actorName ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, search, actor]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <Input
            placeholder={t('activitySearch')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-[var(--line-soft)] bg-bg-2 p-0.5">
          {FILTER_IDS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActor(f)}
              className={clsx(
                'rounded px-2 py-1 text-xs capitalize transition-colors',
                actor === f ? 'bg-mint-500/15 text-mint-500' : 'text-ink-3 hover:text-ink-1',
              )}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <ul className="relative space-y-3 border-l border-[var(--line-soft)] pl-4">
        {filtered.map((e) => (
          <li key={e.id} className="relative">
            <span
              className={clsx(
                'absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ring-2 ring-bg-1',
                TYPE_COLORS[e.type],
              )}
            />
            <div className="rounded-md border border-[var(--line-soft)] bg-bg-1 p-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-xs font-medium text-ink-1">{TYPE_LABELS[e.type]}</div>
                <div className="font-mono text-[10px] text-ink-3">{formatTs(e.timestamp)}</div>
              </div>
              <div className="mt-0.5 text-xs text-ink-2">{e.description}</div>
              {e.actorName && (
                <div className="mt-1 font-mono text-[10px] text-ink-3 uppercase tracking-wide">
                  {e.actor} · {e.actorName}
                </div>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-ink-3">{t('activityEmpty')}</li>
        )}
      </ul>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import type { ActivityEvent } from '@/types';
import { formatTs } from '@/lib/utils/dates';

const DOT_CLASS: Record<string, string> = {
  alert_fired: 'bg-severity-watch border-severity-watch',
  document_replaced: 'bg-severity-watch border-severity-watch',
  document_deleted: 'bg-severity-crit border-severity-crit',
  si_validation_passed: 'bg-severity-ok border-severity-ok',
  draft_bl_validation_passed: 'bg-severity-ok border-severity-ok',
  bl_released_to_exporter: 'bg-severity-ok border-severity-ok',
  esi_acknowledged: 'bg-severity-ok border-severity-ok',
  si_validation_failed: 'bg-severity-crit border-severity-crit',
  draft_bl_validation_failed: 'bg-severity-crit border-severity-crit',
};

function dotClass(type: string, actor: ActivityEvent['actor']): string {
  if (DOT_CLASS[type]) return DOT_CLASS[type];
  if (actor === 'user') return 'bg-trace border-trace';
  if (actor === 'agent') return 'bg-severity-watch border-severity-watch';
  return 'bg-bg-3 border-line-mid';
}

function toTitleCase(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface Props {
  events: ActivityEvent[];
  documentId?: string;
  emptyMessage?: string;
}

export function BookingActivityLog({ events, documentId, emptyMessage }: Props) {
  const t = useTranslations('bookings');

  const filtered = documentId
    ? events.filter((e) => e.documentId === documentId)
    : events;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const actorLabel: Record<ActivityEvent['actor'], string> = {
    system: t('actorSystem'),
    agent: t('actorAgent'),
    user: t('actorUser'),
  };

  const actorBadgeClass: Record<ActivityEvent['actor'], string> = {
    system: 'bg-severity-info/10 text-severity-info border border-severity-info/20',
    agent: 'bg-severity-ok/10 text-severity-ok border border-severity-ok/20',
    user: 'bg-trace/10 text-trace border border-trace/20',
  };

  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-ink-4">
        {emptyMessage ?? t('activityEmpty')}
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {sorted.map((event, idx) => {
        const isLast = idx === sorted.length - 1;
        return (
          <li key={event.id} className="flex gap-3">
            {/* Dot + connector column */}
            <div className="flex w-2.5 flex-shrink-0 flex-col items-center">
              <div
                className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full border ${dotClass(event.type, event.actor)}`}
              />
              {!isLast && <div className="mt-1 w-px flex-1 bg-line-mid" />}
            </div>
            {/* Content */}
            <div className={`flex min-w-0 flex-col gap-0.5 ${isLast ? 'pb-0' : 'pb-5'}`}>
              <p className="text-sm font-medium leading-snug text-ink-1">{toTitleCase(event.type)}</p>
              <p className="font-mono text-[10px] text-ink-4">{formatTs(event.timestamp)}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{event.description}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className={`inline-block rounded px-1.5 py-px font-mono text-[9px] uppercase tracking-wide ${actorBadgeClass[event.actor]}`}>
                  {event.actorName ?? actorLabel[event.actor]}
                </span>
                {event.type === 'document_replaced' && (
                  <span className="inline-block rounded border border-line-mid bg-ink-4/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wide text-ink-3">
                    {t('badgeRescanned')}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

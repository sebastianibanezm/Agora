'use client';

import { useTranslations } from 'next-intl';
import type { BookingStatus } from '@/types';
import type { KanbanRow } from '@/components/bookings/KanbanCard';
import { KanbanCard } from '@/components/bookings/KanbanCard';
import clsx from 'clsx';

// ── Column definitions ────────────────────────────────────────────────────────

interface ColumnDef {
  key: string;
  statuses: BookingStatus[];
  dotClass: string;
  titleKey: string;
  titleNs: 'lifecycle' | 'bookings.kanban';
}

const COLUMNS: ColumnDef[] = [
  { key: 'awaiting_si',      statuses: ['created', 'awaiting_si'],              dotClass: 'bg-severity-watch', titleKey: 'awaiting_si',      titleNs: 'lifecycle' },
  { key: 'si_in_review',     statuses: ['si_received'],                          dotClass: 'bg-severity-info',  titleKey: 'colSiInReview',    titleNs: 'bookings.kanban' },
  { key: 'si_failed',        statuses: ['si_failed'],                            dotClass: 'bg-severity-crit',  titleKey: 'si_failed',        titleNs: 'lifecycle' },
  { key: 'ready_to_send',    statuses: ['si_validated'],                         dotClass: 'bg-mint-500',       titleKey: 'colReadyToSend',   titleNs: 'bookings.kanban' },
  { key: 'awaiting_dbl',     statuses: ['esi_sent', 'draft_bl_received'],        dotClass: 'bg-trace',          titleKey: 'colAwaitingDraftBl', titleNs: 'bookings.kanban' },
  { key: 'ready_to_release', statuses: ['bl_validated'],                         dotClass: 'bg-mint-500',       titleKey: 'colReadyToRelease', titleNs: 'bookings.kanban' },
  { key: 'released',         statuses: ['bl_released', 'closed'],               dotClass: 'bg-ink-4',          titleKey: 'bl_released',      titleNs: 'lifecycle' },
];

interface Props {
  rows: KanbanRow[];
}

export function BookingsKanbanClient({ rows }: Props) {
  const tKanban = useTranslations('bookings.kanban');
  const tLifecycle = useTranslations('lifecycle');

  const byStatus = new Map<BookingStatus, KanbanRow[]>();
  for (const row of rows) {
    const list = byStatus.get(row.booking.status) ?? [];
    list.push(row);
    byStatus.set(row.booking.status, list);
  }

  return (
    <div className="flex gap-[10px] overflow-x-auto pb-4 pt-3">
      {COLUMNS.map((col) => {
        const colRows = col.statuses.flatMap((s) => byStatus.get(s) ?? []);
        const title = col.titleNs === 'lifecycle'
          ? tLifecycle(col.titleKey as Parameters<typeof tLifecycle>[0])
          : tKanban(col.titleKey as Parameters<typeof tKanban>[0]);

        return (
          <div
            key={col.key}
            className="flex w-[230px] min-w-[230px] flex-col overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-bg-1"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-[10px] py-2">
              <div className="flex items-center gap-[6px]">
                <span className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', col.dotClass)} />
                <span className="text-[11px] font-semibold text-ink-2">{title}</span>
              </div>
              <span className="rounded bg-bg-2 px-[5px] py-px font-mono text-[10px] text-ink-4">
                {colRows.length}
              </span>
            </div>

            {/* body */}
            <div className="flex flex-1 flex-col gap-[6px] overflow-y-auto p-[7px]">
              {colRows.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-ink-4">
                  {tKanban('emptyColumn')}
                </p>
              ) : (
                colRows.map((row) => <KanbanCard key={row.booking.id} row={row} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

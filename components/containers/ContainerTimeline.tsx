'use client';
import clsx from 'clsx';
import type { LaneTimelineEvent } from '@/types';

interface Props {
  events: LaneTimelineEvent[];
  currentTDay: string;
}

export function ContainerTimeline({ events, currentTDay }: Props) {
  return (
    <div className="relative flex items-center gap-0 overflow-x-auto pb-2">
      {/* Connector line */}
      <div className="absolute top-4 left-0 right-0 h-px bg-white/10" />
      {events.map((ev, i) => {
        const isCurrent = ev.tDay === currentTDay;
        const isPast = isPastTDay(ev.tDay, currentTDay);
        return (
          <div key={i} className="relative flex flex-col items-center flex-1 min-w-[80px]">
            <div className={clsx(
              'w-2.5 h-2.5 rounded-full border-2 z-10 mb-1',
              isCurrent && 'bg-mint-500 border-mint-500 shadow-[0_0_8px_rgba(0,230,150,0.6)]',
              isPast && !isCurrent && 'bg-white/30 border-white/30',
              !isCurrent && !isPast && 'bg-bg-2 border-white/20',
            )} />
            <span className={clsx(
              'font-mono text-[10px]',
              isCurrent && 'text-mint-500 font-semibold',
              isPast && !isCurrent && 'text-ink-3',
              !isCurrent && !isPast && 'text-ink-4',
            )}>
              {ev.tDay}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function parseTDayNum(tDay: string): number {
  if (tDay === 'T+0') return 0;
  const m = tDay.match(/^T([+-])(\d+)$/);
  if (!m || !m[1] || !m[2]) return 0;
  const n = parseInt(m[2], 10);
  return m[1] === '-' ? -n : n;
}

function isPastTDay(tDay: string, current: string): boolean {
  return parseTDayNum(tDay) < parseTDayNum(current);
}

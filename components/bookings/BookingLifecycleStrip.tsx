import type { BookingStatus } from '@/types';
import clsx from 'clsx';

const ORDER: BookingStatus[] = [
  'created',
  'awaiting_si',
  'si_received',
  'esi_sent',
  'draft_bl_received',
  'bl_validated',
  'bl_released',
  'closed',
];

const SHORT_LABELS: Record<BookingStatus, string> = {
  created: 'New',
  awaiting_si: 'Awaiting SI',
  si_received: 'SI in',
  si_validated: 'SI ✓',
  si_failed: 'SI failed',
  esi_sent: 'e-SI sent',
  draft_bl_received: 'BL in',
  bl_validated: 'BL ✓',
  bl_released: 'Released',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

interface Props {
  current: BookingStatus;
  className?: string;
}

export function BookingLifecycleStrip({ current, className }: Props) {
  const idx = ORDER.indexOf(current);
  const failed = current === 'si_failed';

  return (
    <ol className={clsx('flex items-center gap-1', className)}>
      {ORDER.map((status, i) => {
        const isCurrent = status === current || (failed && status === 'si_received');
        const reached = i <= idx || failed && i <= 2;
        return (
          <li key={status} className="flex items-center gap-1">
            <div
              className={clsx(
                'flex flex-col items-center text-center',
                isCurrent && 'scale-105',
              )}
            >
              <div
                className={clsx(
                  'rounded-full transition-all duration-200',
                  isCurrent ? 'h-3 w-3' : 'h-2 w-2',
                  reached
                    ? failed && i === 2
                      ? 'bg-severity-crit'
                      : 'bg-mint-500'
                    : 'bg-ink-4/50',
                  isCurrent && 'ring-2 ring-offset-1 ring-mint-500/40 ring-offset-[var(--color-bg-0)]',
                )}
              />
              <span
                className={clsx(
                  'mt-1 font-mono text-[10px] tracking-wide uppercase',
                  reached ? 'text-ink-2' : 'text-ink-4',
                  isCurrent && 'font-semibold text-ink-1',
                )}
              >
                {SHORT_LABELS[status]}
              </span>
            </div>
            {i < ORDER.length - 1 && (
              <div
                className={clsx(
                  'mx-0.5 h-px w-4 transition-colors',
                  i < idx ? 'bg-mint-500/60' : 'bg-ink-3/30',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

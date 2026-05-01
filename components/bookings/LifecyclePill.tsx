import { useTranslations } from 'next-intl';
import type { BookingStatus } from '@/types';
import clsx from 'clsx';

const STYLES: Record<BookingStatus, { bg: string; fg: string; ring?: string; pulse?: boolean }> = {
  created: { bg: 'bg-ink-3/15', fg: 'text-ink-2' },
  awaiting_si: { bg: 'bg-severity-watch/15', fg: 'text-severity-watch' },
  si_received: { bg: 'bg-severity-info/15', fg: 'text-severity-info' },
  si_validated: { bg: 'bg-severity-ok/15', fg: 'text-severity-ok' },
  si_failed: { bg: 'bg-severity-crit/15', fg: 'text-severity-crit', pulse: true },
  esi_sent: { bg: 'bg-trace/15', fg: 'text-trace' },
  draft_bl_received: { bg: 'bg-trace/15', fg: 'text-trace' },
  bl_validated: { bg: 'bg-severity-ok/15', fg: 'text-severity-ok' },
  bl_released: { bg: 'bg-severity-ok/20', fg: 'text-severity-ok' },
  closed: { bg: 'bg-ink-3/15', fg: 'text-ink-3' },
  cancelled: { bg: 'bg-ink-4/15', fg: 'text-ink-4' },
};

interface Props {
  status: BookingStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function LifecyclePill({ status, size = 'md', className }: Props) {
  const t = useTranslations('lifecycle');
  const s = STYLES[status];
  return (
    <span
      data-testid={`lifecycle-pill-${status}`}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        s.bg,
        s.fg,
        s.pulse && 'animate-pulse',
        className,
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          s.fg.replace('text-', 'bg-'),
        )}
      />
      {t(status)}
    </span>
  );
}

export const LIFECYCLE_COLORS: Record<BookingStatus, string> = {
  created: '#6B7689',
  awaiting_si: '#B97A1F',
  si_received: '#5A6B85',
  si_validated: '#4F7A3C',
  si_failed: '#8B2A1F',
  esi_sent: '#6B7E9A',
  draft_bl_received: '#6B7E9A',
  bl_validated: '#4F7A3C',
  bl_released: '#4F7A3C',
  closed: '#8A7860',
  cancelled: '#B5A586',
};

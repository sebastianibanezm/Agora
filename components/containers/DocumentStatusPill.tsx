import clsx from 'clsx';
import type { DocStatus } from '@/types';
import { useTranslations } from 'next-intl';

const STATUS_STYLE: Record<DocStatus, string> = {
  missing:        'bg-severity-crit/10 text-severity-crit border-severity-crit/30',
  draft:          'bg-white/10 text-ink-3 border-white/20',
  pending_review: 'bg-severity-watch/10 text-severity-watch border-severity-watch/30',
  approved:       'bg-severity-ok/10 text-severity-ok border-severity-ok/30',
  rejected:       'bg-severity-crit/10 text-severity-crit border-severity-crit/30',
  in_transit:     'bg-severity-info/10 text-severity-info border-severity-info/30',
  delivered:      'bg-severity-ok/10 text-severity-ok border-severity-ok/30',
};

export function DocumentStatusPill({ status }: { status: DocStatus }) {
  const t = useTranslations('docStatuses');
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium',
      STATUS_STYLE[status],
    )}>
      {t(status)}
    </span>
  );
}

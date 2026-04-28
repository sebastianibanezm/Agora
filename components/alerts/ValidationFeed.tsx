'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import type { Validation, Severity } from '@/types';
import { formatTs } from '@/lib/utils/dates';

const SEV_BORDER: Record<Severity, string> = {
  ok: 'border-l-severity-ok',
  info: 'border-l-severity-info',
  watch: 'border-l-severity-watch',
  risk: 'border-l-severity-risk',
  crit: 'border-l-severity-crit',
};

const STATUS_STYLE: Record<Validation['status'], string> = {
  passed: 'bg-severity-ok/10 text-severity-ok border-severity-ok/30',
  failed: 'bg-severity-crit/10 text-severity-crit border-severity-crit/30',
  warning: 'bg-severity-watch/10 text-severity-watch border-severity-watch/30',
};

export function ValidationFeed({ validations }: { validations: Validation[] }) {
  const t = useTranslations();
  const sorted = [...validations].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-bg-2/50 px-4 py-6 text-center text-ink-4 text-sm">
        {t('common.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map(v => (
        <div
          key={v.id}
          data-validation-id={v.id}
          className={clsx(
            'rounded-md border border-white/10 bg-bg-2/50 border-l-4 px-4 py-3 flex items-start gap-3',
            SEV_BORDER[v.severity],
          )}
        >
          <div className="font-mono text-xs text-ink-3 shrink-0 pt-0.5">{formatTs(v.detectedAt)}</div>
          <div className="flex-1 text-sm text-ink-1">{t(v.message)}</div>
          <span
            className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium shrink-0',
              STATUS_STYLE[v.status],
            )}
          >
            {t(`validations.${v.status}`)}
          </span>
        </div>
      ))}
    </div>
  );
}

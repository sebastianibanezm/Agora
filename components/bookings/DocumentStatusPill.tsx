import { useTranslations } from 'next-intl';
import type { ValidationStatus } from '@/types';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const STYLE_MAP: Record<ValidationStatus | 'missing', { bg: string; fg: string; Icon: typeof CheckCircle2 }> = {
  missing: { bg: 'bg-ink-3/15', fg: 'text-ink-3', Icon: AlertCircle },
  pending: { bg: 'bg-severity-info/15', fg: 'text-severity-info', Icon: Loader2 },
  green: { bg: 'bg-severity-ok/15', fg: 'text-severity-ok', Icon: CheckCircle2 },
  failed: { bg: 'bg-severity-crit/15', fg: 'text-severity-crit', Icon: AlertCircle },
};

interface Props {
  status: ValidationStatus | 'missing';
  label?: string;
  className?: string;
}

export function DocumentStatusPill({ status, label, className }: Props) {
  const t = useTranslations('bookings');
  const LABEL_MAP: Record<ValidationStatus | 'missing', string> = {
    missing: t('documentNotReceived'),
    pending: t('documentValidating'),
    green: t('documentValidated'),
    failed: t('documentIssues'),
  };
  const { bg, fg, Icon } = STYLE_MAP[status];
  const defaultLabel = LABEL_MAP[status];
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', bg, fg, className)}>
      <Icon className={clsx('h-3 w-3 shrink-0', status === 'pending' && 'animate-spin')} />
      {label ?? defaultLabel}
    </span>
  );
}

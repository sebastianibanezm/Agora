'use client';

import type { ValidationCheck } from '@/types';
import { useTranslations } from 'next-intl';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  checks: ValidationCheck[];
  title?: string;
  action?: React.ReactNode;
}

export function ValidationPanel({ checks, title, action }: Props) {
  const t = useTranslations('validation');
  const passed = checks.filter((c) => c.result === 'pass').length;
  const warnings = checks.filter((c) => c.result === 'warn').length;
  const failed = checks.filter((c) => c.result === 'fail').length;

  return (
    <div className="rounded-md border border-[var(--line-soft)] bg-bg-1">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
        <div>
          <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
            {title ?? t('title')}
          </div>
          <div className="mt-0.5 text-xs text-ink-2">
            {t('summary', { passed, warnings, failed })}
          </div>
        </div>
        {action}
      </div>
      <ul className="divide-y divide-[var(--line-soft)]">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-3 px-4 py-2.5 text-xs">
            {c.result === 'pass' && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-500" />}
            {c.result === 'warn' && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-severity-watch" />}
            {c.result === 'fail' && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-severity-crit" />}
            <div className="min-w-0 flex-1">
              <div
                className={clsx(
                  'font-medium',
                  c.result === 'fail' ? 'text-severity-crit' : c.result === 'warn' ? 'text-severity-watch' : 'text-ink-1',
                )}
              >
                {c.checkName}
              </div>
              <div className="text-ink-3">{c.details}</div>
              {(c.expected !== undefined || c.actual !== undefined) && (
                <div className="mt-1 grid grid-cols-2 gap-2 rounded-sm bg-bg-2 p-2 font-mono text-[10px]">
                  {c.expected !== undefined && (
                    <div>
                      <div className="text-[9px] tracking-wider text-ink-3 uppercase">{t('expected')}</div>
                      <div className="text-ink-1">{c.expected}</div>
                    </div>
                  )}
                  {c.actual !== undefined && (
                    <div>
                      <div className="text-[9px] tracking-wider text-ink-3 uppercase">{t('actual')}</div>
                      <div className="text-ink-1">{c.actual}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

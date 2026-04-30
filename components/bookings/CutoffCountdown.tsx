'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getTodayDemo } from '@/lib/mock-data/today';
import clsx from 'clsx';

function formatRemaining(deltaMs: number): { value: string; passed: boolean } {
  const passed = deltaMs < 0;
  const abs = Math.abs(deltaMs);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  if (days >= 2) return { value: `${days}d`, passed };
  if (days >= 1) return { value: `${days}d ${hours}h`, passed };
  if (hours >= 1) return { value: `${hours}h ${minutes}m`, passed };
  return { value: `${minutes}m`, passed };
}

interface Props {
  cutoffIso: string;
  className?: string;
  /** When true, renders "Cut-off ·" prefix in muted color. */
  prefix?: boolean;
}

export function CutoffCountdown({ cutoffIso, className, prefix = false }: Props) {
  const t = useTranslations('cutoff');
  const cutoff = new Date(cutoffIso).getTime();
  const baseDemo = getTodayDemo().getTime();
  const [effectiveNow, setEffectiveNow] = useState(baseDemo);

  useEffect(() => {
    const mountWall = Date.now();
    const id = setInterval(() => {
      setEffectiveNow(baseDemo + (Date.now() - mountWall));
    }, 60_000);
    return () => clearInterval(id);
  }, [baseDemo]);

  const delta = cutoff - effectiveNow;

  const { value, passed } = formatRemaining(delta);
  const hours = delta / 3_600_000;
  const color = passed
    ? 'text-ink-3'
    : hours <= 6
      ? 'text-severity-crit'
      : hours <= 24
        ? 'text-severity-watch'
        : 'text-ink-2';

  return (
    <span
      data-testid="cutoff-countdown"
      data-state={passed ? 'passed' : hours <= 6 ? 'crit' : hours <= 24 ? 'warn' : 'ok'}
      className={clsx('inline-flex items-center gap-1 font-mono text-xs', color, className)}
    >
      {prefix && <span className="text-ink-3 uppercase tracking-wider text-[9.5px]">{t('label')}</span>}
      {passed ? t('passed') : hours >= 0 ? t('in', { value }) : t('ago', { value })}
    </span>
  );
}

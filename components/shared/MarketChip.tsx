import type { Market } from '@/types';
import clsx from 'clsx';

const STYLES: Record<Market, { bg: string; fg: string; flag: string }> = {
  US: { bg: 'bg-blue-500/15', fg: 'text-blue-300', flag: '🇺🇸' },
  EU: { bg: 'bg-indigo-500/15', fg: 'text-indigo-300', flag: '🇪🇺' },
  IN: { bg: 'bg-orange-500/15', fg: 'text-orange-300', flag: '🇮🇳' },
  CN: { bg: 'bg-red-500/15', fg: 'text-red-300', flag: '🇨🇳' },
  MENA: { bg: 'bg-amber-500/15', fg: 'text-amber-300', flag: '🇦🇪' },
  LATAM: { bg: 'bg-emerald-500/15', fg: 'text-emerald-300', flag: '🌎' },
};

interface Props {
  market: Market;
  size?: 'sm' | 'md';
  className?: string;
}

export function MarketChip({ market, size = 'sm', className }: Props) {
  const s = STYLES[market];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        s.bg,
        s.fg,
        className,
      )}
    >
      <span aria-hidden>{s.flag}</span>
      {market}
    </span>
  );
}

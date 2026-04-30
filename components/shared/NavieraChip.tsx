import Link from 'next/link';
import type { Naviera } from '@/types';
import { Ship } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  naviera: Naviera;
  size?: 'sm' | 'md';
  asLink?: boolean;
  className?: string;
}

export function NavieraChip({ naviera, size = 'sm', asLink = true, className }: Props) {
  const logoSize = size === 'sm' ? 14 : 16;

  const inner = (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-2 text-ink-2',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs',
        asLink && 'transition-colors hover:border-[var(--line-mid)] hover:text-ink-1',
        className,
      )}
    >
      {naviera.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={naviera.logoUrl}
          alt={naviera.shortName}
          width={logoSize}
          height={logoSize}
          className="shrink-0 rounded-sm object-contain"
        />
      ) : (
        <>
          <span
            className={clsx(
              'flex shrink-0 items-center justify-center rounded-sm bg-ink-3/20 font-mono font-semibold text-ink-1',
              size === 'sm' ? 'h-3.5 w-3.5 text-[8px]' : 'h-4 w-4 text-[9px]',
            )}
            title={naviera.code}
          >
            {naviera.code.slice(0, 2)}
          </span>
          <Ship className={clsx('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        </>
      )}
      <span className="truncate">{naviera.shortName}</span>
    </span>
  );

  if (!asLink) return inner;
  return <Link href={`/navieras/${naviera.id}`}>{inner}</Link>;
}

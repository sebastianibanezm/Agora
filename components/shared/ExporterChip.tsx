import Link from 'next/link';
import type { Exporter } from '@/types';
import { Building2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  exporter: Exporter;
  size?: 'sm' | 'md';
  asLink?: boolean;
  className?: string;
}

export function ExporterChip({ exporter, size = 'sm', asLink = true, className }: Props) {
  const logoSize = size === 'sm' ? 14 : 16;

  const inner = (
    <span
      className={clsx(
        'inline-flex min-w-0 items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-2 text-ink-2',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs',
        asLink && 'transition-colors hover:border-[var(--line-mid)] hover:text-ink-1',
        className,
      )}
    >
      {exporter.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={exporter.logoUrl}
          alt={exporter.name}
          width={logoSize}
          height={logoSize}
          className="shrink-0 rounded-sm object-contain"
        />
      ) : (
        <Building2 className={clsx('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      )}
      <span className="truncate">{exporter.name}</span>
    </span>
  );
  if (!asLink) return inner;
  return <Link href={`/exporters/${exporter.id}`}>{inner}</Link>;
}

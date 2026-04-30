import type { ReactNode } from 'react';
import { EntityKpiStrip } from './EntityKpiStrip';

interface Pill {
  label: string;
  color: string;
}

interface KpiTile {
  label: string;
  value: string;
  sub?: string;
}

interface Props {
  name: string;
  subtitle?: string;
  logoUrl?: string;
  pills?: Pill[];
  kpis?: KpiTile[];
  children?: ReactNode;
}

export function EntityFiche({ name, subtitle, logoUrl, pills = [], kpis = [], children }: Props) {
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 p-6">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-bold text-ink-1 overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="h-full w-full object-contain p-1" />
          ) : (
            initials || '?'
          )}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-ink-1">{name}</h1>
          {subtitle && <div className="text-xs text-ink-3">{subtitle}</div>}
          {pills.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {pills.map((p) => (
                <span
                  key={p.label}
                  className="rounded-full px-2 py-[2px] text-[11px] font-medium"
                  style={{ background: `${p.color}22`, color: p.color }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {kpis.length > 0 && <EntityKpiStrip kpis={kpis} />}
      {children && <div className="mt-6 flex flex-col gap-6">{children}</div>}
    </div>
  );
}

interface KpiTile {
  label: string;
  value: string;
  sub?: string;
}

interface Props {
  kpis: KpiTile[];
}

export function EntityKpiStrip({ kpis }: Props) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))` }}>
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-md border border-[var(--line-soft)] bg-bg-2 px-4 py-3"
        >
          <div className="mb-1 font-mono text-[10px] tracking-wider text-ink-3 uppercase">{k.label}</div>
          <div className="font-mono text-lg font-semibold text-ink-1">{k.value}</div>
          {k.sub && <div className="text-[11px] text-ink-3">{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

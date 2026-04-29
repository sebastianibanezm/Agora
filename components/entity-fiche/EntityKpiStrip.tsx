interface KpiTile {
  label: string;
  value: string;
  sub: string;
}

interface Props {
  kpis: KpiTile[];
}

export function EntityKpiStrip({ kpis }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: '12px', margin: '16px 0' }}>
      {kpis.map(k => (
        <div key={k.label} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{k.label}</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{k.value}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

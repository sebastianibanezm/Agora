import type { ReactNode } from 'react';
import { EntityKpiStrip } from './EntityKpiStrip';
import { RelationshipHistory } from './RelationshipHistory';

interface Pill {
  label: string;
  color: string;
}

interface KpiTile {
  label: string;
  value: string;
  sub: string;
}

interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface Props<P, C> {
  name: string;
  pills: Pill[];
  kpis: KpiTile[];
  pos: P[];
  containers: C[];
  poColumns: Column<P>[];
  containerColumns: Column<C>[];
  children: ReactNode;
}

export function EntityFiche<P, C>({ name, pills, kpis, pos, containers, poColumns, containerColumns, children }: Props<P, C>) {
  const initials = name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: '#ffffff18', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '16px', color: '#e2e8f0', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>{name}</h1>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {pills.map(p => (
              <span key={p.label} style={{ padding: '2px 8px', borderRadius: '10px', background: p.color + '22', color: p.color, fontSize: '11px', fontWeight: 500 }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <EntityKpiStrip kpis={kpis} />
      <RelationshipHistory pos={pos} containers={containers} poColumns={poColumns} containerColumns={containerColumns} />
      <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {children}
      </div>
    </div>
  );
}

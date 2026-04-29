import type { ReactNode } from 'react';

interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface Props<P, C> {
  pos: P[];
  containers: C[];
  poColumns: Column<P>[];
  containerColumns: Column<C>[];
}

export function RelationshipHistory<P, C>({ pos, containers, poColumns, containerColumns }: Props<P, C>) {
  const renderTable = <T,>(rows: T[], columns: Column<T>[]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ffffff12' }}>
          {columns.map(c => (
            <th key={c.label} style={{ padding: '6px 8px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #ffffff08' }}>
            {columns.map(c => (
              <td key={c.label} style={{ padding: '8px', color: '#94a3b8' }}>{c.render(row)}</td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={columns.length} style={{ padding: '16px 8px', color: '#334155', textAlign: 'center' }}>—</td></tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '16px 0' }}>
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Purchase Orders</h3>
        {renderTable(pos, poColumns)}
      </div>
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Containers</h3>
        {renderTable(containers, containerColumns)}
      </div>
    </div>
  );
}

import { importers } from '@/lib/mock-data/importers';
import Link from 'next/link';

export default function ImportersPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>Importers</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {importers.map(imp => (
          <Link key={imp.id} href={`/importers/${imp.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{imp.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{imp.country} · {imp.market}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

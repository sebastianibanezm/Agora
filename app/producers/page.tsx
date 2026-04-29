import { PageTransition } from '@/components/shared/PageTransition';
import { producers } from '@/lib/mock-data/producers';
import Link from 'next/link';

export default function ProducersPage() {
  return (
    <PageTransition>
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>Producers</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {producers.map(p => (
            <Link key={p.id} href={`/producers/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{p.region} · SAG {p.sagId}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

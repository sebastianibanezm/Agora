import type { ProductProfile } from '@/types';
import { MiniSeasonBar } from '@/components/shared/MiniSeasonBar';

interface Props {
  product: ProductProfile;
}

export function ProductProfileCard({ product }: Props) {
  const parts = (product.seasonality ?? 'Jan-Dec').split(/[–\-]/);
  const seasonStart = parts[0]?.trim() ?? 'Jan';
  const seasonEnd = parts[1]?.trim() ?? 'Dec';

  return (
    <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{product.id.replace(/_/g, ' ')}</div>
        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{product.hsCode}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span style={{ color: '#64748b' }}>Season: {product.seasonality}</span>
        <span style={{ color: product.requiresColdChain ? '#7DD3FC' : '#64748b' }}>
          {product.requiresColdChain ? 'Cold chain' : 'Ambient'}
        </span>
      </div>
      <MiniSeasonBar start={seasonStart} end={seasonEnd} />
    </div>
  );
}

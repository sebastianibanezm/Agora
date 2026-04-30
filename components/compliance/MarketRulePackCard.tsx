import { getTranslations } from 'next-intl/server';
import type { MarketProfileExtended } from '@/types';

interface Props {
  market: MarketProfileExtended;
}

const MARKET_COLORS: Record<string, string> = {
  CN: '#EF4444', EU: '#3B82F6', US: '#8B5CF6', IN: '#F97316', MENA: '#F59E0B',
};

export async function MarketRulePackCard({ market }: Props) {
  const t = await getTranslations('compliance');
  const color = MARKET_COLORS[market.id] ?? '#64748b';

  const rows = [
    { label: t('inspectionAuthority'), value: market.inspectionAuthority },
    ...(market.digitalPhytoSystem ? [{ label: t('digitalSystem'), value: market.digitalPhytoSystem }] : []),
    { label: t('registrations'),   value: market.registrationsRequired.join(', ') },
    { label: t('labelLanguages'),  value: market.labelLanguageRequired.join(', ') },
  ];

  return (
    <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ height: '4px', background: color }} />
      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '15px', marginBottom: '12px' }}>{market.id}</div>

        {rows.map(row => (
          <div key={row.label} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{row.label}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

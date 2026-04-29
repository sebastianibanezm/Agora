import { marketProfiles } from '@/lib/mock-data/market-rules';
import { productProfiles } from '@/lib/mock-data/product-profiles';
import { alerts } from '@/lib/mock-data/alerts';
import { commercialProfiles } from '@/lib/mock-data/commercial-profiles';
import { MarketRulePackCard } from '@/components/compliance/MarketRulePackCard';
import { ProductProfileCard } from '@/components/compliance/ProductProfileCard';
import { CommercialProfileCard } from '@/components/compliance/CommercialProfileCard';
import { SentinelQueue } from '@/components/compliance/SentinelQueue';

export default function CompliancePage() {
  const complianceAlerts = alerts.filter(a => a.category === 'market_compliance');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Market Rule Packs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {marketProfiles.slice(0, 3).map(m => (
            <MarketRulePackCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Product Profiles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {productProfiles.map(p => (
            <ProductProfileCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Commercial Profiles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {commercialProfiles.map(p => (
            <CommercialProfileCard key={p.id} profile={p} isDraft={p.isDraft} />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Master Data Sentinel Queue</h2>
        <SentinelQueue alerts={complianceAlerts} />
      </section>
    </div>
  );
}

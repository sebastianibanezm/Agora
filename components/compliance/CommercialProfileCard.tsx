import type { CommercialProfile } from '@/types';

interface Props {
  profile: CommercialProfile;
  isDraft?: boolean;
  activePOCount?: number;
}

export function CommercialProfileCard({ profile, isDraft = false, activePOCount = 0 }: Props) {
  const avgDaysOk = profile.avgCollectionDays == null ? true
    : profile.paymentMethod === 'L/C' ? profile.avgCollectionDays <= 7
    : profile.avgCollectionDays <= 45;

  return (
    <div style={{
      background: '#1a1f2e',
      border: isDraft ? '1px dashed #ffffff30' : '1px solid #ffffff12',
      borderRadius: '8px', padding: '14px', opacity: isDraft ? 0.55 : 1,
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>
        {profile.label.replace('commercial.', '').replace(/_/g, ' ')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
        <div><span style={{ color: '#e2e8f0', fontWeight: 600 }}>{profile.incoterm}</span> · {profile.paymentTerms}</div>
        {profile.bank && <div>Banco: {profile.bank}</div>}
        {profile.currency && <div>Moneda: {profile.currency}</div>}
        {profile.avgCollectionDays != null && (
          <div style={{ color: avgDaysOk ? '#00E696' : '#F59E0B' }}>
            Cobro promedio: {profile.avgCollectionDays}d
          </div>
        )}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #ffffff08' }}>
        {isDraft && <span style={{ fontSize: '10px', color: '#64748b' }}>Draft</span>}
        {activePOCount > 0 && <span style={{ fontSize: '11px', color: '#94a3b8' }}>{activePOCount} active POs</span>}
      </div>
    </div>
  );
}

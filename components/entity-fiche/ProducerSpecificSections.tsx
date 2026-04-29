import type { Producer } from '@/types';
import { VolumeTimeSeries } from '@/components/shared/VolumeTimeSeries';
import { MiniSeasonBar } from '@/components/shared/MiniSeasonBar';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const WarnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

interface Props {
  producer: Producer;
}

export function ProducerSpecificSections({ producer }: Props) {
  return (
    <>
      {/* Volume time series */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Volumen por Temporada</h2>
        <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
          <VolumeTimeSeries data={producer.volumeHistory} />
        </div>
      </section>

      {/* Certified products */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Productos Certificados</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {producer.certifiedProducts.map(cp => (
            <div key={cp.productId} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{cp.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{cp.hsCode}</div>
                </div>
                <span style={{ fontSize: '11px', color: cp.requiresColdChain ? '#7DD3FC' : '#64748b' }}>
                  {cp.requiresColdChain ? 'Cold chain' : 'Ambient'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>Season: {cp.seasonStart}–{cp.seasonEnd}</div>
                <MiniSeasonBar start={cp.seasonStart} end={cp.seasonEnd} />
              </div>
              {cp.coldProtocol && (
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Protocol: {cp.coldProtocol}</div>
              )}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {cp.enabledMarkets.map(m => (
                  <span key={m} style={{ padding: '1px 6px', borderRadius: '8px', background: '#00E69622', color: '#00E696', fontSize: '10px' }}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAG certifications */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Certificaciones SAG</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {producer.sagCertifications.map(cert => {
            const isOk = cert.daysUntilExpiry > 60;
            const isCrit = cert.daysUntilExpiry <= 14;
            const statusColor = isCrit ? '#EF4444' : !isOk ? '#F59E0B' : '#00E696';
            const statusLabel = isOk ? 'Vigente' : `Vence en ${cert.daysUntilExpiry}d`;

            return (
              <div key={cert.id} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: statusColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor }}>
                  {isOk ? <CheckIcon /> : <WarnIcon />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{cert.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{cert.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {new Date(cert.expiryDate).toLocaleDateString('es-CL')}
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: '10px', background: statusColor + '22', color: statusColor, fontSize: '11px' }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

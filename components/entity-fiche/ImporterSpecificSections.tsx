import type { Importer } from '@/types';
import { VolumeTimeSeries } from '@/components/shared/VolumeTimeSeries';

interface Props {
  importer: Importer;
}

export function ImporterSpecificSections({ importer }: Props) {
  return (
    <>
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Volumen por Temporada</h2>
        <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px' }}>
          <VolumeTimeSeries data={importer.volumeHistory} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Perfil de Mercado</h2>
        <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Autoridad de Inspección', values: importer.marketProfile.inspectionAuthority },
            { label: 'Sistema Digital', values: [importer.marketProfile.digitalSystem] },
            { label: 'Registros Requeridos', values: importer.marketProfile.requiredRegistrations },
            { label: 'Idiomas de Etiqueta', values: importer.marketProfile.labelLanguages },
            ...(importer.marketProfile.coldTreatmentOptions
              ? [{ label: 'Tratamiento de Frío', values: importer.marketProfile.coldTreatmentOptions }]
              : []),
          ].map(row => (
            <div key={row.label}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{row.label}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {row.values.map(v => (
                  <span key={v} style={{ padding: '2px 8px', borderRadius: '10px', background: '#ffffff0d', fontSize: '11px', color: '#94a3b8' }}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Historial de Pagos</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ffffff12', color: '#64748b' }}>
              {['PO', 'Método', 'Banco', 'Monto', 'Días', 'Estado'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {importer.paymentHistory.map(p => (
              <tr key={p.poId} style={{ borderBottom: '1px solid #ffffff08', color: '#94a3b8' }}>
                <td style={{ padding: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#00E696' }}>{p.poId}</td>
                <td style={{ padding: '8px' }}>{p.method}</td>
                <td style={{ padding: '8px' }}>{p.bank}</td>
                <td style={{ padding: '8px' }}>${p.amount.toLocaleString()}</td>
                <td style={{ padding: '8px' }}>{p.daysToCollect != null ? `${p.daysToCollect}d` : '—'}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ color: p.status === 'paid' ? '#00E696' : '#F59E0B' }}>
                    {p.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

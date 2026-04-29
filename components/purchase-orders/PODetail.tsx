import type { PurchaseOrder, Importer, DocumentInstance, Container } from '@/types';
import { POKpiStrip } from './POKpiStrip';
import { POResumenEjecutivo } from './POResumenEjecutivo';
import { POLifecycleTimeline } from './POLifecycleTimeline';
import { PODocumentSection } from './PODocumentSection';
import { differenceInDays } from 'date-fns';
import { getTodayDemo } from '@/lib/utils/dates';

interface Props {
  po: PurchaseOrder;
  importer: Importer;
  documents: DocumentInstance[];
  linkedContainers: Container[];
}

export function PODetail({ po, importer, documents, linkedContainers }: Props) {
  const today = getTodayDemo();
  const pills = [
    { key: 'status',   label: po.status,                                    color: '#3B82F6' },
    { key: 'importer', label: importer.name,                                color: '#8B5CF6' },
    { key: 'product',  label: po.productId.replace(/_/g, ' '),              color: '#00E696' },
    { key: 'market',   label: po.market,                                    color: '#F97316' },
    { key: 'incoterm', label: po.incotermPaymentId,                         color: '#F59E0B' },
    { key: 'payment',  label: importer.paymentHistory.find(p => p.poId === po.id)?.method ?? po.incotermPaymentId, color: '#7DD3FC' },
    { key: 'date',     label: new Date(po.issuedAt).toLocaleDateString('es-CL'), color: '#64748b' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', color: '#e2e8f0', fontWeight: 700, marginBottom: '12px' }}>{po.id}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {pills.map(p => (
            <span key={p.key} style={{ padding: '3px 10px', borderRadius: '12px', background: p.color + '22', color: p.color, fontSize: '12px', fontWeight: 500 }}>{p.label}</span>
          ))}
        </div>
      </div>
      <POKpiStrip po={po} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
        <POResumenEjecutivo po={po} />
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Ciclo de Vida</h2>
          <POLifecycleTimeline events={po.events} />
        </section>
        <PODocumentSection documents={documents} />
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Fulfillment & Contraparte</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
            <div>
              <h3 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 500 }}>Contenedores vinculados</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ffffff12', color: '#64748b' }}>
                    {['ID', 'Producto', 'Etapa', 'T-Day'].map(h => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 500 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {linkedContainers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #ffffff08', color: '#94a3b8' }}>
                      <td style={{ padding: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#00E696', fontSize: '11px' }}>{c.id}</td>
                      <td style={{ padding: '8px' }}>{c.productLabel}</td>
                      <td style={{ padding: '8px' }}>{c.status}</td>
                      <td style={{ padding: '8px' }}>{(() => { const d = differenceInDays(new Date(c.etd), today); return `T${d >= 0 ? '+' : ''}${d}d`; })()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
              <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{importer.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{importer.country} · {importer.market}</div>
              {importer.creditRating && <div style={{ fontSize: '12px', color: '#00E696', fontFamily: 'JetBrains Mono, monospace' }}>{importer.creditRating}</div>}
              <div style={{ fontSize: '12px', color: '#64748b' }}>Avg payment: {importer.avgPaymentDays}d</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import type { PurchaseOrder } from '@/types';

const StatusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2h-2"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>
  </svg>
);
const ColdIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" strokeWidth="1.5">
    <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="5.64" y1="5.64" x2="18.36" y2="18.36"/><line x1="5.64" y1="18.36" x2="18.36" y2="5.64"/>
  </svg>
);
const DocsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="11" y2="17"/>
  </svg>
);
const FinanceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

interface Props { po: PurchaseOrder }

export function POResumenEjecutivo({ po }: Props) {
  const statusLabel: Record<string, string> = {
    draft: 'Borrador', confirmed: 'Confirmado', in_fulfillment: 'En Ejecución',
    delivered: 'Entregado', cancelled: 'Cancelado',
  };

  const gridItems = [
    { icon: <StatusIcon />, label: 'Estado de PO', value: statusLabel[po.status] ?? po.status },
    { icon: <ColdIcon />, label: 'Cadena de frío', value: po.events.find(e => e.type === 'bl_issued') ? 'Monitoreo activo' : 'Pendiente' },
    { icon: <DocsIcon />, label: 'Documentación', value: po.events.find(e => e.type === 'docs_submitted') ? 'Presentada' : 'En proceso' },
    { icon: <FinanceIcon />, label: 'Situación financiera', value: po.events.find(e => e.type === 'payment_received') ? 'Pago recibido' : 'Pendiente de pago' },
  ];

  return (
    <section>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Resumen Ejecutivo</h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
        PO {po.id} en estado <strong style={{ color: '#e2e8f0' }}>{statusLabel[po.status]}</strong> con {po.containerIds.length} contenedor(es) asignado(s).
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[po.market, po.incotermPaymentId, po.status].map(tag => (
          <span key={tag} style={{ padding: '3px 10px', borderRadius: '12px', background: '#ffffff0d', fontSize: '11px', color: '#94a3b8' }}>{tag}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {gridItems.map(item => (
          <div key={item.label} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

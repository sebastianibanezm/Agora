import type { PurchaseOrder } from '@/types';
import { getTodayDemo } from '@/lib/utils/dates';
import { differenceInDays } from 'date-fns';
import { getTranslations } from 'next-intl/server';

interface Props { po: PurchaseOrder }

export async function POKpiStrip({ po }: Props) {
  const t = await getTranslations('purchaseOrders');
  const today = getTodayDemo();
  const daysToDelivery = differenceInDays(new Date(po.deliveryWindow.to), today);
  const lastPayment = po.events.find(e => e.type === 'payment_received');

  const tiles = [
    { label: t('kpi.totalValue'),    value: `$${(po.valueUsd / 1000).toFixed(0)}k`, sub: t('kpi.usd') },
    { label: t('kpi.quantity'),      value: `${(po.quantityKg / 1000).toFixed(1)}t`, sub: t('kpi.kg') },
    { label: t('kpi.containers'),    value: String(po.containerIds.length), sub: t('kpi.units') },
    { label: t('kpi.daysToDelivery'), value: daysToDelivery > 0 ? `${daysToDelivery}d` : t('kpi.past'), sub: '' },
    { label: t('kpi.payment'),       value: lastPayment ? t('kpi.received') : t('kpi.pending'), sub: po.incotermPaymentId },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', margin: '16px 0' }}>
      {tiles.map(t => (
        <div key={t.label} style={{ background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{t.label}</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{t.value}</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

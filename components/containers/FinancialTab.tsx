'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { commercialProfiles } from '@/lib/mock-data/commercial-profiles';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { formatUsd } from '@/lib/utils/currency';

// Demo-grade margin proxy: 22% baseline minus risk drag.
function projectedMarginPct(valueUsd: number, riskUsd: number): number {
  const baseline = 0.22;
  const drag = valueUsd > 0 ? riskUsd / valueUsd : 0;
  return Math.max(0, baseline - drag);
}

export function FinancialTab({ container }: { container: Container }) {
  const t = useTranslations();
  const cp = commercialProfiles.find(c => c.id === container.commercialId)!;
  const po = purchaseOrders.find(p => p.id === container.purchaseOrderId);
  const poValue = po?.valueUsd ?? container.valueUsd;
  const risk = container.costAtRiskUsd ?? 0;
  const marginPct = projectedMarginPct(container.valueUsd, risk);
  const paymentStatusKey =
    risk > 0 ? 'financial.paymentStatusAtRisk' : 'financial.paymentStatusOnTrack';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Cell
        label={t('financial.poValue')}
        value={formatUsd(poValue, 'es')}
        mono
      />
      <Cell label={t('financial.incoterm')} value={cp.incoterm} mono />
      <Cell label={t('financial.paymentTerms')} value={cp.paymentTerms} />
      <Cell
        label={t('financial.paymentStatus')}
        value={t(paymentStatusKey)}
        className={risk > 0 ? 'text-severity-watch' : 'text-severity-ok'}
      />
      <Cell
        label={t('financial.costAtRisk')}
        value={formatUsd(risk, 'es')}
        mono
        className={risk > 0 ? 'text-severity-risk' : 'text-ink-1'}
      />
      <Cell
        label={t('financial.projectedMargin')}
        value={`${(marginPct * 100).toFixed(1)}%`}
        mono
      />
    </div>
  );
}

function Cell({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className="rounded bg-bg-2/50 border border-white/10 p-3">
      <div className="text-xs text-ink-3 mb-1">{label}</div>
      <div className={clsx(mono && 'font-mono', 'text-sm text-ink-1', className)}>{value}</div>
    </div>
  );
}

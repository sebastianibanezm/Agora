'use client';

import type { DraftBL, ShippingInstruction } from '@/types';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import clsx from 'clsx';

function ComparisonRow({
  label,
  siValue,
  blValue,
  match,
}: {
  label: string;
  siValue: React.ReactNode;
  blValue: React.ReactNode;
  match: boolean;
}) {
  return (
    <tr className={clsx('border-t border-[var(--line-soft)]', !match && 'bg-severity-crit/5')}>
      <td className="px-3 py-2 font-mono text-[10px] tracking-wider text-ink-3 uppercase">{label}</td>
      <td className="px-3 py-2 text-xs text-ink-2">{siValue || <span className="text-ink-3">—</span>}</td>
      <td
        className={clsx(
          'px-3 py-2 text-xs',
          match ? 'text-ink-1' : 'text-severity-crit font-medium',
        )}
      >
        {blValue || <span className="text-ink-3">—</span>}
      </td>
    </tr>
  );
}

function eq(a: unknown, b: unknown): boolean {
  if (a == null || b == null) return a === b;
  return String(a).toLowerCase().replace(/[\s.,]+/g, ' ').trim() ===
    String(b).toLowerCase().replace(/[\s.,]+/g, ' ').trim();
}

function eqWeight(a: number, b: number): boolean {
  if (a === 0 && b === 0) return true;
  return Math.abs(a - b) / Math.max(a, b) <= 0.005;
}

interface Props {
  bl: DraftBL;
  si: ShippingInstruction;
}

export function DraftBLViewer({ bl, si }: Props) {
  const t = useTranslations('blViewer');
  const blF = bl.parsedFields;
  const siF = si.parsedFields;

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
      {/* PDF preview */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">Draft BL · {blF.blNumber}</div>
          <a
            href={bl.sourceFileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-md border border-[var(--line-soft)] bg-bg-2">
          {bl.sourceFileUrl.endsWith('.pdf') ? (
            <iframe src={bl.sourceFileUrl} title={blF.blNumber} className="h-full min-h-[480px] w-full rounded-md" />
          ) : (
            <img src={bl.sourceFileUrl} alt={`Draft BL ${blF.blNumber}`} className="h-full min-h-[480px] w-full rounded-md object-contain" />
          )}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="overflow-y-auto rounded-md border border-[var(--line-soft)] bg-bg-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--line-soft)]">
              <th className="px-3 py-2 text-left font-mono text-[9px] tracking-wider text-ink-3 uppercase">Field</th>
              <th className="px-3 py-2 text-left font-mono text-[9px] tracking-wider text-ink-3 uppercase">SI</th>
              <th className="px-3 py-2 text-left font-mono text-[9px] tracking-wider text-ink-3 uppercase">Draft BL</th>
            </tr>
          </thead>
          <tbody>
            <ComparisonRow label={t('field_blNumber')} siValue={siF.blNumber} blValue={blF.blNumber} match={eq(siF.blNumber, blF.blNumber)} />
            <ComparisonRow label={t('field_bookingRef')} siValue={siF.bookingReference} blValue={blF.bookingReference} match={eq(siF.bookingReference, blF.bookingReference)} />
            <ComparisonRow label={t('field_vesselVoyage')} siValue={siF.vesselVoyage} blValue={blF.vesselVoyage} match={eq(siF.vesselVoyage, blF.vesselVoyage)} />
            <ComparisonRow label={t('field_pol')} siValue={siF.portOfLoading} blValue={blF.pol} match={eq(siF.portOfLoading, blF.pol)} />
            <ComparisonRow label={t('field_pod')} siValue={siF.portOfDischarge} blValue={blF.pod} match={eq(siF.portOfDischarge, blF.pod)} />
            <ComparisonRow
              label={t('field_consignee')}
              siValue={`${siF.consignee.name} — ${siF.consignee.address}`}
              blValue={blF.consignee}
              match={eq(siF.consignee.name, blF.consignee.split(',')[0])}
            />
            <ComparisonRow
              label={t('field_notify')}
              siValue={`${siF.notify.name} — ${siF.notify.address}`}
              blValue={blF.notify}
              match={eq(siF.notify.name, blF.notify.split(',')[0])}
            />
            <ComparisonRow
              label={t('field_shipper')}
              siValue={`${siF.shipper.name} — ${siF.shipper.address}`}
              blValue={blF.shipper}
              match={eq(siF.shipper.name, blF.shipper.split(',')[0])}
            />
            <ComparisonRow label={t('field_containerNumber')} siValue="—" blValue={blF.containerNumber} match={true} />
            <ComparisonRow label={t('field_sealNumber')} siValue="—" blValue={blF.sealNumber} match={true} />
            <ComparisonRow
              label={t('field_netWeight')}
              siValue={`${siF.totalKgNet.toLocaleString()} kg`}
              blValue={`${blF.netWeight.toLocaleString()} kg`}
              match={eqWeight(siF.totalKgNet, blF.netWeight)}
            />
            <ComparisonRow
              label={t('field_grossWeight')}
              siValue={`${siF.totalKgGross.toLocaleString()} kg`}
              blValue={`${blF.grossWeight.toLocaleString()} kg`}
              match={eqWeight(siF.totalKgGross, blF.grossWeight)}
            />
            <ComparisonRow label={t('field_freightTerms')} siValue={siF.freightTerms} blValue={blF.freightTerms} match={eq(siF.freightTerms, blF.freightTerms)} />
            <ComparisonRow label={t('field_cargo')} siValue={`${siF.cargo[0]?.product ?? ''}`} blValue={blF.cargoDescription} match={true} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

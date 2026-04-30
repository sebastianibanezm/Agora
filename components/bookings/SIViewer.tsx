'use client';

import type { ShippingInstruction } from '@/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { formatDate, formatTs } from '@/lib/utils/dates';

interface Props {
  si: ShippingInstruction;
  locale: 'es' | 'en';
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-xs">
      <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">{label}</div>
      <div className="text-ink-1">{value || <span className="text-ink-3">—</span>}</div>
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-[var(--line-soft)] bg-bg-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-ink-2 hover:text-ink-1"
      >
        <span className="font-mono text-[10px] tracking-wider uppercase">{title}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && <div className="border-t border-[var(--line-soft)] px-3 py-2">{children}</div>}
    </div>
  );
}

export function SIViewer({ si, locale }: Props) {
  const t = useTranslations('siViewer');
  const f = si.parsedFields;

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left: PDF viewer */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">{t('viewerTitle')}</div>
          <a
            href={si.sourceFileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink-1"
          >
            <ExternalLink className="h-3 w-3" />
            {t('openInTab')}
          </a>
        </div>
        <div className="relative flex-1 rounded-md border border-[var(--line-soft)] bg-bg-2">
          <iframe
            src={si.sourceFileUrl}
            title={si.sourceFileName}
            className="h-full min-h-[480px] w-full rounded-md"
          />
        </div>
        <div className="font-mono text-[10px] text-ink-3">
          {si.sourceFileName} · {t('uploadedAt', { when: formatTs(si.receivedAt) })}{' '}
          {t(`uploadedVia_${si.uploadedVia}`)}
        </div>
      </div>

      {/* Right: parsed fields */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        <Section title={t('section_identity')}>
          <Field label={t('field_embarque')} value={f.embarqueNumber} />
          <Field label={t('field_po')} value={f.poNumber} />
          <Field label={t('field_pol')} value={f.portOfLoading} />
          <Field label={t('field_pod')} value={f.portOfDischarge} />
          <Field label={t('field_finalDestination')} value={f.finalDestination} />
          <Field label={t('field_vesselVoyage')} value={f.vesselVoyage} />
          <Field label={t('field_naviera')} value={f.naviera} />
          <Field label={t('field_forwarder')} value={f.forwarder} />
          <Field label={t('field_bookingRef')} value={<span className="font-mono">{f.bookingReference}</span>} />
          <Field label={t('field_blNumber')} value={f.blNumber ? <span className="font-mono">{f.blNumber}</span> : '—'} />
          <Field label={t('field_salesModality')} value={f.salesModality} />
          <Field label={t('field_paymentForm')} value={f.paymentForm} />
          <Field label={t('field_incoterm')} value={f.incoterm} />
        </Section>

        <Section title={t('section_container')}>
          <Field label={t('field_containerCount')} value={f.containerCount} />
          <Field label={t('field_containerType')} value={f.containerType} />
          {typeof f.setpointC === 'number' && (
            <Field label={t('field_setpoint')} value={`${f.setpointC} °C`} />
          )}
          <Field label={t('field_deposito')} value={f.deposito} />
          <Field label={t('field_generator')} value={f.generator} />
          <Field label={t('field_transport')} value={f.transport} />
          <Field label={t('field_truckType')} value={f.truckType} />
          <Field label={t('field_freightTerms')} value={f.freightTerms} />
          <Field label={t('field_returnPeriod')} value={f.returnPeriod} />
        </Section>

        <Section title={t('section_time')}>
          <Field label={t('field_loadingDate')} value={formatDate(f.loadingDate, locale)} />
          <Field label={t('field_portArrival')} value={formatDate(f.portArrivalDate, locale)} />
          <Field label={t('field_stackingFrom')} value={formatTs(f.stackingFrom)} />
          <Field label={t('field_stackingTo')} value={formatTs(f.stackingTo)} />
          <Field label={t('field_cutoff')} value={<span className="font-mono">{formatTs(f.cutOff)}</span>} />
        </Section>

        <Section title={t('section_parties')}>
          <Field
            label={t('field_consignee')}
            value={
              <div>
                <div>{f.consignee.name}</div>
                <div className="text-ink-3">{f.consignee.address}</div>
              </div>
            }
          />
          <Field
            label={t('field_notify')}
            value={
              <div>
                <div>{f.notify.name}</div>
                <div className="text-ink-3">{f.notify.address}</div>
              </div>
            }
          />
          {f.alsoNotify && (
            <Field
              label={t('field_alsoNotify')}
              value={
                <div>
                  <div>{f.alsoNotify.name}</div>
                  <div className="text-ink-3">{f.alsoNotify.address}</div>
                </div>
              }
            />
          )}
          {f.thirdNotifyParty && (
            <Field
              label={t('field_thirdNotify')}
              value={
                <div>
                  <div>{f.thirdNotifyParty.name}</div>
                  <div className="text-ink-3">{f.thirdNotifyParty.address}</div>
                </div>
              }
            />
          )}
          <Field
            label={t('field_shipper')}
            value={
              <div>
                <div>{f.shipper.name}</div>
                <div className="text-ink-3">{f.shipper.address}</div>
              </div>
            }
          />
          <Field
            label={t('field_plant')}
            value={
              <div>
                <div>{f.plant.name}</div>
                <div className="text-ink-3">{f.plant.address}</div>
                <div className="text-ink-3">{f.plant.contact}</div>
              </div>
            }
          />
        </Section>

        <Section title={t('section_cargo')}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left font-mono text-[9px] tracking-wider text-ink-3 uppercase">
                <th className="pb-1.5">{t('cargoCol_product')}</th>
                <th className="pb-1.5 text-right">{t('cargoCol_qty')}</th>
                <th className="pb-1.5 text-right">{t('cargoCol_kgNet')}</th>
                <th className="pb-1.5 text-right">{t('cargoCol_kgGross')}</th>
                <th className="pb-1.5 text-right">{t('cargoCol_fobPrice')}</th>
              </tr>
            </thead>
            <tbody>
              {f.cargo.map((c, i) => (
                <tr key={i} className={clsx('border-t border-[var(--line-soft)]')}>
                  <td className="py-1.5 pr-2 text-ink-1">{c.product}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{c.qty.toLocaleString()}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{c.kgNetTotal.toLocaleString()}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{c.kgGrossTotal.toLocaleString()}</td>
                  <td className="py-1.5 text-right font-mono">${c.fobPrice.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t border-[var(--line-mid)] font-mono">
                <td colSpan={2} className="py-1.5 text-right text-ink-3 uppercase text-[9px] tracking-wider">
                  {t('totalNet')}
                </td>
                <td className="py-1.5 text-right text-ink-1">{f.totalKgNet.toLocaleString()}</td>
                <td colSpan={2} className="py-1.5 text-right text-ink-3 uppercase text-[9px] tracking-wider">
                  {t('totalGross')}: <span className="text-ink-1">{f.totalKgGross.toLocaleString()}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  );
}

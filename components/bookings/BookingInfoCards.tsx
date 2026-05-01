'use client';

import { useTranslations } from 'next-intl';
import type { Booking } from '@/types';
import { formatTs } from '@/lib/utils/dates';

interface Props {
  booking: Booking;
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line-soft bg-bg-2 p-3.5 flex flex-col gap-2.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-4">{title}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-ink-4">{label}</dt>
      <dd className="font-medium text-ink-1 truncate">{value ?? '—'}</dd>
    </div>
  );
}

export function BookingInfoCards({ booking }: Props) {
  const t = useTranslations('bookings');

  // Port flow: pol → transshipmentPort? → pod
  const portFlow = booking.transshipmentPort
    ? `${booking.pol.split(',')[0]} → ${booking.transshipmentPort} → ${booking.pod.split(',')[0]}`
    : `${booking.pol.split(',')[0]} → ${booking.pod.split(',')[0]}`;

  const stackingStr =
    booking.stackingFrom && booking.stackingTo
      ? `${formatTs(booking.stackingFrom)} → ${formatTs(booking.stackingTo)}`
      : '—';

  return (
    <>
      {/* Partes */}
      <InfoCard title={t('sectionPartes')}>
        <Field label={t('shipper')} value={booking.shipper} />
        <Field label={t('consignee')} value={booking.consignee} />
        <Field label={t('referenciaCliente')} value={booking.referenciaCliente} />
        <Field label={t('labelCondicionPago')} value={booking.freightTerm} />
        <Field label={t('labelEmision')} value={booking.emissionType} />
        <Field label={t('labelDiasLibres')} value={booking.diasLibresOrigen} />
      </InfoCard>

      {/* Ruta */}
      <InfoCard title={t('sectionRuta')}>
        <div className="col-span-2">
          <dt className="text-ink-4">{t('transshipmentPort')}</dt>
          <dd className="font-medium text-ink-1">{portFlow}</dd>
        </div>
        <Field label={t('vessel')} value={booking.vesselName} />
        <Field label={t('voyage')} value={booking.voyage} />
        <Field label={t('labelEtd')} value={formatTs(booking.etd)} />
        <Field label={t('labelEta')} value={formatTs(booking.eta)} />
      </InfoCard>

      {/* Referencias */}
      <InfoCard title={t('sectionReferencias')}>
        <Field label={t('colNumber')} value={booking.bookingNumber} />
        <Field label={t('labelMasterBl')} value={booking.masterBl} />
        <Field label={t('labelBlInterglobo')} value={booking.blInterglobo} />
        <Field label={t('labelScacNaviera')} value={booking.scacNaviera} />
        <Field label={t('labelScacInterglobo')} value={booking.scacInterglobo} />
        <Field label={t('labelDepositoRetiro')} value={booking.depositoRetiro} />
      </InfoCard>

      {/* Carga & Logística */}
      <InfoCard title={t('sectionCargaLogistica')}>
        <Field label={t('container')} value={booking.containerType} />
        {booking.isReefer && booking.setpointC !== undefined && (
          <Field label={t('labelTemperatura')} value={`${booking.setpointC} °C`} />
        )}
        {booking.ventilation !== undefined && (
          <Field label={t('labelVentilacion')} value={`${booking.ventilation}%`} />
        )}
        <Field label={t('stacking')} value={stackingStr} />
        <Field label={t('labelCutoff')} value={formatTs(booking.cutOff ?? '')} />
        {booking.destinoUsa && (
          <div className="col-span-2 mt-1 rounded-md border border-severity-watch/25 border-l-[3px] border-l-severity-watch bg-severity-watch/8 px-2.5 py-1.5">
            <p className="text-[10px] leading-relaxed text-ink-2">{t('isfWarning')}</p>
          </div>
        )}
      </InfoCard>
    </>
  );
}

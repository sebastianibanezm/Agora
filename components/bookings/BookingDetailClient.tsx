'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type {
  ActivityEvent,
  Alert,
  Booking,
  DraftBL,
  ExporterBL,
  Exporter,
  Naviera,
  ShippingInstruction,
} from '@/types';
import { ContainerCard } from './ContainerCard';
import { Button } from '@/components/ui/button';
import { BookingHeader } from './BookingHeader';
import { BookingLifecycleStrip } from './BookingLifecycleStrip';
import { BookingInfoCards } from './BookingInfoCards';
import { BookingActivityLog } from './BookingActivityLog';
import { BookingDocumentCard, type DocumentStatus } from './BookingDocumentCard';
import { BookingDocumentPopup, type DocType } from './BookingDocumentPopup';
import {
  useDemoStore,
  applyBookingOverride,
  transitionBooking,
  getNewBookingById,
  getContainersByBookingId,
} from '@/lib/hooks/useDemoStore';
import { toast } from '@/components/ui/toast';
import { AlertTriangle, Loader2, Send } from 'lucide-react';

interface Props {
  bookingId: string;
  booking?: Booking;
  exporter?: Exporter;
  naviera?: Naviera;
  si?: ShippingInstruction;
  bl?: DraftBL;
  exporterBl?: ExporterBL;
  alerts?: Alert[];
  events?: ActivityEvent[];
}

export function BookingDetailClient({
  bookingId,
  booking: initialBooking,
  exporter,
  naviera,
  si,
  bl,
  exporterBl: initialExporterBl,
  alerts = [],
  events = [],
}: Props) {
  const t = useTranslations('bookings');
  const locale = useLocale() as 'es' | 'en';
  const storeState = useDemoStore();

  const booking = useMemo(() => {
    const base = initialBooking ?? getNewBookingById(bookingId);
    if (!base) return null;
    return applyBookingOverride(base);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBooking, bookingId, storeState]);

  const [transmitting, setTransmitting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ type: DocType; id: string } | null>(null);
  const [exporterBl, setExporterBl] = useState<ExporterBL | undefined>(initialExporterBl);
  // Local events for demo actions (e.g. document_deleted). Prepended to server events.
  const [localEvents, setLocalEvents] = useState<ActivityEvent[]>([]);
  const allEvents = [...localEvents, ...events];

  const siHasFails = (si?.validationResults ?? []).some((c) => c.result === 'fail');
  const blHasFails = (bl?.validationResults ?? []).some((c) => c.result === 'fail');

  function handleGenerateEsi() {
    if (!booking || !si || siHasFails) return;
    setTransmitting(true);
    setTimeout(() => {
      transitionBooking(booking.id, 'esi_sent');
      toast.success(t('toasts.esiSent', { naviera: naviera?.shortName ?? '' }));
      setTransmitting(false);
    }, 1500);
  }

  function handleReleaseBl() {
    if (!booking || !bl || blHasFails) return;
    transitionBooking(booking.id, 'bl_released');
    toast.success(t('toasts.blReleased', { email: exporter?.contactEmail ?? '' }));
  }

  const DOC_LABELS: Record<DocType, string> = {
    booking: t('docBooking'),
    si: t('docSI'),
    bl: t('docDraftBL'),
    exporterBl: t('docExporterBL'),
  };

  function handleDocDelete(docType: DocType) {
    if (!booking) return;
    if (docType === 'exporterBl') setExporterBl(undefined);
    const deletedEvent: ActivityEvent = {
      id: `EVT-DEL-${Date.now()}`,
      bookingId: booking.id,
      type: 'document_deleted',
      timestamp: new Date().toISOString(),
      actor: 'user',
      actorName: 'Usuario Demo',
      description: `${DOC_LABELS[docType]} document deleted.`,
      metadata: { documentType: docType, deletedBy: 'Usuario Demo' },
    };
    setLocalEvents((prev) => [deletedEvent, ...prev]);
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-3">
        {t('empty')}
      </div>
    );
  }

  const bookingDocStatus: DocumentStatus = booking.bookingFileUrl ? 'ok' : 'missing';
  const siStatus: DocumentStatus = !si ? 'missing' : siHasFails ? 'warn' : 'ok';
  const blStatus: DocumentStatus = !bl ? 'missing' : blHasFails ? 'warn' : 'ok';
  const exporterBlStatus: DocumentStatus =
    !exporterBl || exporterBl.status === 'pending'
      ? 'missing'
      : exporterBl.status === 'uploaded'
        ? 'warn'
        : 'ok';

  const siPrimaryAction = (
    <Button
      size="sm"
      disabled={siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
      onClick={handleGenerateEsi}
    >
      {transmitting ? (
        <><Loader2 className="mr-1 h-3 w-3 animate-spin" />{t('transmittingEsi')}</>
      ) : (
        <><Send className="mr-1 h-3 w-3" />{t('generateEsi')}</>
      )}
    </Button>
  );

  const blPrimaryAction = (
    <Button
      size="sm"
      disabled={blHasFails || booking.status === 'bl_released'}
      onClick={handleReleaseBl}
    >
      {t('releaseBl')}
    </Button>
  );

  return (
    <>
      <div className="flex min-h-screen flex-col gap-4 px-4 pt-4 pb-8">
        <BookingHeader booking={booking} exporter={exporter} naviera={naviera} />
        <BookingLifecycleStrip current={booking.status} />

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-4">
              <AlertTriangle className="h-3 w-3 text-severity-watch" />
              {t('alertsSection')}
            </div>
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-md border border-[rgba(185,122,31,0.25)] border-l-[3px] border-l-severity-watch bg-[rgba(185,122,31,0.06)] px-3 py-2.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-ink-1">
                      {locale === 'es' ? (a.titleEs ?? a.title) : a.title}
                    </p>
                    <p className="font-mono text-[10px] text-ink-3">
                      {locale === 'es' ? (a.agentNameEs ?? a.agentName) : a.agentName}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-2">
                    {locale === 'es' ? (a.messageEs ?? a.message) : a.message}
                  </p>
                  {a.suggestedAction && (
                    <p className="mt-1 text-xs text-severity-ok">
                      → {locale === 'es' ? (a.suggestedActionEs ?? a.suggestedAction) : a.suggestedAction}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ruta y Horario — 2-column: info cards (left) + activity log (right) */}
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
          {/* Left: 4 info cards */}
          <div className="flex flex-col gap-2.5">
            <BookingInfoCards booking={booking} />
          </div>

          {/* Right: Actividades log */}
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line-soft bg-bg-2">
            <p className="flex-shrink-0 border-b border-line-soft px-[14px] py-[9px] font-mono text-[10px] uppercase tracking-widest text-ink-4">
              {t('sectionActividades')}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto p-[14px_16px]">
              <BookingActivityLog events={allEvents} />
            </div>
          </div>
        </div>

        {/* Contenedores */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-4">
            {t('containers', { n: getContainersByBookingId(booking.id).length })}
          </p>
          <div className="flex flex-col gap-2">
            {getContainersByBookingId(booking.id).map((c) => (
              <ContainerCard key={c.id} container={c} />
            ))}
          </div>
        </div>

        {/* Documentos */}
        <div>
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-ink-4">
            {t('sectionDocumentos')}
          </p>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-4">
            <BookingDocumentCard
              label={t('docBooking')}
              status={bookingDocStatus}
              onClick={() => setSelectedDoc({ type: 'booking', id: booking.id })}
            />
            <BookingDocumentCard
              label={t('docSI')}
              status={siStatus}
              onClick={() => setSelectedDoc({ type: 'si', id: si?.id ?? booking.id })}
            />
            <BookingDocumentCard
              label={t('docDraftBL')}
              status={blStatus}
              onClick={() => setSelectedDoc({ type: 'bl', id: bl?.id ?? booking.id })}
            />
            <BookingDocumentCard
              label={t('docExporterBL')}
              status={exporterBlStatus}
              onClick={() =>
                setSelectedDoc({
                  type: 'exporterBl',
                  id: exporterBl?.id ?? booking.id,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Document popup */}
      {selectedDoc && (
        <BookingDocumentPopup
          docType={selectedDoc.type}
          docId={selectedDoc.id}
          booking={booking}
          si={si}
          bl={bl}
          exporterBl={exporterBl}
          events={allEvents}
          onClose={() => setSelectedDoc(null)}
          onDelete={handleDocDelete}
          primaryAction={
            selectedDoc.type === 'si'
              ? siPrimaryAction
              : selectedDoc.type === 'bl'
                ? blPrimaryAction
                : undefined
          }
        />
      )}
    </>
  );
}

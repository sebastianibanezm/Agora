'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingActivityLog } from './BookingActivityLog';
import { updateBookingField, deleteBookingDocument } from '@/lib/hooks/useDemoStore';
import type { Booking, ActivityEvent, ExporterBL, ShippingInstruction, DraftBL } from '@/types';
import { formatTs } from '@/lib/utils/dates';

export type DocType = 'booking' | 'si' | 'bl' | 'exporterBl';

interface Props {
  docType: DocType;
  docId: string;
  booking: Booking;
  si?: ShippingInstruction;
  bl?: DraftBL;
  exporterBl?: ExporterBL;
  events: ActivityEvent[];
  onClose: () => void;
  onDelete: (docType: DocType) => void;
  primaryAction?: React.ReactNode;
}

const DOC_LABELS: Record<DocType, string> = {
  booking: 'Booking',
  si: 'Shipping Instruction',
  bl: 'Draft BL',
  exporterBl: 'Exporter BL',
};

const BOOKING_EXTRACTED_FIELDS: Array<{ label: string; field: keyof Booking }> = [
  { label: 'Embarcador', field: 'shipper' },
  { label: 'Consignatario', field: 'consignee' },
  { label: 'Booking #', field: 'bookingNumber' },
  { label: 'Master BL', field: 'masterBl' },
  { label: 'Nave', field: 'vesselName' },
  { label: 'Viaje', field: 'voyage' },
  { label: 'ETD', field: 'etd' },
  { label: 'ETA', field: 'eta' },
  { label: 'Pto. Embarque', field: 'pol' },
  { label: 'Pto. Transbordo', field: 'transshipmentPort' },
  { label: 'Pto. Descarga', field: 'pod' },
  { label: 'Depósito retiro', field: 'depositoRetiro' },
];

export function BookingDocumentPopup({
  docType,
  docId,
  booking,
  si,
  bl,
  exporterBl,
  events,
  onClose,
  onDelete,
  primaryAction,
}: Props) {
  const t = useTranslations('bookings');
  const [showConfirm, setShowConfirm] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceNotice, setReplaceNotice] = useState<'idle' | 'pending' | 'scanning'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docLabel = DOC_LABELS[docType];
  const fileUrl =
    docType === 'booking'
      ? booking.bookingFileUrl
      : docType === 'si'
        ? si?.sourceFileUrl
        : docType === 'bl'
          ? bl?.sourceFileUrl
          : exporterBl?.fileUrl;

  const isUploadMode = docType === 'exporterBl' && !exporterBl;

  function handleBackdropClick(e: React.MouseEvent) {
    if (showConfirm) return;
    if (e.target === e.currentTarget) onClose();
  }

  function handleDelete() {
    deleteBookingDocument(booking.id, docType);
    onDelete(docType);
    onClose();
  }

  function handleReplaceClick() {
    setReplaceNotice('pending');
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    // Reset so re-selecting same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!e.target.files?.length) {
      setReplaceNotice('idle');
      return;
    }
    setReplaceNotice('scanning');
    setReplacing(true);
    setTimeout(() => {
      setReplacing(false);
      setReplaceNotice('idle');
    }, 2000);
  }

  const metaLine =
    docType === 'booking'
      ? `${booking.bookingNumber} · ${formatTs(booking.createdAt)}`
      : docType === 'si'
        ? `${booking.bookingNumber} · ${si?.receivedAt ? formatTs(si.receivedAt) : '—'}`
        : docType === 'bl'
          ? `${booking.bookingNumber} · ${bl?.receivedAt ? formatTs(bl.receivedAt) : '—'}`
          : `${booking.bookingNumber} · ${exporterBl?.uploadedAt ? formatTs(exporterBl.uploadedAt) : '—'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(43,31,18,0.45)] p-8 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-xl border border-line-mid bg-bg-1 shadow-[0_24px_60px_rgba(43,31,18,0.22)] max-h-[calc(100vh-64px)]">

        {/* Delete confirmation overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[rgba(248,242,228,0.88)] backdrop-blur-sm">
            <div className="flex w-[90%] max-w-sm flex-col gap-3 rounded-xl border border-line-mid bg-bg-1 p-6 shadow-lg">
              <p className="text-[16px] font-normal text-ink-1">{t('confirmDeleteTitle')}</p>
              <p className="text-xs leading-relaxed text-ink-3">{t('confirmDeleteMessage')}</p>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>
                  {t('confirmDeleteCancel')}
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  {t('confirmDeleteConfirm')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-line-mid p-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-[17px] font-normal tracking-[-0.01em] text-ink-1">
              {docLabel}
            </p>
            <p className="font-mono text-[10px] text-ink-4">{metaLine}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {primaryAction}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowConfirm(true)}
            >
              {t('popupDeleteDoc')}
            </Button>
            <button
              type="button"
              aria-label="Close"
              onClick={() => { if (!showConfirm) onClose(); }}
              disabled={showConfirm}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-soft bg-bg-3 text-ink-3 hover:bg-bg-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex flex-shrink-0 flex-col gap-2 border-b border-line-soft bg-bg-2 p-3">
          <div className="rounded-lg border border-line-soft bg-bg-1 p-[10px_13px]">
            <p className="text-xs leading-relaxed text-ink-2">
              {docType === 'booking' &&
                `Booking confirmation for ${booking.bookingNumber}. Vessel: ${booking.vesselName} / ${booking.voyage}. Route: ${booking.pol.split(',')[0]} → ${booking.pod.split(',')[0]}.`}
              {docType === 'si' &&
                (si
                  ? `Shipping Instruction received from ${booking.shipper}. Validation ${si.validationStatus === 'green' ? 'passed' : 'has issues'}.`
                  : 'No SI on file.')}
              {docType === 'bl' &&
                (bl
                  ? `Draft BL received from carrier. Validation ${bl.validationStatus === 'green' ? 'passed' : 'has issues'}.`
                  : 'No Draft BL on file.')}
              {docType === 'exporterBl' &&
                (exporterBl
                  ? `Exporter BL status: ${exporterBl.status}. Uploaded ${exporterBl.uploadedAt ? formatTs(exporterBl.uploadedAt) : '—'}.`
                  : 'No Exporter BL uploaded yet.')}
            </p>
          </div>
          {/* Alert chip — shown when SI/BL have validation fails */}
          {((docType === 'si' && si?.validationResults.some((c) => c.result === 'fail')) ||
            (docType === 'bl' && bl?.validationResults.some((c) => c.result === 'fail'))) && (
            <div className="flex items-start gap-2 rounded-lg border border-[rgba(185,122,31,0.25)] border-l-[3px] border-l-severity-watch bg-[rgba(185,122,31,0.08)] p-[7px_11px]">
              <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-severity-watch" />
              <div className="flex flex-col">
                <p className="text-[11px] font-semibold text-severity-watch">Validation issues found</p>
                <p className="text-[10px] text-ink-3">One or more checks failed. Review before proceeding.</p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {isUploadMode ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-line-mid bg-bg-2">
                <span className="text-2xl">↑</span>
              </div>
              <p className="text-sm font-medium text-ink-1">{t('uploadExporterBl')}</p>
              <label className="cursor-pointer rounded-lg border border-dashed border-line-mid bg-bg-2 px-6 py-3 text-xs text-ink-3 hover:bg-bg-3">
                {/* Demo placeholder — actual upload handling deferred */}
                <input type="file" accept=".pdf" className="sr-only" />
                Click to browse or drag PDF here
              </label>
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden">
            {/* Left: document preview */}
            <div className="flex flex-col gap-2.5 overflow-y-auto border-r border-line-soft p-3.5">
              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!fileUrl}
                  onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                >
                  {t('popupExpandPdf')}
                </Button>
                <div className="flex gap-1.5">
                  {/* Download — use <a> since Button has no asChild */}
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      download
                      className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-severity-ok/25 bg-severity-ok/10 px-2.5 text-[0.8rem] font-medium text-severity-ok hover:bg-severity-ok/18"
                    >
                      {t('popupDownloadPdf')}
                    </a>
                  ) : (
                    <Button size="sm" disabled className="bg-severity-ok/10 text-severity-ok border border-severity-ok/25">
                      {t('popupDownloadPdf')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    disabled={replacing}
                    className="bg-severity-watch/10 text-severity-watch border border-severity-watch/25 hover:bg-severity-watch/18"
                    onClick={handleReplaceClick}
                  >
                    {replacing ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> {t('popupReplaceScanning')}</>
                    ) : (
                      t('popupReplacePdf')
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileSelected}
                  />
                </div>
              </div>

              {replaceNotice !== 'idle' && (
                <p className="rounded-md border border-severity-watch/25 bg-severity-watch/8 px-2.5 py-1.5 text-[10px] text-ink-3">
                  {replaceNotice === 'pending' ? t('popupReplaceNotice') : t('popupReplaceScanning')}
                </p>
              )}

              {/* HTML replica */}
              <div className="rounded-sm bg-white shadow-sm">
                <BookingDocPreview docType={docType} booking={booking} si={si} bl={bl} />
              </div>
            </div>

            {/* Right: document history */}
            <div className="flex flex-col overflow-y-auto p-3.5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink-4">
                {t('sectionActividades')}
              </p>
              <BookingActivityLog
                events={events}
                documentId={docId}
                emptyMessage={t('docHistoryEmpty')}
              />
            </div>
          </div>
        )}

        {/* Footer — extracted fields */}
        {!isUploadMode && (
          <div className="flex-shrink-0 border-t border-line-mid bg-bg-2 p-3.5">
            {docType === 'booking' ? (
              <div className="flex flex-col gap-2.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-4">
                  {t('fieldsExtractedLabel')}
                </p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {BOOKING_EXTRACTED_FIELDS.map(({ label, field }) => (
                    <div key={field} className="flex flex-col gap-0.5">
                      <label htmlFor={`field-${field}`} className="font-mono text-[10px] text-ink-4">{label}</label>
                      <input
                        id={`field-${field}`}
                        className="w-full rounded-[5px] border border-line-mid bg-bg-1 px-2 py-[5px] text-xs text-ink-1 focus:border-ink-3 focus:outline-none"
                        defaultValue={String(booking[field] ?? '')}
                        onChange={(e) => updateBookingField(booking.id, field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-ink-4">{t('fieldsTbdPlaceholder')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Minimal HTML replica ───────────────────────────────────────────────────────

function BookingDocPreview({
  docType,
  booking,
  si,
  bl,
}: {
  docType: DocType;
  booking: Booking;
  si?: ShippingInstruction;
  bl?: DraftBL;
}) {
  if (docType === 'booking') {
    return (
      <div className="space-y-3 p-4 text-[10px] text-gray-700">
        <div className="border-b pb-2 text-center">
          <p className="text-xs font-bold uppercase tracking-widest">Booking Confirmation</p>
          <p>{booking.bookingNumber}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          <dt className="font-semibold">Shipper</dt><dd>{booking.shipper}</dd>
          <dt className="font-semibold">Consignee</dt><dd>{booking.consignee}</dd>
          <dt className="font-semibold">Vessel</dt><dd>{booking.vesselName}</dd>
          <dt className="font-semibold">Voyage</dt><dd>{booking.voyage}</dd>
          <dt className="font-semibold">POL</dt><dd>{booking.pol}</dd>
          <dt className="font-semibold">POD</dt><dd>{booking.pod}</dd>
          <dt className="font-semibold">ETD</dt><dd>{booking.etd}</dd>
          <dt className="font-semibold">ETA</dt><dd>{booking.eta}</dd>
        </dl>
      </div>
    );
  }
  // Silence unused-variable warnings for si/bl in non-booking cases
  void si;
  void bl;
  return (
    <div className="p-4 text-[10px] text-gray-500 italic">
      Preview not available for this document type.
    </div>
  );
}

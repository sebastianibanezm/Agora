'use client';

import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';

export type DocumentStatus = 'ok' | 'warn' | 'missing';

interface Props {
  label: string;
  status: DocumentStatus;
  onClick: () => void;
}

const STATUS_BADGE: Record<DocumentStatus, { className: string }> = {
  ok: {
    className: 'bg-severity-ok/10 text-severity-ok border-severity-ok/25',
  },
  warn: {
    className: 'bg-severity-watch/10 text-severity-watch border-severity-watch/25',
  },
  missing: {
    className: 'bg-ink-4/10 text-ink-3 border-line-mid',
  },
};

export function BookingDocumentCard({ label, status, onClick }: Props) {
  const t = useTranslations('bookings');

  const badge = STATUS_BADGE[status];

  const statusLabel =
    status === 'ok'
      ? t('docStatusOk')
      : status === 'warn'
        ? t('docStatusReview')
        : t('docStatusMissing');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border border-line-soft bg-bg-2 p-4 text-left transition-colors hover:bg-bg-3 focus:outline-none focus:ring-2 focus:ring-ink-3/30 ${status === 'missing' ? 'opacity-[0.55]' : ''}`}
    >
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md border ${status === 'missing' ? 'border-dashed border-line-mid bg-bg-1' : 'border-line-soft bg-bg-1'}`}
      >
        <FileText className="h-4 w-4 text-ink-3" />
      </div>
      <p className="mb-1.5 text-sm font-medium text-ink-1">{label}</p>
      <span
        className={`inline-block rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-wide ${badge.className}`}
      >
        {statusLabel}
      </span>
    </button>
  );
}

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ChevronRight } from 'lucide-react';

export interface DrilldownRow {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  sublabel?: string;
  rows: DrilldownRow[];
}

export function KpiDrilldownModal({ open, onClose, title, sublabel, rows }: Props) {
  const t = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[65vh] overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-[var(--line-soft)] shrink-0">
          <DialogTitle className="font-mono text-sm tracking-wider uppercase text-ink-2">
            {title}
          </DialogTitle>
          {sublabel && (
            <DialogDescription className="font-mono text-[10px] text-ink-3">
              {sublabel}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          {rows.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink-3">{t('empty')}</div>
          ) : (
            <ul className="divide-y divide-[var(--line-soft)]">
              {rows.map(({ booking, exporter, naviera }) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-ink-3">{booking.bookingNumber}</span>
                        <LifecyclePill status={booking.status} size="sm" />
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-2">
                        <span className="font-medium text-ink-1">{exporter.name}</span>
                        <span className="text-ink-4">·</span>
                        <span className="text-ink-3">{naviera.shortName}</span>
                        <span className="text-ink-4">·</span>
                        <span className="text-ink-3">
                          {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
                        </span>
                      </div>
                    </div>
                    {booking.cutOff && (
                      <CutoffCountdown cutoffIso={booking.cutOff} prefix className="shrink-0" />
                    )}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-4 transition-colors group-hover:text-ink-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

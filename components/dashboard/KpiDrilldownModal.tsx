'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  rows: DrilldownRow[];
}

export function KpiDrilldownModal({ open, onClose, title, rows }: Props) {
  const t = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl p-0 flex flex-col max-h-[70vh] overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-baseline justify-between gap-3">
            <DialogTitle className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink-3">
              {title}
            </DialogTitle>
            <span className="font-mono text-[11px] text-ink-4">{rows.length}</span>
          </div>
        </DialogHeader>

        {/* Divider */}
        <div className="mx-6 h-px bg-[var(--line-soft)] shrink-0" />

        {/* List */}
        <div className="overflow-y-auto flex-1 py-2">
          {rows.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-ink-3">{t('empty')}</div>
          ) : (
            <ul>
              {rows.map(({ booking, exporter, naviera }) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.04]"
                  >
                    {/* Left: exporter + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-ink-1 leading-none">
                          {exporter.name}
                        </span>
                        <LifecyclePill status={booking.status} size="sm" />
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-ink-3">
                        <span>{booking.bookingNumber}</span>
                        <span className="text-ink-4">·</span>
                        <span>{naviera.shortName}</span>
                        <span className="text-ink-4">·</span>
                        <span>{booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Right: cutoff */}
                    {booking.cutOff && (
                      <CutoffCountdown cutoffIso={booking.cutOff} className="shrink-0 text-[11px]" />
                    )}

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-4 transition-colors group-hover:text-ink-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer spacer */}
        <div className="h-2 shrink-0" />
      </DialogContent>
    </Dialog>
  );
}

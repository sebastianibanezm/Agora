'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type {
  ActivityEvent,
  Alert,
  Booking,
  DraftBL,
  Exporter,
  Naviera,
  ShippingInstruction,
} from '@/types';
import { getContainersByBookingId } from '@/lib/hooks/useDemoStore';
import { ContainerCard } from './ContainerCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookingHeader } from './BookingHeader';
import { BookingLifecycleStrip } from './BookingLifecycleStrip';
import { SIViewer } from './SIViewer';
import { ValidationPanel } from './ValidationPanel';
import { DraftBLViewer } from './DraftBLViewer';
import { BookingActivityFeed } from './BookingActivityFeed';
import { useDemoStore, applyBookingOverride, transitionBooking } from '@/lib/hooks/useDemoStore';
import { toast } from '@/components/ui/toast';
import { formatTs } from '@/lib/utils/dates';
import { Send, Upload, FileCheck2, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  si: ShippingInstruction | undefined;
  bl: DraftBL | undefined;
  alerts: Alert[];
  events: ActivityEvent[];
}

function GenerateEsiButton({
  onClick,
  disabled,
  transmitting,
  label,
  transmittingLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  transmitting: boolean;
  label: string;
  transmittingLabel: string;
}) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      {transmitting ? (
        <><Loader2 data-icon="inline-start" className="animate-spin" /> {transmittingLabel}</>
      ) : (
        <><Send data-icon="inline-start" /> {label}</>
      )}
    </Button>
  );
}

export function BookingDetailClient({
  booking: initialBooking,
  exporter,
  naviera,
  si,
  bl,
  alerts,
  events,
}: Props) {
  const t = useTranslations('bookings');
  const locale = useLocale() as 'es' | 'en';
  useDemoStore();
  const booking = useMemo(() => applyBookingOverride(initialBooking), [initialBooking]);
  const [transmitting, setTransmitting] = useState(false);
  const [tab, setTab] = useState<'overview' | 'si' | 'bl' | 'activity'>('overview');

  const siHasFails = (si?.validationResults ?? []).some((c) => c.result === 'fail');
  const blHasFails = (bl?.validationResults ?? []).some((c) => c.result === 'fail');

  function handleGenerateEsi() {
    if (!si || siHasFails) return;
    setTransmitting(true);
    setTimeout(() => {
      transitionBooking(booking.id, 'esi_sent');
      toast.success(t('toasts.esiSent', { naviera: naviera.shortName }));
      setTransmitting(false);
    }, 1500);
  }

  function handleReleaseBl() {
    if (!bl || blHasFails) return;
    transitionBooking(booking.id, 'bl_released');
    toast.success(t('toasts.blReleased', { email: exporter.contactEmail }));
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 px-4 pt-4 pb-8">
      <BookingHeader booking={booking} exporter={exporter} naviera={naviera} />
      <BookingLifecycleStrip current={booking.status} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
        <TabsList variant="line" className="border-b border-[var(--line-soft)] w-full rounded-none pb-0">
          <TabsTrigger value="overview" className="gap-1.5">
            {t('tabOverview')}
            {alerts.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-severity-watch/20 px-1 font-mono text-[10px] text-severity-watch">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="si" className="gap-1.5">
            {t('tabSI')}
            {si && siHasFails && (
              <span className="h-1.5 w-1.5 rounded-full bg-severity-crit" />
            )}
            {si && !siHasFails && (
              <span className="h-1.5 w-1.5 rounded-full bg-severity-ok" />
            )}
          </TabsTrigger>
          <TabsTrigger value="bl" className="gap-1.5">
            {t('tabBL')}
            {bl && blHasFails && (
              <span className="h-1.5 w-1.5 rounded-full bg-severity-crit" />
            )}
            {bl && !blHasFails && (
              <span className="h-1.5 w-1.5 rounded-full bg-severity-ok" />
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">{t('tabActivity')}</TabsTrigger>
        </TabsList>

        {/* Persistent route context — visible on all tabs */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--line-soft)] px-0 py-2 font-mono text-[11px] text-ink-3">
          <span className="text-ink-2">
            {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
          </span>
          <span>{booking.vesselName} / {booking.voyage}</span>
          <span>{t('labelEtd')} {formatTs(booking.etd)}</span>
          <span>{t('labelEta')} {formatTs(booking.eta)}</span>
          <span>{t('labelCutoff')} {formatTs(booking.cutOff)}</span>
          {booking.isReefer && booking.setpointC !== undefined && (
            <span className="text-trace">{booking.containerType} @ {booking.setpointC} °C</span>
          )}
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-4 flex flex-col gap-4">
            {/* Route & Schedule */}
            <div>
              <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-4 uppercase">
                {t('sectionRouteSchedule')}
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <dt className="text-ink-3">{t('labelPolToPod')}</dt>
                  <dd className="text-ink-1">{booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">{t('vessel')}</dt>
                  <dd className="text-ink-1">{booking.vesselName}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">{t('voyage')}</dt>
                  <dd className="font-mono text-ink-1">{booking.voyage}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">{t('labelEtdToEta')}</dt>
                  <dd className="text-ink-1">{formatTs(booking.etd)} → {formatTs(booking.eta)}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">{t('stacking')}</dt>
                  <dd className="text-ink-1">{formatTs(booking.stackingFrom)} → {formatTs(booking.stackingTo)}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">{t('labelCutoff')}</dt>
                  <dd className="font-mono text-ink-1">{formatTs(booking.cutOff)}</dd>
                </div>
              </dl>
            </div>

            {/* Containers */}
            <div className="border-t border-[var(--line-soft)] pt-3">
              <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-4 uppercase">
                {t('containers', { n: getContainersByBookingId(booking.id).length })}
              </div>
              <div className="flex flex-col gap-2">
                {getContainersByBookingId(booking.id).map((c) => (
                  <ContainerCard key={c.id} container={c} />
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
              {t('quickActions')}
            </div>
            <div className="flex flex-col gap-2">
              {/* Primary actions */}
              <GenerateEsiButton
                onClick={handleGenerateEsi}
                disabled={!si || siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
                transmitting={transmitting}
                label={t('generateEsi')}
                transmittingLabel={t('transmittingEsi')}
              />
              <Button
                onClick={handleReleaseBl}
                disabled={!bl || blHasFails || booking.status === 'bl_released' || booking.status === 'closed'}
                className="w-full"
              >
                {t('releaseBl')}
              </Button>

              {/* Divider */}
              <div className="my-1 h-px bg-[var(--line-soft)]" />

              {/* Navigation actions */}
              <Button
                variant="ghost"
                disabled={!si}
                onClick={() => setTab('si')}
                className="w-full justify-start text-ink-2"
              >
                <Upload data-icon="inline-start" /> {t('openSi')}
              </Button>
              <Button
                variant="ghost"
                disabled={!bl}
                onClick={() => setTab('bl')}
                className="w-full justify-start text-ink-2"
              >
                <FileCheck2 data-icon="inline-start" /> {t('viewBl')}
              </Button>
            </div>
          </Card>

          {alerts.length > 0 && (
            <Card className="lg:col-span-3 p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
                <AlertTriangle className="h-3 w-3 text-severity-watch" /> {t('alertsSection')}
              </div>
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li key={a.id} className="rounded-md border border-[var(--line-soft)] bg-bg-2 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-medium text-ink-1">{locale === 'es' ? (a.titleEs ?? a.title) : a.title}</div>
                      <div className="font-mono text-[10px] text-ink-3">{locale === 'es' ? (a.agentNameEs ?? a.agentName) : a.agentName}</div>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-2">{locale === 'es' ? (a.messageEs ?? a.message) : a.message}</div>
                    {a.suggestedAction && (
                      <div className="mt-1 text-xs text-mint-500">→ {locale === 'es' ? (a.suggestedActionEs ?? a.suggestedAction) : a.suggestedAction}</div>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* SHIPPING INSTRUCTION */}
        <TabsContent value="si" className="mt-3 flex flex-col gap-4">
          {si ? (
            <>
              <SIViewer si={si} locale={locale} />
              <ValidationPanel
                checks={si.validationResults}
                title={t('validationSiTitle')}
                action={
                  <GenerateEsiButton
                    onClick={handleGenerateEsi}
                    disabled={siHasFails || transmitting || booking.status === 'esi_sent' || booking.status === 'bl_released'}
                    transmitting={transmitting}
                    label={t('generateEsi')}
                    transmittingLabel={t('transmittingEsi')}
                  />
                }
              />
            </>
          ) : (
            <EmptyState
              title={t('siEmptyTitle', { exporter: exporter.name })}
              hint={t('siEmptyHint', { exporter: exporter.name })}
            />
          )}
        </TabsContent>

        {/* DRAFT BL */}
        <TabsContent value="bl" className="mt-3 flex flex-col gap-4">
          {bl && si ? (
            <>
              <DraftBLViewer bl={bl} si={si} />
              <ValidationPanel
                checks={bl.validationResults}
                title={t('validationBlTitle')}
                action={
                  <Button onClick={handleReleaseBl} disabled={blHasFails || booking.status === 'bl_released'}>
                    {t('releaseBl')}
                  </Button>
                }
              />
            </>
          ) : (
            <EmptyState
              title={t('blEmptyTitle', { naviera: naviera.shortName })}
              hint={t('blEmptyHint', { when: si?.esiTransmittedAt ? formatTs(si.esiTransmittedAt) : '—' })}
            />
          )}
        </TabsContent>

        {/* ACTIVITY */}
        <TabsContent value="activity" className="mt-3">
          <BookingActivityFeed events={events} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-soft)] bg-bg-2">
        <FileCheck2 className="h-5 w-5 text-ink-3" />
      </div>
      <div className="text-sm font-medium text-ink-1">{title}</div>
      <div className="max-w-xs text-xs text-ink-3">{hint}</div>
    </Card>
  );
}

'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';
import { addBooking } from '@/lib/hooks/useDemoStore';
import { toast } from '@/components/ui/toast';
import type { Booking, ContainerType, Exporter, Naviera, Order } from '@/types';
import { POL, POD } from '@/lib/mock-data/lanes';
import { getTodayDemo } from '@/lib/mock-data/today';

interface Props {
  order: Order;
  exporter: Exporter;
  navieras: Naviera[];
  children: ReactNode;
}

const CONTAINER_TYPES: ContainerType[] = ['40RF', '40HC', '40DV', '20RF', '20DV'];
const POL_LIST = Object.entries(POL);
const POD_LIST = Object.entries(POD);

let LAST_BOOKING_DEFAULTS: { navieraId?: string; containerType?: ContainerType; pol?: string; pod?: string } = {};

export function CreateBookingDialog({ order, exporter, navieras, children }: Props) {
  const t = useTranslations('bookings');
  const tDlg = useTranslations('bookings.createDialog');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [navieraId, setNavieraId] = useState<string>(LAST_BOOKING_DEFAULTS.navieraId ?? navieras[0]?.id ?? '');
  const [bookingNumber, setBookingNumber] = useState('');
  const [containerType, setContainerType] = useState<ContainerType>(LAST_BOOKING_DEFAULTS.containerType ?? '40RF');
  const [setpoint, setSetpoint] = useState<number>(-18);
  const [vesselName, setVesselName] = useState('');
  const [voyage, setVoyage] = useState('');
  const [polKey, setPolKey] = useState<string>(LAST_BOOKING_DEFAULTS.pol ?? 'SAN_ANTONIO');
  const [podKey, setPodKey] = useState<string>(LAST_BOOKING_DEFAULTS.pod ?? 'CHARLESTON');

  const today = getTodayDemo();
  const inDays = (n: number) => new Date(today.getTime() + n * 86_400_000).toISOString().slice(0, 16);
  const [etd, setEtd] = useState<string>(inDays(7));
  const [eta, setEta] = useState<string>(inDays(21));
  const [cutoff, setCutoff] = useState<string>(inDays(5));
  const [stackingFrom, setStackingFrom] = useState<string>(inDays(3));
  const [stackingTo, setStackingTo] = useState<string>(inDays(5));

  const isReefer = containerType === '40RF' || containerType === '20RF';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const polDef = POL[polKey as keyof typeof POL];
    const podDef = POD[podKey as keyof typeof POD];
    const id = `BKG-${bookingNumber || `NEW${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`}`;
    const booking: Booking = {
      id,
      bookingNumber: bookingNumber || id.replace('BKG-', ''),
      orderId: order.id,
      navieraId,
      containerType,
      isReefer,
      setpointC: isReefer ? setpoint : undefined,
      vesselName: vesselName || 'TBD',
      voyage: voyage || 'TBD',
      pol: polDef.name,
      polCoords: polDef.coords,
      pod: podDef.name,
      podCoords: podDef.coords,
      etd: new Date(etd).toISOString(),
      eta: new Date(eta).toISOString(),
      cutOff: new Date(cutoff).toISOString(),
      stackingFrom: new Date(stackingFrom).toISOString(),
      stackingTo: new Date(stackingTo).toISOString(),
      status: 'awaiting_si',
      createdAt: new Date().toISOString(),
      alertIds: [],
      costAtRiskUsd: 0,
    };
    addBooking(booking);
    LAST_BOOKING_DEFAULTS = { navieraId, containerType, pol: polKey, pod: podKey };
    const naviera = navieras.find((n) => n.id === navieraId);
    toast.success(tDlg('toast', { number: booking.bookingNumber }), {
      description: naviera ? `${exporter.name} → ${naviera.shortName}` : exporter.name,
    });
    setOpen(false);
    router.push(`/bookings/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tDlg('title')}</DialogTitle>
          <DialogDescription>
            {tDlg('context', {
              orderNumber: order.orderNumber,
              exporter: exporter.name,
              country: order.destinationCountry,
              count: order.containerCount,
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="naviera">{tDlg('naviera')}</Label>
              <select
                id="naviera"
                value={navieraId}
                onChange={(e) => setNavieraId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
              >
                {navieras.map((n) => (
                  <option key={n.id} value={n.id}>{n.shortName}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bn">{tDlg('bookingNumber')}</Label>
              <Input id="bn" value={bookingNumber} onChange={(e) => setBookingNumber(e.target.value)} placeholder="MSCSAI4500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ct">{tDlg('containerType')}</Label>
              <select
                id="ct"
                value={containerType}
                onChange={(e) => setContainerType(e.target.value as ContainerType)}
                className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
              >
                {CONTAINER_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {isReefer && (
              <div>
                <Label htmlFor="sp">{tDlg('setpoint')}</Label>
                <Input id="sp" type="number" value={setpoint} onChange={(e) => setSetpoint(parseFloat(e.target.value || '0'))} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="vn">{tDlg('vesselName')}</Label>
              <Input id="vn" value={vesselName} onChange={(e) => setVesselName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="vy">{tDlg('voyage')}</Label>
              <Input id="vy" value={voyage} onChange={(e) => setVoyage(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pol">{tDlg('pol')}</Label>
              <select
                id="pol"
                value={polKey}
                onChange={(e) => setPolKey(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
              >
                {POL_LIST.map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pod">{tDlg('pod')}</Label>
              <select
                id="pod"
                value={podKey}
                onChange={(e) => setPodKey(e.target.value)}
                className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
              >
                {POD_LIST.map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="etd">{tDlg('etd')}</Label>
              <Input id="etd" type="datetime-local" value={etd} onChange={(e) => setEtd(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="eta">{tDlg('eta')}</Label>
              <Input id="eta" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="cutoff">{tDlg('cutoff')}</Label>
              <Input id="cutoff" type="datetime-local" value={cutoff} onChange={(e) => setCutoff(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sf">{tDlg('stackingFrom')}</Label>
              <Input id="sf" type="datetime-local" value={stackingFrom} onChange={(e) => setStackingFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="st">{tDlg('stackingTo')}</Label>
              <Input id="st" type="datetime-local" value={stackingTo} onChange={(e) => setStackingTo(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose className="rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-xs text-ink-2 hover:text-ink-1">
              {tCommon('cancel')}
            </DialogClose>
            <button
              type="submit"
              className="rounded-md bg-mint-500 px-3 py-1.5 text-xs font-medium text-bg-0 hover:bg-mint-500/90"
            >
              {tDlg('submit')}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

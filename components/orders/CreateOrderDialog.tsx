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
import { Input, Textarea, Label } from '@/components/ui/input';
import { addOrder } from '@/lib/hooks/useDemoStore';
import { toast } from '@/components/ui/toast';
import type { Exporter, Market, Order } from '@/types';
import { getTodayDemo } from '@/lib/mock-data/today';

interface Props {
  exporters: Exporter[];
  children: ReactNode;
  /** When set, disables exporter selection and pins to the given exporter id. */
  defaultExporterId?: string;
}

const MARKETS: Market[] = ['US', 'EU', 'IN', 'CN', 'MENA', 'LATAM'];

const COUNTRY_BY_MARKET: Record<Market, string> = {
  US: 'USA',
  EU: 'Netherlands',
  CN: 'China',
  IN: 'India',
  MENA: 'United Arab Emirates',
  LATAM: 'Peru',
};

const LAST_DEFAULTS_KEY = '__agora_v2_last_order';
let LAST_DEFAULTS: { market: Market; country: string } | null = null;

export function CreateOrderDialog({ exporters, children, defaultExporterId }: Props) {
  const t = useTranslations('orders');
  const tCreate = useTranslations('orders.createDialog');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initialMarket: Market = LAST_DEFAULTS?.market ?? 'US';
  const initialCountry = LAST_DEFAULTS?.country ?? COUNTRY_BY_MARKET[initialMarket];

  const [exporterId, setExporterId] = useState<string>(defaultExporterId ?? exporters[0]?.id ?? '');
  const [market, setMarket] = useState<Market>(initialMarket);
  const [country, setCountry] = useState<string>(initialCountry);
  const [containerCount, setContainerCount] = useState<number>(20);
  const today = getTodayDemo();
  const todayIso = today.toISOString().slice(0, 10);
  const inOneWeek = new Date(today.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
  const [windowFrom, setWindowFrom] = useState(todayIso);
  const [windowTo, setWindowTo] = useState(inOneWeek);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    const order: Order = {
      id,
      orderNumber: id,
      exporterId,
      destinationMarket: market,
      destinationCountry: country,
      containerCount,
      windowFrom: new Date(windowFrom).toISOString(),
      windowTo: new Date(windowTo).toISOString(),
      status: 'open',
      bookingIds: [],
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };
    addOrder(order);
    LAST_DEFAULTS = { market, country };
    if (typeof window !== 'undefined') {
      try {
        // memory-only ref; key is unused for storage to satisfy "no browser storage" rule
        void LAST_DEFAULTS_KEY;
      } catch {
        // noop
      }
    }
    toast.success(tCreate('toast', { id: order.orderNumber }));
    setOpen(false);
    router.push(`/orders/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tCreate('title')}</DialogTitle>
          <DialogDescription>{tCreate('description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="exporter">{tCreate('exporter')}</Label>
            <select
              id="exporter"
              value={exporterId}
              onChange={(e) => setExporterId(e.target.value)}
              disabled={Boolean(defaultExporterId)}
              className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporters.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="market">{tCreate('destinationMarket')}</Label>
              <select
                id="market"
                value={market}
                onChange={(e) => {
                  const m = e.target.value as Market;
                  setMarket(m);
                  if (!country || country === COUNTRY_BY_MARKET[market]) {
                    setCountry(COUNTRY_BY_MARKET[m]);
                  }
                }}
                className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
              >
                {MARKETS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="country">{tCreate('destinationCountry')}</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="count">{tCreate('containerCount')}</Label>
            <Input
              id="count"
              type="number"
              min={1}
              value={containerCount}
              onChange={(e) => setContainerCount(parseInt(e.target.value || '0', 10))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="from">{tCreate('windowFrom')}</Label>
              <Input id="from" type="date" value={windowFrom} onChange={(e) => setWindowFrom(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="to">{tCreate('windowTo')}</Label>
              <Input id="to" type="date" value={windowTo} onChange={(e) => setWindowTo(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">{tCreate('notes')}</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <DialogClose className="rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-xs text-ink-2 hover:text-ink-1">
              {tCommon('cancel')}
            </DialogClose>
            <button
              type="submit"
              className="rounded-md bg-mint-500 px-3 py-1.5 text-xs font-medium text-bg-0 hover:bg-mint-500/90"
            >
              {tCreate('submit')}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

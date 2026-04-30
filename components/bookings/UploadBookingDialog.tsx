'use client';

import { useState, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input, Label } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { addBooking, addContainer } from '@/lib/hooks/useDemoStore';
import { navieras } from '@/lib/mock-data/navieras';
import type { Booking, Container, ContainerType, FreightTerm } from '@/types';
import { Loader2, Upload } from 'lucide-react';

interface ParseResponse {
  booking: {
    navieraId: string;
    bookingNumber: string;
    shipper: string;
    consignee: string;
    referenciaCliente?: string;
    vesselName: string;
    voyage: string;
    pol: string;
    polCoords: [number, number];
    pod: string;
    podCoords: [number, number];
    transshipmentPort?: string;
    etd?: string;
    eta?: string;
    cutOff?: string;
    stackingFrom?: string;
    stackingTo?: string;
    containerType: ContainerType;
    isReefer: boolean;
    setpointC?: number;
    ventilation?: number;
    freightTerm: FreightTerm;
    emissionType: 'BL' | 'Seawaybill';
  };
  containers: Array<{ containerNumber?: string; cargoDescription?: string }>;
}

type Phase = 'idle' | 'loading' | 'review' | 'error';

export function UploadBookingDialog({ children }: { children: ReactNode }) {
  const t = useTranslations('bookings');
  const tDlg = useTranslations('bookings.uploadDialog');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [parsed, setParsed] = useState<ParseResponse | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<ParseResponse['booking']>>({});
  const [navieraId, setNavieraId] = useState('');

  function reset() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setPhase('idle');
    setParsed(null);
    setBlobUrl(null);
    setFileName('');
    setForm({});
    setNavieraId('');
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    setOpen(v);
  }

  async function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    setFileName(file.name);
    setPhase('loading');

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/bookings/parse', { method: 'POST', body: fd });
      if (!res.ok) {
        setPhase('error');
        URL.revokeObjectURL(url);
        setBlobUrl(null);
        return;
      }
      const data: ParseResponse = await res.json();
      setParsed(data);
      setForm(data.booking);
      setNavieraId(data.booking.navieraId);
      setPhase('review');
    } catch {
      setPhase('error');
      URL.revokeObjectURL(url);
      setBlobUrl(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleConfirm() {
    if (!parsed || !form) return;
    const containerCount = parsed.containers.length;
    const bookingId = `BKG-${form.bookingNumber}`;
    const containerIds = parsed.containers.map((_, i) => `CTR-${form.bookingNumber}-${i}`);

    const booking: Booking = {
      id: bookingId,
      bookingNumber: form.bookingNumber ?? '',
      navieraId,
      shipper: form.shipper ?? '',
      consignee: form.consignee ?? '',
      referenciaCliente: form.referenciaCliente,
      vesselName: form.vesselName ?? '',
      voyage: form.voyage ?? '',
      pol: form.pol ?? '',
      polCoords: form.polCoords ?? [0, 0],
      pod: form.pod ?? '',
      podCoords: form.podCoords ?? [0, 0],
      transshipmentPort: form.transshipmentPort,
      etd: form.etd ?? new Date().toISOString(),
      eta: form.eta ?? new Date().toISOString(),
      cutOff: form.cutOff,
      stackingFrom: form.stackingFrom,
      stackingTo: form.stackingTo,
      containerType: form.containerType ?? '40RF',
      containerCount,
      isReefer: form.isReefer ?? false,
      setpointC: form.setpointC,
      ventilation: form.ventilation,
      freightTerm: form.freightTerm ?? 'COLLECT',
      emissionType: form.emissionType ?? 'BL',
      bookingFileUrl: blobUrl ?? undefined,
      bookingFileName: fileName,
      containerIds,
      status: 'awaiting_si',
      createdAt: new Date().toISOString(),
      alertIds: [],
      costAtRiskUsd: 0,
    };

    addBooking(booking);
    parsed.containers.forEach((c, i) => {
      const container: Container = {
        id: containerIds[i]!,
        bookingId,
        containerNumber: c.containerNumber,
        cargoDescription: c.cargoDescription,
      };
      addContainer(container);
    });

    toast.success(tDlg('toast', { number: booking.bookingNumber }));
    setOpen(false);
    router.push(`/bookings/${bookingId}`);
  }

  const canConfirm =
    !!(form.bookingNumber?.trim()) && navieraId !== 'NAV-UNKNOWN' && navieraId !== '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tDlg('title')}</DialogTitle>
        </DialogHeader>

        {phase === 'idle' && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--line-soft)] p-12 text-center hover:border-mint-500"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-ink-3" />
            <p className="text-sm text-ink-2">{tDlg('dropzone')}</p>
            <input
              ref={fileInputRef}
              data-testid="file-input"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleInputChange}
            />
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            <p className="text-sm text-ink-2">{tDlg('parsing')}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-severity-crit">{tDlg('parseError')}</p>
            <button
              onClick={() => {
                setPhase('idle');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="rounded-md bg-bg-2 px-3 py-1.5 text-xs text-ink-1 hover:bg-bg-3"
            >
              {tDlg('tryAgain')}
            </button>
          </div>
        )}

        {phase === 'review' && parsed && (
          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
                {tDlg('section_booking')}
              </p>
              <p className="mb-3 text-xs text-ink-3">{tDlg('reviewHint')}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bn">{t('colNumber')}</Label>
                  <Input
                    id="bn"
                    value={form.bookingNumber ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, bookingNumber: e.target.value }))}
                    placeholder={tDlg('fieldPending')}
                  />
                </div>
                <div>
                  <Label htmlFor="carrier">{t('carrier')}</Label>
                  <select
                    id="carrier"
                    value={navieraId}
                    onChange={(e) => setNavieraId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    {navieraId === 'NAV-UNKNOWN' && (
                      <option value="NAV-UNKNOWN">{tDlg('unknownCarrier')}</option>
                    )}
                    {navieras.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.shortName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="shipper">{t('shipper')}</Label>
                  <Input
                    id="shipper"
                    value={form.shipper ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, shipper: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="consignee">{t('consignee')}</Label>
                  <Input
                    id="consignee"
                    value={form.consignee ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, consignee: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vessel">{t('vessel')}</Label>
                  <Input
                    id="vessel"
                    value={form.vesselName ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setForm((f) => ({ ...f, vesselName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="voyage">{t('voyage')}</Label>
                  <Input
                    id="voyage"
                    value={form.voyage ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setForm((f) => ({ ...f, voyage: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pol">{t('labelPolToPod')}</Label>
                  <Input
                    id="pol"
                    value={form.pol ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setForm((f) => ({ ...f, pol: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pod">{t('labelPolToPod')}</Label>
                  <Input
                    id="pod"
                    value={form.pod ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setForm((f) => ({ ...f, pod: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="etd">{t('labelEtd')}</Label>
                  <Input
                    id="etd"
                    type="date"
                    value={form.etd?.slice(0, 10) ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setForm((f) => ({ ...f, etd: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="eta">{t('labelEta')}</Label>
                  <Input
                    id="eta"
                    type="date"
                    value={form.eta?.slice(0, 10) ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setForm((f) => ({ ...f, eta: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cutoff">{t('labelCutoff')}</Label>
                  <Input
                    id="cutoff"
                    type="date"
                    value={form.cutOff?.slice(0, 10) ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, cutOff: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="freightTerm">{t('freightTerms')}</Label>
                  <select
                    id="freightTerm"
                    value={form.freightTerm ?? 'COLLECT'}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, freightTerm: e.target.value as FreightTerm }))
                    }
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    <option value="COLLECT">COLLECT</option>
                    <option value="PREPAID">PREPAID</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="emissionType">{t('emissionType')}</Label>
                  <select
                    id="emissionType"
                    value={form.emissionType ?? 'BL'}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        emissionType: e.target.value as 'BL' | 'Seawaybill',
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    <option value="BL">BL</option>
                    <option value="Seawaybill">Seawaybill</option>
                  </select>
                </div>
                {form.isReefer && (
                  <div>
                    <Label htmlFor="setpoint">Setpoint °C</Label>
                    <Input
                      id="setpoint"
                      type="number"
                      value={form.setpointC ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, setpointC: parseFloat(e.target.value) }))
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--line-soft)] pt-4">
              <p className="mb-3 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
                {tDlg('section_containers')}
              </p>
              {parsed.containers.map((c, i) => (
                <div
                  key={i}
                  className="rounded-md border border-[var(--line-soft)] bg-bg-2 p-3 text-xs text-ink-3"
                >
                  Container {i + 1}: {c.containerNumber ?? <span className="italic">—</span>}
                  {c.cargoDescription && ` — ${c.cargoDescription}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'review' && (
          <DialogFooter>
            <DialogClose className="rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-xs text-ink-2 hover:text-ink-1">
              {tCommon('cancel')}
            </DialogClose>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="rounded-md bg-mint-500 px-3 py-1.5 text-xs font-medium text-bg-0 hover:bg-mint-500/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tDlg('confirm')}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

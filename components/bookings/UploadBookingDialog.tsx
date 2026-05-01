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
import type { Booking, ContainerType, FreightTerm } from '@/types';
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

type FileStatus = 'pending' | 'loading' | 'done' | 'error';

interface FileEntry {
  file: File;
  blobUrl: string;
  status: FileStatus;
  parsed?: ParseResponse;
  form?: ParseResponse['booking'];
  navieraId?: string;
}

type Phase = 'idle' | 'processing' | 'review';

export function UploadBookingDialog({ children }: { children: ReactNode }) {
  const t = useTranslations('bookings');
  const tDlg = useTranslations('bookings.uploadDialog');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [lastCreatedBookingId, setLastCreatedBookingId] = useState<string | null>(null);
  const lastCreatedBookingIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    files.forEach(f => { if (f.blobUrl) URL.revokeObjectURL(f.blobUrl); });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPhase('idle');
    setFiles([]);
    setReviewIndex(0);
    setLastCreatedBookingId(null);
    lastCreatedBookingIdRef.current = null;
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    setOpen(v);
  }

  async function handleFiles(selectedFiles: File[]) {
    const entries: FileEntry[] = selectedFiles.map(file => ({
      file,
      blobUrl: URL.createObjectURL(file),
      status: 'loading',
    }));
    setFiles(entries);
    setPhase('processing');

    const calls = entries.map(async (entry) => {
      const fd = new FormData();
      fd.append('file', entry.file);
      try {
        const res = await fetch('/api/bookings/parse', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('parse failed');
        const data: ParseResponse = await res.json();
        setFiles(prev =>
          prev.map(f =>
            f === entry
              ? { ...f, status: 'done', parsed: data, form: data.booking, navieraId: data.booking.navieraId }
              : f
          )
        );
        return data;
      } catch {
        setFiles(prev => prev.map(f => f === entry ? { ...f, status: 'error' } : f));
        throw new Error('error');
      }
    });

    const results = await Promise.allSettled(calls);
    const anySucceeded = results.some(r => r.status === 'fulfilled');
    if (anySucceeded) {
      setPhase('review');
      setReviewIndex(0);
    }
    // else: phase stays 'processing', allFailed will be true after next render
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const pdfs = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (pdfs.length > 0) handleFiles(pdfs);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pdfs = Array.from(e.target.files ?? []).filter(f => f.type === 'application/pdf');
    if (pdfs.length > 0) handleFiles(pdfs);
  }

  const successfulFiles = files.filter(f => f.status === 'done');
  const allFailed = files.length > 0 && files.every(f => f.status === 'error');
  const currentEntry = successfulFiles[reviewIndex];
  const isLastReview = reviewIndex === successfulFiles.length - 1;

  function setEntryForm(update: Partial<ParseResponse['booking']>) {
    if (!currentEntry) return;
    setFiles(prev =>
      prev.map(f => f === currentEntry ? { ...f, form: { ...f.form!, ...update } } : f)
    );
  }

  function setEntryNavieraId(id: string) {
    if (!currentEntry) return;
    setFiles(prev =>
      prev.map(f => f === currentEntry ? { ...f, navieraId: id } : f)
    );
  }

  function handleConfirm() {
    if (!currentEntry?.form) return;
    const { form, navieraId: entryNavieraId, blobUrl, file } = currentEntry;
    const containerCount = currentEntry.parsed!.containers.length;
    const bookingId = `BKG-${form.bookingNumber}`;
    const containerIds = currentEntry.parsed!.containers.map((_, i) => `CTR-${form.bookingNumber}-${i}`);

    const booking: Booking = {
      id: bookingId,
      bookingNumber: form.bookingNumber ?? '',
      navieraId: entryNavieraId ?? '',
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
      bookingFileUrl: blobUrl || undefined,
      bookingFileName: file.name,
      containerIds,
      status: 'awaiting_si',
      createdAt: new Date().toISOString(),
      alertIds: [],
      costAtRiskUsd: 0,
    };

    try {
      addBooking(booking);
      currentEntry.parsed!.containers.forEach((c, i) => {
        addContainer({
          id: containerIds[i]!,
          bookingId,
          containerNumber: c.containerNumber,
          cargoDescription: c.cargoDescription,
        });
      });
      // null out blobUrl — ownership transferred to booking
      setFiles(prev => prev.map(f => f === currentEntry ? { ...f, blobUrl: '' } : f));
      setLastCreatedBookingId(bookingId);
      lastCreatedBookingIdRef.current = bookingId;
      toast.success(tDlg('toast', { number: booking.bookingNumber }));
    } catch {
      toast.error(tDlg('parseError'));
    }

    if (isLastReview) {
      setOpen(false);
      if (lastCreatedBookingIdRef.current) {
        router.push(`/bookings/${lastCreatedBookingIdRef.current}`);
      }
    } else {
      setReviewIndex(i => i + 1);
    }
  }

  const canConfirm =
    !!(currentEntry?.form?.bookingNumber?.trim()) &&
    currentEntry?.navieraId !== 'NAV-UNKNOWN' &&
    !!currentEntry?.navieraId;

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
            <p className="text-sm text-ink-2">{tDlg('dropzoneMultiple')}</p>
            <input
              ref={fileInputRef}
              data-testid="file-input"
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={handleInputChange}
            />
          </div>
        )}

        {phase === 'processing' && (() => {
          return (
            <div className="flex flex-col gap-2 py-4">
              <p className="mb-2 text-sm text-ink-2">{tDlg('processingTitle')}</p>
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-ink-2">
                  {f.status === 'loading' && <Loader2 className="h-3 w-3 animate-spin text-mint-500" />}
                  {f.status === 'done' && <span className="text-mint-500">✓</span>}
                  {f.status === 'error' && <span className="text-severity-crit">✕</span>}
                  <span>{f.file.name}</span>
                </div>
              ))}
              {allFailed && (
                <div className="mt-4 flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-severity-crit">{tDlg('allFailed')}</p>
                  <button
                    onClick={reset}
                    className="rounded-md bg-bg-2 px-3 py-1.5 text-xs text-ink-1 hover:bg-bg-3"
                  >
                    {tDlg('tryAgain')}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {phase === 'review' && currentEntry?.parsed && (
          <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
            {successfulFiles.length > 1 && (
              <p className="text-xs font-medium text-ink-2">
                {tDlg('bookingCounter', {
                  current: reviewIndex + 1,
                  total: successfulFiles.length,
                })}
              </p>
            )}
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
                    value={currentEntry.form?.bookingNumber ?? ''}
                    onChange={(e) => setEntryForm({ bookingNumber: e.target.value })}
                    placeholder={tDlg('fieldPending')}
                  />
                </div>
                <div>
                  <Label htmlFor="carrier">{t('carrier')}</Label>
                  <select
                    id="carrier"
                    value={currentEntry.navieraId ?? ''}
                    onChange={(e) => setEntryNavieraId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    {currentEntry.navieraId === 'NAV-UNKNOWN' && (
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
                    value={currentEntry.form?.shipper ?? ''}
                    onChange={(e) => setEntryForm({ shipper: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="consignee">{t('consignee')}</Label>
                  <Input
                    id="consignee"
                    value={currentEntry.form?.consignee ?? ''}
                    onChange={(e) => setEntryForm({ consignee: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vessel">{t('vessel')}</Label>
                  <Input
                    id="vessel"
                    value={currentEntry.form?.vesselName ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setEntryForm({ vesselName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="voyage">{t('voyage')}</Label>
                  <Input
                    id="voyage"
                    value={currentEntry.form?.voyage ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setEntryForm({ voyage: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pol">{t('labelPolToPod')}</Label>
                  <Input
                    id="pol"
                    value={currentEntry.form?.pol ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setEntryForm({ pol: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pod">{t('labelPolToPod')}</Label>
                  <Input
                    id="pod"
                    value={currentEntry.form?.pod ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setEntryForm({ pod: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="etd">{t('labelEtd')}</Label>
                  <Input
                    id="etd"
                    type="date"
                    value={currentEntry.form?.etd?.slice(0, 10) ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setEntryForm({ etd: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="eta">{t('labelEta')}</Label>
                  <Input
                    id="eta"
                    type="date"
                    value={currentEntry.form?.eta?.slice(0, 10) ?? ''}
                    placeholder={tDlg('fieldPending')}
                    onChange={(e) => setEntryForm({ eta: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cutoff">{t('labelCutoff')}</Label>
                  <Input
                    id="cutoff"
                    type="date"
                    value={currentEntry.form?.cutOff?.slice(0, 10) ?? ''}
                    onChange={(e) => setEntryForm({ cutOff: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="freightTerm">{t('freightTerms')}</Label>
                  <select
                    id="freightTerm"
                    value={currentEntry.form?.freightTerm ?? 'COLLECT'}
                    onChange={(e) => setEntryForm({ freightTerm: e.target.value as FreightTerm })}
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
                    value={currentEntry.form?.emissionType ?? 'BL'}
                    onChange={(e) =>
                      setEntryForm({ emissionType: e.target.value as 'BL' | 'Seawaybill' })
                    }
                    className="flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 outline-none"
                  >
                    <option value="BL">BL</option>
                    <option value="Seawaybill">Seawaybill</option>
                  </select>
                </div>
                {currentEntry.form?.isReefer && (
                  <div>
                    <Label htmlFor="setpoint">Setpoint °C</Label>
                    <Input
                      id="setpoint"
                      type="number"
                      value={currentEntry.form?.setpointC ?? ''}
                      onChange={(e) => setEntryForm({ setpointC: parseFloat(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--line-soft)] pt-4">
              <p className="mb-3 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
                {tDlg('section_containers')}
              </p>
              {currentEntry.parsed.containers.map((c, i) => (
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
              {isLastReview ? tDlg('confirm') : tDlg('confirmNext')}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

# Multi-PDF Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to upload multiple booking confirmation PDFs in a single dialog session, parsing them in parallel and reviewing/confirming each one sequentially.

**Architecture:** Replace single-file state in `UploadBookingDialog.tsx` with a `FileEntry[]` array and a `reviewIndex` cursor. All parse calls fire in parallel via `Promise.allSettled`, which drives the phase transition. Review iterates over the `successfulFiles` derived array, one entry at a time, using the existing form UI unchanged.

**Tech Stack:** React (hooks), Next.js App Router, TypeScript, next-intl (i18n), Vitest + Testing Library

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Modify | `agora-app/components/bookings/UploadBookingDialog.tsx` | Full state model replacement; new processing UI; review loop |
| Modify | `agora-app/messages/en.json` | Add new i18n keys for multi-file UI |
| Modify | `agora-app/__tests__/bookings/upload-booking-dialog.test.tsx` | Update existing tests + add multi-file tests |

No new files. No API changes. No type changes.

---

## Task 1: Add i18n strings

**Files:**
- Modify: `agora-app/messages/en.json`

- [ ] **Step 1: Add new keys inside `uploadDialog`**

Open `agora-app/messages/en.json`. Inside the `"uploadDialog"` object, add after `"tryAgain"`:

```json
"dropzoneMultiple": "Drop PDFs here, or click to browse",
"processingTitle": "Parsing documents…",
"allFailed": "Could not extract data from any of the uploaded PDFs.",
"confirmNext": "Confirm & next",
"bookingCounter": "Booking {current} of {total}"
```

- [ ] **Step 2: Commit**

```bash
git -C agora-app add messages/en.json
git -C agora-app commit -m "feat(i18n): add multi-pdf upload strings"
```

---

## Task 2: Update tests to cover multi-file behavior (write failing tests first)

**Files:**
- Modify: `agora-app/__tests__/bookings/upload-booking-dialog.test.tsx`

Read the existing test file before editing. The existing mock setup (`global.fetch`, `URL.createObjectURL`, `URL.revokeObjectURL`, `addBooking`, `addContainer`) stays in place.

- [ ] **Step 1: Add a helper factory for a successful parse response**

At the top of the test file, after the existing mocks, add:

```ts
function mockParseResponse(bookingNumber: string) {
  return {
    booking: {
      navieraId: 'NAV-001',
      bookingNumber,
      shipper: 'Test Shipper',
      consignee: 'Test Consignee',
      vesselName: 'Test Vessel',
      voyage: 'V001',
      pol: 'Valparaíso',
      polCoords: [-71.62, -33.04] as [number, number],
      pod: 'Rotterdam',
      podCoords: [4.48, 51.9] as [number, number],
      containerType: '40RF' as const,
      isReefer: false,
      freightTerm: 'COLLECT' as const,
      emissionType: 'BL' as const,
    },
    containers: [{ containerNumber: 'TCKU1234567', cargoDescription: 'Fruit' }],
  };
}

function mockFetchOk(response: object) {
  return { ok: true, json: async () => response };
}
```

- [ ] **Step 2: Add test — processing screen shows file rows**

```ts
it('shows a processing row per file during parallel parse', async () => {
  (global.fetch as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ ok: false, json: async () => ({}) }); // all fail — keeps dialog open

  wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
  await userEvent.click(screen.getByText('Upload'));

  const file1 = new File(['a'], 'booking-1.pdf', { type: 'application/pdf' });
  const file2 = new File(['b'], 'booking-2.pdf', { type: 'application/pdf' });
  const input = screen.getByTestId('file-input');
  await userEvent.upload(input, [file1, file2]);

  await waitFor(() => expect(screen.getByText('booking-1.pdf')).toBeInTheDocument());
  expect(screen.getByText('booking-2.pdf')).toBeInTheDocument();
});
```

- [ ] **Step 3: Add test — counter shown in review for multiple files**

```ts
it('shows booking counter when reviewing multiple files', async () => {
  (global.fetch as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-001')))
    .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-002')));

  wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
  await userEvent.click(screen.getByText('Upload'));

  const file1 = new File(['a'], 'booking-1.pdf', { type: 'application/pdf' });
  const file2 = new File(['b'], 'booking-2.pdf', { type: 'application/pdf' });
  const input = screen.getByTestId('file-input');
  await userEvent.upload(input, [file1, file2]);

  await waitFor(() => expect(screen.getByText(/Booking 1 of 2/i)).toBeInTheDocument());
});
```

- [ ] **Step 4: Add test — "Confirm & next" advances to second booking**

```ts
it('advances to the next booking after "Confirm & next"', async () => {
  (global.fetch as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-001')))
    .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-002')));

  wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
  await userEvent.click(screen.getByText('Upload'));

  const input = screen.getByTestId('file-input');
  await userEvent.upload(input, [
    new File(['a'], 'b1.pdf', { type: 'application/pdf' }),
    new File(['b'], 'b2.pdf', { type: 'application/pdf' }),
  ]);

  await waitFor(() => expect(screen.getByText(/Booking 1 of 2/i)).toBeInTheDocument());
  await userEvent.click(screen.getByText(/Confirm & next/i));
  await waitFor(() => expect(screen.getByText(/Booking 2 of 2/i)).toBeInTheDocument());
});
```

- [ ] **Step 5: Add test — all-failed state shows "Try again"**

```ts
it('shows all-failed state when every file fails to parse', async () => {
  (global.fetch as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ ok: false, json: async () => ({}) });

  wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
  await userEvent.click(screen.getByText('Upload'));

  const input = screen.getByTestId('file-input');
  await userEvent.upload(input, [
    new File(['a'], 'bad1.pdf', { type: 'application/pdf' }),
    new File(['b'], 'bad2.pdf', { type: 'application/pdf' }),
  ]);

  await waitFor(() => expect(screen.getByText(/Try again/i)).toBeInTheDocument());
});
```

- [ ] **Step 6: Run new tests to confirm they fail (implementation not written yet)**

```bash
cd agora-app && npx vitest run __tests__/bookings/upload-booking-dialog.test.tsx
```

Expected: the 4 new tests fail; the 3 existing tests still pass.

- [ ] **Step 7: Commit failing tests**

```bash
git -C agora-app add __tests__/bookings/upload-booking-dialog.test.tsx
git -C agora-app commit -m "test(bookings): add failing tests for multi-pdf upload"
```

---

## Task 3: Implement multi-file state and processing phase

**Files:**
- Modify: `agora-app/components/bookings/UploadBookingDialog.tsx`

Read the full current file before editing. The complete new implementation replaces the file contents.

- [ ] **Step 1: Replace imports and type definitions**

At the top of the file, keep all existing imports. Add `useRef` to the React import if not present. The `ParseResponse` interface stays unchanged.

Add the new types below `ParseResponse`:

```ts
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
```

Remove the old `type Phase = 'idle' | 'loading' | 'review' | 'error';` line.

- [ ] **Step 2: Replace component state**

Inside `UploadBookingDialog`, replace all state declarations with:

```ts
const [open, setOpen] = useState(false);
const [phase, setPhase] = useState<Phase>('idle');
const [files, setFiles] = useState<FileEntry[]>([]);
const [reviewIndex, setReviewIndex] = useState(0);
const [lastCreatedBookingId, setLastCreatedBookingId] = useState<string | null>(null);
const lastCreatedBookingIdRef = useRef<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

Remove old: `parsed`, `blobUrl`, `fileName`, `form`, `navieraId` state vars.

- [ ] **Step 3: Replace `reset()`**

```ts
function reset() {
  files.forEach(f => { if (f.blobUrl) URL.revokeObjectURL(f.blobUrl); });
  if (fileInputRef.current) fileInputRef.current.value = '';
  setPhase('idle');
  setFiles([]);
  setReviewIndex(0);
  setLastCreatedBookingId(null);
  lastCreatedBookingIdRef.current = null;
}
```

- [ ] **Step 4: Replace `handleFile` with `handleFiles`**

```ts
async function handleFiles(selectedFiles: File[]) {
  const entries: FileEntry[] = selectedFiles.map(file => ({
    file,
    blobUrl: URL.createObjectURL(file),
    status: 'loading',
  }));
  setFiles(entries);
  setPhase('processing');

  const calls = entries.map(async (entry, i) => {
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
```

- [ ] **Step 5: Update `handleDrop` and `handleInputChange`**

```ts
function handleDrop(e: React.DragEvent) {
  e.preventDefault();
  const pdfs = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
  if (pdfs.length > 0) handleFiles(pdfs);
}

function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
  const pdfs = Array.from(e.target.files ?? []).filter(f => f.type === 'application/pdf');
  if (pdfs.length > 0) handleFiles(pdfs);
}
```

- [ ] **Step 6: Run tests — processing-related tests should now pass**

```bash
cd agora-app && npx vitest run __tests__/bookings/upload-booking-dialog.test.tsx
```

Expected: "shows a processing row per file" and "all-failed state" tests pass. Counter and "Confirm & next" tests still fail (review phase not updated yet).

---

## Task 4: Implement review phase and confirm loop

**Files:**
- Modify: `agora-app/components/bookings/UploadBookingDialog.tsx`

- [ ] **Step 1: Add derived values at the top of the render function**

```ts
const successfulFiles = files.filter(f => f.status === 'done');
const allFailed = files.length > 0 && files.every(f => f.status === 'error');
const currentEntry = successfulFiles[reviewIndex];
const isLastReview = reviewIndex === successfulFiles.length - 1;
```

- [ ] **Step 2: Replace `handleConfirm`**

```ts
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
```

- [ ] **Step 3: Add per-entry form edit helpers**

Replace the old `setForm` and `setNavieraId` pattern. Edits write back via reference equality:

```ts
function setEntryForm(update: Partial<ParseResponse['booking']>) {
  if (!currentEntry) return;
  setFiles(prev =>
    prev.map(f =>
      f === currentEntry ? { ...f, form: { ...f.form!, ...update } } : f
    )
  );
}

function setEntryNavieraId(id: string) {
  if (!currentEntry) return;
  setFiles(prev =>
    prev.map(f => f === currentEntry ? { ...f, navieraId: id } : f)
  );
}
```

- [ ] **Step 4: Update `canConfirm`**

```ts
const canConfirm =
  !!(currentEntry?.form?.bookingNumber?.trim()) &&
  currentEntry?.navieraId !== 'NAV-UNKNOWN' &&
  !!currentEntry?.navieraId;
```

- [ ] **Step 5: Run tests — counter and "Confirm & next" tests should now pass**

```bash
cd agora-app && npx vitest run __tests__/bookings/upload-booking-dialog.test.tsx
```

Expected: all new tests pass.

---

## Task 5: Update JSX

**Files:**
- Modify: `agora-app/components/bookings/UploadBookingDialog.tsx`

- [ ] **Step 1: Update idle phase JSX**

In the `phase === 'idle'` block, change the `<input>` to accept multiple files and update hint text:

```tsx
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
```

- [ ] **Step 2: Replace loading/error phase JSX with processing phase JSX**

Remove the old `phase === 'loading'` and `phase === 'error'` blocks. Add:

```tsx
{phase === 'processing' && !allFailed && (
  <div className="flex flex-col gap-2 py-4">
    <p className="mb-2 text-xs text-ink-3">{tDlg('processingTitle')}</p>
    {files.map((entry, i) => (
      <div key={i} className="flex items-center gap-3 rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-2 text-sm">
        <span className="flex-1 truncate text-ink-1">{entry.file.name}</span>
        {entry.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-mint-500" />}
        {entry.status === 'done' && <span className="text-mint-500">✓</span>}
        {entry.status === 'error' && <span className="text-severity-crit">✕</span>}
      </div>
    ))}
  </div>
)}

{phase === 'processing' && allFailed && (
  <div className="flex flex-col items-center gap-3 py-8 text-center">
    <p className="text-sm text-severity-crit">{tDlg('allFailed')}</p>
    <button
      onClick={reset}
      className="rounded-md bg-bg-2 px-3 py-1.5 text-xs text-ink-1 hover:bg-bg-3"
    >
      {tDlg('tryAgain')}
    </button>
  </div>
)}
```

- [ ] **Step 3: Update review phase JSX**

In the `phase === 'review' && currentEntry` block:

- Add counter in the `<DialogHeader>`:

```tsx
<DialogHeader>
  <DialogTitle>{tDlg('title')}</DialogTitle>
  {successfulFiles.length > 1 && (
    <p className="text-xs text-ink-3">
      {tDlg('bookingCounter', { current: reviewIndex + 1, total: successfulFiles.length })}
    </p>
  )}
</DialogHeader>
```

- Replace all `form.xxx` reads with `currentEntry.form?.xxx` and all `setForm(f => ...)` calls with `setEntryForm({ xxx: ... })`. Replace `navieraId` reads with `currentEntry.navieraId` and setter with `setEntryNavieraId(...)`. The form field JSX structure is otherwise identical to today — no layout changes.

- [ ] **Step 4: Update review footer**

```tsx
{phase === 'review' && currentEntry && (
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
```

- [ ] **Step 5: Run full test suite**

```bash
cd agora-app && npx vitest run __tests__/bookings/upload-booking-dialog.test.tsx
```

Expected: all tests pass (3 existing + 4 new).

- [ ] **Step 6: Commit**

```bash
git -C agora-app add components/bookings/UploadBookingDialog.tsx messages/en.json __tests__/bookings/upload-booking-dialog.test.tsx
git -C agora-app commit -m "feat(bookings): support multi-pdf upload with parallel parse and sequential review"
```

---

## Task 6: Manual smoke test

- [ ] **Step 1: Start dev server**

```bash
cd agora-app && npm run dev
```

- [ ] **Step 2: Smoke test — single file (regression)**

Open the booking creation dialog. Upload one PDF. Verify: processing screen flashes, review form appears, confirm creates the booking and navigates to it.

- [ ] **Step 3: Smoke test — multiple files**

Upload two PDFs. Verify: processing screen shows two rows with spinners that resolve to check/X. Review form shows "Booking 1 of 2". Click "Confirm & next" — form advances to "Booking 2 of 2". Click "Confirm" — dialog closes and navigates to the second booking.

- [ ] **Step 4: Smoke test — partial failure**

Upload two PDFs where one is not a valid booking confirmation. Verify: one row shows X, the other shows ✓. Dialog advances to review with "Booking 1 of 1". Confirm creates the one successful booking.

- [ ] **Step 5: Smoke test — all-failed**

Upload a PDF that fails to parse. Verify: processing screen shows X, all-failed error message appears, "Try again" button resets to the idle dropzone.

# Multi-PDF Upload — Design Spec

**Date:** 2026-05-01  
**Status:** Approved  
**Scope:** `UploadBookingDialog.tsx` only — no API, type, or data changes.

---

## Problem

The booking creation dialog only accepts one PDF at a time. Users need to upload several booking confirmations in a single session without reopening the dialog repeatedly.

---

## Approach

Parallel parse + sequential review:

1. User selects N PDFs via the dropzone.
2. All N parse API calls fire in parallel. Individual `FileEntry` statuses update as each call resolves or rejects.
3. `Promise.allSettled` drives the phase transition — reads the settled results array (not React state) to decide next phase, avoiding stale-closure issues.
4. Processing screen shows per-file status.
5. User reviews and confirms each successfully-parsed booking one at a time with a "Booking X of N" counter.
6. After the final entry, dialog closes. Navigate to the last created booking ID if one exists; otherwise close without navigating.

---

## State model

```ts
type FileStatus = 'pending' | 'loading' | 'done' | 'error';

interface FileEntry {
  file: File;
  blobUrl: string;   // set to '' after confirm — signals ownership transferred to booking
  status: FileStatus;
  parsed?: ParseResponse;
  form?: ParseResponse['booking'];  // non-partial; always fully populated on status:'done'
  navieraId?: string;
}

type Phase = 'idle' | 'processing' | 'review';
```

State vars replacing all current single-file vars:

- `files: FileEntry[]`
- `reviewIndex: number` — cursor into `successfulFiles` (see below)
- `phase: Phase`
- `lastCreatedBookingId: string | null` — React state for UI; also mirrored in a `lastCreatedBookingIdRef` (a `useRef`) so it can be read synchronously in event handlers without stale closure issues

### Derived values (computed inline, not stored in state)

```ts
const successfulFiles = files.filter(f => f.status === 'done');
const allFailed = files.length > 0 && files.every(f => f.status === 'error');
```

Write-back for user edits uses reference equality:

```ts
const entry = successfulFiles[reviewIndex]; // holds a reference
setFiles(prev => prev.map(f => f === entry ? { ...f, form: newForm } : f));
```

### `form` and `navieraId` initialization

`form` is typed as `ParseResponse['booking']` (non-partial) and initialized at parse time directly from `data.booking`. The API returns 400 if required fields are missing, so `data.booking` is always complete when `status === 'done'`. Never initialized lazily. Edits cannot bleed between entries.

### `canConfirm` guard

Reuse the existing `canConfirm` logic (booking number present, navieraId valid) applied to `successfulFiles[reviewIndex]` rather than top-level state.

---

## `reset()`

Called by `handleOpenChange(false)` (same hook as today — covers all dismiss paths: Escape key, backdrop click, programmatic close):

1. Revoke all `blobUrl`s in `files` where `blobUrl !== ''` (confirmed entries are `''` and safely skipped).
2. `fileInputRef.current.value = ''` — prevents browser onChange deduplication if the same files are re-selected after a reset.
3. Reset all state: `files: []`, `reviewIndex: 0`, `lastCreatedBookingId: null`, `phase: 'idle'`. Also reset the ref: `lastCreatedBookingIdRef.current = null`.

---

## UI phases

### Phase: `idle`
- Dropzone unchanged visually.
- `<input>` gains `multiple`. Hint text updated to indicate multiple files are accepted.
- `handleFile` is replaced by `handleFiles(selectedFiles: File[])`:
  1. Create a `FileEntry` per file (`status: 'loading'`, fresh `blobUrl`).
  2. `setFiles(entries)`, `setPhase('processing')`.
  3. Fire all parse calls in parallel. Each call on success: `setFiles` updating the matched entry to `status: 'done'`, `form: data.booking`, `navieraId: data.booking.navieraId`. On failure: `setFiles` updating to `status: 'error'`.
  4. `const results = await Promise.allSettled(calls)`. Read `results` (not React state) to check for any fulfilled outcome. If any fulfilled: `setPhase('review')`, `setReviewIndex(0)`. Otherwise: leave `phase` as `'processing'` — `allFailed` will be true after the final `setFiles` resolves, triggering the all-failed sub-state in the next render.

### Phase: `processing` — two visual sub-states
- **Loading list** (default): list of rows with filename + status icon (spinner → check ✓ or X). Phase advances to `'review'` only via the `Promise.allSettled` callback above.
- **All-failed error state** (when `allFailed === true`): rendered inside the same `phase === 'processing'` branch. Shows an error message and "Try again" button. `allFailed` is always correct here because `Promise.allSettled` has finished and all `setFiles` batches have resolved before React re-renders. "Try again" calls `reset()`.
- N=1: processing screen shown for a single file too — brief flash is accepted.

### Phase: `review`
- Renders the existing review form over `successfulFiles[reviewIndex]`, unchanged.
- Header: `"Booking X of N"` (X = `reviewIndex + 1`, N = `successfulFiles.length`).
- Button label: `"Confirm & next"` when `reviewIndex < successfulFiles.length - 1`; `"Confirm"` on the last.
- No PDF viewer — `blobUrl` only stored to pass as `bookingFileUrl` to `addBooking`.

**On confirm (success):**
1. Call `addBooking` / `addContainer` with current entry's data, including `blobUrl`.
2. Update entry `blobUrl` to `''` via `setFiles` (ownership transferred; `reset()` skips safely).
3. `setLastCreatedBookingId(bookingId)` and `lastCreatedBookingIdRef.current = bookingId` (ref updated synchronously for use in the same or subsequent event handlers).
4. Show success toast (portal outside dialog — survives dialog unmount).
5. If more entries remain: `setReviewIndex(i => i + 1)`, stay in review. If last: `setOpen(false)`, `router.push('/bookings/' + lastCreatedBookingIdRef.current)`.

**On confirm (error):**
1. Show error toast (portal — survives dialog unmount).
2. Skip-on-error: if more entries remain, `setReviewIndex(i => i + 1)`, stay in review.
3. If last entry: `setOpen(false)`. Read `lastCreatedBookingIdRef.current` synchronously — if set, `router.push('/bookings/' + id)`; otherwise close without navigating. Immediate close on last-entry error is intentional; the toast survives to provide feedback.

---

## API & error handling

- `/api/bookings/parse` is **unchanged** — one file per request.
- Parse errors (non-OK response or thrown exception): `FileEntry.status = 'error'`, excluded from `successfulFiles`.
- Confirm-time errors: error toast + skip-on-error.

---

## Out of scope

- Changes to `/api/bookings/parse`
- Changes to `Booking` or `Container` types
- Changes to mock data
- Retry mechanism for individual failed files

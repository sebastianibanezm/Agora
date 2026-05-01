# Multi-PDF Upload — Design Spec

**Date:** 2026-05-01  
**Status:** Approved  
**Scope:** `UploadBookingDialog.tsx` only — no API, type, or data changes.

---

## Problem

The booking creation dialog only accepts one PDF at a time. Users need to upload several booking confirmations in a single session without reopening the dialog repeatedly.

---

## Approach

Parallel parse + sequential review (Option B):

1. User selects N PDFs via the dropzone (multiple selection enabled).
2. All N parse API calls fire in parallel.
3. A processing screen shows per-file status (loading / done / error).
4. Once all calls settle, the dialog advances to review mode.
5. User reviews and confirms each successfully-parsed booking one at a time — identical to the current single-file review — with a "Booking X of N" counter and "Confirm & next" / "Confirm" button label.
6. After the final confirmation, the dialog closes and the router navigates to the last created booking.

---

## State model

```ts
type FileStatus = 'pending' | 'loading' | 'done' | 'error';

interface FileEntry {
  file: File;
  blobUrl: string;
  status: FileStatus;
  parsed?: ParseResponse;
  form?: Partial<ParseResponse['booking']>;
  navieraId?: string;
}

type Phase = 'idle' | 'processing' | 'review';
```

Replace all current single-file state vars (`parsed`, `form`, `navieraId`, `blobUrl`, `fileName`) with:

- `files: FileEntry[]`
- `reviewIndex: number` — cursor into the successfully-parsed subset
- `phase: Phase`

---

## UI phases

### Idle
- Dropzone unchanged visually.
- `<input>` gains the `multiple` attribute.
- Hint text updated to indicate multiple files are accepted.

### Processing
- List of rows: filename + status icon (spinner → check ✓ or X).
- Auto-advances to review once all files have settled (`done` or `error`).
- If every file errored → show error state with "Try again" button that resets to `idle`.
- If at least one succeeded → advance to review.

### Review
- Existing review form, unchanged.
- Header addition: `"Booking X of N"` label (X = position among successful files, N = total successful).
- Confirm button label: `"Confirm & next"` for all but the last; `"Confirm"` for the last.
- Each confirm: calls `addBooking` / `addContainer`, advances `reviewIndex`.
- Errored files are silently skipped (already marked X in processing list).
- After final confirm: close dialog, `router.push` to last created booking ID.

---

## API & error handling

- `/api/bookings/parse` is **unchanged** — one file per request.
- Per-file parse errors set `FileEntry.status = 'error'`; they are skipped in review.
- `reset()` revokes all blob URLs across the entire `files` array.
- Toast behavior on confirm-time errors unchanged (show toast, advance loop).

---

## Out of scope

- Changes to `/api/bookings/parse`
- Changes to `Booking` or `Container` types
- Changes to mock data
- Retry mechanism for individual failed files

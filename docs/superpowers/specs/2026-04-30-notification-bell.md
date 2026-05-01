# Spec: Notification Bell

**Date:** 2026-04-30
**Status:** Draft

---

## Overview

A notification bell in the app header that shows a red badge with an unread count. Clicking it opens a popover panel listing hardcoded mock notifications. Clicking a notification closes the popover and navigates to the relevant booking record.

---

## Scope

- Header bell button with red unread-count badge
- Popover panel (using existing `Popover` component) anchored below-end of the bell
- Hardcoded mock notifications tied to real booking IDs from mock data
- Mark-all-read action that clears the badge
- Read state managed in local component state (no persistence)

Out of scope: real API, persistence, push notifications, filtering, pagination.

---

## Components

### `NotificationBell` (`components/layout/NotificationBell.tsx`)

Self-contained `'use client'` component. Owns:
- `notifications` — static array of `Notification` objects defined in the same file
- `readIds` — `Set<string>` in `useState`, starts empty (all unread)
- `open` — `boolean` in `useState` for controlled popover state (needed to close on row click)
- `locale` — derived via `useLocale()` from `next-intl`, prepended to all `href` values at render time (e.g. `/${locale}/bookings/BKG-SNG0502407`)

`unread` is computed as `notifications.filter(n => !readIds.has(n.id))`. Badge shows `unread.length` when > 0.

Renders:
1. `<Popover open={open} onOpenChange={setOpen}>` (controlled)
2. `PopoverTrigger` wrapping the `Bell` icon button with a red badge showing `unread.length` when > 0, plus `aria-label={t('nav.notifications')}` (uses existing i18n key via `useTranslations('nav')`)
3. `PopoverContent` panel (`w-80`, `bg-bg-2`, `border-[var(--line-soft)]`, `p-0`) containing:
   - Header row: "Notificaciones" title + "Marcar todo leído" button (only shown when `unread.length > 0`)
   - Scrollable list of `NotificationRow` items (`max-h-96 overflow-y-auto`)

### `NotificationRow` (inline sub-component)

Props: `notification: Notification`, `isRead: boolean`, `onMarkRead: (id: string) => void`, `onClose: () => void`, `localizedHref: string`

Renders a `Link href={localizedHref}` that on click:
1. Calls `onMarkRead(notification.id)` — parent updates `readIds`
2. Calls `onClose()` — parent sets `open = false`
3. Navigation proceeds via Next.js `Link` (order-of-operations flash is acceptable for this mock)

Layout (horizontal flex, items-start):
- Left: unread mint dot (`h-1.5 w-1.5 bg-mint-500 rounded-full mt-1.5 shrink-0`) — hidden when read
- Middle: notification icon + message text + timestamp below in `text-ink-3 text-xs`
- Read rows: full text color dimmed to `text-ink-3`; unread rows: `text-ink-1`

---

## Data Shape

```ts
import type { LucideIcon } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  timestamp: string;   // static human-readable string baked into mock data, e.g. "hace 5 min"
  bookingId: string;   // used to build the localized href at render time
  icon: LucideIcon;
}
```

### Mock Notifications (3 items)

| id | message | bookingId | icon |
|----|---------|-----------|------|
| n1 | "SI pendiente en BKG-SNG0502407 — vence en 2 h" | BKG-SNG0502407 | AlertTriangle |
| n2 | "Cutoff próximo para BKG-MSCSAI4421" | BKG-MSCSAI4421 | Clock |
| n3 | "BL borrador listo para revisar en BKG-MAEU991033" | BKG-MAEU991033 | FileText |

---

## Behaviour

- **Badge**: red circle (`bg-red-500 text-white text-[10px] font-mono`) positioned `absolute -top-1 -right-1`, hidden when `unread.length === 0`
- **Open/close**: controlled via `open` / `onOpenChange` on `<Popover>`; rows call `onClose()` on click
- **Mark all read**: sets `readIds` to a new `Set` containing all notification IDs; badge disappears; popover stays open
- **Single read**: clicking a row adds its ID to `readIds` and calls `onClose()`
- **Popover props**: `align="end"`, `sideOffset={8}`

---

## Integration

Replace the existing `<button aria-label={t('nav.notifications')}>…</button>` in `Header.tsx` with `<NotificationBell />`. Remove the `Bell` import from `Header.tsx`.

---

## i18n

The panel title ("Notificaciones") and mark-all-read button label ("Marcar todo leído") are intentionally hardcoded Spanish strings. This is a mock-only exception — the app's primary language is Spanish and no English locale is in active use. No new i18n keys are required.

---

## Styling Constraints

- Panel: `w-80`, `bg-bg-2`, `border-[var(--line-soft)]`, `p-0` (override default `p-3`)
- Use `text-ink-*` tokens for text hierarchy
- `strokeWidth={1.5}` on all icons to match sidebar style
- Badge: `bg-red-500` (standard Tailwind, one-off UI chrome — no new token needed)
- Row hover: `hover:bg-bg-3` (matches nav item hover pattern)

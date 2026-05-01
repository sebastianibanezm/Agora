# CMD+K Command Palette — Design Spec

**Date:** 2026-04-30
**Status:** Approved

---

## Overview

A `⌘K`-triggered search palette that lets users find and navigate to any entity or page in the app. Built on `cmdk`, styled to match Agora's warm paper design system, and mounted globally so it's reachable from anywhere.

---

## Scope

**In scope:**
- Search across bookings, exporters, navieras, alerts, and navigation pages
- Keyboard-first navigation (↑↓ Enter Esc)
- Global trigger via `⌘K` / `Ctrl+K` and the header search button
- Client-side fuzzy search against mock data

**Out of scope:**
- Command/action dispatch (create booking, filter, export)
- Server-side or API-backed search
- Recent items / search history
- Pinned or favourite items
- Mobile/touch layout (desktop-only for now)

---

## Prerequisites

Run `npm install cmdk` before starting implementation.

---

## Component Architecture

Three new files under `components/search/`. All must be `'use client'` components/hooks.

### `CommandPaletteProvider.tsx`
Thin React context that exposes `{ isOpen, open, close }`. `close` is needed both by `CommandPalette` itself (navigate-then-close flow) and by any future consumer. Registers the global `⌘K` / `Ctrl+K` keyboard shortcut via `useEffect` on mount — **the listener lives here and nowhere else** to avoid duplicates.

```ts
type CommandPaletteContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
}
```

### Mounting in the layout

`AppShell` is a Server Component and must not become a client component. Mount `CommandPaletteProvider` in the locale layout (`app/[locale]/layout.tsx`) as a `'use client'` wrapper around the children, or create a thin `ClientProviders.tsx` client wrapper for this purpose. `<CommandPalette />` should be rendered as a sibling to the `<AppShell>` inside that wrapper so it's always in the tree regardless of which page is active.

### `CommandPalette.tsx`
The palette UI. Composed as:
- **`@base-ui/react/dialog`** (`Dialog.Root`, `Dialog.Backdrop`, `Dialog.Popup`) — provides Portal, the `bg-black/60 backdrop-blur-[2px]` backdrop, and focus-trap shell
- **`cmdk` `<Command>`** (not `<Command.Dialog>`) — mounted as the inner search primitive inside `Dialog.Popup`. Using `Command.Dialog` would create a nested portal/focus-trap conflict.

Key implementation notes:
- `Dialog.Root` receives `open={isOpen}` and `onOpenChange={(open) => !open && close()}` from context. Backdrop click closes by default (`disablePointerDismissal` is not set — the base default of `false` is correct here).
- `Dialog.Popup` sets `initialFocus` to the `Command.Input` ref so focus lands on the input on open.
- `Command.Item` sets `value={item.label + ' ' + (item.sublabel ?? '')}` so cmdk filters across both fields.
- The wrapping `Dialog.Popup` includes `<Dialog.Title className="sr-only">Search</Dialog.Title>`.
- Input state **resets on close** — the component unmounts when `Dialog.Root` closes (default @base-ui behaviour), which clears the query. This is the desired UX for a search palette.

### `useSearchData.ts`
A `'use client'` hook returning a flat `SearchItem[]` registry.

```ts
type SearchItem = {
  id: string
  type: 'booking' | 'exporter' | 'naviera' | 'alert' | 'page'
  label: string       // primary display text, locale-aware
  sublabel?: string   // secondary line, locale-aware
  href: string        // bare path (no locale prefix — see Routing note)
  icon: LucideIcon
}
```

**i18n:** The app is bilingual (es/en). Use `useLocale()` from `next-intl` inside the hook to read the active locale and pick the appropriate string for `label`/`sublabel` wherever mock data has locale variants (e.g. alerts with `title`/`titleEs`).

**Routing:** The app uses `localePrefix: 'never'` — the locale is carried by cookie, never prepended to URLs. Store bare paths in `href` (e.g. `/bookings`, `/bookings/BK-2025-001`). Navigate using `useRouter` from `next/navigation`, consistent with the rest of the codebase.

Sources:
| Type | Data source | `label` | `sublabel` |
|---|---|---|---|
| `booking` | `lib/mock-data/bookings.ts` | `bookingNumber` | `vesselName · pol→pod · status` |
| `exporter` | `lib/mock-data/exporters.ts` | `name` | `city · country` |
| `naviera` | `lib/mock-data/navieras.ts` | `name` | `code` |
| `alert` | `lib/mock-data/alerts.ts` | `title` (locale-aware) | `bookingId` |
| `page` | hardcoded list | route label | path |

---

## Search Behaviour

- `cmdk` filters internally against each item's `value` prop (`label + sublabel`)
- No results → `<Command.Empty>` shows `"No results"` in `text-ink-3`
- Results grouped by `type` using `<Command.Group>`, max **5 items per group**

---

## UX & Interaction

| Detail | Spec |
|---|---|
| Triggers | `⌘K` (Mac) · `Ctrl+K` (Win/Linux) · header search button click |
| Header button | Gains a `⌘K` badge hint (`aria-hidden="true"`) next to the Search icon |
| Backdrop | `bg-black/60 backdrop-blur-[2px]` — same as existing `dialog.tsx` |
| Entry animation | `data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]` + `data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]`, 200ms |
| Palette width | `max-w-xl`, vertically and horizontally centred |
| Focus on open | `Dialog.Popup initialFocus` → `Command.Input` ref |
| Backdrop click | Closes palette (default `Dialog.Root` behaviour) |
| Keyboard nav | ↑↓ move selection · Enter navigate · Esc close (handled by `cmdk`) |
| Mouse | Hover → `bg-bg-3` highlight · Click → navigate |
| On navigate | Call `close()`, then `router.push(href)` |
| Input reset | Palette unmounts on close — query always resets on next open |

---

## Styling

`cmdk`'s default stylesheet is **not** imported. All styles applied via Tailwind className props.

| Element | Token / value |
|---|---|
| Palette background | `bg-bg-1` (`#FCF7EA`) |
| Border | `border-[var(--line-soft)]` |
| Primary text | `text-ink-1` |
| Secondary / sublabel | `text-ink-3` |
| Group label | `text-ink-4`, `font-mono`, `uppercase`, `text-[10px]` |
| Hover / selected row | `bg-bg-3` (`#F1E8D5`) |
| Input separator | `border-b border-[var(--line-soft)]` |
| Footer hints | `text-ink-4`, `font-mono`, `text-[10px]` |
| Corner radius | `rounded-xl` |
| Shadow | `shadow-2xl` |

---

## Accessibility

- `Dialog.Popup` includes `<Dialog.Title className="sr-only">Search</Dialog.Title>`
- `⌘K` badge on the header button is `aria-hidden="true"` — screen readers announce only the button's `aria-label`
- `cmdk` handles `Command.Group` ARIA roles — do not add extra `role` attributes
- `initialFocus` on `Command.Input` prevents focus from landing on the backdrop or trigger

---

## Integration Points

- **`app/[locale]/layout.tsx`** (or a thin `ClientProviders.tsx`) — wrap with `CommandPaletteProvider`, render `<CommandPalette />` as a sibling to `<AppShell>`
- **`Header.tsx`** — consume `CommandPaletteContext`, call `open()` on search button click, add `aria-hidden` `⌘K` hint badge
- **Global shortcut** — `useEffect` keydown listener in `CommandPaletteProvider` only

---

## Dependencies

- `cmdk` — install via `npm install cmdk` (not yet in `package.json`)

No other new dependencies.

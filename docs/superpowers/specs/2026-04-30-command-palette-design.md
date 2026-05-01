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

---

## Component Architecture

Three new files under `components/search/`:

### `CommandPaletteProvider.tsx`
Thin React context that holds the `isOpen` boolean and exposes an `open()` function. Mounted once inside `AppShell`, above both `Header` and the page content. This lets `Header` and the global keyboard shortcut trigger the palette without prop-drilling.

### `CommandPalette.tsx`
The palette UI itself. Composed from:
- `@base-ui/react/dialog` — provides the `Portal`, `Backdrop`, and `Popup` wrapper (matching the existing `dialog.tsx` pattern exactly)
- `cmdk` `Command` — provides the input, list, group, and item primitives with built-in keyboard navigation and fuzzy filtering

The component receives `isOpen` and `onClose` from context and renders inside the existing `DialogPortal` infrastructure.

### `useSearchData.ts`
A hook that reads all mock data sources and returns a flat `SearchItem[]` registry. Pure data — no UI.

```ts
type SearchItem = {
  id: string
  type: 'booking' | 'exporter' | 'naviera' | 'alert' | 'page'
  label: string       // primary text (booking number, exporter name, page title)
  sublabel?: string   // secondary line (carrier · route · status, city · country, etc.)
  href: string        // destination route on select
  icon: LucideIcon
}
```

Sources:
| Type | Data source | label | sublabel |
|---|---|---|---|
| booking | `lib/mock-data/bookings.ts` | `bookingNumber` | `vesselName · pol→pod · status` |
| exporter | `lib/mock-data/exporters.ts` | `name` | `city · country` |
| naviera | `lib/mock-data/navieras.ts` | `name` | `code` |
| alert | `lib/mock-data/alerts.ts` | `title` | `bookingId` |
| page | hardcoded list | route label | path |

---

## Search Behaviour

- Filtering is handled by `cmdk` internally against `label + sublabel` concatenated
- Results are grouped by `type` with uppercase mono section headers
- Maximum **5 items per group** to keep the list scannable
- Empty state: input with placeholder only, no results until typing begins

---

## UX & Interaction

| Detail | Spec |
|---|---|
| Trigger | `⌘K` (Mac) · `Ctrl+K` (Win/Linux) · header search button click |
| Header button | Gains a `⌘K` badge hint next to the Search icon |
| Backdrop | `bg-black/60 backdrop-blur-[2px]` — same as existing `dialog.tsx` |
| Entry animation | `opacity-0 scale-[0.98]` → `opacity-1 scale-100`, 200ms, matches existing dialog |
| Palette width | `max-w-xl` (wider than standard dialogs to give result rows room) |
| Position | Vertically and horizontally centred |
| Keyboard nav | ↑↓ move selection · Enter navigate · Esc close (all via `cmdk`) |
| Mouse | Hover → `bg-bg-3` (#F1E8D5) highlight · Click → navigate |
| On navigate | Close palette, push router to `href` |

---

## Styling

All colours and spacing follow existing design tokens:

| Element | Token / value |
|---|---|
| Palette background | `bg-bg-1` (`#FCF7EA`) |
| Border | `border-[var(--line-soft)]` (`rgba(60,42,22,0.08)`) |
| Primary text | `text-ink-1` (`#2B1F12`) |
| Secondary text | `text-ink-3` (`#8A7860`) |
| Group label | `text-ink-4` (`#B5A586`), mono, uppercase, 10px |
| Hover/selected row | `bg-bg-3` (`#F1E8D5`) |
| Input divider | `border-[var(--line-soft)]` |
| Footer hints | `text-ink-4`, mono, 10px |
| Corner radius | `rounded-xl` |
| Shadow | `shadow-2xl` |

`cmdk`'s default styles are fully overridden via Tailwind — no `cmdk` stylesheet imported.

---

## Integration Points

- **`AppShell.tsx`** — wrap children with `CommandPaletteProvider` and mount `<CommandPalette />`
- **`Header.tsx`** — call `open()` from context on search button click; add `⌘K` hint to button
- **Global shortcut** — `useEffect` with `keydown` listener inside `CommandPaletteProvider` (or inside `CommandPalette`)

---

## Dependencies

- `cmdk` — add to `package.json`

No other new dependencies.

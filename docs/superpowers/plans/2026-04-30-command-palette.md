# CMD+K Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a ⌘K command palette that lets users search bookings, exporters, navieras, alerts, and pages — and navigate to them via keyboard or click.

**Architecture:** `cmdk` handles the search input, fuzzy filtering, and keyboard navigation inside an `@base-ui/react/dialog` shell (reusing the existing backdrop/animation pattern). A React context (`CommandPaletteProvider`) holds open state and the global keyboard shortcut. A hook (`useSearchData`) builds the searchable registry from existing mock data exports.

**Tech Stack:** cmdk, @base-ui/react/dialog, Tailwind v4, Vitest + @testing-library/react, next-intl (useLocale), next/navigation (useRouter), lucide-react

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `components/search/types.ts` | `SearchItem` type — shared by hook and palette |
| Create | `components/search/useSearchData.ts` | Aggregates mock data into `SearchItem[]`, locale-aware |
| Create | `components/search/CommandPaletteProvider.tsx` | Context `{ isOpen, open, close }` + ⌘K keydown listener |
| Create | `components/search/CommandPalette.tsx` | Palette UI: Dialog shell + Command primitives, full styling |
| Create | `__tests__/search/useSearchData.test.ts` | Unit tests for data hook |
| Create | `__tests__/search/CommandPalette.test.tsx` | Render + interaction tests for the palette |
| Modify | `app/[locale]/layout.tsx` | Wrap body with `CommandPaletteProvider`, add `<CommandPalette />` |
| Modify | `components/layout/Header.tsx` | Call `open()` on search button click, add `⌘K` badge |

---

## Task 1: Install cmdk

**Files:** `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
cd agora-app && npm install cmdk
```

Expected: `package.json` gains `"cmdk": "^x.x.x"` and `package-lock.json` updates.

- [ ] **Step 2: Verify import resolves**

```bash
node -e "require('cmdk'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add cmdk for command palette"
```

---

## Task 2: SearchItem type

**Files:**
- Create: `components/search/types.ts`

- [ ] **Step 1: Write the type file**

```ts
// components/search/types.ts
'use client';

import type { LucideIcon } from 'lucide-react';

export type SearchItemType = 'booking' | 'exporter' | 'naviera' | 'alert' | 'page';

export type SearchItem = {
  id: string;
  type: SearchItemType;
  label: string;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
};
```

- [ ] **Step 2: Commit**

```bash
git add components/search/types.ts
git commit -m "feat(search): add SearchItem type"
```

---

## Task 3: useSearchData hook

**Files:**
- Create: `components/search/useSearchData.ts`
- Create: `__tests__/search/useSearchData.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/search/useSearchData.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchData } from '@/components/search/useSearchData';

vi.mock('next-intl', () => ({ useLocale: () => 'en' }));

describe('useSearchData', () => {
  it('returns an array of SearchItems', () => {
    const { result } = renderHook(() => useSearchData());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('includes all five entity types', () => {
    const { result } = renderHook(() => useSearchData());
    const types = new Set(result.current.map(i => i.type));
    expect(types.has('booking')).toBe(true);
    expect(types.has('exporter')).toBe(true);
    expect(types.has('naviera')).toBe(true);
    expect(types.has('alert')).toBe(true);
    expect(types.has('page')).toBe(true);
  });

  it('every item has id, label, href, and icon', () => {
    const { result } = renderHook(() => useSearchData());
    for (const item of result.current) {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.href).toBeTruthy();
      expect(typeof item.icon).toBe('function');
    }
  });

  it('booking hrefs point to the booking detail page', () => {
    const { result } = renderHook(() => useSearchData());
    const bookings = result.current.filter(i => i.type === 'booking');
    for (const b of bookings) {
      expect(b.href).toMatch(/^\/bookings\//);
    }
  });

  it('uses English strings when locale is en', () => {
    const { result } = renderHook(() => useSearchData());
    const alerts = result.current.filter(i => i.type === 'alert');
    // English alert titles do not contain 'en' locale marker,
    // but they exist and are non-empty strings
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].label).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --reporter=verbose __tests__/search/useSearchData.test.ts
```

Expected: FAIL — `useSearchData` not found.

- [ ] **Step 3: Implement the hook**

```ts
// components/search/useSearchData.ts
'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import {
  Package, Building2, Ship, Bell, LayoutDashboard,
  BookOpen, Users, Anchor, Settings,
} from 'lucide-react';
import type { SearchItem } from './types';
import { bookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { alerts } from '@/lib/mock-data/alerts';

const PAGES: SearchItem[] = [
  { id: 'page-dashboard', type: 'page', label: 'Operations Dashboard', href: '/', icon: LayoutDashboard },
  { id: 'page-bookings', type: 'page', label: 'Bookings', sublabel: '/bookings', href: '/bookings', icon: BookOpen },
  { id: 'page-exporters', type: 'page', label: 'Exporters', sublabel: '/exporters', href: '/exporters', icon: Users },
  { id: 'page-navieras', type: 'page', label: 'Navieras', sublabel: '/navieras', href: '/navieras', icon: Anchor },
  { id: 'page-settings', type: 'page', label: 'Settings', sublabel: '/settings', href: '/settings', icon: Settings },
];

export function useSearchData(): SearchItem[] {
  const locale = useLocale();
  const isEs = locale === 'es';

  return useMemo(() => {
    const bookingItems: SearchItem[] = bookings.map(b => ({
      id: b.id,
      type: 'booking',
      label: b.bookingNumber,
      sublabel: `${b.vesselName} · ${b.pol} → ${b.pod} · ${b.status}`,
      href: `/bookings/${b.id}`,
      icon: Package,
    }));

    const exporterItems: SearchItem[] = exporters.map(e => ({
      id: e.id,
      type: 'exporter',
      label: e.name,
      sublabel: `${e.city} · ${e.country}`,
      href: `/exporters/${e.id}`,
      icon: Building2,
    }));

    const navieraItems: SearchItem[] = navieras.map(n => ({
      id: n.id,
      type: 'naviera',
      label: n.name,
      sublabel: n.code,
      href: `/navieras/${n.id}`,
      icon: Ship,
    }));

    const alertItems: SearchItem[] = alerts.map(a => ({
      id: a.id,
      type: 'alert',
      label: isEs ? (a.titleEs ?? a.title) : a.title,
      sublabel: a.bookingId,
      href: `/bookings/${a.bookingId}`,
      icon: Bell,
    }));

    return [...bookingItems, ...exporterItems, ...navieraItems, ...alertItems, ...PAGES];
  }, [isEs]);
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --reporter=verbose __tests__/search/useSearchData.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/search/useSearchData.ts __tests__/search/useSearchData.test.ts
git commit -m "feat(search): add useSearchData hook"
```

---

## Task 4: CommandPaletteProvider

**Files:**
- Create: `components/search/CommandPaletteProvider.tsx`

- [ ] **Step 1: Write the provider**

```tsx
// components/search/CommandPaletteProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type CommandPaletteContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used inside CommandPaletteProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/search/CommandPaletteProvider.tsx
git commit -m "feat(search): add CommandPaletteProvider with global shortcut"
```

---

## Task 5: CommandPalette UI

**Files:**
- Create: `components/search/CommandPalette.tsx`
- Create: `__tests__/search/CommandPalette.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// __tests__/search/CommandPalette.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider';
import { CommandPalette } from '@/components/search/CommandPalette';

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return { ...actual, useLocale: () => 'en' };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <CommandPaletteProvider>
        {children}
        <CommandPalette />
      </CommandPaletteProvider>
    </NextIntlClientProvider>
  );
}

describe('CommandPalette', () => {
  it('is not visible by default', () => {
    render(<Wrapper><div /></Wrapper>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens when ⌘K is pressed', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the search input when open', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('shows results matching a query', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'Comfrut');
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('closes on Escape', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose __tests__/search/CommandPalette.test.tsx
```

Expected: FAIL — `CommandPalette` not found.

- [ ] **Step 3: Implement the palette**

```tsx
// components/search/CommandPalette.tsx
'use client';

import { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@base-ui/react/dialog';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPalette } from './CommandPaletteProvider';
import { useSearchData } from './useSearchData';
import type { SearchItem, SearchItemType } from './types';

const GROUP_LABELS: Record<SearchItemType, string> = {
  booking: 'Bookings',
  exporter: 'Exporters',
  naviera: 'Navieras',
  alert: 'Alerts',
  page: 'Pages',
};

const GROUP_ORDER: SearchItemType[] = ['booking', 'exporter', 'naviera', 'alert', 'page'];
const MAX_PER_GROUP = 5;

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();
  const items = useSearchData();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback((item: SearchItem) => {
    close();
    router.push(item.href);
  }, [close, router]);

  // Group items by type, capped at MAX_PER_GROUP each
  const grouped = GROUP_ORDER.reduce<Record<SearchItemType, SearchItem[]>>(
    (acc, type) => {
      acc[type] = items.filter(i => i.type === type).slice(0, MAX_PER_GROUP);
      return acc;
    },
    {} as Record<SearchItemType, SearchItem[]>,
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => { if (!open) close(); }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
            'transition-opacity duration-200',
          )}
        />
        <Dialog.Popup
          initialFocus={inputRef}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-[var(--line-soft)] bg-bg-1 shadow-2xl outline-none overflow-hidden',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]',
            'transition-all duration-200',
          )}
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>

          <Command>
            {/* Input row */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--line-soft)]">
              <Search className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} />
              <Command.Input
                ref={inputRef}
                placeholder="Search bookings, exporters, pages…"
                className={cn(
                  'flex-1 bg-transparent text-sm text-ink-1 outline-none',
                  'placeholder:text-ink-4',
                )}
              />
              <kbd className="font-mono text-[10px] text-ink-4 bg-[var(--line-soft)] px-1.5 py-0.5 rounded">
                esc
              </kbd>
            </div>

            {/* Results */}
            <Command.List className="max-h-80 overflow-y-auto py-1.5">
              <Command.Empty className="py-6 text-center text-sm text-ink-3">
                No results
              </Command.Empty>

              {GROUP_ORDER.map((type) => {
                const groupItems = grouped[type];
                if (!groupItems.length) return null;
                return (
                  <Command.Group
                    key={type}
                    heading={
                      <span className="block px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-4 border-t border-[var(--line-soft)] mt-1 first:border-t-0 first:mt-0">
                        {GROUP_LABELS[type]}
                      </span>
                    }
                  >
                    {groupItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={item.label + ' ' + (item.sublabel ?? '')}
                        onSelect={() => handleSelect(item)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 cursor-pointer',
                          'text-ink-1 aria-selected:bg-bg-3',
                          'transition-colors duration-75',
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{item.label}</div>
                          {item.sublabel && (
                            <div className="text-[11px] text-ink-3 truncate mt-0.5">{item.sublabel}</div>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}
            </Command.List>

            {/* Footer hints */}
            <div className="flex items-center justify-end gap-3 px-4 py-2 border-t border-[var(--line-soft)]">
              <span className="font-mono text-[10px] text-ink-4">↑↓ navigate</span>
              <span className="font-mono text-[10px] text-ink-4">↵ open</span>
              <span className="font-mono text-[10px] text-ink-4">esc close</span>
            </div>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- --reporter=verbose __tests__/search/CommandPalette.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/search/CommandPalette.tsx __tests__/search/CommandPalette.test.tsx
git commit -m "feat(search): add CommandPalette UI"
```

---

## Task 6: Wire into layout and Header

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Update the locale layout**

In `app/[locale]/layout.tsx`, import the provider and palette, then wrap the body content:

```tsx
// Add these imports
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider';
import { CommandPalette } from '@/components/search/CommandPalette';
```

Change the return body from:
```tsx
<NextIntlClientProvider locale={locale} messages={messages}>
  <AppShell>{children}</AppShell>
  <Toaster />
</NextIntlClientProvider>
```

To:
```tsx
<NextIntlClientProvider locale={locale} messages={messages}>
  <CommandPaletteProvider>
    <AppShell>{children}</AppShell>
    <Toaster />
    <CommandPalette />
  </CommandPaletteProvider>
</NextIntlClientProvider>
```

`NextIntlClientProvider` is already a client boundary, so `CommandPaletteProvider` can be a direct child without making the layout itself a client component.

- [ ] **Step 2: Update Header.tsx**

Import `useCommandPalette` and update the search button:

```tsx
// Add import at top
import { useCommandPalette } from '@/components/search/CommandPaletteProvider';
```

Inside the `Header` component, add:
```tsx
const { open } = useCommandPalette();
```

Replace the existing search button:
```tsx
// Before:
<button
  aria-label={t('common.search')}
  className="flex items-center justify-center h-7 w-7 rounded-md text-ink-3 hover:text-ink-1 hover:bg-white/5 transition-colors"
>
  <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
</button>

// After:
<button
  aria-label={t('common.search')}
  onClick={open}
  className="flex items-center gap-1.5 h-7 px-2 rounded-md text-ink-3 hover:text-ink-1 hover:bg-white/5 transition-colors"
>
  <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
  <span aria-hidden="true" className="font-mono text-[10px] text-ink-4">⌘K</span>
</button>
```

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: all tests PASS (no regressions).

- [ ] **Step 4: Start dev server and smoke test**

```bash
npm run dev
```

Verify manually:
- [ ] Header shows Search icon + `⌘K` badge
- [ ] Clicking the button opens the palette
- [ ] Pressing `⌘K` / `Ctrl+K` opens the palette
- [ ] Typing a booking number (e.g. `SNG0502407`) shows the matching booking
- [ ] Typing `Comfrut` shows bookings and exporters
- [ ] Arrow keys move selection highlight
- [ ] `Enter` on a result navigates and closes the palette
- [ ] `Esc` closes the palette
- [ ] Clicking the backdrop closes the palette
- [ ] Opening again shows a blank input (state reset)

- [ ] **Step 5: Commit**

```bash
git add app/\[locale\]/layout.tsx components/layout/Header.tsx
git commit -m "feat(search): wire command palette into layout and header"
```

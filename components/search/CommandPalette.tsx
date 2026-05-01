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

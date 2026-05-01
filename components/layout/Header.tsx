'use client';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useCommandPalette } from '@/components/search/CommandPaletteProvider';

interface HeaderProps {
  breadcrumb?: { parent: string; current: string };
}

const USER_FIRST_NAME = 'Felipe';

const SECTION_KEYS: Record<string, 'operations' | 'bookings' | 'exporters' | 'navieras' | 'performance' | 'settings'> = {
  bookings: 'bookings',
  exporters: 'exporters',
  navieras: 'navieras',
  performance: 'performance',
  settings: 'settings',
};

export function Header({ breadcrumb }: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { open } = useCommandPalette();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('nav.greetingMorning') : t('nav.greetingAfternoon');

  // pathname: /es/bookings/... → segments[2] is the section
  const segments = pathname.split('/').filter(Boolean);
  const sectionSlug = segments[1] ?? '';
  const sectionKey = SECTION_KEYS[sectionSlug] ?? 'operations';
  const sectionLabel = t(`nav.${sectionKey}`);

  return (
    <header className="fixed top-0 left-14 right-0 h-14 z-30 glass border-b border-white/10 flex items-center px-4 gap-4">
      {/* Left: breadcrumb */}
      {breadcrumb ? (
        <div className="flex items-center gap-1.5 font-mono text-xs tracking-wider mr-auto">
          <span className="text-ink-3 uppercase">{breadcrumb.parent}</span>
          <span className="text-ink-4">/</span>
          <span className="text-ink-2">{breadcrumb.current}</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5 font-mono text-xs tracking-wider mr-auto">
          <span className="text-ink-3 uppercase">{sectionLabel}</span>
          <span className="text-ink-4">/</span>
          <span className="text-ink-2 normal-case tracking-normal text-xs">
            {greeting}{' '}
            <span className="font-display italic text-ink-1 text-base">{USER_FIRST_NAME}</span>
          </span>
        </div>
      )}

      {/* Right cluster */}
      <button
        aria-label={t('common.search')}
        onClick={open}
        className="flex items-center gap-1.5 h-7 px-2 rounded-md text-ink-3 hover:text-ink-1 hover:bg-white/5 transition-colors"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
        <span aria-hidden="true" className="font-mono text-[10px] text-ink-4">⌘K</span>
      </button>

      <NotificationBell />

    </header>
  );
}

'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Bell, User } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  breadcrumb?: { parent: string; current: string };
}

const USER_NAME = 'Felipe Donoso';
const USER_FIRST_NAME = USER_NAME.split(' ')[0];

export function Header({ breadcrumb }: HeaderProps) {
  const t = useTranslations();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('nav.greetingMorning') : t('nav.greetingAfternoon');

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
        <div className="flex items-center gap-1.5 font-mono text-xs tracking-wider mr-auto">
          <span className="text-ink-3 uppercase">{t('nav.operations')}</span>
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
        className="flex items-center justify-center h-7 w-7 rounded-md text-ink-3 hover:text-ink-1 hover:bg-white/5 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>

      <button
        aria-label={t('nav.notifications')}
        className="relative flex items-center justify-center h-[30px] w-[30px] rounded-md border border-white/10 text-ink-2 hover:text-ink-1 hover:border-white/20 transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('nav.userMenu')}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-white/5 transition-colors text-ink-2 hover:text-ink-1"
        >
          <div className="h-[30px] w-[30px] rounded-full bg-bg-2 border border-white/10 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-ink-2" />
          </div>
          <span className="text-sm">Felipe Donoso</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass border border-white/10">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="font-mono text-xs text-ink-3 mb-0.5">Interglobo Chile</div>
              <div className="text-sm text-ink-1">Felipe Donoso</div>
              <div className="text-xs text-ink-3">FF Operator</div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer">
            {t('settings.title')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

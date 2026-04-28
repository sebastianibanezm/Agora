'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

export function Header() {
  const t = useTranslations();
  return (
    <header className="fixed top-0 left-14 right-0 h-14 z-30 glass border-b border-white/10 flex items-center justify-end px-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t('nav.userMenu')}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-white/5 transition-colors text-ink-2 hover:text-ink-1"
        >
          <div className="h-7 w-7 rounded-full bg-mint-700 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-mint-300" />
          </div>
          <span className="text-sm">María José</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass border border-white/10">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="font-mono text-xs text-ink-3 mb-0.5">Valle Fresco S.A.</div>
              <div className="text-sm text-ink-1">María José Soto</div>
              <div className="text-xs text-ink-3">Logistics Manager</div>
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

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Container as ContainerIcon,
  Building2,
  Ship,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const NAV = [
  { href: '/', key: 'operations', Icon: LayoutDashboard },
  { href: '/bookings', key: 'bookings', Icon: ContainerIcon },
  { href: '/exporters', key: 'exporters', Icon: Building2 },
  { href: '/navieras', key: 'navieras', Icon: Ship },
] as const;

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={clsx(
        'fixed top-0 bottom-0 left-0 z-40 glass border-r border-white/10',
        'transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        expanded ? 'w-56' : 'w-14',
      )}
    >
      <div className="flex h-14 items-center px-4 font-mono text-sm font-semibold tracking-widest text-mint-500">
        {expanded ? 'AGORA' : 'AG'}
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {NAV.map(({ href, key, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={key}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-md px-2 py-2 text-ink-2 transition-colors hover:bg-white/5 hover:text-ink-1',
                active && 'border-l-2 border-mint-500 bg-white/5 text-ink-1',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={clsx('truncate text-sm', !expanded && 'sr-only')}>
                {t(key)}
              </span>
            </Link>
          );
        })}
        {/* Performance — V2 roadmap, greyed */}
        <div
          aria-disabled="true"
          title={t('performanceSoon')}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-ink-4 cursor-not-allowed"
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span className={clsx('truncate text-sm', !expanded && 'sr-only')}>
            {t('performance')}
          </span>
        </div>
      </nav>
      <div
        className={clsx(
          'absolute right-0 bottom-3 left-0 px-3 font-mono text-[10px] tracking-widest text-ink-3 uppercase',
          !expanded && 'sr-only',
        )}
      >
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-mint-500" />{' '}
        {t('agentsRunning', { n: 5 })}
      </div>
    </aside>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Container as ContainerIcon,
  Building2,
  FileStack,
  Ship,
  BarChart3,
  User,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

const NAV = [
  { href: '/app', key: 'operations', Icon: LayoutDashboard },
  { href: '/bookings', key: 'bookings', Icon: ContainerIcon },
  { href: '/documents', key: 'documents', Icon: FileStack },
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
      <Link
        href="/app"
        className={clsx('flex w-full h-14 items-center', expanded ? 'px-2' : 'justify-center px-0')}
      >
        <Image
          src="/agora-logo-lambda.png"
          alt="Agora"
          width={46}
          height={46}
          className="shrink-0"
          priority
        />
        {expanded && (
          <span className="ml-2 font-mono text-sm font-semibold tracking-widest text-mint-500 whitespace-nowrap">
            AGORA
          </span>
        )}
      </Link>
      <nav className="flex flex-col gap-1 px-2 mt-[48px]">
        {NAV.map(({ href, key, Icon }) => {
          const active = pathname === href || (href !== '/app' && pathname.startsWith(href));
          return (
            <Link
              key={key}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-md py-2 text-ink-2 transition-colors hover:bg-bg-3 hover:text-ink-1',
                expanded ? 'px-2' : 'justify-center px-0',
                active && 'bg-bg-3 text-ink-1',
              )}
            >
              <Icon className="h-[21px] w-[21px] shrink-0" strokeWidth={1.5} />
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
          className={clsx(
            'flex items-center gap-3 rounded-md py-2 text-ink-4 cursor-not-allowed',
            expanded ? 'px-2' : 'justify-center px-0',
          )}
        >
          <BarChart3 className="h-[21px] w-[21px] shrink-0" strokeWidth={1.5} />
          <span className={clsx('truncate text-sm', !expanded && 'sr-only')}>
            {t('performance')}
          </span>
        </div>
      </nav>
      <div className={clsx('absolute right-0 bottom-0 left-0 flex flex-col', expanded ? 'px-2' : 'items-center px-0')}>
        <div className={clsx('flex items-center gap-3 rounded-md py-2 w-full', expanded ? 'px-2' : 'justify-center px-0')}>
          <div className="h-7 w-7 shrink-0 rounded-full bg-bg-2 border border-white/10 flex items-center justify-center">
            <User className="h-[18px] w-[18px] text-ink-2" strokeWidth={1.5} />
          </div>
          {expanded && (
            <div className="min-w-0">
              <div className="text-xs text-ink-1 truncate">Felipe Pavez</div>
              <div className="font-mono text-[10px] text-ink-3 truncate">InterGlobo</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

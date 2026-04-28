'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Boxes, FileText, Building2, Sprout, ShieldCheck, BarChart3, Inbox } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const NAV = [
  { href: '/',                key: 'operations',     Icon: LayoutDashboard },
  { href: '/containers',      key: 'containers',     Icon: Boxes },
  { href: '/purchase-orders', key: 'purchaseOrders', Icon: FileText },
  { href: '/importers',       key: 'importers',      Icon: Building2 },
  { href: '/producers',       key: 'producers',      Icon: Sprout },
  { href: '/compliance',      key: 'compliance',     Icon: ShieldCheck },
  { href: '/performance',     key: 'performance',    Icon: BarChart3 },
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
        'fixed left-0 top-0 bottom-0 z-40 glass border-r border-white/10',
        'transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        expanded ? 'w-56' : 'w-14',
      )}
    >
      <div className="flex h-14 items-center px-4 font-mono text-mint-500 text-sm font-semibold tracking-widest">
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
                'flex items-center gap-3 rounded-md px-2 py-2 text-ink-2 hover:text-ink-1 hover:bg-white/5 transition-colors',
                active && 'text-ink-1 bg-white/5 border-l-2 border-mint-500',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={clsx('text-sm truncate', !expanded && 'sr-only')}>
                {t(key)}
              </span>
            </Link>
          );
        })}
        {/* Approval Queue — disabled, no route */}
        <div
          aria-disabled="true"
          title={t('approvalQueueSoon')}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-ink-4 cursor-not-allowed"
        >
          <Inbox className="h-4 w-4 shrink-0" />
          <span className={clsx('text-sm truncate', !expanded && 'sr-only')}>
            {t('approvalQueue')}
          </span>
        </div>
      </nav>
    </aside>
  );
}

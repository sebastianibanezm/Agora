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

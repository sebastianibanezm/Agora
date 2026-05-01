'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Bell, AlertTriangle, Clock, FileText, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  bookingId: string;
  icon: LucideIcon;
  severity: 'critical' | 'warning' | 'info';
}

const SEVERITY_BORDER: Record<Notification['severity'], string> = {
  critical: 'border-l-severity-crit',
  warning:  'border-l-severity-watch',
  info:     'border-l-severity-info',
};

const SEVERITY_ICON: Record<Notification['severity'], string> = {
  critical: 'text-severity-crit',
  warning:  'text-severity-watch',
  info:     'text-severity-info',
};

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    message: 'SI pendiente en BKG-SNG0502407 — vence en 2 h',
    timestamp: 'hace 5 min',
    bookingId: 'BKG-SNG0502407',
    icon: AlertTriangle,
    severity: 'critical',
  },
  {
    id: 'n2',
    message: 'Cutoff próximo para BKG-MSCSAI4421',
    timestamp: 'hace 23 min',
    bookingId: 'BKG-MSCSAI4421',
    icon: Clock,
    severity: 'warning',
  },
  {
    id: 'n3',
    message: 'BL borrador listo para revisar en BKG-MAEU991033',
    timestamp: 'hace 1 h',
    bookingId: 'BKG-MAEU991033',
    icon: FileText,
    severity: 'info',
  },
];

interface RowProps {
  notification: Notification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  onClose: () => void;
  localizedHref: string;
}

function NotificationRow({ notification, isRead, onMarkRead, onClose, localizedHref }: RowProps) {
  const Icon = notification.icon;
  return (
    <Link
      href={localizedHref}
      onClick={() => {
        onMarkRead(notification.id);
        onClose();
      }}
      className={clsx(
        'group flex items-start gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-bg-3',
        isRead
          ? 'border-l-transparent opacity-50'
          : SEVERITY_BORDER[notification.severity],
      )}
    >
      <Icon
        className={clsx('mt-0.5 h-4 w-4 shrink-0', isRead ? 'text-ink-3' : SEVERITY_ICON[notification.severity])}
        strokeWidth={1.5}
      />
      <div className="min-w-0 flex-1">
        <p className={clsx('font-sans text-xs leading-snug', isRead ? 'text-ink-3' : 'text-ink-1')}>
          {notification.message}
        </p>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-3 uppercase">
          {notification.bookingId} · {notification.timestamp}
        </p>
      </div>
      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
    </Link>
  );
}

export function NotificationBell() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const unread = NOTIFICATIONS.filter(n => !readIds.has(n.id));

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]));
  }

  function markAllRead() {
    setReadIds(new Set(NOTIFICATIONS.map(n => n.id)));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative self-center mr-4">
        <PopoverTrigger
          aria-label={t('notifications')}
          className="flex items-center justify-center h-[30px] w-[30px] rounded-md border border-white/10 text-ink-2 hover:text-ink-1 hover:border-white/20 transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </PopoverTrigger>
        {unread.length > 0 && (
          <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-severity-crit font-mono text-[10px] font-bold text-[#fff]">
            {unread.length}
          </span>
        )}
      </div>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
          <span className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
            Notificaciones
          </span>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="font-mono text-[10px] tracking-wide text-ink-3 uppercase hover:text-ink-1 transition-colors"
            >
              Marcar leído
            </button>
          )}
        </div>

        <div className="divide-y divide-[var(--line-soft)]">
          {NOTIFICATIONS.map(n => (
            <NotificationRow
              key={n.id}
              notification={n}
              isRead={readIds.has(n.id)}
              onMarkRead={markRead}
              onClose={() => setOpen(false)}
              localizedHref={`/${locale}/bookings/${n.bookingId}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

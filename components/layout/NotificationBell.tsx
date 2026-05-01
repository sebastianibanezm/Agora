'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Bell, AlertTriangle, Clock, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  bookingId: string;
  icon: LucideIcon;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    message: 'SI pendiente en BKG-SNG0502407 — vence en 2 h',
    timestamp: 'hace 5 min',
    bookingId: 'BKG-SNG0502407',
    icon: AlertTriangle,
  },
  {
    id: 'n2',
    message: 'Cutoff próximo para BKG-MSCSAI4421',
    timestamp: 'hace 23 min',
    bookingId: 'BKG-MSCSAI4421',
    icon: Clock,
  },
  {
    id: 'n3',
    message: 'BL borrador listo para revisar en BKG-MAEU991033',
    timestamp: 'hace 1 h',
    bookingId: 'BKG-MAEU991033',
    icon: FileText,
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
        'flex items-start gap-3 px-4 py-3 hover:bg-bg-3 transition-colors',
        isRead ? 'text-ink-3' : 'text-ink-1',
      )}
    >
      <span className={clsx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint-500', isRead && 'invisible')} />
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-sm leading-snug">{notification.message}</p>
        <p className="mt-0.5 text-xs text-ink-3">{notification.timestamp}</p>
      </div>
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
      <PopoverTrigger
        aria-label={t('notifications')}
        className="relative flex items-center justify-center h-[30px] w-[30px] rounded-md border border-white/10 text-ink-2 hover:text-ink-1 hover:border-white/20 transition-colors mr-4"
      >
        <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-mono text-[10px] text-white">
            {unread.length}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
          <span className="text-sm font-medium text-ink-1">Notificaciones</span>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-ink-3 hover:text-ink-1 transition-colors"
            >
              Marcar todo leído
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-[var(--line-soft)]">
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

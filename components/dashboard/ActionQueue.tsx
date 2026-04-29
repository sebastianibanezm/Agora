'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Container, Alert, Importer } from '@/types';
import { isActiveContainer } from '@/lib/containers';
import { ContainerCard } from './ContainerCard';

const QUEUE_IDS = [
  'OOLU-7710443',
  'MSCU-7842156',
  'MSKU-3401827',
  'CMAU-9281744',
  'HLXU-4427109',
] as const;

interface Props {
  containers: Container[];
  alerts: Alert[];
  importers: Importer[];
}

export function ActionQueue({ containers, alerts, importers }: Props) {
  const t = useTranslations('dashboard');

  const queue = QUEUE_IDS
    .map(id => containers.find(c => c.id === id))
    .filter((c): c is Container => c !== undefined);

  const activeCount = containers.filter(isActiveContainer).length;

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-1">{t('needsAction')}</span>
          <span className="font-mono text-[10px] text-ink-4 tracking-widest uppercase">{t('now')}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 p-3">
        {queue.map(c => (
          <ContainerCard
            key={c.id}
            container={c}
            alerts={alerts.filter(a => a.containerId === c.id)}
            importers={importers}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--line-soft)]">
        <span className="font-mono text-[11px] text-ink-4">
          SHOWING {queue.length} OF {activeCount} ACTIVE
        </span>
        <Link
          href="/containers"
          className="font-mono text-[11px] text-mint-500 hover:text-mint-400 transition-colors"
        >
          {t('viewAllContainers')} →
        </Link>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { formatUsd } from '@/lib/utils/currency';

export function ContainerListTable({ containers }: { containers: Container[] }) {
  const t = useTranslations('containers');
  return (
    <div>
      <div className="mb-4">
        <input
          type="search"
          placeholder={t('id') + '...'}
          className="w-72 rounded-md bg-bg-2 border border-white/10 px-3 py-1.5 text-sm text-ink-2 focus:outline-none focus:border-mint-500/50"
        />
      </div>
      <div className="rounded-md border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-bg-2/50">
              <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('id')}</th>
              <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('product')}</th>
              <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('route')}</th>
              <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('status')}</th>
              <th className="text-right px-4 py-3 text-ink-3 font-medium">{t('value')}</th>
            </tr>
          </thead>
          <tbody>
            {containers.map(c => (
              <tr key={c.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/containers/${c.id}`} className="font-mono text-mint-500 hover:text-mint-300 text-xs">
                    {c.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-2">{c.productLabel}</td>
                <td className="px-4 py-3 text-ink-3 font-mono text-xs">{c.polLabel} → {c.podLabel}</td>
                <td className="px-4 py-3">
                  <span className="text-ink-2 text-xs">{t(`statuses.${c.status}`)}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-ink-2">
                  {formatUsd(c.valueUsd, 'es')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { Snowflake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { ColdChainSummaryCard } from './ColdChainSummaryCard';

export function ColdChainDashboardSection({ containers }: { containers: Container[] }) {
  const t = useTranslations('dashboard');
  if (!containers.length) return null;

  return (
    <section className="rounded-xl border border-[rgba(0,230,150,0.25)] bg-bg-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,230,150,0.15)]">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-1">
          <Snowflake className="h-3.5 w-3.5 text-mint-500" />
          {t('coldChainStatus')}
        </div>
        <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
          {containers.length} REEFERS · IN TREATMENT
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {containers.map(c => (
          <div key={c.id} data-testid="cold-chain-summary">
            <ColdChainSummaryCard trace={c.coldChain!} />
          </div>
        ))}
      </div>
    </section>
  );
}

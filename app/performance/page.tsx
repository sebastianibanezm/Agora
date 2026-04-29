import { getTranslations } from 'next-intl/server';
import { containers } from '@/lib/mock-data/containers';
import { kpis } from '@/lib/mock-data/kpis';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';
import { agents } from '@/lib/mock-data/agents';
import { agentStatuses } from '@/lib/mock-data/agent-statuses';
import { KPIStrip } from '@/components/kpi/KPIStrip';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';
import { AgentGrid } from './components/AgentGrid';
import { ColdChainPanel } from './components/ColdChainPanel';

const PERF_KPI_IDS = ['avoided_penalties', 'active_agents', 'cold_incidents', 'doc_auto_gen_rate', 'avg_cycle_time'];

export default async function PerformancePage() {
  const t = await getTranslations('performance');
  const reefers = containers.filter(c => c.coldChain?.required === true);
  const perfKpis = PERF_KPI_IDS.map(id => kpis.find(k => k.id === id)!).filter(Boolean);
  const coldAgentCount = agents.filter(a => a.tags.includes('cold_chain')).length;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8 min-h-screen bg-bg-0">
      {/* KPI strip */}
      <KPIStrip kpis={perfKpis} />

      {/* Agent grid */}
      <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
          <span className="text-sm font-medium text-ink-1">{t('digitalTeam')}</span>
          <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
            {t('agentsCount', { count: agents.length, coldCount: coldAgentCount })}
          </span>
        </div>
        <AgentGrid agents={agents} statuses={agentStatuses} reefers={reefers} />
      </section>

      {/* Bottom split: heatmap + cold panel */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px', alignItems: 'stretch' }}>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
            <span className="text-sm font-medium text-ink-1">{t('dollarsSaved')}</span>
            <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
              {t('seasonMeta')}
            </span>
          </div>
          <PenaltyHeatmap matrix={penaltyAvoidedMatrix} hidePerformanceLink />
        </section>

        {reefers.length > 0 && (
          <ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />
        )}
      </div>
    </div>
  );
}

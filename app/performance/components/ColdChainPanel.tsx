'use client';
import type { Agent, AgentStatusEntry, Container } from '@/types';

interface ColdChainPanelProps {
  reefers: Container[];
  agents: Agent[];
  agentStatuses: AgentStatusEntry[];
}

export function ColdChainPanel({ reefers, agents, agentStatuses }: ColdChainPanelProps) {
  if (reefers.length === 0) return null;

  const container = reefers[0]!;
  const cc = container.coldChain!;
  const daysCurrent = Math.round(cc.treatmentMinutesCompliant / 60 / 24);
  const daysRequired = Math.round(cc.treatmentRequiredMinutes / 60 / 24);
  const progressPct = daysRequired > 0 ? Math.round((daysCurrent / daysRequired) * 100) : 0;

  const coldAgents = agents.filter(a => a.tags.includes('cold_chain'));
  const statusMap = new Map(agentStatuses.map(s => [s.agentId, s]));

  const excursions = cc.excursionEvents.length;
  const incidents = excursions;

  return (
    <div className="bg-[#0d1a26] border border-[rgba(125,211,252,0.2)] rounded-[10px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(125,211,252,0.1)]">
        <span className="text-sm font-medium text-[#7DD3FC]">❄ Cold Chain</span>
        <span className="font-mono text-[9px] text-[#4a7a99] tracking-widest uppercase">
          {reefers.length} active
        </span>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-5">
        {/* Container card */}
        <div className="bg-bg-1 border border-[rgba(125,211,252,0.12)] rounded-[7px] p-3.5">
          <div className="font-mono text-[11px] text-[#7DD3FC] mb-1">{container.id}</div>
          <div className="text-[12px] text-ink-2 mb-3">
            {container.productLabel} · {container.polLabel} → {container.podLabel}
          </div>
          <div>
            <div className="font-mono text-[9px] text-ink-4 tracking-widest mb-1.5 flex justify-between">
              <span>COLD TREATMENT</span>
              <span className="text-[#7DD3FC]">DAY {daysCurrent} / {daysRequired}</span>
            </div>
            <div
              data-testid="treatment-progress"
              className="h-[5px] bg-white/6 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-[#7DD3FC] rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sentinel list */}
        <div className="flex-1">
          <div className="font-mono text-[9px] text-[#4a7a99] tracking-widest mb-1">
            SENTINEL STATUS
          </div>
          <div className="flex flex-col">
            {coldAgents.map(agent => {
              const entry = statusMap.get(agent.id);
              return (
                <div
                  key={agent.id}
                  data-testid="sentinel-row"
                  className="flex items-center gap-2 py-2 border-b border-white/4 last:border-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7DD3FC] shrink-0" />
                  <span className="text-[11px] text-ink-2 flex-1">{agent.label}</span>
                  <span className="font-mono text-[9px] text-mint-600">
                    {entry?.status ?? 'active'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div>
          {[
            { label: 'EXCURSIONS', value: String(excursions), color: excursions === 0 ? 'text-mint-500' : 'text-severity-risk' },
            { label: 'INCIDENTS',  value: String(incidents),  color: incidents  === 0 ? 'text-mint-500' : 'text-severity-risk' },
            { label: 'COMPLIANCE', value: 'ON TRACK',         color: 'text-mint-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-t border-[rgba(125,211,252,0.08)]">
              <span className="font-mono text-[10px] text-ink-4 tracking-widest">{label}</span>
              <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import type { Agent, AgentStatusEntry, Container } from '@/types';
import { AgentCard } from './AgentCard';

interface AgentGridProps {
  agents: Agent[];
  statuses: AgentStatusEntry[];
  reefers: Container[];
}

export function AgentGrid({ agents, statuses, reefers }: AgentGridProps) {
  const statusMap = new Map(statuses.map(s => [s.agentId, s]));
  const visibleAgents = reefers.length > 0
    ? agents
    : agents.filter(a => !a.tags.includes('cold_chain'));

  return (
    <div
      className="grid gap-2 p-3.5"
      style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
    >
      {visibleAgents.map(agent => {
        const statusEntry = statusMap.get(agent.id) ?? {
          agentId: agent.id,
          status: 'idle' as const,
          lastAction: '—',
        };
        return <AgentCard key={agent.id} agent={agent} statusEntry={statusEntry} />;
      })}
    </div>
  );
}

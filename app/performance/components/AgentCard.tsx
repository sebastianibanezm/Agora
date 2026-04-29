'use client';
import type { Agent, AgentStatusEntry } from '@/types';
import clsx from 'clsx';

interface AgentCardProps {
  agent: Agent;
  statusEntry: AgentStatusEntry;
}

const DOT_COLOR: Record<string, string> = {
  active: 'bg-mint-500',
  idle: 'bg-ink-4',
  alert: 'bg-severity-risk',
};

const COLD_DOT_COLOR = 'bg-[#7DD3FC]';

export function AgentCard({ agent, statusEntry }: AgentCardProps) {
  const isCold = agent.tags.includes('cold_chain');
  const dotColor = isCold && statusEntry.status === 'active'
    ? COLD_DOT_COLOR
    : (DOT_COLOR[statusEntry.status] ?? 'bg-ink-4');

  return (
    <div
      data-testid="agent-card"
      className={clsx(
        'rounded-[7px] border p-2.5 flex flex-col gap-1.5',
        isCold
          ? 'bg-[#0d1a26] border-l-2 border-l-[rgba(125,211,252,0.5)] border-[rgba(125,211,252,0.2)]'
          : 'bg-bg-2 border-[var(--line-soft)]',
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
        <span className={clsx('text-[11px] font-medium leading-snug flex-1', isCold ? 'text-[#7DD3FC]' : 'text-ink-2')}>
          {agent.label}
        </span>
        {isCold && (
          <span data-testid="cold-badge" className="text-[9px] shrink-0">❄</span>
        )}
      </div>
      <div className="font-mono text-[9px] text-ink-4 leading-snug">
        {statusEntry.lastAction}
      </div>
    </div>
  );
}

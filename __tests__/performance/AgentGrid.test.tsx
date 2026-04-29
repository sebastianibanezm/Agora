import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgentGrid } from '@/app/performance/components/AgentGrid';
import { agents } from '@/lib/mock-data/agents';
import { agentStatuses } from '@/lib/mock-data/agent-statuses';
import type { Container } from '@/types';

const reefers = [{ coldChain: { required: true } }] as Container[];
const noReefers: Container[] = [];

describe('AgentGrid', () => {
  it('renders all 25 agents when reefers exist', () => {
    render(<AgentGrid agents={agents} statuses={agentStatuses} reefers={reefers} />);
    expect(screen.getAllByTestId('agent-card').length).toBe(25);
  });

  it('hides cold-chain sentinel cards when no reefers', () => {
    render(<AgentGrid agents={agents} statuses={agentStatuses} reefers={noReefers} />);
    const cards = screen.getAllByTestId('agent-card');
    expect(cards.length).toBe(19); // 25 total - 6 cold-chain sentinels
  });

  it('shows ❄ badge only on cold-chain agents', () => {
    render(<AgentGrid agents={agents} statuses={agentStatuses} reefers={reefers} />);
    expect(screen.getAllByTestId('cold-badge').length).toBe(6);
  });
});

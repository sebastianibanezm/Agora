import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ColdChainPanel } from '@/app/performance/components/ColdChainPanel';
import { containers } from '@/lib/mock-data/containers';
import { agentStatuses } from '@/lib/mock-data/agent-statuses';
import { agents } from '@/lib/mock-data/agents';

const reefers = containers.filter(c => c.coldChain?.required === true);

describe('ColdChainPanel', () => {
  it('renders nothing when reefers is empty', () => {
    const { container } = render(
      <ColdChainPanel reefers={[]} agents={agents} agentStatuses={agentStatuses} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows active container ID when reefers exist', () => {
    render(<ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />);
    expect(screen.getByText('MAEU-9182734')).toBeInTheDocument();
  });

  it('shows cold treatment progress bar', () => {
    render(<ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />);
    expect(screen.getByTestId('treatment-progress')).toBeInTheDocument();
  });

  it('lists cold-chain sentinel agents', () => {
    render(<ColdChainPanel reefers={reefers} agents={agents} agentStatuses={agentStatuses} />);
    expect(screen.getAllByTestId('sentinel-row').length).toBeGreaterThan(0);
  });
});

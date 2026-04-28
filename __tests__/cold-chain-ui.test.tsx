import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { containers } from '@/lib/mock-data/containers';
import { ColdChainTab } from '@/components/cold-chain/ColdChainTab';
import { ColdChainSummaryCard } from '@/components/cold-chain/ColdChainSummaryCard';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('ColdChainTab', () => {
  it('returns null for dry container (no coldChain)', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    const { container } = render(wrap(<ColdChainTab container={c} />));
    expect(container.firstChild).toBeNull();
  });
  it('renders for cherries container with telemetry chart', () => {
    const c = containers.find(x => x.id === 'MAEU-9182734')!;
    render(wrap(<ColdChainTab container={c} />));
    expect(screen.getByTestId('cold-chain-timeline')).toBeInTheDocument();
  });
  it('shows excursion section with 1 excursion event', () => {
    const c = containers.find(x => x.id === 'MAEU-9182734')!;
    render(wrap(<ColdChainTab container={c} />));
    expect(screen.getByText('LOG-TOP-9182734')).toBeInTheDocument();
  });
});

describe('ColdChainSummaryCard', () => {
  it('shows compliance counter for cherries', () => {
    const c = containers.find(x => x.id === 'MAEU-9182734')!;
    render(wrap(<ColdChainSummaryCard trace={c.coldChain!} />));
    const counter = screen.getByTestId('compliance-counter');
    expect(counter.textContent).toMatch(/9d|13800|13[0-9]/);
  });
});

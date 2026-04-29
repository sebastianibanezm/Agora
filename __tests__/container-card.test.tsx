import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';
import { alerts } from '@/lib/mock-data/alerts';
import { ContainerCard } from '@/components/dashboard/ContainerCard';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

const walnuts = containers.find(c => c.id === 'MSCU-7842156')!;
const alertForWalnuts = alerts.filter(a => a.containerId === 'MSCU-7842156');

describe('ContainerCard', () => {
  it('renders container ID', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByText('MSCU-7842156')).toBeInTheDocument();
  });

  it('renders buyer name from importers lookup', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByText('Mumbai Dry Fruits Pvt. Ltd.')).toBeInTheDocument();
  });

  it('renders carrier and route', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByTestId('card-route')).toHaveTextContent('CLSAI → INNSA · MSC');
  });

  it('renders timeline', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByTestId('timeline-mini')).toBeInTheDocument();
  });

  it('severity left bar has crit color class for critical container', () => {
    const { container } = render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    const bar = container.querySelector('[data-testid="sev-bar"]');
    expect(bar?.className).toMatch(/crit/);
  });

  it('renders cost at risk amount', () => {
    render(wrap(<ContainerCard container={walnuts} alerts={alertForWalnuts} importers={importers} />));
    expect(screen.getByTestId('cost-at-risk')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';

// Mock next-intl/server — page and KPIStrip call getTranslations which needs a Next.js context
vi.mock('next-intl/server', async () => {
  const messages = (await import('../messages/en.json')).default as any;
  return {
    getTranslations: async (ns?: string) => {
      return (key: string) => {
        const fullKey = ns ? `${ns}.${key}` : key;
        return fullKey.split('.').reduce((obj: any, k) => obj?.[k], messages) ?? key;
      };
    },
  };
});

// Mock the 'use client' components and nested async RSCs to avoid jsdom issues
vi.mock('@/components/map/ShipmentMap', () => ({
  ShipmentMap: () => <div data-testid="shipment-map" />,
}));

vi.mock('@/components/dashboard/ContainerCard', () => ({
  ContainerCard: () => <div data-testid="timeline-mini" />,
}));

vi.mock('@/components/dashboard/ClosedTable', () => ({
  ClosedTable: ({ rows }: { rows: unknown[] }) => (
    <div>{rows.map((_, i) => <div key={i} data-testid="closed-row" />)}</div>
  ),
}));

vi.mock('@/components/dashboard/PenaltyHeatmap', () => ({
  PenaltyHeatmap: () => <div data-testid="penalty-heatmap" />,
}));

// KPIStrip is an async RSC — render stub that uses the kpis prop
vi.mock('@/components/kpi/KPIStrip', () => ({
  KPIStrip: ({ kpis }: { kpis: Array<{ id: string; value: number }> }) => (
    <div>
      {kpis.map((k) => (
        <span key={k.id} data-testid="kpi-value">{k.value}</span>
      ))}
    </div>
  ),
}));

import OperationsDashboard from '@/app/[locale]/page';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('Operations Dashboard page', () => {
  it('renders shipment map section', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getByTestId('shipment-map')).toBeInTheDocument();
  });

  it('renders KPI strip with 5 tiles', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getAllByTestId('kpi-value').length).toBe(5);
  });

  it('renders action queue section header', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getByText(/Needs action/i)).toBeInTheDocument();
  });

  it('renders live alerts section header', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getByText(/Live alerts/i)).toBeInTheDocument();
  });

  it('renders last week closed table', async () => {
    render(wrap(await OperationsDashboard()));
    expect(screen.getAllByTestId('closed-row').length).toBe(6);
  });
});

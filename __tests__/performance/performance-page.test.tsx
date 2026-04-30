import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../messages/en.json';

vi.mock('next-intl/server', async () => {
  const messages = (await import('../../messages/en.json')).default as any;
  return {
    getTranslations: async () => (key: string) =>
      key.split('.').reduce((obj: any, k) => obj?.[k], messages) ?? key,
  };
});

vi.mock('@/components/dashboard/PenaltyHeatmap', () => ({
  PenaltyHeatmap: ({ matrix }: { matrix: unknown[] }) => (
    <div>{matrix.map((_, i) => <div key={i} data-testid="heatmap-row" />)}</div>
  ),
}));

// KPIStrip is an async RSC — stub it to avoid nested async RSC resolution in tests
vi.mock('@/components/kpi/KPIStrip', () => ({
  KPIStrip: ({ kpis }: { kpis: Array<{ id: string; value: number }> }) => (
    <div>
      {kpis.map(k => (
        <span key={k.id} data-testid="kpi-value">{k.value}</span>
      ))}
    </div>
  ),
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('/performance page', () => {
  it('renders all 25 agent cards when reefers exist', async () => {
    const PerformancePage = (await import('@/app/[locale]/performance/page')).default;
    render(wrap(await PerformancePage()));
    expect(screen.getAllByTestId('agent-card').length).toBe(25);
  });

  it('renders the KPI strip with 5 performance KPIs', async () => {
    const PerformancePage = (await import('@/app/[locale]/performance/page')).default;
    render(wrap(await PerformancePage()));
    expect(screen.getAllByTestId('kpi-value').length).toBe(5);
  });

  it('renders the heatmap', async () => {
    const PerformancePage = (await import('@/app/[locale]/performance/page')).default;
    render(wrap(await PerformancePage()));
    expect(screen.getAllByTestId('heatmap-row').length).toBe(6);
  });
});

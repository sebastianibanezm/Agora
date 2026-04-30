import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../messages/en.json';

// Reset module registry before each test in this file
beforeEach(() => {
  vi.resetModules();
});

vi.mock('next-intl/server', async () => {
  const messages = (await import('../../messages/en.json')).default as any;
  return {
    getTranslations: async () => (key: string) =>
      key.split('.').reduce((obj: any, k) => obj?.[k], messages) ?? key,
  };
});

vi.mock('@/components/kpi/KPIStrip', () => ({
  KPIStrip: () => <div />,
}));

vi.mock('@/components/dashboard/PenaltyHeatmap', () => ({
  PenaltyHeatmap: () => <div data-testid="penalty-heatmap" />,
}));

vi.mock('@/lib/mock-data/containers', () => ({
  containers: [{ id: 'MSCU-7842156', productLabel: 'Walnuts in shell', coldChain: null }],
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('/performance page — walnut-only mode', () => {
  it('hides cold-chain panel when no reefers exist', async () => {
    const { default: PerformancePage } = await import('@/app/[locale]/performance/page');
    render(wrap(await PerformancePage()));
    expect(screen.queryByText('❄ Cold Chain')).not.toBeInTheDocument();
  });

  it('hides cold-chain sentinel cards', async () => {
    const { default: PerformancePage } = await import('@/app/[locale]/performance/page');
    render(wrap(await PerformancePage()));
    // With no reefers, only 19 agents should be visible (25 - 6 cold-chain sentinels)
    expect(screen.getAllByTestId('agent-card').length).toBe(19);
  });
});

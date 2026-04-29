import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { KPITile } from '@/components/kpi/KPITile';
import { KPIStrip } from '@/components/kpi/KPIStrip';
import { kpis } from '@/lib/mock-data/kpis';

vi.mock('@/lib/hooks/useCountUp', () => ({
  useCountUp: (target: number) => target,
  easeOutCubic: (p: number) => p,
}));

// KPIStrip is an async RSC that calls getTranslations — mock it for tests
vi.mock('next-intl/server', async () => {
  const messages = (await import('../messages/en.json')).default as any;
  return {
    getTranslations: async () => (key: string) =>
      key.split('.').reduce((obj: any, k) => obj?.[k], messages) ?? key,
  };
});

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('KPITile', () => {
  it('renders the KPI value', () => {
    render(<KPITile kpi={kpis[0]!} label="Active Shipments" />);
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('12');
  });

  it('renders unit label', () => {
    render(<KPITile kpi={kpis[0]!} label="Active Shipments" />);
    expect(screen.getByTestId('kpi-unit')).toBeInTheDocument();
  });

  it('renders sparkline svg', () => {
    render(<KPITile kpi={kpis[0]!} label="Active Shipments" />);
    expect(screen.getByTestId('kpi-sparkline')).toBeInTheDocument();
  });

  it('renders good-direction delta in mint color class', () => {
    // avoided_penalties: deltaPct +18%, deltaPositiveIsGood: true (default) → mint
    const kpi = kpis.find(k => k.id === 'avoided_penalties')!;
    render(<KPITile kpi={kpi} label="Avoided Penalties" />);
    const delta = screen.getByTestId('kpi-delta');
    expect(delta.className).toMatch(/mint/);
  });

  it('renders good-direction negative delta in mint color class', () => {
    // demurrage_incurred: deltaPct -55%, deltaPositiveIsGood: false → mint (decrease is good)
    const kpi = kpis.find(k => k.id === 'demurrage_incurred')!;
    render(<KPITile kpi={kpi} label="Demurrage Incurred" />);
    const delta = screen.getByTestId('kpi-delta');
    expect(delta.className).toMatch(/mint/);
  });
});

describe('KPIStrip', () => {
  it('renders exactly 7 tiles', async () => {
    // KPIStrip is an async RSC — invoke directly and await, then wrap result for rendering
    render(wrap(await KPIStrip({ kpis })));
    expect(screen.getAllByTestId('kpi-value').length).toBe(7);
  });
});

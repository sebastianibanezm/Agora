import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { alerts } from '@/lib/mock-data/alerts';
import { containerSeverity } from '@/lib/utils/severity';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('containerSeverity', () => {
  it('returns crit when container has a crit alert', () => {
    const sev = containerSeverity('MSCU-7842156', alerts);
    expect(sev).toBe('crit');
  });

  it('returns ok when container has no alerts', () => {
    const sev = containerSeverity('NONEXISTENT-ID', alerts);
    expect(sev).toBe('ok');
  });

  it('returns crit when container has crit alert (other alerts dismissed)', () => {
    const sev = containerSeverity('MSCU-7842156', alerts);
    expect(sev).toBe('crit');
  });

  it('returns info when only info alert exists', () => {
    const sev = containerSeverity('MSCU-6128390', alerts);
    expect(sev).toBe('info');
  });
});

describe('ShipmentMap', () => {
  it('renders without crashing with container data', async () => {
    const { ShipmentMap } = await import('@/components/map/ShipmentMap');
    const { container } = render(
      wrap(<ShipmentMap containers={containers} alerts={alerts} />)
    );
    expect(container.firstChild).toBeTruthy();
  });
});

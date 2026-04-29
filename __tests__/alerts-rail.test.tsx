import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { alerts } from '@/lib/mock-data/alerts';
import { AlertsRail } from '@/components/dashboard/AlertsRail';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('AlertsRail', () => {
  it('renders 7 alert rows', () => {
    render(wrap(<AlertsRail alerts={alerts} />));
    expect(screen.getAllByTestId('alert-row').length).toBe(7);
  });

  it('renders section header with "Live alerts"', () => {
    render(wrap(<AlertsRail alerts={alerts} />));
    expect(screen.getByText(/Live alerts/i)).toBeInTheDocument();
  });

  it('renders CRITICAL severity pill for crit alert', () => {
    render(wrap(<AlertsRail alerts={alerts} />));
    const pills = screen.getAllByTestId('sev-pill');
    expect(pills.some(p => p.textContent?.match(/CRITICAL/i))).toBe(true);
  });
});

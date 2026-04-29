import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';
import { alerts } from '@/lib/mock-data/alerts';
import { ActionQueue } from '@/components/dashboard/ActionQueue';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ActionQueue', () => {
  it('renders 5 container cards', () => {
    render(wrap(<ActionQueue containers={containers} alerts={alerts} importers={importers} />));
    expect(screen.getAllByTestId('timeline-mini').length).toBe(5);
  });

  it('renders section header "Needs action"', () => {
    render(wrap(<ActionQueue containers={containers} alerts={alerts} importers={importers} />));
    expect(screen.getByText(/Needs action/i)).toBeInTheDocument();
  });

  it('renders footer with "View all containers" link', () => {
    render(wrap(<ActionQueue containers={containers} alerts={alerts} importers={importers} />));
    expect(screen.getByRole('link', { name: /View all containers/i })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { containers } from '@/lib/mock-data/containers';
import { OverviewTab } from '@/components/containers/OverviewTab';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('OverviewTab', () => {
  it('renders timeline with T-day labels', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<OverviewTab container={c} />));
    expect(screen.getByText('T-2')).toBeInTheDocument();
    expect(screen.getByText('T+0')).toBeInTheDocument();
  });
  it('shows POL and POD labels', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<OverviewTab container={c} />));
    expect(screen.getByText('San Antonio')).toBeInTheDocument();
    expect(screen.getByText('Nhava Sheva')).toBeInTheDocument();
  });
  it('shows container value formatted', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<OverviewTab container={c} />));
    expect(screen.getByText(/142[\.,]500|142\.500/)).toBeInTheDocument();
  });
});

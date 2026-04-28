import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { containers } from '@/lib/mock-data/containers';
import { ContainerTabs } from '@/components/containers/ContainerTabs';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/containers/MSCU-7842156',
  useRouter: () => ({ push: vi.fn() }),
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('ContainerTabs', () => {
  it('walnuts MSCU-7842156 renders exactly 7 tabs (no Cold Chain)', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<ContainerTabs container={c} />));
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(7);
    expect(screen.queryByRole('tab', { name: /Cadena de frío/i })).toBeNull();
  });
  it('cherries MAEU-9182734 renders exactly 8 tabs including Cold Chain', () => {
    const c = containers.find(x => x.id === 'MAEU-9182734')!;
    render(wrap(<ContainerTabs container={c} />));
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(8);
    expect(screen.getByRole('tab', { name: /Cadena de frío/i })).toBeInTheDocument();
  });
});

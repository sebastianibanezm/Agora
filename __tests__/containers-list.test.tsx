import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { ContainerListTable } from '@/components/containers/ContainerListTable';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';

vi.mock('next/navigation', () => ({
  usePathname: () => '/containers',
  useRouter: () => ({ push: vi.fn() }),
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('ContainerListTable', () => {
  it('renders all 3 hero container IDs', () => {
    render(wrap(<ContainerListTable containers={containers} importers={importers} />));
    expect(screen.getByText('MSCU-7842156')).toBeInTheDocument();
    expect(screen.getByText('MAEU-9182734')).toBeInTheDocument();
    expect(screen.getByText('CMAU-9281744')).toBeInTheDocument();
  });
  it('each container links to its detail page', () => {
    render(wrap(<ContainerListTable containers={containers} importers={importers} />));
    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('/containers/MSCU-7842156');
    expect(hrefs).toContain('/containers/MAEU-9182734');
    expect(hrefs).toContain('/containers/CMAU-9281744');
  });
});

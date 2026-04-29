import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { containers } from '@/lib/mock-data/containers';
import { DocumentsTab } from '@/components/containers/DocumentsTab';
import { DocumentStatusPill } from '@/components/containers/DocumentStatusPill';
import type { DocStatus } from '@/types';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('DocumentStatusPill', () => {
  it('missing status has crit styling class', () => {
    const { container } = render(wrap(<DocumentStatusPill status="missing" />));
    const span = container.querySelector('span')!;
    expect(span.className).toMatch(/crit/);
  });
  it('approved status has ok styling class', () => {
    const { container } = render(wrap(<DocumentStatusPill status="approved" />));
    const span = container.querySelector('span')!;
    expect(span.className).toMatch(/ok/);
  });
});

describe('DocumentsTab', () => {
  it('renders documents for walnuts container (DUS must appear as missing)', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<DocumentsTab container={c} />));
    // There should be at least one "DUS" row (legacy doc + workflow doc)
    expect(screen.getAllByText('DUS').length).toBeGreaterThan(0);
  });
  it('shows doc type labels via i18n', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<DocumentsTab container={c} />));
    // Commercial invoice should appear in Spanish
    expect(screen.getByText('Factura comercial')).toBeInTheDocument();
  });
});

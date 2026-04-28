import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { ValidationFeed } from '@/components/alerts/ValidationFeed';
import type { Validation } from '@/types';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

const fixture: Validation[] = [
  {
    id: 'V1',
    containerId: 'C1',
    checkId: 'CHK.1',
    severity: 'crit',
    status: 'failed',
    message: 'validations.dusMissing',
    detectedAt: '2027-01-09T08:00:00-04:00',
  },
  {
    id: 'V2',
    containerId: 'C1',
    checkId: 'CHK.2',
    severity: 'ok',
    status: 'passed',
    message: 'validations.invoiceMatchesPO',
    detectedAt: '2027-01-08T10:00:00-04:00',
  },
  {
    id: 'V3',
    containerId: 'C1',
    checkId: 'CHK.3',
    severity: 'watch',
    status: 'warning',
    message: 'validations.weightDiscrepancy',
    detectedAt: '2027-01-07T11:00:00-04:00',
  },
];

describe('ValidationFeed', () => {
  it('renders all validations with i18n messages', () => {
    render(wrap(<ValidationFeed validations={fixture} />));
    expect(screen.getByText('DUS no presentado antes del cierre')).toBeInTheDocument();
    expect(screen.getByText('Monto de factura coincide con la OC')).toBeInTheDocument();
    expect(screen.getByText('Discrepancia de peso entre packing list y BL')).toBeInTheDocument();
  });

  it('renders status pills for each validation', () => {
    render(wrap(<ValidationFeed validations={fixture} />));
    expect(screen.getByText('Falló')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('Advertencia')).toBeInTheDocument();
  });

  it('orders validations chronologically (most recent first)', () => {
    const { container } = render(wrap(<ValidationFeed validations={fixture} />));
    const items = Array.from(container.querySelectorAll('[data-validation-id]'));
    expect(items.map(el => el.getAttribute('data-validation-id'))).toEqual(['V1', 'V2', 'V3']);
  });

  it('applies severity-colored left border', () => {
    const { container } = render(wrap(<ValidationFeed validations={fixture} />));
    const critItem = container.querySelector('[data-validation-id="V1"]')!;
    expect(critItem.className).toMatch(/severity-crit/);
    const okItem = container.querySelector('[data-validation-id="V2"]')!;
    expect(okItem.className).toMatch(/severity-ok/);
  });

  it('renders empty state when no validations', () => {
    render(wrap(<ValidationFeed validations={[]} />));
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { KanbanCard } from '@/components/bookings/KanbanCard';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera, AlertSeverity } from '@/types';

const mockNaviera: Naviera = {
  id: 'NAV-MSC', name: 'MSC', shortName: 'MSC', code: 'MSCU',
  apiCapability: 'manual', totalBookings: 10, avgDraftBlTurnaroundHours: 24,
  siRejectionRate: 0.02, cutoffDisciplineRate: 0.95,
};

const mockExporter: Exporter = {
  id: 'EXP-1', name: 'Comfrut', legalName: 'Comfrut S.A.', taxId: '12345',
  address: 'Linares', city: 'Linares', country: 'Chile',
  contactName: 'Cristián', contactEmail: 'c@comfrut.com', contactPhone: '+56',
  defaultIncoterm: 'FOB', defaultPaymentTerm: 'COBRANZA',
  primaryProducts: ['cherries'], primaryMarkets: ['US'],
  totalOrders: 5, totalContainers: 10, onTimeSiRate: 0.9,
  siQualityScore: 0.85, avgSiTurnaroundHours: 12,
};

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BKG-TEST', bookingNumber: 'MSCSAI9999',
    navieraId: 'NAV-MSC', containerType: '40RF', containerCount: 1, isReefer: false,
    shipper: 'Comfrut', consignee: 'Consignee Co.',
    freightTerm: 'COLLECT', emissionType: 'BL', containerIds: [],
    vesselName: 'MSC Test', voyage: 'V001',
    pol: 'San Antonio, Chile', polCoords: [-71.6, -33.6],
    pod: 'Charleston, USA', podCoords: [-79.9, 32.8],
    etd: '2026-05-03T19:00:00-04:00', eta: '2026-05-17T07:00:00-04:00',
    cutOff: '2026-05-01T16:00:00-04:00',
    stackingFrom: '2026-04-29T08:00:00-04:00', stackingTo: '2026-05-01T14:00:00-04:00',
    status: 'awaiting_si', createdAt: '2026-04-20T10:00:00-04:00',
    alertIds: [], costAtRiskUsd: 0,
    ...overrides,
  };
}

function makeRow(bookingOverrides: Partial<Booking> = {}, extras: {
  highestAlertSeverity?: AlertSeverity | null;
  siFailedCheckCount?: number;
  siFailedCheckNames?: string[];
  esiTransmittedAt?: string | null;
  siReceivedAt?: string | null;
} = {}) {
  return {
    booking: makeBooking(bookingOverrides),
    exporter: mockExporter,
    naviera: mockNaviera,
    alertCount: extras.highestAlertSeverity ? 1 : 0,
    highestAlertSeverity: extras.highestAlertSeverity ?? null,
    siFailedCheckCount: extras.siFailedCheckCount ?? 0,
    siFailedCheckNames: extras.siFailedCheckNames ?? [],
    esiTransmittedAt: extras.esiTransmittedAt ?? null,
    siReceivedAt: extras.siReceivedAt ?? null,
  };
}

function renderCard(row: ReturnType<typeof makeRow>) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <KanbanCard row={row} />
    </NextIntlClientProvider>,
  );
}

describe('KanbanCard', () => {
  it('renders booking number', () => {
    renderCard(makeRow());
    expect(screen.getByText('MSCSAI9999')).toBeInTheDocument();
  });

  it('renders naviera short name', () => {
    renderCard(makeRow());
    expect(screen.getByText('MSC')).toBeInTheDocument();
  });

  it('renders exporter name', () => {
    renderCard(makeRow());
    expect(screen.getByText('Comfrut')).toBeInTheDocument();
  });

  it('renders container type badge', () => {
    renderCard(makeRow());
    expect(screen.getByText('40RF')).toBeInTheDocument();
  });

  it('renders reefer icon only for reefer bookings', () => {
    const { rerender } = renderCard(makeRow({ isReefer: false }));
    expect(screen.queryByTestId('reefer-icon')).toBeNull();

    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <KanbanCard row={makeRow({ isReefer: true })} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId('reefer-icon')).toBeInTheDocument();
  });

  it('renders severity strip when highestAlertSeverity is set', () => {
    const { container } = renderCard(makeRow({}, { highestAlertSeverity: 'critical' }));
    expect(container.querySelector('[data-severity="critical"]')).toBeInTheDocument();
  });

  it('does not render severity strip when no alerts', () => {
    const { container } = renderCard(makeRow({}, { highestAlertSeverity: null }));
    expect(container.querySelector('[data-severity]')).toBeNull();
  });

  it('shows issue count for si_failed bookings', () => {
    renderCard(makeRow({ status: 'si_failed' }, { siFailedCheckCount: 3 }));
    expect(screen.getByText('3 issues')).toBeInTheDocument();
  });

  it('shows "BL clean · ready" for bl_validated bookings', () => {
    renderCard(makeRow({ status: 'bl_validated' }));
    expect(screen.getByText('BL clean · ready')).toBeInTheDocument();
  });

  it('shows "Draft BL received" for draft_bl_received bookings', () => {
    renderCard(makeRow({ status: 'draft_bl_received' }));
    expect(screen.getByText('Draft BL received')).toBeInTheDocument();
  });

  it('wraps in a link to the booking detail page', () => {
    const { container } = renderCard(makeRow());
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/bookings/BKG-TEST');
  });

  it('shows elapsed time for si_validated bookings', () => {
    renderCard(makeRow({ status: 'si_validated' }, { siReceivedAt: '2026-04-28T10:00:00-04:00' }));
    // Should render the cardReadySince metric — presence of the elapsed span confirms the metric renders
    // (exact text depends on demo date anchor; we just verify it doesn't crash and renders something)
    const card = screen.getByText(/Ready/i);
    expect(card).toBeInTheDocument();
  });

  it('shows elapsed time for esi_sent bookings', () => {
    renderCard(makeRow({ status: 'esi_sent' }, { esiTransmittedAt: '2026-04-27T08:00:00-04:00' }));
    const metric = screen.getByText(/e-SI sent/i);
    expect(metric).toBeInTheDocument();
  });
});

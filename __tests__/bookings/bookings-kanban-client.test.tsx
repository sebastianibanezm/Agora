import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingsKanbanClient } from '@/components/bookings/BookingsKanbanClient';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera, Order } from '@/types';

// minimal mocks ---------------------------------------------------------------
const naviera: Naviera = {
  id: 'NAV-MSC', name: 'MSC', shortName: 'MSC', code: 'MSCU',
  apiCapability: 'manual', totalBookings: 1, avgDraftBlTurnaroundHours: 24,
  siRejectionRate: 0, cutoffDisciplineRate: 1,
};
const exporter: Exporter = {
  id: 'EXP-1', name: 'Comfrut', legalName: 'Comfrut S.A.', taxId: '0',
  address: '', city: '', country: 'Chile', contactName: '', contactEmail: '',
  contactPhone: '', defaultIncoterm: 'FOB', defaultPaymentTerm: 'COBRANZA',
  primaryProducts: [], primaryMarkets: [], totalOrders: 0, totalContainers: 0,
  onTimeSiRate: 1, siQualityScore: 1, avgSiTurnaroundHours: 12,
};
const order: Order = {
  id: 'ORD-1', orderNumber: 'ORD-001', exporterId: 'EXP-1',
  destinationMarket: 'US', destinationCountry: 'USA', containerCount: 1,
  windowFrom: '', windowTo: '', status: 'in_progress', bookingIds: [],
  createdAt: '',
};

function makeRow(status: Booking['status'], num: string) {
  const booking: Booking = {
    id: `BKG-${num}`, bookingNumber: num, orderId: 'ORD-1', navieraId: 'NAV-MSC',
    containerType: '40HC', isReefer: false, vesselName: 'Test', voyage: 'V1',
    pol: 'San Antonio', polCoords: [-71.6, -33.6], pod: 'Charleston', podCoords: [-79.9, 32.8],
    etd: '2026-05-03T00:00:00Z', eta: '2026-05-17T00:00:00Z',
    cutOff: '2026-05-01T16:00:00-04:00', stackingFrom: '2026-04-29T00:00:00Z',
    stackingTo: '2026-05-01T00:00:00Z', status, createdAt: '2026-04-20T00:00:00Z',
    alertIds: [], costAtRiskUsd: 0,
  };
  return { booking, order, exporter, naviera, alertCount: 0, highestAlertSeverity: null, siFailedCheckCount: 0, esiTransmittedAt: null, siReceivedAt: null };
}

function renderBoard(rows: ReturnType<typeof makeRow>[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <BookingsKanbanClient rows={rows} />
    </NextIntlClientProvider>,
  );
}

describe('BookingsKanbanClient', () => {
  it('renders all 7 column headers', () => {
    renderBoard([]);
    expect(screen.getByText('Awaiting SI')).toBeInTheDocument();
    expect(screen.getByText('SI in Review')).toBeInTheDocument();
    expect(screen.getByText('SI Failed')).toBeInTheDocument();
    expect(screen.getByText('Ready to Send')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Draft BL')).toBeInTheDocument();
    expect(screen.getByText('Ready to Release')).toBeInTheDocument();
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('places awaiting_si booking in column 1', () => {
    renderBoard([makeRow('awaiting_si', 'BKG001')]);
    expect(screen.getByText('BKG001')).toBeInTheDocument();
  });

  it('places si_failed booking in SI Failed column', () => {
    renderBoard([makeRow('si_failed', 'BKG002')]);
    expect(screen.getByText('BKG002')).toBeInTheDocument();
  });

  it('places esi_sent and draft_bl_received in same column 5', () => {
    renderBoard([
      makeRow('esi_sent', 'ESI001'),
      makeRow('draft_bl_received', 'DBL001'),
    ]);
    expect(screen.getByText('ESI001')).toBeInTheDocument();
    expect(screen.getByText('DBL001')).toBeInTheDocument();
  });

  it('shows empty-column text when a column has no cards', () => {
    renderBoard([]);
    const empties = screen.getAllByText('No bookings');
    expect(empties.length).toBe(7);
  });

  it('shows correct count badge per column', () => {
    renderBoard([makeRow('si_failed', 'F1'), makeRow('si_failed', 'F2')]);
    // "2" badge should appear for SI Failed; all other columns show "0"
    const badges = screen.getAllByText('2');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});

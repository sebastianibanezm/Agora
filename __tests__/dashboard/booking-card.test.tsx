import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingCard } from '@/components/shared/BookingCard';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera, Alert } from '@/types';

const mockNaviera: Naviera = {
  id: 'NAV-MSC', name: 'MSC Mediterranean Shipping', shortName: 'MSC', code: 'MSCU',
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
    id: 'BKG-1', bookingNumber: 'MSCSAI9999',
    navieraId: 'NAV-MSC', containerType: '40HC', containerCount: 1, isReefer: false,
    shipper: 'Comfrut', consignee: 'Consignee Co.',
    freightTerm: 'COLLECT', emissionType: 'BL', containerIds: [],
    vesselName: 'MSC Test', voyage: 'V001',
    pol: 'San Antonio, Chile', polCoords: [-71.6, -33.6],
    pod: 'Rotterdam, Netherlands', podCoords: [4.5, 51.9],
    etd: '2026-05-15T19:00:00-04:00', eta: '2026-06-01T07:00:00-04:00',
    cutOff: '2026-05-10T16:00:00-04:00',
    stackingFrom: '2026-05-08T08:00:00-04:00', stackingTo: '2026-05-10T14:00:00-04:00',
    status: 'awaiting_si', createdAt: '2026-04-20T10:00:00-04:00',
    alertIds: [], costAtRiskUsd: 0,
    ...overrides,
  };
}

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

describe('BookingCard base', () => {
  it('renders booking number', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('MSCSAI9999')).toBeInTheDocument();
  });

  it('renders naviera shortName', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('MSC')).toBeInTheDocument();
  });

  it('renders route', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText(/San Antonio.*Rotterdam/)).toBeInTheDocument();
  });

  it('renders exporter name', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('Comfrut')).toBeInTheDocument();
  });

  it('renders reefer emoji when isReefer', () => {
    wrap(<BookingCard booking={makeBooking({ isReefer: true })} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.getByText('❄')).toBeInTheDocument();
  });

  it('does not render reefer emoji when not isReefer', () => {
    wrap(<BookingCard booking={makeBooking({ isReefer: false })} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.queryByText('❄')).not.toBeInTheDocument();
  });

  it('applies hover style when isHovered', () => {
    const { container } = wrap(
      <BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} isHovered />
    );
    expect(container.firstChild).toHaveClass('bg-bg-3');
  });
});

describe('BookingCard cutoff slot', () => {
  it('does not render cutoff section when showCutoff is false', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.queryByText('Cutoff')).not.toBeInTheDocument();
  });

  it('renders cutoff section when showCutoff is true', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} showCutoff />);
    expect(screen.getByText('Cutoff')).toBeInTheDocument();
  });
});

describe('BookingCard alert slot', () => {
  const mockAlert: Alert = {
    id: 'ALT-1', bookingId: 'BKG-1',
    severity: 'critical',
    agentId: 'si_validator', agentName: 'SI Validator',
    title: 'SI rejected', titleEs: 'SI rechazado',
    message: 'SI was rejected',
    costAtRiskUsd: 4200, createdAt: '2026-04-30T10:00:00-04:00',
  };

  it('does not render alert when not provided', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} />);
    expect(screen.queryByText('SI rejected')).not.toBeInTheDocument();
  });

  it('renders alert title in English', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} alert={mockAlert} />);
    expect(screen.getByText(/SI rejected/)).toBeInTheDocument();
  });

  it('renders cost at risk when present', () => {
    wrap(<BookingCard booking={makeBooking()} exporter={mockExporter} naviera={mockNaviera} alert={mockAlert} />);
    expect(screen.getByText(/4,200/)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingHeader } from '@/components/bookings/BookingHeader';
import en from '@/messages/en.json';
import type { Booking, Exporter, Naviera } from '@/types';

const booking: Booking = {
  id: 'b1',
  bookingNumber: 'MSC-001',
  status: 'awaiting_si',
  shipper: 'ACME Exports',
  consignee: 'Global Imports',
  pol: 'Shanghai, China',
  polCoords: [121.47, 31.23],
  pod: 'Los Angeles, USA',
  podCoords: [-118.24, 34.05],
  vesselName: 'Ever Given',
  voyage: '001E',
  etd: '2026-05-10T00:00:00Z',
  eta: '2026-05-25T00:00:00Z',
  cutOff: '2026-05-08T00:00:00Z',
  containerType: '40HC',
  containerCount: 1,
  isReefer: false,
  freightTerm: 'PREPAID',
  emissionType: 'BL',
  costAtRiskUsd: 0,
  navieraId: 'nav1',
  containerIds: [],
  alertIds: [],
  createdAt: '2026-04-01T00:00:00Z',
  stackingFrom: undefined,
  stackingTo: undefined,
  setpointC: undefined,
};

const exporter: Exporter = {
  id: 'exp1',
  name: 'ACME Exports',
  legalName: 'ACME Exports Ltd.',
  taxId: '12-3456789',
  address: '1 Export Lane',
  city: 'New York',
  country: 'US',
  contactName: 'Jane Doe',
  contactEmail: 'ops@acme.com',
  contactPhone: '+1-555-0100',
  defaultIncoterm: 'FOB',
  defaultPaymentTerm: 'OPEN_ACCOUNT',
  primaryProducts: ['Fresh Fruit'],
  primaryMarkets: ['US'],
  totalOrders: 42,
  totalContainers: 120,
  onTimeSiRate: 0.95,
  siQualityScore: 4.8,
  avgSiTurnaroundHours: 12,
  logoUrl: undefined,
};

const naviera: Naviera = {
  id: 'nav1',
  name: 'MSC',
  shortName: 'MSC',
  code: 'MSC',
  apiCapability: 'manual',
  totalBookings: 500,
  avgDraftBlTurnaroundHours: 24,
  siRejectionRate: 0.02,
  cutoffDisciplineRate: 0.98,
  logoUrl: undefined,
};

function renderHeader(exp?: Exporter, nav?: Naviera) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <BookingHeader booking={booking} exporter={exp} naviera={nav} />
    </NextIntlClientProvider>,
  );
}

describe('BookingHeader', () => {
  it('does not show shipper or consignee', () => {
    const { queryByText } = renderHeader(exporter, naviera);
    expect(queryByText(/ACME Exports → Global Imports/)).toBeNull();
    expect(queryByText(/Global Imports/)).toBeNull();
  });

  it('does not end with a trailing dot when naviera is absent', () => {
    const { container } = renderHeader(exporter, undefined);
    const dots = container.querySelectorAll('span');
    const lastDot = [...dots].reverse().find(s => s.textContent === '·');
    if (lastDot) {
      const parent = lastDot.parentElement;
      expect(parent?.lastElementChild).not.toBe(lastDot);
    }
  });

  it('shows both chips when both are provided', () => {
    const { getByText } = renderHeader(exporter, naviera);
    // ExporterChip renders exporter.name; NavieraChip renders naviera.shortName
    expect(getByText('ACME Exports')).toBeInTheDocument();
    expect(getByText('MSC')).toBeInTheDocument();
  });
});

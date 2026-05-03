import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentsViewClient } from '@/components/documents/DocumentsViewClient';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/bookings/BookingDocumentPopup', () => ({
  BookingDocumentPopup: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="popup"><button onClick={onClose}>close</button></div>
  ),
}));
vi.mock('@/lib/hooks/useDemoStore', () => ({ deleteBookingDocument: vi.fn() }));
vi.mock('@/components/documents/DocumentsGroupedList', () => ({
  DocumentsGroupedList: ({ rows, onDocClick }: { rows: DocumentsRow[]; onDocClick: (args: { bookingId: string; docType: string }) => void }) => (
    <div data-testid="grouped-list">
      <span data-testid="row-count">{rows.length}</span>
      <button onClick={() => onDocClick({ bookingId: 'BKG-001', docType: 'booking' })}>
        open-doc
      </button>
    </div>
  ),
}));

const makeRow = (id: string, exporterId: string, navieraId: string, isReefer = false): DocumentsRow => ({
  booking: {
    id, bookingNumber: id, navieraId, shipper: 'Comfrut', status: 'awaiting_si',
    isReefer, pod: 'Charleston, SC, US', bookingFileUrl: '/mock.pdf',
    bookingFileName: 'mock.pdf', containerType: '40RF', containerCount: 1,
    freightTerm: 'COLLECT', emissionType: 'Seawaybill', vesselName: 'Vessel',
    pol: 'San Antonio, CL', etd: '', eta: '', cutOff: '', stackingFrom: '',
    stackingTo: '', containerIds: [], alertIds: [], costAtRiskUsd: 0, createdAt: '',
  } as unknown as DocumentsRow['booking'],
  exporter: { id: exporterId, name: exporterId, legalName: exporterId, country: 'CL', logoUrl: '' } as DocumentsRow['exporter'],
  naviera: { id: navieraId, name: navieraId, shortName: navieraId, code: navieraId, logoUrl: '' } as unknown as DocumentsRow['naviera'],
  si: undefined, bl: undefined, exporterBl: undefined, events: [],
});

const exporters = [
  { id: 'EXP-A', name: 'EXP-A', legalName: 'EXP-A', country: 'CL', logoUrl: '' },
  { id: 'EXP-B', name: 'EXP-B', legalName: 'EXP-B', country: 'CL', logoUrl: '' },
] as DocumentsRow['exporter'][];

const navieras = [
  { id: 'NAV-A', name: 'NAV-A', shortName: 'NAV-A', code: 'NA', logoUrl: '' },
] as unknown as DocumentsRow['naviera'][];

const rows = [
  makeRow('BKG-001', 'EXP-A', 'NAV-A'),
  makeRow('BKG-002', 'EXP-B', 'NAV-A'),
  makeRow('BKG-003', 'EXP-A', 'NAV-A', true),
];

describe('DocumentsViewClient', () => {
  it('passes all rows to DocumentsGroupedList by default', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    expect(screen.getByTestId('row-count').textContent).toBe('3');
  });

  it('filters by search text', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    fireEvent.change(screen.getByPlaceholderText('search'), { target: { value: 'BKG-001' } });
    expect(screen.getByTestId('row-count').textContent).toBe('1');
  });

  it('filters by reefer', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByTestId('row-count').textContent).toBe('1');
  });

  it('opens popup when a doc row is clicked', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('open-doc'));
    expect(screen.getByTestId('popup')).toBeInTheDocument();
  });

  it('closes popup when onClose is called', () => {
    render(<DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />);
    fireEvent.click(screen.getByText('open-doc'));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('popup')).not.toBeInTheDocument();
  });
});

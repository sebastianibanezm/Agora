import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentsGroupedList } from '@/components/documents/DocumentsGroupedList';
import type { DocumentsRow } from '@/app/[locale]/(app)/documents/page';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) =>
    <a href={href} {...props}>{children}</a>,
}));

const makeRow = (overrides: Partial<DocumentsRow['booking']> = {}): DocumentsRow => ({
  booking: {
    id: 'BKG-001', bookingNumber: 'TEST001', navieraId: 'NAV-MSC',
    shipper: 'Comfrut', status: 'awaiting_si', vesselName: 'Test Vessel',
    pod: 'Charleston, SC, US', bookingFileUrl: '/mock-docs/booking.pdf',
    bookingFileName: 'booking.pdf', containerType: '40RF', containerCount: 1,
    isReefer: false, freightTerm: 'COLLECT', emissionType: 'Seawaybill',
    pol: 'San Antonio, CL', etd: '2026-05-10T00:00:00Z', eta: '2026-05-20T00:00:00Z',
    cutOff: '2026-05-08T00:00:00Z', stackingFrom: '2026-05-06T00:00:00Z',
    stackingTo: '2026-05-08T00:00:00Z', containerIds: [], alertIds: [],
    costAtRiskUsd: 0, createdAt: '2026-04-01T00:00:00Z',
    ...overrides,
  } as DocumentsRow['booking'],
  exporter: { id: 'EXP-001', name: 'Comfrut', legalName: 'Comfrut S.A.', country: 'CL', logoUrl: '' } as DocumentsRow['exporter'],
  naviera: { id: 'NAV-MSC', name: 'MSC', shortName: 'MSC', code: 'MSC', logoUrl: '' } as unknown as DocumentsRow['naviera'],
  si: undefined,
  bl: undefined,
  exporterBl: undefined,
  events: [],
});

describe('DocumentsGroupedList', () => {
  it('renders a group header with the booking number', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    expect(screen.getByText('TEST001')).toBeInTheDocument();
  });

  it('renders all 4 document type rows', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    expect(screen.getByText('docTypeBooking')).toBeInTheDocument();
    expect(screen.getByText('docTypeSi')).toBeInTheDocument();
    expect(screen.getByText('docTypeBl')).toBeInTheDocument();
    expect(screen.getByText('docTypeExporterBl')).toBeInTheDocument();
  });

  it('shows the booking filename when bookingFileUrl is present', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    expect(screen.getByText('booking.pdf')).toBeInTheDocument();
  });

  it('shows sinDocumento for missing SI', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    // SI, Draft BL, ExporterBL are all undefined — 3 "sinDocumento" cells
    expect(screen.getAllByText('sinDocumento').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onDocClick with bookingId and docType when a row is clicked', () => {
    const onDocClick = vi.fn();
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={onDocClick} />);
    // click the Booking row (first doc row after header)
    fireEvent.click(screen.getByText('docTypeBooking').closest('[data-testid="doc-row"]')!);
    expect(onDocClick).toHaveBeenCalledWith({ bookingId: 'BKG-001', docType: 'booking' });
  });

  it('collapses group on header click', () => {
    render(<DocumentsGroupedList rows={[makeRow()]} onDocClick={vi.fn()} />);
    // Initially open (has a document)
    expect(screen.getByText('docTypeBooking')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('group-header-BKG-001'));
    expect(screen.queryByText('docTypeBooking')).not.toBeInTheDocument();
  });

  it('renders empty state when rows is empty', () => {
    render(<DocumentsGroupedList rows={[]} onDocClick={vi.fn()} />);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});

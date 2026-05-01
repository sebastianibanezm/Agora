import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { BookingDocumentPopup } from '@/components/bookings/BookingDocumentPopup';
import en from '@/messages/en.json';
import type { Booking, ActivityEvent } from '@/types';

vi.mock('@/lib/hooks/useDemoStore', () => ({
  updateBookingField: vi.fn(),
  deleteBookingDocument: vi.fn(),
}));

const mockBooking: Partial<Booking> = {
  id: 'BKG-1',
  bookingNumber: 'SNG0506037',
  shipper: 'Comfrut S.A.',
  consignee: 'QUIRCH FOODS, LLC',
  vesselName: 'Matthew Schulte',
  voyage: '0LI1YN1MA',
  pol: 'San Antonio, CL',
  pod: 'Charleston, US',
  etd: '2026-04-22T18:00:00-04:00',
  eta: '2026-05-06T08:00:00-04:00',
  createdAt: '2026-04-09T15:20:00-04:00',
};

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

describe('BookingDocumentPopup', () => {
  it('renders popup with document name in header', () => {
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Booking')).toBeInTheDocument();
  });

  it('calls onClose when × button is clicked', async () => {
    const onClose = vi.fn();
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={onClose}
        onDelete={vi.fn()}
      />
    );
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows delete confirmation overlay when Delete button is clicked', async () => {
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete document')).toBeInTheDocument();
    expect(screen.getByText('Yes, delete')).toBeInTheDocument();
  });

  it('calls onDelete and closes on confirm', async () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={onClose}
        onDelete={onDelete}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    await userEvent.click(screen.getByText('Yes, delete'));
    expect(onDelete).toHaveBeenCalledWith('booking');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides confirmation when Cancel is clicked', async () => {
    wrap(
      <BookingDocumentPopup
        docType="booking"
        docId="BKG-1"
        booking={mockBooking as Booking}
        events={[]}
        onClose={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete document')).not.toBeInTheDocument();
  });
});

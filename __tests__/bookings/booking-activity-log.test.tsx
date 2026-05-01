import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingActivityLog } from '@/components/bookings/BookingActivityLog';
import en from '@/messages/en.json';
import type { ActivityEvent } from '@/types';

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

const baseEvent: ActivityEvent = {
  id: 'EVT-1',
  bookingId: 'BKG-1',
  type: 'booking_created',
  timestamp: '2026-04-09T15:20:00-04:00',
  actor: 'user',
  actorName: 'Felipe Donoso',
  description: 'Booking created.',
};

describe('BookingActivityLog', () => {
  it('renders the description of each event', () => {
    wrap(<BookingActivityLog events={[baseEvent]} />);
    expect(screen.getByText('Booking created.')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    wrap(<BookingActivityLog events={[]} />);
    expect(screen.getByText('No activity recorded.')).toBeInTheDocument();
  });

  it('filters by documentId when provided', () => {
    const withDoc: ActivityEvent = { ...baseEvent, id: 'EVT-2', documentId: 'SI-1', description: 'Doc event.' };
    const withoutDoc: ActivityEvent = { ...baseEvent, id: 'EVT-3', description: 'Booking event.' };
    wrap(<BookingActivityLog events={[withDoc, withoutDoc]} documentId="SI-1" />);
    expect(screen.getByText('Doc event.')).toBeInTheDocument();
    expect(screen.queryByText('Booking event.')).not.toBeInTheDocument();
  });

  it('renders actor badge', () => {
    wrap(<BookingActivityLog events={[baseEvent]} />);
    expect(screen.getByText('Felipe Donoso')).toBeInTheDocument();
  });

  it('renders Re-scanned badge for document_replaced events', () => {
    const replaced: ActivityEvent = { ...baseEvent, type: 'document_replaced', documentId: 'SI-1' };
    wrap(<BookingActivityLog events={[replaced]} />);
    expect(screen.getByText('Re-scanned')).toBeInTheDocument();
  });

  it('shows events with documentId when no documentId filter is applied (booking-level log)', () => {
    const withDoc: ActivityEvent = { ...baseEvent, id: 'EVT-4', documentId: 'SI-1', description: 'Has doc id.' };
    const withoutDoc: ActivityEvent = { ...baseEvent, id: 'EVT-5', description: 'No doc id.' };
    wrap(<BookingActivityLog events={[withDoc, withoutDoc]} />);
    expect(screen.getByText('Has doc id.')).toBeInTheDocument();
    expect(screen.getByText('No doc id.')).toBeInTheDocument();
  });
});

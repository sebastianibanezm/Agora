import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { BookingLifecycleStrip } from '@/components/bookings/BookingLifecycleStrip';
import en from '@/messages/en.json';
import type { BookingStatus } from '@/types';

// ResizeObserver is not available in jsdom — mock it
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    constructor(_cb: ResizeObserverCallback) {}
  };
});

function renderStrip(status: BookingStatus) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <BookingLifecycleStrip current={status} />
    </NextIntlClientProvider>,
  );
}

describe('BookingLifecycleStrip', () => {
  it('renders all 7 step labels', () => {
    const { getByText } = renderStrip('awaiting_si');
    expect(getByText('Awaiting SI')).toBeInTheDocument();
    expect(getByText('SI In Review')).toBeInTheDocument();
    expect(getByText('SI Failed')).toBeInTheDocument();
    expect(getByText('Ready to Send')).toBeInTheDocument();
    expect(getByText('Awaiting Draft BL')).toBeInTheDocument();
    expect(getByText('Ready to Release')).toBeInTheDocument();
    expect(getByText('Released')).toBeInTheDocument();
  });

  it('shows the sub-badge with current raw status on the active step', () => {
    const { getByText } = renderStrip('si_received');
    expect(getByText('si_received')).toBeInTheDocument();
  });

  it('does not show a sub-badge for non-active statuses', () => {
    const { queryByText } = renderStrip('si_received');
    expect(queryByText('awaiting_si')).toBeNull();
    expect(queryByText('si_validated')).toBeNull();
  });

  it('shows si_failed badge with correct text when status is si_failed', () => {
    const { getByText } = renderStrip('si_failed');
    expect(getByText('si_failed')).toBeInTheDocument();
  });

  it('hides the SI Failed label (ghost) on the happy path', () => {
    const { getByText } = renderStrip('si_received');
    const label = getByText('SI Failed');
    expect(label.className).toMatch(/invisible/);
  });

  it('shows the SI Failed label when status is si_failed', () => {
    const { getByText } = renderStrip('si_failed');
    const label = getByText('SI Failed');
    expect(label.className).not.toMatch(/invisible/);
  });

  it('handles all BookingStatus values without throwing', () => {
    const statuses: BookingStatus[] = [
      'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
      'esi_sent', 'draft_bl_received', 'bl_validated', 'bl_released', 'closed', 'cancelled',
    ];
    for (const s of statuses) {
      expect(() => renderStrip(s)).not.toThrow();
    }
  });
});

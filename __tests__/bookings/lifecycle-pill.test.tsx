import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { LifecyclePill, LIFECYCLE_COLORS } from '@/components/bookings/LifecyclePill';
import en from '@/messages/en.json';
import type { BookingStatus } from '@/types';

function renderPill(status: BookingStatus) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <LifecyclePill status={status} />
    </NextIntlClientProvider>,
  );
}

describe('LifecyclePill', () => {
  const statuses: BookingStatus[] = [
    'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
    'esi_sent', 'draft_bl_received', 'bl_validated', 'bl_released', 'closed', 'cancelled',
  ];

  it('renders a pill for every BookingStatus', () => {
    for (const s of statuses) {
      const { getByTestId, unmount } = renderPill(s);
      expect(getByTestId(`lifecycle-pill-${s}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('exposes a color map for the globe', () => {
    for (const s of statuses) {
      expect(LIFECYCLE_COLORS[s]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('shows translated label for awaiting_si', () => {
    const { getByText } = renderPill('awaiting_si');
    expect(getByText('Awaiting SI')).toBeInTheDocument();
  });
});

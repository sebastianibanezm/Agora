import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ContainerCard } from '@/components/bookings/ContainerCard';
import en from '@/messages/en.json';
import type { Container } from '@/types';

vi.mock('@/lib/hooks/useDemoStore', () => ({
  updateContainer: vi.fn(),
  useDemoStore: vi.fn(),
}));

const mockContainer: Container = {
  id: 'CTR-TEST',
  bookingId: 'BKG-TEST',
  containerNumber: 'CGMU-9176432',
  sealNumber: 'CMA0418771',
  netWeightKg: 22400,
  grossWeightKg: 24800,
  cargoDescription: 'Fresh cherries',
};

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('ContainerCard', () => {
  it('renders container number and weight', () => {
    wrap(<ContainerCard container={mockContainer} />);
    expect(screen.getByText('CGMU-9176432')).toBeInTheDocument();
    expect(screen.getByText('22400')).toBeInTheDocument();
  });

  it('shows notAssigned placeholder for empty fields', () => {
    const empty: Container = { id: 'CTR-EMPTY', bookingId: 'BKG-TEST' };
    wrap(<ContainerCard container={empty} />);
    expect(screen.getAllByText('Not yet assigned').length).toBeGreaterThan(0);
  });

  it('activates inline input on click', async () => {
    wrap(<ContainerCard container={mockContainer} />);
    const field = screen.getByText('CGMU-9176432');
    await userEvent.click(field);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

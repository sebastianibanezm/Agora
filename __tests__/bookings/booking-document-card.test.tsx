import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { BookingDocumentCard } from '@/components/bookings/BookingDocumentCard';
import en from '@/messages/en.json';

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>{ui}</NextIntlClientProvider>
  );
}

describe('BookingDocumentCard', () => {
  it('renders label and ok status', () => {
    wrap(<BookingDocumentCard label="Booking" status="ok" onClick={vi.fn()} />);
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders missing status with dimmed style', () => {
    const { container } = wrap(
      <BookingDocumentCard label="Exporter BL" status="missing" onClick={vi.fn()} />
    );
    expect(screen.getByText('Missing')).toBeInTheDocument();
    // missing cards have opacity class
    expect(container.firstChild).toHaveClass('opacity-[0.55]');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    wrap(<BookingDocumentCard label="SI" status="ok" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('still calls onClick for missing Exporter BL (upload mode)', async () => {
    const onClick = vi.fn();
    wrap(<BookingDocumentCard label="Exporter BL" status="missing" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

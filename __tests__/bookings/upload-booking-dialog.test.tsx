import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { UploadBookingDialog } from '@/components/bookings/UploadBookingDialog';
import en from '@/messages/en.json';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/hooks/useDemoStore', () => ({
  addBooking: vi.fn(),
  addContainer: vi.fn(),
}));

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:test');
global.URL.revokeObjectURL = vi.fn();

function wrap(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('UploadBookingDialog', () => {
  it('renders trigger button with upload label', () => {
    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('shows dropzone after trigger click', async () => {
    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));
    expect(screen.getByText(/Drop a PDF/i)).toBeInTheDocument();
  });

  it('shows parse error when API returns 400', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'parse failed' }),
    });
    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, file);
    await waitFor(() => expect(screen.getByText(/Could not extract/i)).toBeInTheDocument());
  });
});

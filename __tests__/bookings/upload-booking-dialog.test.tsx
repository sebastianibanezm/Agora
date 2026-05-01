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

function mockParseResponse(bookingNumber: string) {
  return {
    booking: {
      navieraId: 'NAV-001',
      bookingNumber,
      shipper: 'Test Shipper',
      consignee: 'Test Consignee',
      vesselName: 'Test Vessel',
      voyage: 'V001',
      pol: 'Valparaíso',
      polCoords: [-71.62, -33.04] as [number, number],
      pod: 'Rotterdam',
      podCoords: [4.48, 51.9] as [number, number],
      containerType: '40RF' as const,
      isReefer: false,
      freightTerm: 'COLLECT' as const,
      emissionType: 'BL' as const,
    },
    containers: [{ containerNumber: 'TCKU1234567', cargoDescription: 'Fruit' }],
  };
}

function mockFetchOk(response: object) {
  return { ok: true, json: async () => response };
}

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

  it('shows a processing row per file during parallel parse', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValue({ ok: false, json: async () => ({}) }); // all fail — keeps dialog open

    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));

    const file1 = new File(['a'], 'booking-1.pdf', { type: 'application/pdf' });
    const file2 = new File(['b'], 'booking-2.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => expect(screen.getByText('booking-1.pdf')).toBeInTheDocument());
    expect(screen.getByText('booking-2.pdf')).toBeInTheDocument();
  });

  it('shows booking counter when reviewing multiple files', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-001')))
      .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-002')));

    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));

    const file1 = new File(['a'], 'booking-1.pdf', { type: 'application/pdf' });
    const file2 = new File(['b'], 'booking-2.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => expect(screen.getByText(/Booking 1 of 2/i)).toBeInTheDocument());
  });

  it('advances to the next booking after "Confirm & next"', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-001')))
      .mockResolvedValueOnce(mockFetchOk(mockParseResponse('BK-002')));

    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));

    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, [
      new File(['a'], 'b1.pdf', { type: 'application/pdf' }),
      new File(['b'], 'b2.pdf', { type: 'application/pdf' }),
    ]);

    await waitFor(() => expect(screen.getByText(/Booking 1 of 2/i)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/Confirm & next/i));
    await waitFor(() => expect(screen.getByText(/Booking 2 of 2/i)).toBeInTheDocument());
  });

  it('shows all-failed state when every file fails to parse', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValue({ ok: false, json: async () => ({}) });

    wrap(<UploadBookingDialog><button>Upload</button></UploadBookingDialog>);
    await userEvent.click(screen.getByText('Upload'));

    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, [
      new File(['a'], 'bad1.pdf', { type: 'application/pdf' }),
      new File(['b'], 'bad2.pdf', { type: 'application/pdf' }),
    ]);

    await waitFor(() => expect(screen.getByText(/Try again/i)).toBeInTheDocument());
  });
});

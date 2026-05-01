import type { ExporterBL } from '@/types';

export const exporterBls: ExporterBL[] = [
  {
    id: 'EBL-SNG0502407',
    bookingId: 'BKG-SNG0502407',
    status: 'approved',
    uploadedAt: '2026-04-23T10:00:00-04:00',
    fileUrl: undefined, // HTML-replica only in demo
    extractedFields: {},
    validationResults: [],
  },
];

export function getExporterBlByBookingId(bookingId: string): ExporterBL | undefined {
  return exporterBls.find((e) => e.bookingId === bookingId);
}

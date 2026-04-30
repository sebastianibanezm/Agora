import type { ActivityEvent } from '@/types';

export const activityEvents: ActivityEvent[] = [
  // ============================================================
  // HERO — Comfrut SNG0502407 timeline
  // ============================================================
  {
    id: 'EVT-SNG-1',
    bookingId: 'BKG-SNG0502407',
    type: 'booking_created',
    timestamp: '2026-04-09T15:20:00-04:00',
    actor: 'user',
    actorName: 'Felipe Donoso',
    description: 'Booking SNG0502407 created against Order ORD-2026-0421 with CMA-CGM Matthew Schulte (40RF, San Antonio → Charleston).',
  },
  {
    id: 'EVT-SNG-2',
    bookingId: 'BKG-SNG0502407',
    type: 'si_received',
    timestamp: '2026-04-19T11:42:00-04:00',
    actor: 'system',
    description: 'SI received from Comfrut via portal (Embarque 1009562).',
  },
  {
    id: 'EVT-SNG-3',
    bookingId: 'BKG-SNG0502407',
    type: 'si_validation_run',
    timestamp: '2026-04-19T11:43:00-04:00',
    actor: 'agent',
    actorName: 'SI Validator',
    description: 'Ran 10 validation checks against the Booking and Exporter master data.',
  },
  {
    id: 'EVT-SNG-4',
    bookingId: 'BKG-SNG0502407',
    type: 'si_validation_passed',
    timestamp: '2026-04-19T11:44:00-04:00',
    actor: 'agent',
    actorName: 'SI Validator',
    description: 'All 10 checks passed. SI cleared for transmission.',
  },
  {
    id: 'EVT-SNG-5',
    bookingId: 'BKG-SNG0502407',
    type: 'esi_generated',
    timestamp: '2026-04-19T12:08:00-04:00',
    actor: 'agent',
    actorName: 'e-SI Transmitter',
    description: 'e-SI message generated in DCSA format (CMA-CGM endpoint).',
  },
  {
    id: 'EVT-SNG-6',
    bookingId: 'BKG-SNG0502407',
    type: 'esi_sent',
    timestamp: '2026-04-19T12:11:00-04:00',
    actor: 'agent',
    actorName: 'e-SI Transmitter',
    description: 'e-SI transmitted to CMA-CGM via DCSA. ACK received in 11s.',
  },
  {
    id: 'EVT-SNG-7',
    bookingId: 'BKG-SNG0502407',
    type: 'esi_acknowledged',
    timestamp: '2026-04-19T12:11:11-04:00',
    actor: 'system',
    description: 'CMA-CGM acknowledged receipt of e-SI; ref MSCSAI3052801.',
  },
  {
    id: 'EVT-SNG-8',
    bookingId: 'BKG-SNG0502407',
    type: 'draft_bl_received',
    timestamp: '2026-04-21T16:30:00-04:00',
    actor: 'system',
    description: 'Draft BL received from CMA-CGM (CGMUSAI3052801).',
  },
  {
    id: 'EVT-SNG-9',
    bookingId: 'BKG-SNG0502407',
    type: 'draft_bl_validation_run',
    timestamp: '2026-04-21T16:31:00-04:00',
    actor: 'agent',
    actorName: 'Draft BL Validator',
    description: 'Compared 10 fields between Draft BL and the SI that was sent.',
  },
  {
    id: 'EVT-SNG-10',
    bookingId: 'BKG-SNG0502407',
    type: 'draft_bl_validation_passed',
    timestamp: '2026-04-21T16:32:00-04:00',
    actor: 'agent',
    actorName: 'Draft BL Validator',
    description: 'All 10 comparison checks passed. BL ready for release to exporter.',
  },

  // ============================================================
  // SI_FAILED — MSCSAI4419 (consignee typo)
  // ============================================================
  {
    id: 'EVT-4419-1',
    bookingId: 'BKG-MSCSAI4419',
    type: 'booking_created',
    timestamp: '2026-04-18T11:00:00-04:00',
    actor: 'user',
    actorName: 'Felipe Donoso',
    description: 'Booking MSCSAI4419 created against Order ORD-2026-0421.',
  },
  {
    id: 'EVT-4419-2',
    bookingId: 'BKG-MSCSAI4419',
    type: 'si_received',
    timestamp: '2026-04-29T14:20:00-04:00',
    actor: 'system',
    description: 'SI received from Comfrut via portal (Embarque 1009571).',
  },
  {
    id: 'EVT-4419-3',
    bookingId: 'BKG-MSCSAI4419',
    type: 'si_validation_run',
    timestamp: '2026-04-29T14:21:00-04:00',
    actor: 'agent',
    actorName: 'Master Data Sentinel',
    description: 'Ran 10 validation checks; 9 passed, 1 failed.',
  },
  {
    id: 'EVT-4419-4',
    bookingId: 'BKG-MSCSAI4419',
    type: 'si_validation_failed',
    timestamp: '2026-04-29T14:22:00-04:00',
    actor: 'agent',
    actorName: 'Master Data Sentinel',
    description: 'Consignee "Wallmart Inc." does not match master record "Walmart Inc." (12-of-12 prior SIs).',
  },
  {
    id: 'EVT-4419-5',
    bookingId: 'BKG-MSCSAI4419',
    type: 'alert_fired',
    timestamp: '2026-04-29T14:25:00-04:00',
    actor: 'agent',
    actorName: 'Master Data Sentinel',
    description: 'Alert raised: SI consignee transcription drift. Estimated avoidance USD 500.',
  },

  // ============================================================
  // BL discrepancy — MSCSAI4408 (weight)
  // ============================================================
  {
    id: 'EVT-4408-1',
    bookingId: 'BKG-MSCSAI4408',
    type: 'booking_created',
    timestamp: '2026-04-09T11:00:00-04:00',
    actor: 'user',
    actorName: 'Felipe Donoso',
    description: 'Booking MSCSAI4408 created against Order ORD-2026-0421.',
  },
  {
    id: 'EVT-4408-2',
    bookingId: 'BKG-MSCSAI4408',
    type: 'si_received',
    timestamp: '2026-04-22T10:30:00-04:00',
    actor: 'system',
    description: 'SI received from Comfrut via portal.',
  },
  {
    id: 'EVT-4408-3',
    bookingId: 'BKG-MSCSAI4408',
    type: 'si_validation_passed',
    timestamp: '2026-04-22T10:32:00-04:00',
    actor: 'agent',
    actorName: 'SI Validator',
    description: 'All 10 SI checks passed.',
  },
  {
    id: 'EVT-4408-4',
    bookingId: 'BKG-MSCSAI4408',
    type: 'esi_sent',
    timestamp: '2026-04-22T11:04:00-04:00',
    actor: 'agent',
    actorName: 'e-SI Transmitter',
    description: 'e-SI transmitted to MSC via DCSA.',
  },
  {
    id: 'EVT-4408-5',
    bookingId: 'BKG-MSCSAI4408',
    type: 'draft_bl_received',
    timestamp: '2026-04-30T07:15:00-04:00',
    actor: 'system',
    description: 'Draft BL received from MSC.',
  },
  {
    id: 'EVT-4408-6',
    bookingId: 'BKG-MSCSAI4408',
    type: 'draft_bl_validation_failed',
    timestamp: '2026-04-30T07:17:00-04:00',
    actor: 'agent',
    actorName: 'Draft BL Validator',
    description: 'Net weight 23,010 vs SI 22,860 (Δ +0.66%, above 0.5% tolerance). Gross also off.',
  },
  {
    id: 'EVT-4408-7',
    bookingId: 'BKG-MSCSAI4408',
    type: 'alert_fired',
    timestamp: '2026-04-30T07:18:00-04:00',
    actor: 'agent',
    actorName: 'Draft BL Validator',
    description: 'Alert raised: Draft BL weight differs from SI by 0.66%.',
  },
];

export function getActivityForBooking(bookingId: string): ActivityEvent[] {
  return activityEvents
    .filter((e) => e.bookingId === bookingId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

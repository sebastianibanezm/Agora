import type { ActivityEvent, BookingStatus } from '@/types';
import { bookings } from './bookings';

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
    documentId: 'SI-SNG0502407',
    type: 'si_received',
    timestamp: '2026-04-19T11:42:00-04:00',
    actor: 'system',
    description: 'SI received from Comfrut via portal (Embarque 1009562).',
  },
  {
    id: 'EVT-SNG-3',
    bookingId: 'BKG-SNG0502407',
    documentId: 'SI-SNG0502407',
    type: 'si_validation_run',
    timestamp: '2026-04-19T11:43:00-04:00',
    actor: 'agent',
    actorName: 'SI Validator',
    description: 'Ran 10 validation checks against the Booking and Exporter master data.',
  },
  {
    id: 'EVT-SNG-4',
    bookingId: 'BKG-SNG0502407',
    documentId: 'SI-SNG0502407',
    type: 'si_validation_passed',
    timestamp: '2026-04-19T11:44:00-04:00',
    actor: 'agent',
    actorName: 'SI Validator',
    description: 'All 10 checks passed. SI cleared for transmission.',
  },
  {
    id: 'EVT-SNG-5',
    bookingId: 'BKG-SNG0502407',
    documentId: 'SI-SNG0502407',
    type: 'esi_generated',
    timestamp: '2026-04-19T12:08:00-04:00',
    actor: 'agent',
    actorName: 'e-SI Transmitter',
    description: 'e-SI message generated in DCSA format (CMA-CGM endpoint).',
  },
  {
    id: 'EVT-SNG-6',
    bookingId: 'BKG-SNG0502407',
    documentId: 'SI-SNG0502407',
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
    documentId: 'BL-SNG0502407',
    type: 'draft_bl_received',
    timestamp: '2026-04-21T16:30:00-04:00',
    actor: 'system',
    description: 'Draft BL received from CMA-CGM (CGMUSAI3052801).',
  },
  {
    id: 'EVT-SNG-9',
    bookingId: 'BKG-SNG0502407',
    documentId: 'BL-SNG0502407',
    type: 'draft_bl_validation_run',
    timestamp: '2026-04-21T16:31:00-04:00',
    actor: 'agent',
    actorName: 'Draft BL Validator',
    description: 'Compared 10 fields between Draft BL and the SI that was sent.',
  },
  {
    id: 'EVT-SNG-10',
    bookingId: 'BKG-SNG0502407',
    documentId: 'BL-SNG0502407',
    type: 'draft_bl_validation_passed',
    timestamp: '2026-04-21T16:32:00-04:00',
    actor: 'agent',
    actorName: 'Draft BL Validator',
    description: 'All 10 comparison checks passed. BL ready for release to exporter.',
  },
  {
    id: 'EVT-SNG-DOC-REPLACED',
    bookingId: 'BKG-SNG0502407',
    documentId: 'SI-SNG0502407',
    type: 'document_replaced',
    timestamp: '2026-04-20T09:15:00-04:00',
    actor: 'user',
    actorName: 'Usuario Demo',
    description: 'SI re-uploaded after consignee address correction. Document re-scanned and validated successfully. Previous version archived.',
    metadata: {
      documentType: 'si',
      replacedBy: 'Usuario Demo',
      changedFields: [
        { field: 'consignee', before: 'QUIRCH FOODS', after: 'QUIRCH FOODS, LLC' },
      ],
    },
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

type EventTemplate = { offset: number; type: ActivityEvent['type']; actor: ActivityEvent['actor']; description: string };

// Full event chain per status — offset in minutes from booking.createdAt, newest last.
const CHAIN: EventTemplate[] = [
  { offset:   0, type: 'booking_created',             actor: 'system', description: 'Booking PDF uploaded and parsed. Awaiting Shipping Instruction from exporter.' },
  { offset:  60, type: 'si_received',                 actor: 'system', description: 'SI received via portal.' },
  { offset:  62, type: 'si_validation_run',            actor: 'agent',  description: 'Running validation checks against booking master data.' },
  { offset:  65, type: 'si_validation_passed',         actor: 'agent',  description: 'All checks passed. SI cleared for e-SI generation.' },
  { offset:  67, type: 'esi_generated',                actor: 'agent',  description: 'e-SI message generated in DCSA format.' },
  { offset:  70, type: 'esi_sent',                     actor: 'agent',  description: 'e-SI transmitted to carrier via API.' },
  { offset:  75, type: 'esi_acknowledged',             actor: 'agent',  description: 'Carrier acknowledged receipt of e-SI.' },
  { offset: 240, type: 'draft_bl_received',            actor: 'system', description: 'Draft BL received from carrier.' },
  { offset: 242, type: 'draft_bl_validation_run',      actor: 'agent',  description: 'Running comparison checks between BL and SI.' },
  { offset: 245, type: 'draft_bl_validation_passed',   actor: 'agent',  description: 'All 8 BL comparison checks passed.' },
  { offset: 260, type: 'bl_released_to_exporter',      actor: 'user',   description: 'BL released to exporter.' },
];

const CHAIN_INDEX: Record<ActivityEvent['type'], number> = Object.fromEntries(
  CHAIN.map((e, i) => [e.type, i])
) as Record<ActivityEvent['type'], number>;

// Last chain step that should be visible for each booking status.
const STATUS_CHAIN_CUTOFF: Partial<Record<BookingStatus, ActivityEvent['type']>> = {
  created:             'booking_created',
  awaiting_si:         'booking_created',
  si_received:         'si_received',
  si_validated:        'si_validation_passed',
  si_failed:           'si_validation_run',   // run but failed — show run step
  esi_sent:            'esi_sent',
  draft_bl_received:   'draft_bl_received',
  bl_validated:        'draft_bl_validation_passed',
  bl_released:         'bl_released_to_exporter',
  closed:              'bl_released_to_exporter',
  cancelled:           'booking_created',
};

function synthesizeEvents(bookingId: string): ActivityEvent[] {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return [];

  // For si_failed: swap the passed step for a failed step.
  const isSiFailed = booking.status === 'si_failed';
  const cutoffType = STATUS_CHAIN_CUTOFF[booking.status] ?? 'booking_created';
  const cutoffIdx = CHAIN_INDEX[cutoffType] ?? 0;

  const base = new Date(booking.createdAt).getTime();
  return CHAIN.slice(0, cutoffIdx + 1).map((tpl, i) => {
    const type: ActivityEvent['type'] =
      isSiFailed && tpl.type === 'si_validation_run' && i === cutoffIdx
        ? 'si_validation_failed'
        : tpl.type;
    const description =
      type === 'si_validation_failed'
        ? 'SI validation failed — one or more checks did not pass. Action required.'
        : tpl.description;
    return {
      id: `EVT-SYN-${bookingId}-${i}`,
      bookingId,
      type,
      timestamp: new Date(base + tpl.offset * 60_000).toISOString(),
      actor: tpl.actor,
      description,
    };
  });
}

export function getActivityForBooking(bookingId: string): ActivityEvent[] {
  const real = activityEvents.filter((e) => e.bookingId === bookingId);
  const events = real.length > 0 ? real : synthesizeEvents(bookingId);
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

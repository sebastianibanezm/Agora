import type { PenaltyEvent, PenaltyAvoidedRow } from '@/types';

export const penaltyEvents: PenaltyEvent[] = [
  { id: 'PEN-001', containerId: 'MSCU-7842156', week: '2026-W48', amountUsd: 1_200, reason: 'penalties.lateDocSubmission' },
  { id: 'PEN-002', containerId: 'MSCU-7842156', week: '2026-W49', amountUsd: 800, reason: 'penalties.customsDelay' },
  { id: 'PEN-003', containerId: 'MAEU-9182734', week: '2026-W51', amountUsd: 0, reason: 'penalties.none' },
  { id: 'PEN-004', containerId: 'CMAU-9281744', week: '2026-W52', amountUsd: 500, reason: 'penalties.portCongestion' },
  { id: 'PEN-005', containerId: 'MSCU-7842156', week: '2026-W50', amountUsd: 2_100, reason: 'penalties.documentRejection' },
];

export const penaltyAvoidedMatrix: PenaltyAvoidedRow[] = [
  { buyerName: 'Mumbai Dry Fruits',  counts: { refumigation:3, phyto_reissue:2, vgm_late:1, dus_error:2, bl_correction:2, demurrage:1, detention:1, bank_discrepancy:3 } },
  { buyerName: 'Frutimar SL',        counts: { refumigation:1, phyto_reissue:2, vgm_late:2, dus_error:1, bl_correction:3, demurrage:2, detention:1, bank_discrepancy:2 } },
  { buyerName: 'Sun Yang Foods',     counts: { refumigation:2, phyto_reissue:1, vgm_late:1, dus_error:1, bl_correction:1, demurrage:4, detention:3, bank_discrepancy:1 } },
  { buyerName: 'Al Madina Trading',  counts: { refumigation:1, phyto_reissue:1, vgm_late:1, dus_error:2, bl_correction:2, demurrage:3, detention:2, bank_discrepancy:1 } },
  { buyerName: 'Pacific Produce',    counts: { refumigation:2, phyto_reissue:2, vgm_late:3, dus_error:2, bl_correction:1, demurrage:1, detention:1, bank_discrepancy:2 } },
  { buyerName: 'Costco FreshCo',     counts: { refumigation:1, phyto_reissue:1, vgm_late:2, dus_error:1, bl_correction:1, demurrage:1, detention:1, bank_discrepancy:2 } },
];

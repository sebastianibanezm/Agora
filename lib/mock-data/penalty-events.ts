import type { PenaltyEvent, PenaltyAvoidedRow } from '@/types';

export const penaltyEvents: PenaltyEvent[] = [
  { id: 'PEN-001', containerId: 'MSCU-7842156', week: '2026-W48', amountUsd: 1_200, reason: 'penalties.lateDocSubmission' },
  { id: 'PEN-002', containerId: 'MSCU-7842156', week: '2026-W49', amountUsd: 800, reason: 'penalties.customsDelay' },
  { id: 'PEN-003', containerId: 'MAEU-9182734', week: '2026-W51', amountUsd: 0, reason: 'penalties.none' },
  { id: 'PEN-004', containerId: 'CMAU-9281744', week: '2026-W52', amountUsd: 500, reason: 'penalties.portCongestion' },
  { id: 'PEN-005', containerId: 'MSCU-7842156', week: '2026-W50', amountUsd: 2_100, reason: 'penalties.documentRejection' },
];

export const penaltyAvoidedMatrix: PenaltyAvoidedRow[] = [
  { buyerName: 'Mumbai Dry Fruits', savedUsd: { refumigation:2400, phyto_reissue:1100, vgm_late:400,  dus_error:900, bl_correction:700,  demurrage:800,  detention:600,  bank_discrepancy:2100 } },
  { buyerName: 'Frutimar SL',       savedUsd: { refumigation:800,  phyto_reissue:1200, vgm_late:800,  dus_error:500, bl_correction:2400, demurrage:1600, detention:600,  bank_discrepancy:1600 } },
  { buyerName: 'Sun Yang Foods',    savedUsd: { refumigation:1600, phyto_reissue:600,  vgm_late:400,  dus_error:500, bl_correction:700,  demurrage:3200, detention:2700, bank_discrepancy:800  } },
  { buyerName: 'Al Madina Trading', savedUsd: { refumigation:800,  phyto_reissue:600,  vgm_late:400,  dus_error:900, bl_correction:1400, demurrage:2400, detention:1200, bank_discrepancy:800  } },
  { buyerName: 'Pacific Produce',   savedUsd: { refumigation:1600, phyto_reissue:1200, vgm_late:1200, dus_error:900, bl_correction:700,  demurrage:800,  detention:600,  bank_discrepancy:1600 } },
  { buyerName: 'Costco FreshCo',    savedUsd: { refumigation:800,  phyto_reissue:600,  vgm_late:800,  dus_error:500, bl_correction:700,  demurrage:800,  detention:600,  bank_discrepancy:1600 } },
];

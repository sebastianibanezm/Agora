import type { PenaltyEvent } from '@/types';

export const penaltyEvents: PenaltyEvent[] = [
  { id: 'PEN-001', containerId: 'MSCU-7842156', week: '2026-W48', amountUsd: 1_200, reason: 'penalties.lateDocSubmission' },
  { id: 'PEN-002', containerId: 'MSCU-7842156', week: '2026-W49', amountUsd: 800, reason: 'penalties.customsDelay' },
  { id: 'PEN-003', containerId: 'MAEU-9182734', week: '2026-W51', amountUsd: 0, reason: 'penalties.none' },
  { id: 'PEN-004', containerId: 'CMAU-9281744', week: '2026-W52', amountUsd: 500, reason: 'penalties.portCongestion' },
  { id: 'PEN-005', containerId: 'MSCU-7842156', week: '2026-W50', amountUsd: 2_100, reason: 'penalties.documentRejection' },
];

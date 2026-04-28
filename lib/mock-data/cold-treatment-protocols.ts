import type { ColdTreatmentProtocol } from '@/types';

export const coldTreatmentProtocols: ColdTreatmentProtocol[] = [
  {
    id: 'china_15d_0_5c',
    label: 'coldChain.protocols.china_15d_0_5c',
    market: 'CN',
    durationDays: 15,
    setpointC: 0.5,
    toleranceC: 0.3,
    description: 'coldChain.protocols.china_15d_0_5c',
  },
  {
    id: 'us_jh_24d_neg_1c',
    label: 'coldChain.protocols.us_jh_24d_neg_1c',
    market: 'US',
    durationDays: 24,
    setpointC: -1.1,
    toleranceC: 0.4,
    description: 'coldChain.protocols.us_jh_24d_neg_1c',
  },
  {
    id: 'in_cold_disinfestation',
    label: 'coldChain.protocols.in_cold_disinfestation',
    market: 'IN',
    durationDays: 18,
    setpointC: 1.5,
    toleranceC: 0.5,
    description: 'coldChain.protocols.in_cold_disinfestation',
  },
];

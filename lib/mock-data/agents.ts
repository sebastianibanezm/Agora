import type { Agent } from '@/types';

export const agents: Agent[] = [
  {
    id: 'si_validator',
    displayName: 'SI Validator',
    category: 'validator',
    description: 'Validates SI fields against the Booking record when received.',
    status: 'active',
    runsThisWeek: 52,
    catchesThisWeek: 8,
    estimatedSavingsUsd: 4_400,
  },
  {
    id: 'cutoff_clock',
    displayName: 'Cut-off Clock',
    category: 'monitor',
    description: 'Counts down from booking creation to documental cut-off; alerts at T-48h, T-24h, T-6h if no SI.',
    status: 'active',
    runsThisWeek: 1_240,
    catchesThisWeek: 5,
    estimatedSavingsUsd: 7_200,
  },
  {
    id: 'esi_transmitter',
    displayName: 'e-SI Transmitter',
    category: 'transmitter',
    description: 'Sends validated SI to the Naviera via API (DCSA, myMSC, INTTRA fallback).',
    status: 'active',
    runsThisWeek: 44,
    catchesThisWeek: 0,
    estimatedSavingsUsd: 0,
  },
  {
    id: 'draft_bl_validator',
    displayName: 'Draft BL Validator',
    category: 'validator',
    description: 'Compares incoming Draft BL fields against the SI that was sent.',
    status: 'active',
    runsThisWeek: 38,
    catchesThisWeek: 6,
    estimatedSavingsUsd: 5_100,
  },
  {
    id: 'master_data_sentinel',
    displayName: 'Master Data Sentinel',
    category: 'validator',
    description: 'Maintains golden record across Exporters and Navieras; catches transcription drift.',
    status: 'active',
    runsThisWeek: 312,
    catchesThisWeek: 3,
    estimatedSavingsUsd: 1_800,
  },
  {
    id: 'po_validator',
    displayName: 'PO Validator',
    category: 'validator',
    description: '(Roadmap) Will validate purchase orders before SI generation.',
    status: 'coming_soon',
    runsThisWeek: 0,
    catchesThisWeek: 0,
    estimatedSavingsUsd: 0,
  },
  {
    id: 'free_time_tracker',
    displayName: 'Free Time Tracker',
    category: 'monitor',
    description: '(Roadmap) Counts down free time from arrival to projected demurrage.',
    status: 'coming_soon',
    runsThisWeek: 0,
    catchesThisWeek: 0,
    estimatedSavingsUsd: 0,
  },
  {
    id: 'lc_consignee_checker',
    displayName: 'L/C Consignee Cross-check',
    category: 'validator',
    description: '(Roadmap) Validates SI consignee against L/C terms.',
    status: 'coming_soon',
    runsThisWeek: 0,
    catchesThisWeek: 0,
    estimatedSavingsUsd: 0,
  },
];

export const activeAgents = agents.filter((a) => a.status === 'active');
export const comingSoonAgents = agents.filter((a) => a.status === 'coming_soon');

export function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

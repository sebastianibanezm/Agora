import type { KPI } from '@/types';

export const kpis: KPI[] = [
  { id: 'active_shipments',   labelKey: 'dashboard.kpiActiveShipments',   value: 12,     unit: 'count', deltaPct:  2,  sparkline: [4,6,5,8,7,9,10,12] },
  { id: 'avoided_penalties',  labelKey: 'dashboard.kpiAvoidedPenalties',  value: 14_200, unit: 'usd',   deltaPct:  18, sparkline: [3,5,4,7,6,9,8,14] },
  { id: 'demurrage_incurred', labelKey: 'dashboard.kpiDemurrageIncurred', value: 1_080,  unit: 'usd',   deltaPct: -55, sparkline: [9,8,7,6,5,4,3,1], deltaPositiveIsGood: false },
  { id: 'avg_cycle_time',     labelKey: 'dashboard.kpiAvgCycleTime',      value: 58,     unit: 'days',  deltaPct: -5,  sparkline: [62,61,60,61,60,59,58,58], deltaPositiveIsGood: false },
  { id: 'doc_auto_gen_rate',  labelKey: 'dashboard.kpiDocAutoGenRate',     value: 87,     unit: 'pct',   deltaPct:  5,  sparkline: [78,80,79,82,84,85,86,87] },
  { id: 'active_agents',  labelKey: 'performance.kpiActiveAgents',  value: 25, unit: 'count', deltaPct: 9,   sparkline: [21,22,22,23,23,24,25,25] },
  { id: 'cold_incidents', labelKey: 'performance.kpiColdIncidents', value: 2,  unit: 'count', deltaPct: 100, sparkline: [0,0,1,0,0,1,1,2], deltaPositiveIsGood: false },
];

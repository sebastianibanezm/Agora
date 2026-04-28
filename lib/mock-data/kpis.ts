import type { KPI } from '@/types';

export const kpis: KPI[] = [
  { id: 'active_containers', labelKey: 'dashboard.kpiActiveContainers', value: 3, unit: 'count' },
  { id: 'cost_at_risk', labelKey: 'dashboard.kpiCostAtRisk', value: 8_500, unit: 'usd', severity: 'watch' },
  { id: 'on_time_docs', labelKey: 'dashboard.kpiOnTimeDocs', value: 87, unit: 'pct', deltaPct: 3 },
  { id: 'alerts_open', labelKey: 'dashboard.kpiAlertsOpen', value: 4, unit: 'count', severity: 'risk' },
  { id: 'cutoff_next_24h', labelKey: 'dashboard.kpiCutoffNext24h', value: 1, unit: 'count', severity: 'crit' },
  { id: 'cold_treatment_compliance', labelKey: 'dashboard.kpiColdTreatmentCompliance', value: 96, unit: 'pct', severity: 'ok' },
];

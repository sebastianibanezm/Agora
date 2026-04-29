import type { KPI } from '@/types';

export const kpis: KPI[] = [
  { id: 'active_containers', labelKey: 'dashboard.kpiActiveContainers', value: 3, unit: 'count', sparkline: [3, 3, 3, 3, 3] },
  { id: 'cost_at_risk', labelKey: 'dashboard.kpiCostAtRisk', value: 8_500, unit: 'usd', severity: 'watch', sparkline: [8500, 8200, 8600, 8300, 8500], deltaPositiveIsGood: false },
  { id: 'on_time_docs', labelKey: 'dashboard.kpiOnTimeDocs', value: 87, unit: 'pct', deltaPct: 3, sparkline: [84, 85, 86, 87, 87], deltaPositiveIsGood: true },
  { id: 'alerts_open', labelKey: 'dashboard.kpiAlertsOpen', value: 4, unit: 'count', severity: 'risk', sparkline: [4, 3, 4, 4, 4], deltaPositiveIsGood: false },
  { id: 'cutoff_next_24h', labelKey: 'dashboard.kpiCutoffNext24h', value: 1, unit: 'count', severity: 'crit', sparkline: [1, 1, 1, 1, 1], deltaPositiveIsGood: false },
  { id: 'cold_treatment_compliance', labelKey: 'dashboard.kpiColdTreatmentCompliance', value: 96, unit: 'pct', severity: 'ok', sparkline: [92, 93, 94, 95, 96], deltaPositiveIsGood: true },
];

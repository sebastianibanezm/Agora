import type { KPI } from '@/types';
import { KPITile } from '@/components/kpi/KPITile';

export function KpiStripV2({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((k) => (
        <KPITile key={k.id} kpi={k} />
      ))}
    </div>
  );
}

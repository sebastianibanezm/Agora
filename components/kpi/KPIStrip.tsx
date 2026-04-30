import type { KPI } from '@/types';
import { KPITile } from './KPITile';

export function KPIStrip({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpis.map((k) => (
        <KPITile key={k.id} kpi={k} />
      ))}
    </div>
  );
}

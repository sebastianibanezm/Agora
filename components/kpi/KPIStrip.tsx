import { getTranslations } from 'next-intl/server';
import type { KPI } from '@/types';
import { KPITile } from './KPITile';

export async function KPIStrip({ kpis }: { kpis: KPI[] }) {
  const t = await getTranslations();
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpis.map(k => <KPITile key={k.id} kpi={k} label={t(k.labelKey)} />)}
    </div>
  );
}

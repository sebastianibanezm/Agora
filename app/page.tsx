import { getTranslations } from 'next-intl/server';
import { containers, closedContainers } from '@/lib/mock-data/containers';
import { kpis } from '@/lib/mock-data/kpis';
import { alerts } from '@/lib/mock-data/alerts';
import { importers } from '@/lib/mock-data/importers';
import { documents } from '@/lib/mock-data/documents';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';
import { PageTransition } from '@/components/shared/PageTransition';
import { ShipmentMap } from '@/components/map/ShipmentMap';
import { KPIStrip } from '@/components/kpi/KPIStrip';
import { ActionQueue } from '@/components/dashboard/ActionQueue';
import { AlertsRail } from '@/components/dashboard/AlertsRail';
import { ColdChainDashboardSection } from '@/components/cold-chain/ColdChainDashboardSection';
import { ReadinessStrip } from '@/components/dashboard/ReadinessStrip';
import { ClosedTable } from '@/components/dashboard/ClosedTable';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';

const OPS_DASHBOARD_KPI_IDS = ['active_shipments', 'avoided_penalties', 'demurrage_incurred', 'avg_cycle_time', 'doc_auto_gen_rate'];

export default async function OperationsDashboard() {
  const t = await getTranslations('dashboard');
  const reefers = containers.filter(c => c.coldChain?.required === true);
  const dashKpis = OPS_DASHBOARD_KPI_IDS.map(id => kpis.find(k => k.id === id)!).filter(Boolean);

  return (
    <PageTransition>
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8 min-h-screen bg-bg-0">

      {/* §3 Shipment Map */}
      <ShipmentMap containers={containers} alerts={alerts} />

      {/* §4 KPI Strip */}
      <KPIStrip kpis={dashKpis} />

      {/* §5 Action Queue + Alerts Rail */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'stretch' }}>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <ActionQueue containers={containers} alerts={alerts} importers={importers} />
        </section>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <AlertsRail alerts={alerts} />
        </section>
      </div>

      {/* §6 Cold Chain — conditional */}
      {reefers.length > 0 && <ColdChainDashboardSection containers={reefers} />}

      {/* §7 This Week Readiness */}
      <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
          <span className="text-sm font-medium text-ink-1">{t('thisWeekReadiness')}</span>
          <span className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
            T-7 → T0 WINDOW
          </span>
        </div>
        <ReadinessStrip containers={containers} documents={documents} importers={importers} />
      </section>

      {/* §8 Last Week Closed + Penalty Heatmap */}
      <div className="grid grid-cols-2 gap-4">
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
            <span className="text-sm font-medium text-ink-1">{t('lastWeekClosed')}</span>
          </div>
          <ClosedTable rows={closedContainers} />
        </section>
        <section className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
            <span className="text-sm font-medium text-ink-1">{t('penaltiesAvoided')}</span>
          </div>
          <PenaltyHeatmap matrix={penaltyAvoidedMatrix} />
        </section>
      </div>
    </div>
    </PageTransition>
  );
}

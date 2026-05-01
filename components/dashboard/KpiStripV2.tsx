'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { KPITile } from '@/components/kpi/KPITile';
import { KpiDrilldownModal, type DrilldownRow } from './KpiDrilldownModal';
import { getDashboardKpis } from '@/lib/mock-data/kpis';
import { bookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { activeAlerts } from '@/lib/mock-data/alerts';
import { hoursUntil } from '@/lib/utils/dates';
import type { KPI } from '@/types';

const ACTIVE_STATUSES = new Set([
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated',
]);

const exporterMap = new Map(exporters.map((e) => [e.id, e]));
const navieraMap = new Map(navieras.map((n) => [n.id, n]));

function resolveRows(ids: string[]): DrilldownRow[] {
  return ids.flatMap((id) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return [];
    const exporter = exporters.find(
      (e) => e.name === booking.shipper || e.legalName === booking.shipper,
    ) ?? exporterMap.get(booking.navieraId);
    const naviera = navieraMap.get(booking.navieraId);
    if (!exporter || !naviera) return [];
    return [{ booking, exporter, naviera }];
  });
}

function getRowsForKpi(kpiId: string): DrilldownRow[] {
  const now = new Date();
  let filtered: string[];

  if (kpiId === 'active_bookings') {
    filtered = bookings.filter((b) => ACTIVE_STATUSES.has(b.status)).map((b) => b.id);
  } else if (kpiId === 'awaiting_si') {
    filtered = bookings.filter((b) => b.status === 'awaiting_si').map((b) => b.id);
  } else if (kpiId === 'cutoffs_at_risk_24h') {
    filtered = bookings
      .filter((b) => {
        if (['closed', 'cancelled', 'bl_released'].includes(b.status)) return false;
        const h = hoursUntil(b.cutOff ?? '', now);
        return h >= 0 && h <= 24;
      })
      .map((b) => b.id);
  } else if (kpiId === 'avg_si_turnaround') {
    filtered = bookings
      .filter((b) => ['si_received', 'si_validated', 'esi_sent'].includes(b.status))
      .map((b) => b.id);
  } else if (kpiId === 'bl_discrepancies_caught') {
    const discrepancyBookingIds = new Set(
      activeAlerts
        .filter((a) => {
          const b = bookings.find((bb) => bb.id === a.bookingId);
          return b && b.status === 'draft_bl_received' && a.severity !== 'info';
        })
        .map((a) => a.bookingId),
    );
    filtered = [...discrepancyBookingIds];
  } else {
    filtered = [];
  }

  return resolveRows(filtered);
}

export function KpiStripV2() {
  const t = useTranslations('dashboard');
  const kpis = getDashboardKpis(t);
  const [openKpiId, setOpenKpiId] = useState<string | null>(null);

  const openKpi: KPI | undefined = kpis.find((k) => k.id === openKpiId);
  const rows = openKpiId ? getRowsForKpi(openKpiId) : [];

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <KPITile key={k.id} kpi={k} onClick={() => setOpenKpiId(k.id)} />
        ))}
      </div>

      {openKpi && (
        <KpiDrilldownModal
          open={openKpiId !== null}
          onClose={() => setOpenKpiId(null)}
          title={openKpi.label}
          rows={rows}
        />
      )}
    </>
  );
}

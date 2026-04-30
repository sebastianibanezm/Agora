import { bookings } from './bookings';
import { alerts as allAlerts } from './alerts';
import { getTodayDemo } from './today';
import { hoursUntil } from '@/lib/utils/dates';
import type { KPI } from '@/types';

const ACTIVE_STATUSES = new Set([
  'created',
  'awaiting_si',
  'si_received',
  'si_validated',
  'si_failed',
  'esi_sent',
  'draft_bl_received',
  'bl_validated',
]);

const RELEASED_STATUSES = new Set(['bl_released', 'closed']);

export interface DashboardMetrics {
  activeBookings: { value: number; deltaPct: number };
  awaitingSi: { value: number; overdue: number };
  cutoffsAtRisk24h: { value: number; usdAtRisk: number };
  avgSiTurnaroundHours: { value: number; deltaHours: number };
  blDiscrepanciesCaught: { value: number; usdAvoided: number };
}

export function getDashboardMetrics(): DashboardMetrics {
  const now = getTodayDemo();
  const active = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));
  const awaitingSi = bookings.filter((b) => b.status === 'awaiting_si');
  const overdue = awaitingSi.filter((b) => hoursUntil(b.cutOff, now) < 36);

  const cutoffsAtRisk = bookings.filter((b) => {
    if (b.status === 'closed' || b.status === 'cancelled' || b.status === 'bl_released') return false;
    const h = hoursUntil(b.cutOff, now);
    return h >= 0 && h <= 24;
  });
  const usdAtRisk = cutoffsAtRisk.reduce((s, b) => s + b.costAtRiskUsd, 0);

  // Discrepancies caught = action+critical alerts on draft_bl_received bookings
  const discrepancyAlerts = allAlerts.filter((a) => {
    const b = bookings.find((bb) => bb.id === a.bookingId);
    return b && b.status === 'draft_bl_received' && a.severity !== 'info';
  });
  const usdAvoided = discrepancyAlerts.reduce((s, a) => s + (a.costAtRiskUsd ?? 0), 0);

  return {
    activeBookings: { value: active.length, deltaPct: 12 },
    awaitingSi: { value: awaitingSi.length, overdue: overdue.length },
    cutoffsAtRisk24h: { value: cutoffsAtRisk.length, usdAtRisk },
    avgSiTurnaroundHours: { value: 22, deltaHours: -3 },
    blDiscrepanciesCaught: { value: discrepancyAlerts.length, usdAvoided },
  };
}

export function getDashboardKpis(): KPI[] {
  const m = getDashboardMetrics();
  return [
    {
      id: 'active_bookings',
      label: 'Active Bookings',
      value: String(m.activeBookings.value),
      delta: `${m.activeBookings.deltaPct >= 0 ? '+' : ''}${m.activeBookings.deltaPct}%`,
      deltaDirection: m.activeBookings.deltaPct >= 0 ? 'up' : 'down',
      deltaPositive: m.activeBookings.deltaPct >= 0,
      sublabel: 'vs last week',
    },
    {
      id: 'awaiting_si',
      label: 'Awaiting SI',
      value: String(m.awaitingSi.value),
      sublabel: `${m.awaitingSi.overdue} overdue`,
      deltaDirection: m.awaitingSi.overdue > 0 ? 'up' : 'flat',
      deltaPositive: m.awaitingSi.overdue === 0,
    },
    {
      id: 'cutoffs_at_risk_24h',
      label: 'Cut-offs at risk (24h)',
      value: String(m.cutoffsAtRisk24h.value),
      sublabel: `USD ${m.cutoffsAtRisk24h.usdAtRisk.toLocaleString('en-US')} at risk`,
      deltaDirection: m.cutoffsAtRisk24h.value > 0 ? 'up' : 'flat',
      deltaPositive: m.cutoffsAtRisk24h.value === 0,
    },
    {
      id: 'avg_si_turnaround',
      label: 'Avg SI Turnaround',
      value: `${m.avgSiTurnaroundHours.value}h`,
      delta: `${m.avgSiTurnaroundHours.deltaHours >= 0 ? '+' : ''}${m.avgSiTurnaroundHours.deltaHours}h`,
      deltaDirection: m.avgSiTurnaroundHours.deltaHours <= 0 ? 'down' : 'up',
      deltaPositive: m.avgSiTurnaroundHours.deltaHours <= 0,
      sublabel: 'SI receipt → e-SI sent',
    },
    {
      id: 'bl_discrepancies_caught',
      label: 'BL Discrepancies Caught',
      value: String(m.blDiscrepanciesCaught.value),
      sublabel: `USD ${m.blDiscrepanciesCaught.usdAvoided.toLocaleString('en-US')} avoided`,
      deltaDirection: 'up',
      deltaPositive: true,
    },
  ];
}

// Helper exposed for "Last week closed" section
export function getRecentlyClosedBookings(days = 7) {
  const cutoff = getTodayDemo().getTime() - days * 24 * 3_600_000;
  return bookings
    .filter((b) => RELEASED_STATUSES.has(b.status) && new Date(b.eta).getTime() >= cutoff - 30 * 24 * 3_600_000)
    .sort((a, b) => new Date(b.eta).getTime() - new Date(a.eta).getTime());
}

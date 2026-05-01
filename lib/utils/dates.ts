import { differenceInCalendarDays } from 'date-fns';
import { getTodayDemo } from '@/lib/mock-data/today';
import type { AlertSeverity } from '@/types';

export { getTodayDemo };

export function tDayFrom(etdIso: string): string {
  const today = getTodayDemo();
  const etd = new Date(etdIso);
  const diff = differenceInCalendarDays(etd, today);
  if (diff === 0) return 'T+0';
  return diff > 0 ? `T-${diff}` : `T+${Math.abs(diff)}`;
}

export function formatDate(iso: string, locale: 'es' | 'en'): string {
  const date = new Date(iso);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return locale === 'es' ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
}

export function hoursUntil(iso: string, now: Date = getTodayDemo()): number {
  return (new Date(iso).getTime() - now.getTime()) / 3_600_000;
}

export function formatTs(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Returns a human-readable elapsed string like "4d ago" or "2h ago".
 * Uses the demo time anchor as "now".
 */
export function formatElapsedSince(iso: string, now: Date = getTodayDemo()): string {
  const deltaMs = now.getTime() - new Date(iso).getTime();
  if (deltaMs <= 0) return '0m ago';
  const totalMinutes = Math.floor(deltaMs / 60_000);
  const totalHours = Math.floor(deltaMs / 3_600_000);
  const totalDays = Math.floor(deltaMs / 86_400_000);
  if (totalDays >= 1) return `${totalDays}d ago`;
  if (totalHours >= 1) return `${totalHours}h ago`;
  return `${totalMinutes}m ago`;
}

/**
 * Returns a short locale-aware date like "Apr 25" (en) or "25 abr" (es).
 *
 * Implemented manually (not via Intl.DateTimeFormat) so the output is
 * byte-identical between Node.js (SSR) and the browser. ICU/CLDR data
 * differs across runtimes for Spanish abbreviated months — e.g. some
 * environments append a trailing period ("abr.") and others don't ("abr"),
 * which causes React hydration mismatches.
 */
const SHORT_MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const SHORT_MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatShortDate(iso: string, locale: 'es' | 'en'): string {
  const date = new Date(iso);
  const day = date.getDate();
  const monthIdx = date.getMonth();
  return locale === 'es'
    ? `${day} ${SHORT_MONTHS_ES[monthIdx]}`
    : `${SHORT_MONTHS_EN[monthIdx]} ${day}`;
}

export function getCutoffSeverity(cutoffIso: string, now: Date = getTodayDemo()): AlertSeverity | null {
  if (!cutoffIso) return null;
  const delta = hoursUntil(cutoffIso, now);
  if (delta <= 0) return null;
  if (delta <= 72) return 'critical';
  if (delta <= 120) return 'action';
  return null;
}

import { differenceInCalendarDays } from 'date-fns';
import { getTodayDemo } from '@/lib/mock-data/today';

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
 */
export function formatShortDate(iso: string, locale: 'es' | 'en'): string {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

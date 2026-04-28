import { differenceInCalendarDays } from 'date-fns';

export const getTodayDemo = (): Date => new Date('2027-01-09T10:00:00-04:00');

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

  if (locale === 'es') {
    return `${d}/${m}/${y}`;
  } else {
    return `${m}/${d}/${y}`;
  }
}

export function hoursUntil(iso: string, now: Date = getTodayDemo()): number {
  return (new Date(iso).getTime() - now.getTime()) / 3_600_000;
}

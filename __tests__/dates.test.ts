import { describe, it, expect } from 'vitest';
import { getTodayDemo, tDayFrom, formatDate, hoursUntil } from '@/lib/utils/dates';

describe('dates', () => {
  it('getTodayDemo is anchored to 2026-04-30T10:00:00-04:00', () => {
    expect(getTodayDemo().toISOString()).toBe('2026-04-30T14:00:00.000Z');
  });

  it('tDayFrom returns T-2 for ETD 2026-05-02', () => {
    expect(tDayFrom('2026-05-02T00:00:00-04:00')).toBe('T-2');
  });

  it('tDayFrom returns T+10 for ETD 2026-04-20', () => {
    expect(tDayFrom('2026-04-20T00:00:00-04:00')).toBe('T+10');
  });

  it('formatDate honors es vs en', () => {
    const d = '2026-04-30T10:00:00-04:00';
    expect(formatDate(d, 'es')).toMatch(/30\/04\/2026/);
    expect(formatDate(d, 'en')).toMatch(/04\/30\/2026/);
  });

  it('hoursUntil computes positive hours', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 18 * 3600 * 1000).toISOString();
    expect(hoursUntil(cutoff)).toBeCloseTo(18, 0);
  });
});

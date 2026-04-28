import { describe, it, expect } from 'vitest';
import { getTodayDemo, tDayFrom, formatDate, hoursUntil } from '@/lib/utils/dates';

describe('dates', () => {
  it('getTodayDemo is anchored to 2027-01-09T10:00:00-04:00', () => {
    expect(getTodayDemo().toISOString()).toBe('2027-01-09T14:00:00.000Z');
  });

  it('tDayFrom returns T-2 for ETD 2027-01-11', () => {
    expect(tDayFrom('2027-01-11T00:00:00-04:00')).toBe('T-2');
  });

  it('tDayFrom returns T+10 for ETD 2026-12-30', () => {
    expect(tDayFrom('2026-12-30T00:00:00-04:00')).toBe('T+10');
  });

  it('formatDate honors es vs en', () => {
    const d = '2027-01-09T10:00:00-04:00';
    expect(formatDate(d, 'es')).toMatch(/09\/01\/2027/);
    expect(formatDate(d, 'en')).toMatch(/01\/09\/2027/);
  });

  it('hoursUntil computes positive hours', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 18 * 3600 * 1000).toISOString();
    expect(hoursUntil(cutoff)).toBeCloseTo(18, 0);
  });
});

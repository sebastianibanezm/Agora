import { describe, it, expect } from 'vitest';
import { getTodayDemo, tDayFrom, formatDate, hoursUntil, getCutoffSeverity } from '@/lib/utils/dates';

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

describe('getCutoffSeverity', () => {
  it('returns critical when cutoff is within 72h', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 48 * 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBe('critical');
  });

  it('returns action when cutoff is between 72h and 120h', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 96 * 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBe('action');
  });

  it('returns null when cutoff is beyond 120h', () => {
    const cutoff = new Date(getTodayDemo().getTime() + 200 * 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getCutoffSeverity('')).toBeNull();
  });

  it('returns null when cutoff is in the past', () => {
    const cutoff = new Date(getTodayDemo().getTime() - 3600 * 1000).toISOString();
    expect(getCutoffSeverity(cutoff)).toBeNull();
  });
});

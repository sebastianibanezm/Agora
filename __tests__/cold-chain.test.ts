import { describe, it, expect } from 'vitest';
import { containers } from '@/lib/mock-data/containers';

describe('cold chain', () => {
  const cherries = containers.find(c => c.id === 'MAEU-9182734')!;
  const grapes   = containers.find(c => c.id === 'CMAU-9281744')!;
  const walnuts  = containers.find(c => c.id === 'MSCU-7842156')!;

  it('walnuts has no coldChain', () => {
    expect(walnuts.coldChain).toBeUndefined();
  });
  it('cherries has 3 loggers', () => {
    expect(cherries.coldChain?.loggers.length).toBe(3);
  });
  it('cherries has 2880 readings per logger', () => {
    for (const l of cherries.coldChain!.loggers) {
      expect(l.readings.length).toBe(2880);
    }
  });
  it('cherries has exactly 1 excursion (within tolerance, 18 min, top logger)', () => {
    expect(cherries.coldChain!.excursionEvents.length).toBe(1);
    const e = cherries.coldChain!.excursionEvents[0]!;
    expect(e.durationMin).toBe(18);
    expect(e.brokeCompliance).toBe(false);
    expect(e.peakTempC).toBeGreaterThan(0.7);
    expect(e.peakTempC).toBeLessThan(1.1);
  });
  it('cherries treatmentMinutesCompliant is around 13800', () => {
    expect(cherries.coldChain!.treatmentMinutesCompliant).toBeGreaterThanOrEqual(13_700);
    expect(cherries.coldChain!.treatmentMinutesCompliant).toBeLessThanOrEqual(13_900);
  });
  it('cherries status is in_treatment', () => {
    expect(cherries.coldChain!.status).toBe('in_treatment');
  });
  it('grapes has refrigerated cold chain (sampled)', () => {
    expect(grapes.coldChain?.required).toBe(true);
    expect(grapes.coldChain?.status).toBe('in_treatment');
    expect(grapes.coldChain!.loggers[0]!.readings.length).toBeLessThanOrEqual(60);
  });
});

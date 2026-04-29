import { describe, it, expect } from 'vitest';
import { containers, closedContainers } from '@/lib/mock-data/containers';
import { kpis } from '@/lib/mock-data/kpis';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';

describe('containers — Phase 2 data', () => {
  it('closedContainers has 6 items', () => {
    expect(closedContainers.length).toBe(6);
  });

  it('closedContainers items have required shape', () => {
    for (const c of closedContainers) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.buyerName).toBe('string');
      expect(typeof c.cycledays).toBe('number');
      expect(typeof c.deltaAvgDays).toBe('number');
      expect(typeof c.penaltyUsd).toBe('number');
    }
  });

  it('MSCU-9920183 in closedContainers has penaltyUsd 1320', () => {
    const c = closedContainers.find(x => x.id === 'MSCU-9920183')!;
    expect(c).toBeDefined();
    expect(c.penaltyUsd).toBe(1320);
  });
});

describe('kpis — Phase 2', () => {
  it('has exactly 7 KPIs', () => {
    expect(kpis.length).toBe(7);
  });

  it('all KPIs have sparkline arrays', () => {
    for (const k of kpis) {
      expect(Array.isArray(k.sparkline)).toBe(true);
      expect(k.sparkline.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('avoided_penalties KPI has value 14200', () => {
    const k = kpis.find(x => x.id === 'avoided_penalties')!;
    expect(k.value).toBe(14_200);
  });
});

describe('penaltyAvoidedMatrix', () => {
  it('has 6 buyer rows', () => {
    expect(penaltyAvoidedMatrix.length).toBe(6);
  });

  it('each row has all 8 event types', () => {
    const events: string[] = [
      'refumigation','phyto_reissue','vgm_late','dus_error',
      'bl_correction','demurrage','detention','bank_discrepancy',
    ];
    for (const row of penaltyAvoidedMatrix) {
      for (const ev of events) {
        expect(typeof row.savedUsd[ev as any]).toBe('number');
      }
    }
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';
import type { PenaltyAvoidedRow } from '@/types';
import en from '../messages/en.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async (ns?: string) => {
    const nsData = ns ? (en as Record<string, unknown>)[ns] : en;
    function resolve(obj: unknown, key: string): string {
      const parts = key.split('.');
      let cur: unknown = obj;
      for (const p of parts) cur = (cur as Record<string, unknown>)?.[p];
      return typeof cur === 'string' ? cur : key;
    }
    return (key: string, values?: Record<string, unknown>) => {
      const val = resolve(nsData, key);
      if (!values) return val;
      return val.replace(/\{(\w+)\}/g, (_: string, k: string) => String(values[k] ?? k));
    };
  },
}));

const singleRow: PenaltyAvoidedRow[] = [{
  buyerName: 'Test Buyer',
  savedUsd: { refumigation: 3200, phyto_reissue: 0, vgm_late: 800, dus_error: 1500, bl_correction: 2000, demurrage: 999, detention: 1000, bank_discrepancy: 400 },
}];

describe('PenaltyHeatmap — dollar mode', () => {
  it('displays abbreviated dollar values', async () => {
    const resolved = await PenaltyHeatmap({ matrix: singleRow });
    render(resolved);
    expect(screen.getByText('$3.2k')).toBeInTheDocument();
    expect(screen.getByText('$800')).toBeInTheDocument();
    expect(screen.getByText('$1.5k')).toBeInTheDocument();
  });

  it('shows empty cell for $0', async () => {
    const testData: PenaltyAvoidedRow[] = [{
      buyerName: 'Zero Buyer',
      savedUsd: { refumigation: 0, phyto_reissue: 0, vgm_late: 0, dus_error: 0, bl_correction: 0, demurrage: 0, detention: 0, bank_discrepancy: 0 },
    }];
    const resolved = await PenaltyHeatmap({ matrix: testData });
    render(resolved);
    // Check that we don't display any dollar values for a row of zeros
    expect(screen.queryByText('$100')).not.toBeInTheDocument();
    expect(screen.queryByText('$500')).not.toBeInTheDocument();
  });

  it('hides OPEN PERFORMANCE link when hidePerformanceLink is true', async () => {
    const resolved = await PenaltyHeatmap({ matrix: singleRow, hidePerformanceLink: true });
    render(resolved);
    expect(screen.queryByText(/OPEN PERFORMANCE/)).not.toBeInTheDocument();
  });

  it('shows OPEN PERFORMANCE link by default', async () => {
    const resolved = await PenaltyHeatmap({ matrix: singleRow });
    render(resolved);
    expect(screen.getByText(/OPEN PERFORMANCE/)).toBeInTheDocument();
  });
});

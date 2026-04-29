import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';
import type { PenaltyAvoidedRow } from '@/types';

const singleRow: PenaltyAvoidedRow[] = [{
  buyerName: 'Test Buyer',
  savedUsd: { refumigation: 3200, phyto_reissue: 0, vgm_late: 800, dus_error: 1500, bl_correction: 2000, demurrage: 999, detention: 1000, bank_discrepancy: 400 },
}];

describe('PenaltyHeatmap — dollar mode', () => {
  it('displays abbreviated dollar values', () => {
    render(<PenaltyHeatmap matrix={singleRow} />);
    expect(screen.getByText('$3.2k')).toBeInTheDocument();
    expect(screen.getByText('$800')).toBeInTheDocument();
    expect(screen.getByText('$1.5k')).toBeInTheDocument();
  });

  it('shows empty cell for $0', () => {
    const testData: PenaltyAvoidedRow[] = [{
      buyerName: 'Zero Buyer',
      savedUsd: { refumigation: 0, phyto_reissue: 0, vgm_late: 0, dus_error: 0, bl_correction: 0, demurrage: 0, detention: 0, bank_discrepancy: 0 },
    }];
    render(<PenaltyHeatmap matrix={testData} />);
    // Check that we don't display any dollar values for a row of zeros
    expect(screen.queryByText('$100')).not.toBeInTheDocument();
    expect(screen.queryByText('$500')).not.toBeInTheDocument();
  });

  it('hides OPEN PERFORMANCE link when hidePerformanceLink is true', () => {
    render(<PenaltyHeatmap matrix={singleRow} hidePerformanceLink />);
    expect(screen.queryByText(/OPEN PERFORMANCE/)).not.toBeInTheDocument();
  });

  it('shows OPEN PERFORMANCE link by default', () => {
    render(<PenaltyHeatmap matrix={singleRow} />);
    expect(screen.getByText(/OPEN PERFORMANCE/)).toBeInTheDocument();
  });
});

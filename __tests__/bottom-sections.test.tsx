import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { closedContainers } from '@/lib/mock-data/containers';
import { penaltyAvoidedMatrix } from '@/lib/mock-data/penalty-events';
import { ClosedTable } from '@/components/dashboard/ClosedTable';
import { PenaltyHeatmap } from '@/components/dashboard/PenaltyHeatmap';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ClosedTable', () => {
  it('renders 6 data rows', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    expect(screen.getAllByTestId('closed-row').length).toBe(6);
  });

  it('renders positive deltaAvgDays in watch color', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    // MSCU-9920183 has deltaAvgDays: 9 (slower than avg = watch)
    const frutimar = screen.getByTestId('delta-MSCU-9920183');
    expect(frutimar.className).toMatch(/watch/);
  });

  it('renders negative deltaAvgDays in ok (mint) color', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    // MSCU-1102934 has deltaAvgDays: -4
    const pacific = screen.getByTestId('delta-MSCU-1102934');
    expect(pacific.className).toMatch(/ok|mint/);
  });

  it('renders penaltyUsd > 0 in crit color', () => {
    render(wrap(<ClosedTable rows={closedContainers} />));
    const penalty = screen.getByTestId('penalty-MSCU-9920183');
    expect(penalty.className).toMatch(/crit/);
  });
});

describe('PenaltyHeatmap', () => {
  it('renders 6 buyer rows', () => {
    render(wrap(<PenaltyHeatmap matrix={penaltyAvoidedMatrix} />));
    expect(screen.getAllByTestId('heatmap-row').length).toBe(6);
  });

  it('renders 8 column headers', () => {
    render(wrap(<PenaltyHeatmap matrix={penaltyAvoidedMatrix} />));
    expect(screen.getAllByTestId('heatmap-col-header').length).toBe(8);
  });
});

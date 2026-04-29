import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { containers } from '@/lib/mock-data/containers';
import { documents } from '@/lib/mock-data/documents';
import { importers } from '@/lib/mock-data/importers';
import { ReadinessStrip } from '@/components/dashboard/ReadinessStrip';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

describe('ReadinessStrip', () => {
  it('renders 6 mini-cards for containers with ETD in T-7→T0 window', () => {
    render(wrap(<ReadinessStrip containers={containers} documents={documents} importers={importers} />));
    expect(screen.getAllByTestId('ready-mini').length).toBe(6);
  });

  it('each mini-card has exactly 15 readiness cells', () => {
    render(wrap(<ReadinessStrip containers={containers} documents={documents} importers={importers} />));
    const allCells = screen.getAllByTestId('ready-cell');
    // 6 cards × 15 cells = 90
    expect(allCells.length).toBe(90);
  });

  it('shows readiness % per card', () => {
    render(wrap(<ReadinessStrip containers={containers} documents={documents} importers={importers} />));
    const pcts = screen.getAllByTestId('ready-pct');
    expect(pcts.length).toBe(6);
    for (const p of pcts) {
      expect(p.textContent).toMatch(/\d+%/);
    }
  });
});

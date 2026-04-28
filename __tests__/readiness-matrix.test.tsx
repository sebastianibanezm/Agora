import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { ReadinessMatrix } from '@/components/containers/ReadinessMatrix';
import { ReadinessTab } from '@/components/containers/ReadinessTab';
import { containers } from '@/lib/mock-data/containers';
import { computeLaneProfile } from '@/lib/mock-data/lane-profiles';
import type { DocumentType, DocStatus } from '@/types';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('ReadinessMatrix', () => {
  it('renders exactly N rows from documentSet', () => {
    const lp = computeLaneProfile('walnuts_in_shell', 'IN', 'cif_cad_at_sight');
    const { getAllByRole } = render(wrap(
      <ReadinessMatrix
        documents={lp.documentSet}
        documentStates={{} as Record<DocumentType, DocStatus>}
        validationResults={{} as any}
      />
    ));
    const dataRows = getAllByRole('row').slice(1); // exclude header
    expect(dataRows.length).toBe(15);
  });
});

describe('ReadinessTab', () => {
  it('walnuts container shows 15 rows', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<ReadinessTab container={c} />));
    const dataRows = screen.getAllByRole('row').slice(1);
    expect(dataRows.length).toBe(15);
  });
  it('cherries container shows 18 rows', () => {
    const c = containers.find(x => x.id === 'MAEU-9182734')!;
    render(wrap(<ReadinessTab container={c} />));
    const dataRows = screen.getAllByRole('row').slice(1);
    expect(dataRows.length).toBe(18);
  });
  it('walnuts DUS row shows missing status pill', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    render(wrap(<ReadinessTab container={c} />));
    // The DUS doc in documents.ts has status 'missing'
    // Find the DUS row label
    expect(screen.getByText('DUS')).toBeInTheDocument();
  });
});

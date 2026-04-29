import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { ProducerSpecificSections } from '@/components/entity-fiche/ProducerSpecificSections';
import { producers } from '@/lib/mock-data/producers';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

const kpis = [
  { label: 'Volume', value: '720k', sub: 'kg' },
  { label: 'PO Value', value: '$1.2M', sub: 'USD' },
  { label: 'Containers', value: '4', sub: '' },
  { label: 'Avg Payment', value: '12d', sub: '' },
];

describe('EntityFiche shell', () => {
  it('renders entity name in header', () => {
    render(wrap(
      <EntityFiche name="Dragon Imports Ltd." pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <div>entity content</div>
      </EntityFiche>
    ));
    expect(screen.getByText('Dragon Imports Ltd.')).toBeInTheDocument();
  });

  it('renders injected children', () => {
    render(wrap(
      <EntityFiche name="Test Entity" pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <div data-testid="custom-section">custom</div>
      </EntityFiche>
    ));
    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
  });

  it('renders KPI labels', () => {
    render(wrap(
      <EntityFiche name="X" pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <></>
      </EntityFiche>
    ));
    expect(screen.getByText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Avg Payment')).toBeInTheDocument();
  });
});

describe('EntityFiche with ProducerSpecificSections', () => {
  it('renders without errors with producer children', () => {
    const prod = producers[0]!;
    render(wrap(
      <EntityFiche name={prod.name} pills={[]} kpis={[
        { label: 'A', value: '1', sub: '' },
        { label: 'B', value: '2', sub: '' },
        { label: 'C', value: '3', sub: '' },
        { label: 'D', value: '4', sub: '' },
      ]} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <ProducerSpecificSections producer={prod} />
      </EntityFiche>
    ));
    expect(screen.getByText(prod.name)).toBeInTheDocument();
  });

  it('renders SAG certifications list', () => {
    const prod = producers[0]!;
    render(wrap(<ProducerSpecificSections producer={prod} />));
    prod.sagCertifications.forEach(cert => {
      expect(screen.getByText(cert.name)).toBeInTheDocument();
    });
  });
});

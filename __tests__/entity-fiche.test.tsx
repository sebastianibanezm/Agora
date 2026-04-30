import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { ProducerSpecificSections } from '@/components/entity-fiche/ProducerSpecificSections';
import { producers } from '@/lib/mock-data/producers';

// RelationshipHistory is an async RSC — stub it so EntityFiche (sync) can render in jsdom
vi.mock('@/components/entity-fiche/RelationshipHistory', () => ({
  RelationshipHistory: () => <div data-testid="relationship-history" />,
}));

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
  it('renders entity name in header', async () => {
    render(wrap(
      <EntityFiche name="Dragon Imports Ltd." pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <div>entity content</div>
      </EntityFiche>
    ));
    expect(screen.getByText('Dragon Imports Ltd.')).toBeInTheDocument();
  });

  it('renders injected children', async () => {
    render(wrap(
      <EntityFiche name="Test Entity" pills={[]} kpis={kpis} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        <div data-testid="custom-section">custom</div>
      </EntityFiche>
    ));
    expect(screen.getByTestId('custom-section')).toBeInTheDocument();
  });

  it('renders KPI labels', async () => {
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
  it('renders without errors with producer children', async () => {
    const prod = producers[0]!;
    const sections = await ProducerSpecificSections({ producer: prod });
    render(wrap(
      <EntityFiche name={prod.name} pills={[]} kpis={[
        { label: 'A', value: '1', sub: '' },
        { label: 'B', value: '2', sub: '' },
        { label: 'C', value: '3', sub: '' },
        { label: 'D', value: '4', sub: '' },
      ]} pos={[]} containers={[]} poColumns={[]} containerColumns={[]}>
        {sections}
      </EntityFiche>
    ));
    expect(screen.getByText(prod.name)).toBeInTheDocument();
  });

  it('renders SAG certifications list', async () => {
    const prod = producers[0]!;
    render(wrap(await ProducerSpecificSections({ producer: prod })));
    prod.sagCertifications.forEach(cert => {
      expect(screen.getByText(cert.name)).toBeInTheDocument();
    });
  });
});

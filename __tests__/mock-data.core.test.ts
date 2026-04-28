import { describe, it, expect } from 'vitest';
import { containers } from '@/lib/mock-data/containers';
import { agents } from '@/lib/mock-data/agents';
import { importers } from '@/lib/mock-data/importers';
import { producers } from '@/lib/mock-data/producers';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';

describe('core mock data', () => {
  it('has 3 hero containers with required IDs', () => {
    const ids = containers.map(c => c.id);
    expect(ids).toEqual(expect.arrayContaining(['MSCU-7842156','MAEU-9182734','CMAU-9281744']));
  });
  it('walnuts hero MSCU-7842156 is dry, CAD at sight, IN', () => {
    const c = containers.find(x => x.id === 'MSCU-7842156')!;
    expect(c.productId).toBe('walnuts_in_shell');
    expect(c.commercialId).toBe('cif_cad_at_sight');
    expect(c.market).toBe('IN');
    expect(c.coldChain).toBeUndefined();
  });
  it('cherries hero MAEU-9182734 is reefer, L/C at sight, CN', () => {
    const c = containers.find(x => x.id === 'MAEU-9182734')!;
    expect(c.productId).toBe('fresh_cherries');
    expect(c.commercialId).toBe('cif_lc_at_sight');
    expect(c.market).toBe('CN');
  });
  it('agents catalog has exactly 25 agents', () => {
    expect(agents.length).toBe(25);
  });
  it('agents catalog includes 6 cold-chain sentinels', () => {
    expect(agents.filter(a => a.tags.includes('cold_chain')).length).toBeGreaterThanOrEqual(6);
  });
  it('importers, producers, POs are referentially intact', () => {
    const impIds = new Set(importers.map(i => i.id));
    const prodIds = new Set(producers.map(p => p.id));
    const poIds = new Set(purchaseOrders.map(p => p.id));
    for (const c of containers) {
      expect(impIds.has(c.importerId)).toBe(true);
      expect(prodIds.has(c.producerId)).toBe(true);
      expect(poIds.has(c.purchaseOrderId)).toBe(true);
    }
  });
});

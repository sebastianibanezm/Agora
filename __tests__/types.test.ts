import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  Container, ColdChainTrace, LaneProfile, ProductId, IncotermPaymentId,
  ProductProfile, MarketProfileExtended, CommercialProfile, DocumentRequirement,
  Agent, Alert, Validation, PurchaseOrder, Importer, Producer, KPI, PenaltyEvent,
  DataLogger, CaReading, ExcursionEvent, PreCoolingRecord, ReeferPtiRecord, ColdTreatmentProtocol,
} from '@/types';

describe('types', () => {
  it('ProductId union has all 7 product values', () => {
    const ids: ProductId[] = [
      'walnuts_in_shell','walnut_kernels','almonds_in_shell',
      'fresh_cherries','fresh_blueberries','table_grapes_red','table_grapes_white',
    ];
    expect(ids.length).toBe(7);
  });
  it('IncotermPaymentId union has all 6 commercial profile values', () => {
    const ids: IncotermPaymentId[] = [
      'cif_cad_at_sight','cif_lc_at_sight','cif_lc_60',
      'cif_open_account_30','fob_open_account_30','dap_open_account',
    ];
    expect(ids.length).toBe(6);
  });
  it('Container has Patch 01 fields', () => {
    expectTypeOf<Container['productId']>().toEqualTypeOf<ProductId>();
    expectTypeOf<Container['commercialId']>().toEqualTypeOf<IncotermPaymentId>();
    expectTypeOf<Container['laneProfileId']>().toEqualTypeOf<string>();
    expectTypeOf<Container['coldChain']>().toEqualTypeOf<ColdChainTrace | undefined>();
  });
  it('ColdChainTrace.status is the documented union', () => {
    expectTypeOf<ColdChainTrace['status']>().toEqualTypeOf<'pre_load' | 'in_treatment' | 'completed' | 'breached'>();
  });
  it('LaneProfile has documentSet array and composed fields', () => {
    expectTypeOf<LaneProfile['documentSet']>().toEqualTypeOf<DocumentRequirement[]>();
  });
});

import type { PurchaseOrder } from '@/types';

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2026-0142',
    importerId: 'IMP-IN-MUMBAI',
    productId: 'walnuts_in_shell',
    quantityKg: 24_500,
    incotermPaymentId: 'cif_cad_at_sight',
    valueUsd: 142_500,
    issuedAt: '2026-11-15T00:00:00-04:00',
    deliveryWindow: { from: '2027-02-01T00:00:00+05:30', to: '2027-02-28T00:00:00+05:30' },
    containerIds: ['MSCU-7842156'],
  },
  {
    id: 'PO-2026-0157',
    importerId: 'IMP-CN-DRAGON',
    productId: 'fresh_cherries',
    quantityKg: 22_800,
    incotermPaymentId: 'cif_lc_at_sight',
    valueUsd: 215_000,
    issuedAt: '2026-11-20T00:00:00-04:00',
    deliveryWindow: { from: '2027-01-20T00:00:00+08:00', to: '2027-02-05T00:00:00+08:00' },
    containerIds: ['MAEU-9182734'],
  },
  {
    id: 'PO-2026-0163',
    importerId: 'IMP-CN-EAST',
    productId: 'table_grapes_red',
    quantityKg: 23_400,
    incotermPaymentId: 'cif_lc_60',
    valueUsd: 168_000,
    issuedAt: '2026-11-28T00:00:00-04:00',
    deliveryWindow: { from: '2027-02-01T00:00:00+08:00', to: '2027-02-20T00:00:00+08:00' },
    containerIds: ['CMAU-9281744'],
  },
];

'use client';

import { useState } from 'react';
import type { PurchaseOrder, Importer } from '@/types';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  draft: '#64748b', confirmed: '#3B82F6', in_fulfillment: '#00E696',
  delivered: '#8B5CF6', cancelled: '#EF4444',
};

interface Props {
  purchaseOrders: PurchaseOrder[];
  importers: Importer[];
}

export function POListTable({ purchaseOrders, importers }: Props) {
  const [search, setSearch] = useState('');
  const imp = (id: string) => importers.find(i => i.id === id);

  const filtered = purchaseOrders.filter(po =>
    po.id.toLowerCase().includes(search.toLowerCase()) ||
    (imp(po.importerId)?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
    po.productId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input type="text" placeholder="Search POs…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '16px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ffffff18', background: '#1a1f2e', color: '#e2e8f0', fontSize: '13px', width: '280px' }} />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ color: '#64748b', borderBottom: '1px solid #ffffff12' }}>
            {['PO ID', 'Product', 'Importer', 'Status', 'Value USD', 'Date'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(po => (
            <tr key={po.id} style={{ borderBottom: '1px solid #ffffff08', color: '#e2e8f0' }}>
              <td style={{ padding: '10px 12px' }}>
                <Link href={`/purchase-orders/${po.id}`} style={{ color: '#00E696', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>{po.id}</Link>
              </td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{po.productId.replace(/_/g, ' ')}</td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{imp(po.importerId)?.name ?? po.importerId}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '10px', background: (STATUS_COLORS[po.status] ?? '#64748b') + '22', color: STATUS_COLORS[po.status] ?? '#64748b', fontSize: '11px' }}>
                  {po.status}
                </span>
              </td>
              <td style={{ padding: '10px 12px', color: '#94a3b8' }}>${po.valueUsd.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(po.issuedAt).toLocaleDateString('es-CL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

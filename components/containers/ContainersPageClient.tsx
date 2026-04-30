'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Container, Importer } from '@/types';
import { ContainerKanban } from './ContainerKanban';
import { ContainerListTable } from './ContainerListTable';

interface Props {
  containers: Container[];
  importers: Importer[];
}

export function ContainersPageClient({ containers, importers }: Props) {
  const t = useTranslations('containers');
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const allProducts = useMemo(() =>
    [...new Set(containers.map(c => c.productId))].sort(),
    [containers],
  );
  const allMarkets = useMemo(() =>
    [...new Set(containers.map(c => c.market))].sort(),
    [containers],
  );

  const filtered = useMemo(() => containers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.id.toLowerCase().includes(q) ||
      c.productLabel.toLowerCase().includes(q) ||
      (importers.find(i => i.id === c.importerId)?.name.toLowerCase().includes(q) ?? false);
    const matchProduct = selectedProducts.length === 0 || selectedProducts.includes(c.productId);
    const matchMarket = selectedMarkets.length === 0 || selectedMarkets.includes(c.market);
    return matchSearch && matchProduct && matchMarket;
  }), [containers, importers, search, selectedProducts, selectedMarkets]);

  const toggleProduct = (p: string) =>
    setSelectedProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleMarket = (m: string) =>
    setSelectedMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ffffff18', background: '#1a1f2e', color: '#e2e8f0', fontSize: '13px', width: '220px' }}
        />

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {allProducts.map(p => (
            <button
              key={p}
              onClick={() => toggleProduct(p)}
              style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                border: '1px solid #ffffff18',
                background: selectedProducts.includes(p) ? '#00E69622' : 'transparent',
                color: selectedProducts.includes(p) ? '#00E696' : '#64748b',
              }}
            >
              {p.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {allMarkets.map(m => (
            <button
              key={m}
              onClick={() => toggleMarket(m)}
              style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                border: '1px solid #ffffff18',
                background: selectedMarkets.includes(m) ? '#F9731622' : 'transparent',
                color: selectedMarkets.includes(m) ? '#F97316' : '#64748b',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', border: '1px solid #ffffff18', borderRadius: '6px', overflow: 'hidden' }}>
          {(['kanban', 'table'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
                background: view === v ? '#ffffff18' : 'transparent',
                color: view === v ? '#e2e8f0' : '#64748b',
                border: 'none',
              }}
            >
              {v === 'kanban' ? t('viewKanban') : t('viewTable')}
            </button>
          ))}
        </div>
      </div>

      {view === 'kanban'
        ? <ContainerKanban containers={filtered} importers={importers} />
        : <ContainerListTable containers={filtered} importers={importers} />
      }
    </div>
  );
}

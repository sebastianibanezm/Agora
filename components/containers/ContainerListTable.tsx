'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Container, ContainerStatus, Importer } from '@/types';
import { STAGES } from '@/lib/containers';
import { formatUsd } from '@/lib/utils/currency';

export function ContainerListTable({ containers, importers: _importers }: { containers: Container[]; importers: Importer[] }) {
  const t = useTranslations('containers');
  const [collapsedStages, setCollapsedStages] = useState<Set<ContainerStatus>>(new Set());

  const toggle = (s: ContainerStatus) => setCollapsedStages(prev => {
    const next = new Set(prev);
    next.has(s) ? next.delete(s) : next.add(s);
    return next;
  });

  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-bg-2/50">
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('id')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('product')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('route')}</th>
            <th className="text-right px-4 py-3 text-ink-3 font-medium">{t('value')}</th>
          </tr>
        </thead>
        <tbody>
          {STAGES.map(stage => {
            const stageContainers = containers.filter(c => c.status === stage.status);
            if (stageContainers.length === 0) return null;
            const collapsed = collapsedStages.has(stage.status);
            return (
              <>
                <tr
                  key={`stage-${stage.status}`}
                  className="border-b border-white/10 bg-bg-2/30 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggle(stage.status)}
                >
                  <td colSpan={4} className="px-4 py-2">
                    <span className="flex items-center gap-2 text-xs font-semibold text-ink-3">
                      <span
                        style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stage.color, display: 'inline-block', flexShrink: 0 }}
                      />
                      {stage.label}
                      <span style={{ marginLeft: '4px', background: '#ffffff12', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', color: '#94a3b8' }}>
                        {stageContainers.length}
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#64748b' }}>
                        {collapsed ? '▶' : '▼'}
                      </span>
                    </span>
                  </td>
                </tr>
                {!collapsed && stageContainers.map(c => (
                  <tr key={c.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/containers/${c.id}`} className="font-mono text-mint-500 hover:text-mint-300 text-xs">
                        {c.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{c.productLabel}</td>
                    <td className="px-4 py-3 text-ink-3 font-mono text-xs">{c.polLabel} → {c.podLabel}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink-2">
                      {formatUsd(c.valueUsd, 'es')}
                    </td>
                  </tr>
                ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

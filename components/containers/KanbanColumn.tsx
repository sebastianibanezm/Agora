'use client';

import type { Container, ContainerStatus, Importer } from '@/types';
import { ContainerCard } from './ContainerCard';
import { useState } from 'react';

interface Props {
  status: ContainerStatus;
  label: string;
  color: string;
  containers: Container[];
  importers: Importer[];
  defaultCollapsed?: boolean;
}

export function KanbanColumn({ status: _status, label, color, containers, importers, defaultCollapsed = false }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const imp = (id: string) => importers.find(i => i.id === id);

  return (
    <div style={{ minWidth: '220px', flex: '0 0 220px' }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#e2e8f0',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        {label}
        <span style={{
          marginLeft: 'auto',
          background: '#ffffff12',
          borderRadius: '10px',
          padding: '1px 7px',
          fontSize: '11px',
          color: '#94a3b8',
        }}>
          {containers.length}
        </span>
      </button>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          {containers.map(c => {
            const importer = imp(c.importerId);
            if (!importer) return null;
            return <ContainerCard key={c.id} container={c} importer={importer} />;
          })}
          {containers.length === 0 && (
            <div style={{ fontSize: '11px', color: '#334155', textAlign: 'center', padding: '16px 0' }}>—</div>
          )}
        </div>
      )}
    </div>
  );
}

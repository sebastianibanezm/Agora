'use client';

import type { Container, Importer } from '@/types';
import { STAGES } from '@/lib/containers';
import { KanbanColumn } from './KanbanColumn';

interface Props {
  containers: Container[];
  importers: Importer[];
}

export function ContainerKanban({ containers, importers }: Props) {
  return (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', alignItems: 'flex-start' }}>
      {STAGES.map(stage => (
        <KanbanColumn
          key={stage.status}
          status={stage.status}
          label={stage.label}
          color={stage.color}
          containers={containers.filter(c => c.status === stage.status)}
          importers={importers}
          defaultCollapsed={stage.status === 'closed'}
        />
      ))}
    </div>
  );
}

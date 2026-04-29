'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import { purchaseOrders } from '@/lib/mock-data/purchase-orders'
import { importers } from '@/lib/mock-data/importers'
import type { ShipmentDocument, WorkflowDocType, WorkflowDocStatus } from '@/types'
import { DocumentRow } from './DocumentRow'
import { DocumentDetailModal } from './DocumentDetailModal'

interface Props {
  typeFilter: WorkflowDocType | null
  statusFilter: WorkflowDocStatus | null
}

export function DocumentsList({ typeFilter, statusFilter }: Props) {
  const t = useTranslations('documents')
  const [selected, setSelected] = useState<ShipmentDocument | null>(null)

  const filtered = shipmentDocuments.filter(d => {
    if (typeFilter && d.type !== typeFilter) return false
    if (statusFilter && d.status !== statusFilter) return false
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-ink-4 text-[12px]">{t('noDocumentsOfType')}</p>
      </div>
    )
  }

  // Group by PO
  const poGroups = new Map<string, { po: typeof purchaseOrders[0]; docs: ShipmentDocument[]; containerGroups: Map<string, ShipmentDocument[]> }>()

  for (const doc of filtered) {
    const poId = doc.owner.type === 'po' ? doc.owner.id : doc.links.find(l => l.type === 'po')?.id
    if (!poId) continue

    if (!poGroups.has(poId)) {
      const po = purchaseOrders.find(p => p.id === poId)
      if (!po) continue
      poGroups.set(poId, { po, docs: [], containerGroups: new Map() })
    }
    const group = poGroups.get(poId)!

    if (doc.owner.type === 'po') {
      group.docs.push(doc)
    } else {
      const cid = doc.owner.id
      if (!group.containerGroups.has(cid)) group.containerGroups.set(cid, [])
      group.containerGroups.get(cid)!.push(doc)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {[...poGroups.entries()].map(([poId, { po, docs, containerGroups }]) => {
        const importer = importers.find(i => i.id === po.importerId)
        return (
          <div key={poId} className="mb-6">
            {/* PO Group header */}
            <div
              className="flex items-center gap-2 mb-3 pb-2 text-[10px]"
              style={{ borderBottom: '1px solid var(--line-soft)' }}
            >
              <span className="font-mono font-semibold text-sky-300">{poId}</span>
              <span className="text-ink-4">·</span>
              <span className="text-ink-2">{importer?.name ?? '—'}</span>
              <span className="text-ink-4">·</span>
              <span className="text-ink-4">{po.productId.replace(/_/g, ' ')}</span>
            </div>

            {/* PO-owned docs */}
            {docs.length > 0 && (
              <div className="mb-3">
                <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-1.5 ml-0.5">
                  {t('section.poDocuments')}
                </div>
                <DocTable docs={docs} t={t} onSelect={setSelected} />
              </div>
            )}

            {/* Container sub-groups */}
            {[...containerGroups.entries()].map(([cid, cdocs]) => (
              <div key={cid} className="ml-4 mb-3">
                <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-1.5">↳ {cid}</div>
                <DocTable
                  docs={cdocs}
                  t={t}
                  onSelect={setSelected}
                />
              </div>
            ))}
          </div>
        )
      })}

      {selected && (
        <DocumentDetailModal doc={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function DocTable({
  docs,
  t,
  onSelect,
  provenance,
}: {
  docs: ShipmentDocument[]
  t: (k: string) => string
  onSelect: (d: ShipmentDocument) => void
  provenance?: string
}) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--line-soft)' }}>
      <table className="w-full" role="table">
        <thead>
          <tr style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--line-soft)' }}>
            {(['table.document', 'table.type', 'table.status', 'table.issued', 'table.due'] as const).map(k => (
              <th key={k} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider text-ink-4 font-medium">
                {t(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              provenance={provenance}
              statusLabel={t(`statuses.${doc.status}`)}
              typeLabel={t(`types.${doc.type}`)}
              onClick={() => onSelect(doc)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

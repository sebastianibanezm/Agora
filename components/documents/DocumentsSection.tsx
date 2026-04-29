'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import type { ShipmentDocument, WorkflowDocStatus } from '@/types'
import { DocumentRow } from '@/app/documents/components/DocumentRow'
import { DocumentDetailModal } from '@/app/documents/components/DocumentDetailModal'

interface Props {
  ownerId: string
  ownerType: 'po' | 'container'
  perspective: 'po' | 'container'
}

const STATUS_COLORS: Record<WorkflowDocStatus, string> = {
  draft: '#475063', submitted: '#3B82F6', validating: '#F59E0B',
  under_review: '#F97316', approved: '#00E696', rejected: '#EF4444',
}

export function DocumentsSection({ ownerId, ownerType, perspective }: Props) {
  const t = useTranslations('documents')
  const [selected, setSelected] = useState<ShipmentDocument | null>(null)

  const owned = shipmentDocuments.filter(d => d.owner.type === ownerType && d.owner.id === ownerId)
  const crossSurfaced = shipmentDocuments.filter(d =>
    d.owner.type !== ownerType &&
    d.links.some(l => l.type === ownerType && l.id === ownerId)
  )
  const all = [...owned, ...crossSurfaced]

  const counts = {
    approved:   all.filter(d => d.status === 'approved').length,
    validating: all.filter(d => d.status === 'validating').length,
    rejected:   all.filter(d => d.status === 'rejected').length,
    draft:      all.filter(d => d.status === 'draft').length,
  }

  if (all.length === 0) return null

  const ownedLabel = perspective === 'po' ? t('section.poDocuments') : t('section.containerDocuments')

  // Group cross-surfaced by their owner
  const linkedGroups = new Map<string, ShipmentDocument[]>()
  for (const doc of crossSurfaced) {
    const key = doc.owner.id
    if (!linkedGroups.has(key)) linkedGroups.set(key, [])
    linkedGroups.get(key)!.push(doc)
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[15px] font-semibold text-ink-1">{t('title')}</h2>
        <div className="flex gap-1.5">
          {counts.approved > 0 && <Pill n={counts.approved} color="#00E696" label={t('statuses.approved')} />}
          {counts.validating > 0 && <Pill n={counts.validating} color="#F59E0B" label={t('statuses.validating')} />}
          {counts.rejected > 0 && <Pill n={counts.rejected} color="#EF4444" label={t('statuses.rejected')} />}
          {counts.draft > 0 && <Pill n={counts.draft} color="#475063" label={t('statuses.draft')} />}
        </div>
      </div>

      {/* Owned documents */}
      {owned.length > 0 && (
        <div className="mb-4">
          <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-2">{ownedLabel}</div>
          <DocTable docs={owned} t={t} onSelect={setSelected} />
        </div>
      )}

      {/* Cross-surfaced groups */}
      {[...linkedGroups.entries()].map(([groupId, docs]) => (
        <div key={groupId} className="mb-4 ml-4">
          <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-2">
            ↳ {groupId} · {docs[0]?.name}
          </div>
          <DocTable
            docs={docs}
            t={t}
            onSelect={setSelected}
            provenancePrefix="de"
            provenanceId={groupId}
          />
        </div>
      ))}

      {selected && (
        <DocumentDetailModal doc={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}

function Pill({ n, color, label }: { n: number; color: string; label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color, background: color + '22' }}>
      {n} {label}
    </span>
  )
}

function DocTable({
  docs,
  t,
  onSelect,
  provenancePrefix,
  provenanceId,
}: {
  docs: ShipmentDocument[]
  t: (k: string) => string
  onSelect: (d: ShipmentDocument) => void
  provenancePrefix?: string
  provenanceId?: string
}) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--line-soft)' }}>
      <table className="w-full">
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
              provenance={provenancePrefix && provenanceId ? `${provenancePrefix} ${provenanceId}` : undefined}
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

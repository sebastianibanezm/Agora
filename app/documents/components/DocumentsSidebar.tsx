'use client'

import { useTranslations } from 'next-intl'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import type { DocumentCategory, WorkflowDocType } from '@/types'

const CATEGORIES: { key: DocumentCategory; types: WorkflowDocType[] }[] = [
  { key: 'commercial',    types: ['commercial_invoice', 'packing_list', 'lc_compliance_letter'] },
  { key: 'transport',     types: ['bill_of_lading'] },
  { key: 'phytosanitary', types: ['sag_export_auth', 'cold_treatment_cert'] },
  { key: 'customs',       types: ['certificate_of_origin', 'dus'] },
]

interface Props {
  selected: WorkflowDocType | null
  onSelect: (t: WorkflowDocType | null) => void
}

export function DocumentsSidebar({ selected, onSelect }: Props) {
  const t = useTranslations('documents')
  const total = shipmentDocuments.length

  const countFor = (type: WorkflowDocType) => shipmentDocuments.filter(d => d.type === type).length
  const hasWarning = (type: WorkflowDocType) =>
    shipmentDocuments.some(d => d.type === type && (d.status === 'rejected' || (d.dueDate && new Date(d.dueDate) < new Date())))

  return (
    <nav className="w-48 shrink-0 py-4" style={{ borderRight: '1px solid var(--line-soft)' }}>
      <div className="px-3.5 pb-2.5 text-[9px] uppercase tracking-widest text-ink-4">
        {t('title')}
      </div>
      {/* All */}
      <button
        onClick={() => onSelect(null)}
        className="w-full flex justify-between items-center px-3.5 py-1.5 text-[11px]"
        style={{
          color: selected === null ? '#00E696' : '#A8B3C7',
          background: selected === null ? 'rgba(0,230,150,0.08)' : 'transparent',
          borderLeft: selected === null ? '2px solid #00E696' : '2px solid transparent',
        }}
      >
        <span>{t('all')}</span>
        <span className="text-ink-4 text-[10px]">{total}</span>
      </button>

      {CATEGORIES.map(cat => (
        <div key={cat.key} className="mt-3">
          <div className="px-3.5 pb-1 text-[9px] uppercase tracking-wider text-ink-4">
            {t(`categories.${cat.key}`)}
          </div>
          {cat.types.map(type => {
            const count = countFor(type)
            const warn = hasWarning(type)
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="w-full flex justify-between items-center px-3.5 py-1 text-[11px] hover:text-ink-1"
                style={{ color: selected === type ? '#F4F6FA' : '#A8B3C7' }}
              >
                <span>{t(`types.${type}`)}</span>
                <span style={{ color: warn ? '#EF4444' : '#475063' }} className="text-[10px]">
                  {warn ? `${count} !` : count}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

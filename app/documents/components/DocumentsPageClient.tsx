'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { WorkflowDocType, WorkflowDocStatus } from '@/types'
import { DocumentsSidebar } from './DocumentsSidebar'
import { DocumentsList } from './DocumentsList'
import { UploadDocumentModal } from './UploadDocumentModal'

const ALL_DOC_STATUSES: WorkflowDocStatus[] = [
  'draft', 'submitted', 'validating', 'under_review', 'approved', 'rejected',
]

interface Props {
  title: string
  uploadLabel: string
}

export function DocumentsPageClient({ title, uploadLabel }: Props) {
  const t = useTranslations('documents')
  const [typeFilter, setTypeFilter] = useState<WorkflowDocType | null>(null)
  const [statusFilter, setStatusFilter] = useState<WorkflowDocStatus | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="flex h-full min-h-0">
      <DocumentsSidebar selected={typeFilter} onSelect={setTypeFilter} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page header */}
        <div
          className="flex justify-between items-center px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--line-soft)' }}
        >
          <h1 className="text-[13px] font-semibold text-ink-1">{title}</h1>
          <div className="flex items-center gap-3">
            {/* Status filter dropdown */}
            <select
              value={statusFilter ?? ''}
              onChange={e => setStatusFilter(e.target.value as WorkflowDocStatus || null)}
              className="text-[11px] px-2.5 py-1.5 rounded text-ink-2"
              style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}
            >
              <option value="">{t('all')}</option>
              {ALL_DOC_STATUSES.map(s => (
                <option key={s} value={s}>{t(`statuses.${s}`)}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="text-[11px] px-3 py-1.5 rounded"
              style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
            >
              + {uploadLabel}
            </button>
          </div>
        </div>
        <DocumentsList typeFilter={typeFilter} statusFilter={statusFilter} />
      </div>

      {showUpload && (
        <UploadDocumentModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}

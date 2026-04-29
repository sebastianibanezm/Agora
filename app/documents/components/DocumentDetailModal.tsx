'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ShipmentDocument, WorkflowDocStatus, ShipmentDocEvent } from '@/types'
import { getNextStatus } from '@/lib/documents/workflow'
import { DocumentOverview } from './DocumentOverview'
import { DocumentFlags } from './DocumentFlags'
import { DocumentTimeline } from './DocumentTimeline'

interface Props {
  doc: ShipmentDocument
  onClose: () => void
}

export function DocumentDetailModal({ doc, onClose }: Props) {
  const t = useTranslations('documents')
  const [status, setStatus] = useState<WorkflowDocStatus>(doc.status)
  const [events, setEvents] = useState<ShipmentDocEvent[]>(doc.events)

  function transition(action: 'submit' | 'approve' | 'reject' | 'reopen') {
    const next = getNextStatus(status, action)
    if (next === status) return
    const event: ShipmentDocEvent = {
      status: next,
      actor: 'user',
      actorName: 'María José Soto',
      timestamp: new Date().toISOString(),
    }
    setStatus(next)
    setEvents(prev => [...prev, event])
  }

  const statusLabel = (s: string) => t(`statuses.${s}`)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,10,18,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden"
        style={{ background: 'var(--color-bg-1)', border: '1px solid var(--line-soft)' }}
        role="dialog"
        aria-label={doc.name}
      >
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div
            className="px-5 py-4 shrink-0"
            style={{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--line-soft)' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[15px] font-semibold text-ink-1 mb-1">{doc.name}</div>
                <div className="flex gap-2 items-center flex-wrap text-[10px]">
                  {doc.links.map(l => (
                    <span
                      key={l.id}
                      className="font-mono px-1.5 py-0.5 rounded"
                      style={{ color: '#7DD3FC', background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.2)' }}
                    >
                      {l.label}
                    </span>
                  ))}
                  <span className="text-ink-3">{t(`categories.${doc.category}`)}</span>
                  <span className="font-mono text-ink-4">{new Date(doc.createdAt).toLocaleDateString('es-CL')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <StatusBadge status={status} label={statusLabel(status)} />
                <button onClick={onClose} className="text-ink-4 hover:text-ink-2 text-lg leading-none">×</button>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line-soft)' }}>
            <div className="text-[9px] uppercase tracking-widest text-ink-4 mb-3">{t('modal.overview')}</div>
            <DocumentOverview overview={doc.overview} />
          </div>

          {/* Flags */}
          {doc.flags.length > 0 && (
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line-soft)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-[9px] uppercase tracking-widest text-ink-4">{t('modal.flags')}</div>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ color: '#EF4444', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {doc.flags.length}
                </span>
              </div>
              <DocumentFlags flags={doc.flags} typeLabel={(type) => t(`types.${type}`)} />
            </div>
          )}

          {/* Document preview */}
          <div className="px-5 py-4 flex-1">
            <div className="text-[9px] uppercase tracking-widest text-ink-4 mb-3">{t('modal.document')}</div>
            <div
              className="rounded-md p-6"
              style={{ background: 'var(--color-bg-0)', border: '1px solid var(--line-soft)' }}
            >
              <div className="text-[11px] font-semibold text-ink-1 mb-1">{doc.name.toUpperCase()}</div>
              <div className="font-mono text-[9px] text-ink-4 mb-4">{doc.id}</div>
              <div className="space-y-2 mb-4">
                {Object.entries(doc.overview).slice(0, 4).map(([k]) => (
                  <div key={k} className="h-2 rounded" style={{ background: 'var(--color-bg-3)', width: `${60 + Math.random() * 30}%` }} />
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="text-[9px] px-2.5 py-1.5 rounded text-ink-2" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}>
                  {t('modal.download')}
                </button>
                <button className="text-[9px] px-2.5 py-1.5 rounded text-ink-2" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}>
                  {t('modal.replace')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-64 shrink-0 flex flex-col" style={{ background: 'var(--color-bg-2)', borderLeft: '1px solid var(--line-soft)' }}>
          <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--line-soft)' }}>
            <div className="text-[12px] font-semibold text-ink-1">{t('modal.activity')}</div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <DocumentTimeline events={events} currentStatus={status} statusLabel={statusLabel} />
          </div>
          <ActionStrip status={status} onTransition={transition} t={t} />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: WorkflowDocStatus; label: string }) {
  const COLOR: Record<string, string> = {
    draft: '#475063', submitted: '#3B82F6', validating: '#F59E0B',
    under_review: '#F97316', approved: '#00E696', rejected: '#EF4444',
  }
  const c = COLOR[status] ?? '#475063'
  return (
    <span
      className="text-[10px] px-2 py-1 rounded"
      style={{ color: c, background: c + '22', border: `1px solid ${c}44` }}
    >
      {label}
    </span>
  )
}

function ActionStrip({
  status,
  onTransition,
  t,
}: {
  status: WorkflowDocStatus
  onTransition: (a: 'submit' | 'approve' | 'reject' | 'reopen') => void
  t: (k: string) => string
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--line-soft)' }}>
      {status === 'draft' && (
        <button
          onClick={() => onTransition('submit')}
          className="w-full text-[11px] py-1.5 rounded"
          style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
        >
          {t('modal.submit')}
        </button>
      )}
      {(status === 'submitted' || status === 'validating') && (
        <div className="text-center text-[10px] text-ink-4">{t('modal.processing')}</div>
      )}
      {status === 'under_review' && (
        <>
          <button
            onClick={() => onTransition('approve')}
            className="w-full text-[11px] py-1.5 rounded"
            style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
          >
            {t('modal.approve')}
          </button>
          <button
            onClick={() => onTransition('reject')}
            className="w-full text-[11px] py-1.5 rounded"
            style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            {t('modal.reject')}
          </button>
        </>
      )}
      {status === 'rejected' && (
        <button
          onClick={() => onTransition('reopen')}
          className="w-full text-[11px] py-1.5 rounded text-ink-2"
          style={{ background: 'var(--color-bg-3)', border: '1px solid var(--line-soft)' }}
        >
          {t('modal.reopen')}
        </button>
      )}
      {(status === 'approved' || status === 'rejected') && (
        <button className="text-center text-[10px] text-ink-4 hover:text-ink-2">
          {t('modal.addComment')}
        </button>
      )}
    </div>
  )
}

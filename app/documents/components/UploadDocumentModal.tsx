'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { purchaseOrders } from '@/lib/mock-data/purchase-orders'
import { containers } from '@/lib/mock-data/containers'
import type { WorkflowDocType, DocumentCategory } from '@/types'

const TYPE_OPTIONS: { category: DocumentCategory; types: WorkflowDocType[] }[] = [
  { category: 'commercial',    types: ['commercial_invoice', 'packing_list', 'lc_compliance_letter'] },
  { category: 'transport',     types: ['bill_of_lading'] },
  { category: 'phytosanitary', types: ['sag_export_auth', 'cold_treatment_cert'] },
  { category: 'customs',       types: ['certificate_of_origin', 'dus'] },
]

interface Props {
  onClose: () => void
  onSuccess: (docName: string) => void
}

type Step = 'file' | 'type' | 'owner' | 'links'

const STEP_ORDER: Step[] = ['file', 'type', 'owner', 'links']

export function UploadDocumentModal({ onClose, onSuccess }: Props) {
  const t = useTranslations('documents')
  const [step, setStep] = useState<Step>('file')
  const [fileName, setFileName] = useState('')
  const [docType, setDocType] = useState<WorkflowDocType | ''>('')
  const [ownerType, setOwnerType] = useState<'po' | 'container'>('po')
  const [ownerId, setOwnerId] = useState('')
  const [linkedIds, setLinkedIds] = useState<string[]>([])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? '')
  }

  function toggleLink(id: string) {
    setLinkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleConfirm() {
    if (!docType || !ownerId) return
    onSuccess(docType.replace(/_/g, ' '))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,10,18,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{ background: 'var(--color-bg-1)', border: '1px solid var(--line-soft)' }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="text-[13px] font-semibold text-ink-1">{t('upload.trigger')}</div>
          <button type="button" onClick={onClose} className="text-ink-4 hover:text-ink-2">×</button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-5">
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full"
              style={{ background: step === s ? '#00E696' : i < STEP_ORDER.indexOf(step) ? '#00E69644' : 'var(--color-bg-3)' }}
            />
          ))}
        </div>

        {step === 'file' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-3">{t('upload.stepFile')}</div>
            <label
              className="block w-full rounded-md p-6 text-center text-[11px] text-ink-3 cursor-pointer"
              style={{ border: '1px dashed var(--line-mid)', background: 'var(--color-bg-2)' }}
            >
              <input type="file" className="hidden" onChange={handleFileChange} />
              {fileName || t('upload.placeholderFile')}
            </label>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                disabled={!fileName}
                onClick={() => setStep('type')}
                className="text-[11px] px-4 py-1.5 rounded disabled:opacity-40"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'type' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-3">{t('upload.stepType')}</div>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as WorkflowDocType)}
              className="w-full text-[11px] px-3 py-2 rounded text-ink-1"
              style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}
            >
              <option value="">{t('upload.placeholderType')}</option>
              {TYPE_OPTIONS.map(cat =>
                cat.types.map(type => (
                  <option key={type} value={type}>{t(`types.${type}`)}</option>
                ))
              )}
            </select>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => setStep('file')} className="text-[11px] text-ink-4 hover:text-ink-2">{t('upload.back')}</button>
              <button
                type="button"
                disabled={!docType}
                onClick={() => setStep('owner')}
                className="text-[11px] px-4 py-1.5 rounded disabled:opacity-40"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'owner' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-3">{t('upload.stepOwner')}</div>
            <div className="flex gap-2 mb-3">
              {(['po', 'container'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setOwnerType(type); setOwnerId('') }}
                  className="flex-1 text-[11px] py-1.5 rounded"
                  style={{
                    color: ownerType === type ? '#00E696' : '#A8B3C7',
                    background: ownerType === type ? 'rgba(0,230,150,0.1)' : 'var(--color-bg-2)',
                    border: `1px solid ${ownerType === type ? 'rgba(0,230,150,0.3)' : 'var(--line-soft)'}`,
                  }}
                >
                  {type === 'po' ? t('upload.ownerPo') : t('upload.ownerContainer')}
                </button>
              ))}
            </div>
            <select
              value={ownerId}
              onChange={e => setOwnerId(e.target.value)}
              className="w-full text-[11px] px-3 py-2 rounded text-ink-1"
              style={{ background: 'var(--color-bg-2)', border: '1px solid var(--line-soft)' }}
            >
              <option value="">{t('upload.placeholderOwner')}</option>
              {ownerType === 'po'
                ? purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.id}</option>)
                : containers.map(c => <option key={c.id} value={c.id}>{c.id}</option>)
              }
            </select>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => setStep('type')} className="text-[11px] text-ink-4 hover:text-ink-2">{t('upload.back')}</button>
              <button
                type="button"
                disabled={!ownerId}
                onClick={() => setStep('links')}
                className="text-[11px] px-4 py-1.5 rounded disabled:opacity-40"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.next')}
              </button>
            </div>
          </div>
        )}

        {step === 'links' && (
          <div>
            <div className="text-[11px] text-ink-2 mb-1">{t('upload.stepLinks')}</div>
            <div className="text-[9px] text-ink-4 mb-3">{t('upload.stepLinksHint')}</div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...purchaseOrders, ...containers].map(entity => {
                const id = entity.id
                if (id === ownerId) return null
                const checked = linkedIds.includes(id)
                return (
                  <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleLink(id)}
                      className="accent-mint-500"
                    />
                    <span className="font-mono text-[11px] text-ink-2">{id}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => setStep('owner')} className="text-[11px] text-ink-4 hover:text-ink-2">{t('upload.back')}</button>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-[11px] px-4 py-1.5 rounded"
                style={{ color: '#00E696', background: 'rgba(0,230,150,0.12)', border: '1px solid rgba(0,230,150,0.3)' }}
              >
                {t('upload.confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { shipmentDocuments } from '@/lib/mock-data/documents'
import { getNextStatus } from '@/lib/documents/workflow'
import type { WorkflowDocStatus } from '@/types'

const ALL_STATUSES: WorkflowDocStatus[] = [
  'draft', 'submitted', 'validating', 'under_review', 'approved', 'rejected',
]

// ── State machine unit tests ─────────────────────────────────────────────────

test('draft + submit → submitted', () => {
  expect(getNextStatus('draft', 'submit')).toBe('submitted')
})

test('under_review + approve → approved', () => {
  expect(getNextStatus('under_review', 'approve')).toBe('approved')
})

test('under_review + reject → rejected', () => {
  expect(getNextStatus('under_review', 'reject')).toBe('rejected')
})

test('rejected + reopen → draft', () => {
  expect(getNextStatus('rejected', 'reopen')).toBe('draft')
})

test('approved + submit → no-op (stays approved)', () => {
  expect(getNextStatus('approved', 'submit')).toBe('approved')
})

test('approved + reject → no-op (stays approved — invalid transition)', () => {
  expect(getNextStatus('approved', 'reject')).toBe('approved')
})

test('draft + approve → no-op (stays draft — skipped step)', () => {
  expect(getNextStatus('draft', 'approve')).toBe('draft')
})

// ── Mock data integrity tests ─────────────────────────────────────────────────

test('shipmentDocuments covers all WorkflowDocStatus values', () => {
  const statuses = new Set(shipmentDocuments.map(d => d.status))
  for (const s of ALL_STATUSES) {
    expect(statuses.has(s), `missing status: ${s}`).toBe(true)
  }
})

test('flagged documents reference existing sibling doc IDs', () => {
  const ids = new Set(shipmentDocuments.map(d => d.id))
  for (const doc of shipmentDocuments) {
    for (const flag of doc.flags) {
      expect(ids.has(flag.conflictingDocId), `flag references unknown id: ${flag.conflictingDocId}`).toBe(true)
    }
  }
})

test('every document has at least one event matching its status', () => {
  for (const doc of shipmentDocuments) {
    const hasMatchingEvent = doc.events.some(e => e.status === doc.status)
    expect(hasMatchingEvent, `${doc.id} has no event for status ${doc.status}`).toBe(true)
  }
})

test('each document owner id exists in either POs or containers', () => {
  const validPoIds = new Set(['PO-2026-0142', 'PO-2026-0157'])
  const validContainerIds = new Set(['MSCU-7842156', 'MAEU-9182734'])
  for (const doc of shipmentDocuments) {
    if (doc.owner.type === 'po') {
      expect(validPoIds.has(doc.owner.id), `unknown PO owner: ${doc.owner.id}`).toBe(true)
    } else {
      expect(validContainerIds.has(doc.owner.id), `unknown container owner: ${doc.owner.id}`).toBe(true)
    }
  }
})

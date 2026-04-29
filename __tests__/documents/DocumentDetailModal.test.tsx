import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DocumentDetailModal } from '@/app/documents/components/DocumentDetailModal'
import { shipmentDocuments } from '@/lib/mock-data/documents'
import type { ShipmentDocument } from '@/types'

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}))

const mockOnClose = vi.fn()
const draftDoc = shipmentDocuments.find(d => d.status === 'draft')!
const underReviewDoc = shipmentDocuments.find(d => d.status === 'under_review')!
const approvedDoc = shipmentDocuments.find(d => d.status === 'approved')!
const rejectedDoc = shipmentDocuments.find(d => d.status === 'rejected')!

test('renders document name in header', () => {
  render(<DocumentDetailModal doc={draftDoc} onClose={mockOnClose} />)
  expect(screen.getByText(draftDoc.name)).toBeInTheDocument()
})

test('draft status shows submit action', () => {
  render(<DocumentDetailModal doc={draftDoc} onClose={mockOnClose} />)
  expect(screen.getByRole('button', { name: /modal\.submit/i })).toBeInTheDocument()
})

test('under_review status shows approve and reject actions', () => {
  render(<DocumentDetailModal doc={underReviewDoc} onClose={mockOnClose} />)
  expect(screen.getByRole('button', { name: /modal\.approve/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /modal\.reject/i })).toBeInTheDocument()
})

test('approved status shows no primary action', () => {
  render(<DocumentDetailModal doc={approvedDoc} onClose={mockOnClose} />)
  expect(screen.queryByRole('button', { name: /modal\.approve/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /modal\.submit/i })).not.toBeInTheDocument()
})

test('rejected status shows reopen action', () => {
  render(<DocumentDetailModal doc={rejectedDoc} onClose={mockOnClose} />)
  expect(screen.getByRole('button', { name: /modal\.reopen/i })).toBeInTheDocument()
})

test('clicking approve transitions status to approved', () => {
  render(<DocumentDetailModal doc={underReviewDoc} onClose={mockOnClose} />)
  fireEvent.click(screen.getByRole('button', { name: /modal\.approve/i }))
  // After transition, no approve button (now approved)
  expect(screen.queryByRole('button', { name: /modal\.approve/i })).not.toBeInTheDocument()
})

test('flags section renders when flags present', () => {
  const docWithFlags = shipmentDocuments.find(d => d.flags.length > 0)!
  render(<DocumentDetailModal doc={docWithFlags} onClose={mockOnClose} />)
  expect(screen.getByText(/modal\.flags/i)).toBeInTheDocument()
})

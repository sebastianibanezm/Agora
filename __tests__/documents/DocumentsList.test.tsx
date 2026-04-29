import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { DocumentsList } from '@/app/documents/components/DocumentsList'

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}))

test('renders PO group headers', () => {
  render(<DocumentsList typeFilter={null} statusFilter={null} />)
  expect(screen.getByText('PO-2026-0142')).toBeInTheDocument()
  expect(screen.getByText('PO-2026-0157')).toBeInTheDocument()
})

test('type filter narrows the list', () => {
  render(<DocumentsList typeFilter="cold_treatment_cert" statusFilter={null} />)
  // With mock t=(k)=>k, the type label renders as its i18n key path
  expect(screen.getByText('types.cold_treatment_cert')).toBeInTheDocument()
  expect(screen.queryByText('types.dus')).not.toBeInTheDocument()
})

test('empty state shown when no docs match both filters', () => {
  // Use a type that has no approved docs to force empty state
  render(<DocumentsList typeFilter="lc_compliance_letter" statusFilter="approved" />)
  expect(screen.getByText('noDocumentsOfType')).toBeInTheDocument()
})

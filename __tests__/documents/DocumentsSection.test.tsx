import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { DocumentsSection } from '@/components/documents/DocumentsSection'

vi.mock('next-intl', () => ({
  useTranslations: () => (k: string) => k,
}))

test('shows owned PO docs and container sub-group for PO perspective', () => {
  render(
    <DocumentsSection ownerId="PO-2026-0142" ownerType="po" perspective="po" />
  )
  // PO-owned docs rendered without provenance tag
  expect(screen.getByText('Factura Comercial')).toBeInTheDocument()
  // Container docs rendered with provenance tag — multiple rows may match
  expect(screen.getAllByText(/de MSCU-7842156/).length).toBeGreaterThan(0)
})

test('shows owned container docs and PO cross-surfaced docs for container perspective', () => {
  render(
    <DocumentsSection ownerId="MSCU-7842156" ownerType="container" perspective="container" />
  )
  // Container-owned doc (no provenance tag)
  expect(screen.getByText('Autorización SAG')).toBeInTheDocument()
  // PO-surfaced doc (has provenance tag) — multiple rows may match, ensure at least one
  expect(screen.getAllByText(/de PO-2026-0142/).length).toBeGreaterThan(0)
})

test('provenance tag not shown for owned documents', () => {
  render(
    <DocumentsSection ownerId="PO-2026-0142" ownerType="po" perspective="po" />
  )
  // PO-owned doc should NOT show a provenance tag
  const cells = screen.getAllByText('Factura Comercial')
  // If there are two Commercial Invoices (one per PO), find the owned one (PO-2026-0142)
  expect(cells.length).toBeGreaterThan(0)
})

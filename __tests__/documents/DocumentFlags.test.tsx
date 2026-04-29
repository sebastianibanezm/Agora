import { render, screen } from '@testing-library/react'
import { DocumentFlags } from '@/app/documents/components/DocumentFlags'
import type { ValidationFlag } from '@/types'

const flag: ValidationFlag = {
  severity: 'error',
  conflictingDocId: 'WF-002',
  conflictingDocType: 'packing_list',
  message: 'Monto no coincide. Delta: +$1,300.',
  detectedAt: '2027-01-08T08:02:00-04:00',
}

const typeLabel = (type: string) => type  // passthrough for tests

test('renders flags when provided', () => {
  render(<DocumentFlags flags={[flag]} typeLabel={typeLabel} />)
  expect(screen.getByText(/Monto no coincide/)).toBeInTheDocument()
})

test('renders nothing when flags array is empty', () => {
  const { container } = render(<DocumentFlags flags={[]} typeLabel={typeLabel} />)
  expect(container.firstChild).toBeNull()
})

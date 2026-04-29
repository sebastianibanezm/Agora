import type { WorkflowDocStatus } from '@/types'

export function getNextStatus(
  current: WorkflowDocStatus,
  action: 'submit' | 'approve' | 'reject' | 'reopen',
): WorkflowDocStatus {
  if (action === 'submit'  && current === 'draft')        return 'submitted'
  if (action === 'approve' && current === 'under_review') return 'approved'
  if (action === 'reject'  && current === 'under_review') return 'rejected'
  if (action === 'reopen'  && current === 'rejected')     return 'draft'
  return current
}

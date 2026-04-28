import type { ColdChainTrace, Severity } from '@/types';

export function severityFromHoursToCutoff(hours: number): Severity {
  if (hours > 48) return 'ok';
  if (hours > 24) return 'info';
  if (hours > 12) return 'watch';
  if (hours > 4) return 'risk';
  return 'crit';
}

export function severityFromColdChain(c: ColdChainTrace): Severity {
  if (c.status === 'breached') return 'crit';
  if (c.status === 'completed') return 'ok';
  const broke = c.excursionEvents.some((e) => e.brokeCompliance);
  if (broke) return 'crit';
  if (c.excursionEvents.length > 0) return 'watch';
  return 'ok';
}

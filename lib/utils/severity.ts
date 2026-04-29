import type { Alert, Severity } from '@/types';

const SEV_ORDER: Severity[] = ['ok', 'info', 'watch', 'risk', 'crit'];

export function worstSeverity(severities: Severity[]): Severity {
  return severities.reduce<Severity>((worst, s) =>
    SEV_ORDER.indexOf(s) > SEV_ORDER.indexOf(worst) ? s : worst,
    'ok'
  );
}

export function containerSeverity(containerId: string, alerts: Alert[]): Severity {
  const active = alerts.filter(a => a.containerId === containerId && !a.dismissed);
  if (!active.length) return 'ok';
  return worstSeverity(active.map(a => a.severity as Severity));
}

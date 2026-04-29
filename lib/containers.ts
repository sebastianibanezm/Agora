import type { Container, ContainerStatus } from '@/types';

export const ACTIVE_STATUSES: ContainerStatus[] = [
  'planning', 'preparation', 'documentation',
  'in_transit', 'customs_release', 'delivery_payment',
];

export const isActiveContainer = (c: Container): boolean =>
  ACTIVE_STATUSES.includes(c.status);

export const stageLabelKey = (status: ContainerStatus): string =>
  `containers.statuses.${status}`;

export const STAGES: Array<{ status: ContainerStatus; label: string; color: string }> = [
  { status: 'planning',          label: 'Planning',           color: '#8B5CF6' },
  { status: 'preparation',       label: 'Preparation',        color: '#00E696' },
  { status: 'documentation',     label: 'Documentation',      color: '#F59E0B' },
  { status: 'in_transit',        label: 'In Transit',         color: '#7DD3FC' },
  { status: 'customs_release',   label: 'Customs & Release',  color: '#F97316' },
  { status: 'delivery_payment',  label: 'Delivery & Payment', color: '#3B82F6' },
  { status: 'closed',            label: 'Closed',             color: '#64748B' },
];

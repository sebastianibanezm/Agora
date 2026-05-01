import type { LucideIcon } from 'lucide-react';

export type SearchItemType = 'booking' | 'exporter' | 'naviera' | 'alert' | 'page';

export type SearchItem = {
  id: string;
  type: SearchItemType;
  label: string;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
};

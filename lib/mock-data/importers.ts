import type { Importer } from '@/types';

export const importers: Importer[] = [
  { id: 'IMP-IN-MUMBAI', name: 'Mumbai Nuts & Grains Pvt. Ltd.', country: 'India', market: 'IN', activeContainers: 2, annualVolumeKg: 480_000, creditRating: 'A' },
  { id: 'IMP-CN-DRAGON', name: 'Dragon Pearl Fruits Co., Ltd.', country: 'China', market: 'CN', activeContainers: 3, annualVolumeKg: 720_000, creditRating: 'A+' },
  { id: 'IMP-CN-EAST', name: 'East Fortune Trading Shanghai', country: 'China', market: 'CN', activeContainers: 1, annualVolumeKg: 310_000, creditRating: 'B+' },
  { id: 'IMP-US-PACIFIC', name: 'Pacific Fresh Imports LLC', country: 'United States', market: 'US', activeContainers: 1, annualVolumeKg: 250_000, creditRating: 'A' },
  { id: 'IMP-EU-BERLIN', name: 'Berlin Organic Imports GmbH', country: 'Germany', market: 'EU', activeContainers: 1, annualVolumeKg: 190_000 },
];

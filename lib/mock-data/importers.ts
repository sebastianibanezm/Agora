import type { Importer } from '@/types';

export const importers: Importer[] = [
  { id: 'IMP-IN-MUMBAI',    name: 'Mumbai Dry Fruits Pvt. Ltd.',    country: 'India',        market: 'IN',   activeContainers: 2, annualVolumeKg: 480_000, creditRating: 'A' },
  { id: 'IMP-CN-DRAGON',    name: 'Dragon Pearl Fruits Co., Ltd.',  country: 'China',        market: 'CN',   activeContainers: 3, annualVolumeKg: 720_000, creditRating: 'A+' },
  { id: 'IMP-CN-EAST',      name: 'Shenzhen Imports Ltd.',          country: 'China',        market: 'CN',   activeContainers: 1, annualVolumeKg: 310_000, creditRating: 'B+' },
  { id: 'IMP-US-PACIFIC',   name: 'Pacific Produce Inc.',           country: 'United States', market: 'US',  activeContainers: 1, annualVolumeKg: 250_000, creditRating: 'A' },
  { id: 'IMP-EU-BERLIN',    name: 'Berlin Organic Imports GmbH',    country: 'Germany',      market: 'EU',   activeContainers: 1, annualVolumeKg: 190_000 },
  { id: 'IMP-CN-SUNYANG',   name: 'Sun Yang Foods Co.',             country: 'China',        market: 'CN',   activeContainers: 1, annualVolumeKg: 280_000 },
  { id: 'IMP-EU-FRUTIMAR',  name: 'Frutimar SL',                   country: 'Spain',        market: 'EU',   activeContainers: 2, annualVolumeKg: 220_000, creditRating: 'A' },
  { id: 'IMP-MENA-ALMADINA',name: 'Al Madina Trading LLC',          country: 'UAE',          market: 'MENA', activeContainers: 1, annualVolumeKg: 180_000 },
  { id: 'IMP-EU-HERITAGE',  name: 'Heritage European Fruits BV',   country: 'Netherlands',  market: 'EU',   activeContainers: 1, annualVolumeKg: 160_000 },
];

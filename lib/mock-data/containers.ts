import type { Container } from '@/types';

export const containers: Container[] = [
  // bl_validated
  {
    id: 'CTR-SNG0502407',
    bookingId: 'BKG-SNG0502407',
    containerNumber: 'CGMU-9176432',
    sealNumber: 'CMA0418771',
    blNumber: 'CGMUSAI3052801',
    netWeightKg: 22_400,
    grossWeightKg: 24_800,
    cargoDescription: 'Fresh cherries, controlled atmosphere',
  },

  // draft_bl_received
  {
    id: 'CTR-MSCSAI4408',
    bookingId: 'BKG-MSCSAI4408',
    containerNumber: 'MSCU-7842156',
    sealNumber: 'MSC0411832',
    blNumber: 'MSCUSAI3052105',
    netWeightKg: 23_100,
    grossWeightKg: 25_200,
    cargoDescription: 'Fresh blueberries',
  },
  {
    id: 'CTR-CGMURTM910',
    bookingId: 'BKG-CGMURTM910',
    containerNumber: 'CGMU-9182374',
    sealNumber: 'CMA0419002',
    blNumber: 'CGMURTM3041201',
    netWeightKg: 20_800,
    grossWeightKg: 22_900,
    cargoDescription: 'Dried fruits assortment',
  },

  // closed / bl_released — have containerNumber/sealNumber/blNumber
  {
    id: 'CTR-MSCSAI4399',
    bookingId: 'BKG-MSCSAI4399',
    containerNumber: 'MSCU-7841108',
    sealNumber: 'MSC0407221',
    blNumber: 'MSCUSAI3050409',
    netWeightKg: 24_000,
    grossWeightKg: 26_100,
    cargoDescription: 'Fresh cherries, controlled atmosphere',
  },
  {
    id: 'CTR-CGMURTM894',
    bookingId: 'BKG-CGMURTM894',
    containerNumber: 'CGMU-9180144',
    sealNumber: 'CMA0408119',
    blNumber: 'CGMURTM3040501',
    netWeightKg: 21_500,
    grossWeightKg: 23_600,
    cargoDescription: 'Dried fruits assortment',
  },
  {
    id: 'CTR-MAEU984301',
    bookingId: 'BKG-MAEU984301',
    containerNumber: 'MAEU-9180042',
    sealNumber: 'MAE0408309',
    blNumber: 'MAEUHAM3040508',
    netWeightKg: 22_800,
    grossWeightKg: 24_900,
    cargoDescription: 'Fresh blueberries, premium grade',
  },
  {
    id: 'CTR-MSCSAI4395',
    bookingId: 'BKG-MSCSAI4395',
    containerNumber: 'MSCU-7842157',
    sealNumber: 'MSC0411833',
    blNumber: 'MSCUSAI3052106',
    netWeightKg: 23_400,
    grossWeightKg: 25_500,
    cargoDescription: 'Fresh cherries, controlled atmosphere',
  },
  {
    id: 'CTR-CGMUSAV498',
    bookingId: 'BKG-CGMUSAV498',
    containerNumber: 'CGMU-9180277',
    sealNumber: 'CMA0408442',
    blNumber: 'CGMUSAV3040515',
    netWeightKg: 22_100,
    grossWeightKg: 24_200,
    cargoDescription: 'Avocado, fresh',
  },
  {
    id: 'CTR-HLCUNSA208',
    bookingId: 'BKG-HLCUNSA208',
    containerNumber: 'HLCU-3491284',
    sealNumber: 'HLCU0407881',
    blNumber: 'HLCUNSA3040421',
    netWeightKg: 19_800,
    grossWeightKg: 21_900,
    cargoDescription: 'Fresh grapes',
  },
  {
    id: 'CTR-MSCSAI4391',
    bookingId: 'BKG-MSCSAI4391',
    containerNumber: 'MSCU-7841234',
    sealNumber: 'MSC0407311',
    blNumber: 'MSCUHAM3050410',
    netWeightKg: 23_700,
    grossWeightKg: 25_800,
    cargoDescription: 'Fresh cherries, controlled atmosphere',
  },

  // esi_sent — no containerNumber/sealNumber/blNumber yet
  { id: 'CTR-CGMUSAV504', bookingId: 'BKG-CGMUSAV504' },
  { id: 'CTR-MAEU984412', bookingId: 'BKG-MAEU984412' },
  { id: 'CTR-COSU88129', bookingId: 'BKG-COSU88129' },
  { id: 'CTR-ONEY220105', bookingId: 'BKG-ONEY220105' },
  { id: 'CTR-EGLV088771', bookingId: 'BKG-EGLV088771' },

  // awaiting_si — no fields at all
  { id: 'CTR-MSCSAI4421', bookingId: 'BKG-MSCSAI4421' },
  { id: 'CTR-MAEU991033', bookingId: 'BKG-MAEU991033' },
  { id: 'CTR-CGMUYAN772', bookingId: 'BKG-CGMUYAN772' },
  { id: 'CTR-HLCUNSA221', bookingId: 'BKG-HLCUNSA221' },
  { id: 'CTR-COSU88331', bookingId: 'BKG-COSU88331' },

  // si_failed — no containerNumber (SI failed)
  { id: 'CTR-MSCSAI4419', bookingId: 'BKG-MSCSAI4419' },
  { id: 'CTR-MAEU991028', bookingId: 'BKG-MAEU991028' },
  { id: 'CTR-HLCUNSA218', bookingId: 'BKG-HLCUNSA218' },

  // si_received — no containerNumber yet
  { id: 'CTR-MSCSAI4423', bookingId: 'BKG-MSCSAI4423' },
  { id: 'CTR-CMACOL112', bookingId: 'BKG-CMACOL112' },
];

export function getContainersByBookingId(bookingId: string): Container[] {
  return containers.filter((c) => c.bookingId === bookingId);
}

// Demo time anchor for the V2 maqueta.
// Update this single constant to shift "today" across the entire app.
export const TODAY_ISO = '2026-04-30T10:00:00-04:00';

export function getTodayDemo(): Date {
  return new Date(TODAY_ISO);
}

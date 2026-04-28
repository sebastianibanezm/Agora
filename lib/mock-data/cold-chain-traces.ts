import type { ColdChainTrace, DataLogger, ExcursionEvent } from '@/types';

// ===== Cherries: 3 loggers × 2880 readings (15-min interval × 10 days) =====
const CHERRIES_LOAD_MS = new Date('2026-12-30T22:00:00Z').getTime(); // Treatment start
const FIFTEEN_MIN_MS = 15 * 60_000;
const SETPOINT = 0.5;
const TOLERANCE = 0.3;

// Excursion: top logger at 2027-01-05T14:32:00Z, spans 2 readings, peakTempC = 0.9
// From Dec30 22:00Z to Jan5 14:32Z = ~5.69 days × 4×24 readings/day ≈ 547
const EXCURSION_START_MS = new Date('2027-01-05T14:32:00Z').getTime();
const EXCURSION_IDX = Math.round((EXCURSION_START_MS - CHERRIES_LOAD_MS) / FIFTEEN_MIN_MS);

function genCherryLogger(position: 'top' | 'middle' | 'bottom', baseOffset: number): DataLogger {
  const readings: { t: string; tempC: number }[] = [];
  for (let i = 0; i < 2880; i++) {
    const t = new Date(CHERRIES_LOAD_MS + i * FIFTEEN_MIN_MS).toISOString();
    let tempC = SETPOINT + baseOffset + 0.08 * Math.sin(i / 23) + 0.04 * Math.sin(i / 7);
    tempC = Number(tempC.toFixed(3));
    readings.push({ t, tempC });
  }
  // Inject excursion for top logger only
  if (position === 'top') {
    const r0 = readings[EXCURSION_IDX];
    const r1 = readings[EXCURSION_IDX + 1];
    if (r0) r0.tempC = 0.9;
    if (r1) r1.tempC = 0.9;
  }
  return {
    id: `LOG-${position.toUpperCase()}-9182734`,
    position,
    serial: `EM4-${position[0]!.toUpperCase()}-${1000 + position.charCodeAt(0)}`,
    readings,
  };
}

const cherryLoggers: DataLogger[] = [
  genCherryLogger('top', -0.05),
  genCherryLogger('middle', 0.00),
  genCherryLogger('bottom', 0.05),
];

const cherryExcursion: ExcursionEvent = {
  id: 'EXC-9182734-001',
  startAt: '2027-01-05T14:32:00Z',
  endAt:   '2027-01-05T14:50:00Z',
  durationMin: 18,
  loggerId: 'LOG-TOP-9182734',
  peakTempC: 0.9,
  severity: 'watch',
  brokeCompliance: false,
};

// 10 days elapsed × 24h × 60min = 14,400 min
// treatmentMinutesCompliant = ~13,800 (accounts for pre-steady-state settling)
const TREATMENT_REQUIRED_MIN = 15 * 24 * 60; // 21,600

export const cherriesTrace: ColdChainTrace = {
  required: true,
  protocol: 'china_15d_0_5c',
  setpointC: SETPOINT,
  toleranceC: TOLERANCE,
  caGasMix: { o2Pct: 5, co2Pct: 12, n2Pct: 83 },
  rhTargetPct: [88, 95],
  preCooling: {
    facility: 'Curicó Pre-cool Hub',
    startedAt: '2026-12-29T08:00:00-04:00',
    completedAt: '2026-12-30T06:00:00-04:00',
    targetTempC: 0,
    pulpTempCurve: Array.from({ length: 22 }, (_, i) => ({
      t: new Date(new Date('2026-12-29T08:00:00-04:00').getTime() + i * 3_600_000).toISOString(),
      tempC: Number((18 - (18 / 21) * i).toFixed(2)),
    })),
  },
  reeferPti: {
    performedAt: '2026-12-29T18:00:00-04:00',
    technician: 'Maersk PTI Bay 4',
    passed: true,
  },
  loggers: cherryLoggers,
  caReadings: Array.from({ length: 240 }, (_, i) => ({
    t: new Date(CHERRIES_LOAD_MS + i * 3_600_000).toISOString(),
    o2Pct: Number((5 + 0.2 * Math.sin(i / 7)).toFixed(2)),
    co2Pct: Number((12 + 0.4 * Math.sin(i / 11)).toFixed(2)),
    n2Pct: 83,
  })),
  treatmentRequiredMinutes: TREATMENT_REQUIRED_MIN,
  treatmentMinutesCompliant: 13_800,
  treatmentMinutesViolation: 0,
  excursionEvents: [cherryExcursion],
  status: 'in_treatment',
  lastReadingAt: new Date(CHERRIES_LOAD_MS + 2879 * FIFTEEN_MIN_MS).toISOString(),
};

// ===== Grapes: single logger, ~50 sampled readings =====
const GRAPES_LOAD_MS = new Date('2027-01-08T08:00:00-04:00').getTime();
const grapesLogger: DataLogger = {
  id: 'LOG-MID-9281744',
  position: 'middle',
  serial: 'EM4-M-7321',
  readings: Array.from({ length: 50 }, (_, i) => ({
    t: new Date(GRAPES_LOAD_MS + i * 30 * 60_000).toISOString(),
    tempC: Number((-0.3 + 0.1 * Math.sin(i / 5)).toFixed(2)),
  })),
};

export const grapesTrace: ColdChainTrace = {
  required: true,
  protocol: null,
  setpointC: -0.5,
  toleranceC: 0.4,
  rhTargetPct: [90, 95],
  loggers: [grapesLogger],
  treatmentRequiredMinutes: 0,
  treatmentMinutesCompliant: 0,
  treatmentMinutesViolation: 0,
  excursionEvents: [],
  status: 'in_treatment',
  lastReadingAt: new Date(GRAPES_LOAD_MS + 49 * 30 * 60_000).toISOString(),
};

// ============================================================================
// AGORA V2 - Freight Forwarder Edition - Data Model
// ============================================================================

export type Market = 'US' | 'EU' | 'IN' | 'CN' | 'MENA' | 'LATAM';

export type Incoterm = 'FOB' | 'CIF' | 'CFR' | 'DAP' | 'EXW' | 'FCA';

export type PaymentTerm = 'COBRANZA' | 'L/C' | 'OPEN_ACCOUNT' | 'CAD' | 'PREPAID';

export type ContainerType = '40HC' | '40RF' | '20DV' | '40DV' | '20RF';

export type FreightTerm = 'COLLECT' | 'PREPAID';

export type AlertSeverity = 'info' | 'watch' | 'action' | 'critical';

// The Booking lifecycle is the spine of the platform. Every status transition
// is logged in the booking's activity feed.
export type BookingStatus =
  | 'created'
  | 'awaiting_si'
  | 'si_received'
  | 'si_validated'
  | 'si_failed'
  | 'esi_sent'
  | 'draft_bl_received'
  | 'bl_validated'
  | 'bl_released'
  | 'closed'
  | 'cancelled';

export type ValidationResult = 'pass' | 'warn' | 'fail';
export type ValidationStatus = 'pending' | 'green' | 'failed';

// ----------------------------------------------------------------------------
// Exporter - the FF's customer (e.g. Comfrut, Agrosuper)
// ----------------------------------------------------------------------------
export interface Exporter {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  defaultIncoterm: Incoterm;
  defaultPaymentTerm: PaymentTerm;
  primaryProducts: string[];
  primaryMarkets: Market[];
  totalOrders: number;
  totalContainers: number;
  onTimeSiRate: number;
  siQualityScore: number;
  avgSiTurnaroundHours: number;
  logoUrl?: string;
}

// ----------------------------------------------------------------------------
// Naviera - the FF's other counterparty (carrier)
// ----------------------------------------------------------------------------
export type ApiCapability = 'DCSA' | 'myMSC' | 'INTTRA' | 'manual';

export interface Naviera {
  id: string;
  name: string;
  shortName: string;
  code: string;
  apiCapability: ApiCapability;
  logoUrl?: string;
  totalBookings: number;
  avgDraftBlTurnaroundHours: number;
  siRejectionRate: number;
  cutoffDisciplineRate: number;
}

// ----------------------------------------------------------------------------
// Booking - top-level entity, created via PDF upload.
// ----------------------------------------------------------------------------
export interface Booking {
  id: string;
  bookingNumber: string;
  navieraId: string;

  // Parties (from PDF)
  shipper: string;
  consignee: string;
  referenciaCliente?: string;

  // Routing
  vesselName: string;
  voyage: string;
  pol: string;
  polCoords: [number, number];
  pod: string;
  podCoords: [number, number];
  transshipmentPort?: string;

  // Schedule
  etd: string;
  eta: string;
  cutOff?: string;
  stackingFrom?: string;
  stackingTo?: string;

  // Cargo spec
  containerType: ContainerType;
  containerCount: number;
  isReefer: boolean;
  setpointC?: number;
  ventilation?: number;
  freightTerm: FreightTerm;
  emissionType: 'BL' | 'Seawaybill';

  // Source file (session-scoped blob URL)
  bookingFileUrl?: string;
  bookingFileName?: string;

  // Relations
  containerIds: string[];
  siId?: string;
  draftBlId?: string;

  status: BookingStatus;
  createdAt: string;
  alertIds: string[];
  costAtRiskUsd: number;
}

// ----------------------------------------------------------------------------
// Container - physical cargo unit, child of Booking.
// ----------------------------------------------------------------------------
export interface Container {
  id: string;
  bookingId: string;
  containerNumber?: string;
  sealNumber?: string;
  blNumber?: string;
  netWeightKg?: number;
  grossWeightKg?: number;
  cargoDescription?: string;
}

// ----------------------------------------------------------------------------
// Shipping Instruction
// ----------------------------------------------------------------------------
export interface ParsedParty {
  name: string;
  address: string;
}

export interface SICargoLine {
  product: string;
  kgNetUnit: number;
  kgGrossUnit: number;
  qty: number;
  kgNetTotal: number;
  kgGrossTotal: number;
  fobPrice: number;
}

export interface ShippingInstruction {
  id: string;
  bookingId: string;
  receivedAt: string;
  sourceFileUrl: string;
  sourceFileName: string;
  uploadedVia: 'portal' | 'email';

  parsedFields: {
    embarqueNumber: string;
    poNumber?: string;
    portOfLoading: string;
    portOfDischarge: string;
    finalDestination: string;
    vesselVoyage: string;
    naviera: string;
    forwarder: string;
    bookingReference: string;
    blNumber?: string;
    salesModality: string;
    paymentForm: string;
    incoterm: Incoterm;

    containerCount: string;
    containerType: ContainerType;
    setpointC?: number;
    deposito: string;
    generator: string;
    transport: string;
    truckType: string;
    freightTerms: FreightTerm;
    returnPeriod: string;

    plant: { name: string; address: string; contact: string };
    loadingDate: string;
    portArrivalDate: string;
    stackingFrom: string;
    stackingTo: string;
    cutOff: string;

    consignee: ParsedParty;
    notify: ParsedParty;
    alsoNotify?: ParsedParty;
    thirdNotifyParty?: ParsedParty;
    shipper: ParsedParty;

    cargo: SICargoLine[];
    totalKgNet: number;
    totalKgGross: number;
  };

  validationStatus: ValidationStatus;
  validationResults: ValidationCheck[];

  esiGeneratedAt?: string;
  esiTransmittedAt?: string;
  esiTransmissionStatus?: 'pending' | 'sent' | 'acknowledged' | 'rejected';
}

// ----------------------------------------------------------------------------
// Draft BL
// ----------------------------------------------------------------------------
export interface DraftBL {
  id: string;
  bookingId: string;
  receivedAt: string;
  sourceFileUrl: string;

  parsedFields: {
    blNumber: string;
    bookingReference: string;
    vesselVoyage: string;
    pol: string;
    pod: string;
    consignee: string;
    notify: string;
    shipper: string;
    containerNumber: string;
    sealNumber: string;
    netWeight: number;
    grossWeight: number;
    cargoDescription: string;
    freightTerms: FreightTerm;
  };

  validationStatus: ValidationStatus;
  validationResults: ValidationCheck[];

  releasedToExporterAt?: string;
}

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
export interface ValidationCheck {
  id: string;
  checkName: string;
  agentId: AgentId;
  result: ValidationResult;
  details: string;
  fieldRef?: string;
  expected?: string;
  actual?: string;
}

// ----------------------------------------------------------------------------
// Alerts
// ----------------------------------------------------------------------------
export interface Alert {
  id: string;
  bookingId: string;
  severity: AlertSeverity;
  agentId: AgentId;
  agentName: string;
  agentNameEs?: string;
  title: string;
  titleEs?: string;
  message: string;
  messageEs?: string;
  costAtRiskUsd: number | null;
  createdAt: string;
  dueAt?: string;
  dismissedAt?: string;
  suggestedAction?: string;
  suggestedActionEs?: string;
}

// ----------------------------------------------------------------------------
// Agents (slimmed to MVP scope)
// ----------------------------------------------------------------------------
export type AgentId =
  // Active in V1
  | 'si_validator'
  | 'cutoff_clock'
  | 'esi_transmitter'
  | 'draft_bl_validator'
  | 'master_data_sentinel'
  // Coming soon
  | 'po_validator'
  | 'free_time_tracker'
  | 'lc_consignee_checker';

export type AgentCategory = 'validator' | 'monitor' | 'transmitter';

export interface Agent {
  id: AgentId;
  displayName: string;
  category: AgentCategory;
  description: string;
  status: 'active' | 'beta' | 'coming_soon';
  runsThisWeek: number;
  catchesThisWeek: number;
  estimatedSavingsUsd: number;
}

// ----------------------------------------------------------------------------
// Activity events (for the Booking detail Activity tab)
// ----------------------------------------------------------------------------
export type ActivityEventType =
  | 'booking_created'
  | 'si_received'
  | 'si_validation_run'
  | 'si_validation_passed'
  | 'si_validation_failed'
  | 'esi_generated'
  | 'esi_sent'
  | 'esi_acknowledged'
  | 'draft_bl_received'
  | 'draft_bl_validation_run'
  | 'draft_bl_validation_passed'
  | 'draft_bl_validation_failed'
  | 'bl_released_to_exporter'
  | 'alert_fired'
  | 'alert_dismissed'
  | 'note_added'
  | 'manual_override';

export interface ActivityEvent {
  id: string;
  bookingId: string;
  type: ActivityEventType;
  timestamp: string;
  actor: 'agent' | 'user' | 'system';
  actorName?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// KPIs (dashboard top strip)
// ----------------------------------------------------------------------------
export interface KPI {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'flat';
  deltaPositive?: boolean;
  sublabel?: string;
}

// ----------------------------------------------------------------------------
// Penalty register (for the rolled-up "USD avoided" tooltips)
// ----------------------------------------------------------------------------
export type PenaltyStage = 'pre_cutoff' | 't0' | 't1' | 't2' | 't3' | 't5';

export interface PenaltyEvent {
  id: string;
  stage: PenaltyStage;
  event: string;
  trigger: string;
  usdMin: number;
  usdMax: number;
  avoidedBy: AgentId;
}

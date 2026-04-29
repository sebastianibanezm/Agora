// ===== Enums =====
export type Market = 'US' | 'EU' | 'IN' | 'CN' | 'MENA';

export type ContainerStatus =
  | 'planning'
  | 'preparation'
  | 'documentation'
  | 'in_transit'
  | 'customs_release'
  | 'delivery_payment'
  | 'closed'

export type POStatus = 'draft' | 'confirmed' | 'in_fulfillment' | 'delivered' | 'cancelled'

export type POEvent = {
  date: string
  type: 'confirmed' | 'container_assigned' | 'bl_issued' | 'docs_submitted' | 'delivered' | 'payment_received'
  note?: string
}

export type VolumeHistoryEntry = {
  season: string
  volumeKg: number
}

export type CertifiedProduct = {
  productId: string
  name: string
  hsCode: string
  seasonStart: string
  seasonEnd: string
  requiresColdChain: boolean
  coldProtocol?: string
  enabledMarkets: Market[]
}

export type SAGCertification = {
  id: string
  name: string
  expiryDate: string
  daysUntilExpiry: number
}

export type ProductId =
  | 'walnuts_in_shell' | 'walnut_kernels' | 'almonds_in_shell'
  | 'fresh_cherries' | 'fresh_blueberries'
  | 'table_grapes_red' | 'table_grapes_white';

export type IncotermPaymentId =
  | 'cif_cad_at_sight' | 'cif_lc_at_sight' | 'cif_lc_60'
  | 'cif_open_account_30' | 'fob_open_account_30' | 'dap_open_account';

export type DocumentType =
  | 'commercial_invoice' | 'packing_list' | 'bill_of_lading' | 'certificate_of_origin'
  | 'phyto_certificate' | 'fumigation_cert' | 'cold_treatment_cert' | 'health_cert'
  | 'gacc_registration' | 'lc_compliance_letter' | 'insurance_certificate'
  | 'dus' | 'sag_export_auth' | 'transport_document' | 'pti_certificate'
  | 'pre_cooling_log' | 'logger_report' | 'ca_atmosphere_log';

export type DocStatus = 'missing' | 'draft' | 'pending_review' | 'approved' | 'rejected' | 'in_transit' | 'delivered';

export type Severity = 'ok' | 'info' | 'watch' | 'risk' | 'crit';

// ===== Document Requirement =====
export interface DocumentRequirement {
  type: DocumentType;
  label: string;
  requiredBy: string;
  issuingAuthority?: string;
  notes?: string;
}

// ===== Validation =====
export interface ValidationSummary {
  passed: number;
  failed: number;
  warnings: number;
}

export interface Validation {
  id: string;
  containerId: string;
  documentType?: DocumentType;
  checkId: string;
  severity: Severity;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  detectedAt: string;
}

// ===== Cold chain =====
export interface DataLogger {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  serial: string;
  readings: Array<{ t: string; tempC: number }>;
}

export interface CaReading {
  t: string;
  o2Pct: number;
  co2Pct: number;
  n2Pct: number;
}

export interface ExcursionEvent {
  id: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  loggerId: string;
  peakTempC: number;
  severity: Severity;
  brokeCompliance: boolean;
}

export interface PreCoolingRecord {
  facility: string;
  startedAt: string;
  completedAt: string;
  targetTempC: number;
  pulpTempCurve: Array<{ t: string; tempC: number }>;
}

export interface ReeferPtiRecord {
  performedAt: string;
  technician: string;
  passed: boolean;
  notes?: string;
}

export interface ColdTreatmentProtocol {
  id: string;
  label: string;
  market: Market;
  durationDays: number;
  setpointC: number;
  toleranceC: number;
  description: string;
}

export interface ColdChainTrace {
  required: boolean;
  protocol: string | null;
  setpointC: number;
  toleranceC: number;
  caGasMix?: { o2Pct: number; co2Pct: number; n2Pct: number };
  rhTargetPct: [number, number];
  preCooling?: PreCoolingRecord;
  reeferPti?: ReeferPtiRecord;
  loggers: DataLogger[];
  caReadings?: CaReading[];
  treatmentRequiredMinutes: number;
  treatmentMinutesCompliant: number;
  treatmentMinutesViolation: number;
  excursionEvents: ExcursionEvent[];
  status: 'pre_load' | 'in_treatment' | 'completed' | 'breached';
  lastReadingAt: string;
  loggerDownloadReportUrl?: string;
  arrivalTransferStatus?: 'pending' | 'in_progress' | 'completed';
}

// ===== Profiles =====
export interface ProductProfile {
  id: ProductId;
  label: string;
  requiresColdChain: boolean;
  defaultProtocols: string[];
  seasonality?: string;
  hsCode: string;
  requiredDocs: DocumentType[];
  activeAgents: AgentId[];
}

export interface MarketProfile {
  id: Market;
  label: string;
  inspectionAuthority: string;
}

export interface MarketProfileExtended extends MarketProfile {
  coldTreatmentOptions?: ColdTreatmentProtocol[];
  registrationsRequired: string[];
  labelLanguageRequired: string[];
  digitalPhytoSystem?: string;
  activeAgents: AgentId[];
  requiredDocs: DocumentType[];
}

export interface CommercialProfile {
  id: IncotermPaymentId;
  label: string;
  incoterm: 'CIF' | 'FOB' | 'DAP';
  paymentMethod: 'CAD' | 'L/C' | 'open_account';
  paymentTerms: string;
  requiredDocs: DocumentType[];
  validationChecks: string[];
  activeAgents: AgentId[];
  bank?: string;
  avgCollectionDays?: number;
  currency?: string;
  isDraft?: boolean;
}

// ===== Lane profile =====
export interface LaneTimelineEvent {
  tDay: string;
  label: string;
  actor: 'producer' | 'exporter' | 'importer' | 'agent' | 'authority';
}

export interface LaneProfile {
  id: string;
  product: ProductProfile;
  market: MarketProfileExtended;
  commercial: CommercialProfile;
  documentSet: DocumentRequirement[];
  agentsActive: AgentId[];
  validationChecks: string[];
  timeline: LaneTimelineEvent[];
}

// ===== Container =====
export interface Container {
  id: string;
  productId: ProductId;
  productLabel: string;
  commercialId: IncotermPaymentId;
  laneProfileId: string;
  market: Market;
  polCode: string;
  polLabel: string;
  podCode: string;
  podLabel: string;
  importerId: string;
  producerId: string;
  purchaseOrderId: string;
  weightKg: number;
  valueUsd: number;
  etd: string;
  eta: string;
  cutoffAt?: string;
  status: ContainerStatus;
  coldChain?: ColdChainTrace;
  costAtRiskUsd?: number;
  carrier: string;
  polCoords: [number, number];
  podCoords: [number, number];
  timelineNodes?: Array<{ tDay: number; status: 'done' | 'crit' | 'warn' | 'future' }>;
}

// ===== Other entities =====
export type AgentId = string;

export interface Agent {
  id: AgentId;
  label: string;
  description: string;
  category: 'collect' | 'validate' | 'monitor' | 'orchestrate' | 'reconcile';
  tags: string[];
  activeOnLanes: string[];
}

export type AlertCategory =
  | 'shipment_doc' | 'market_compliance' | 'bl_switch_window'
  | 'payment_aging' | 'free_time_tracker';

export interface Alert {
  id: string;
  containerId?: string;
  severity: Severity;
  titleKey: string;
  bodyKey: string;
  raisedAt: string;
  raisedBy: AgentId;
  actionLabelKey?: string;
  dismissed?: boolean;
  category: AlertCategory;
  amountUsd?: number;
}

export interface PurchaseOrder {
  id: string;
  importerId: string;
  producerId: string;
  productId: ProductId;
  market: Market;
  quantityKg: number;
  incotermPaymentId: IncotermPaymentId;
  valueUsd: number;
  issuedAt: string;
  deliveryWindow: { from: string; to: string };
  containerIds: string[];
  status: POStatus;
  events: POEvent[];
}

export interface Importer {
  id: string;
  name: string;
  country: string;
  market: Market;
  activeContainers: number;
  annualVolumeKg: number;
  creditRating?: string;
  avgPaymentDays: number;
  volumeHistory: VolumeHistoryEntry[];
  paymentHistory: Array<{
    poId: string;
    method: string;
    bank: string;
    amount: number;
    daysToCollect?: number;
    status: 'paid' | 'pending';
  }>;
  marketProfile: {
    inspectionAuthority: string[];
    digitalSystem: string;
    requiredRegistrations: string[];
    labelLanguages: string[];
    coldTreatmentOptions?: string[];
  };
}

export interface Producer {
  id: string;
  name: string;
  region: string;
  products: ProductId[];
  sagId: string;
  activeContainers: number;
  avgPaymentDays?: number;
  volumeHistory: VolumeHistoryEntry[];
  certifiedProducts: CertifiedProduct[];
  sagCertifications: SAGCertification[];
}

export interface KPI {
  id: string;
  labelKey: string;
  value: number;
  unit: 'usd' | 'pct' | 'count' | 'days' | 'minutes';
  deltaPct?: number;
  severity?: Severity;
  sparkline: number[];
  deltaPositiveIsGood?: boolean;
}

export interface PenaltyEvent {
  id: string;
  containerId: string;
  week: string;
  amountUsd: number;
  reason: string;
}

export interface DocumentInstance {
  id: string;
  type: DocumentType;
  containerId: string;
  status: DocStatus;
  issuedAt?: string;
  fileUrl?: string;
  issuer?: string;
  number?: string;
}

export interface ClosedContainer {
  id: string;
  buyerName: string;
  cycledays: number;
  deltaAvgDays: number;
  penaltyUsd: number;
}

export type PenaltyEventType =
  | 'refumigation' | 'phyto_reissue' | 'vgm_late' | 'dus_error'
  | 'bl_correction' | 'demurrage' | 'detention' | 'bank_discrepancy';

export interface PenaltyAvoidedRow {
  buyerName: string;
  counts: Record<PenaltyEventType, number>;
}

// ===== Phase 4: Workflow Document System =====

export type DocumentCategory =
  | 'commercial'
  | 'transport'
  | 'phytosanitary'
  | 'customs'

// Subset of existing DocumentType used in the workflow system.
// Extends existing DocumentType — does not replace it.
export type WorkflowDocType = Extract<
  DocumentType,
  | 'commercial_invoice'
  | 'packing_list'
  | 'lc_compliance_letter'
  | 'bill_of_lading'
  | 'dus'
  | 'sag_export_auth'
  | 'cold_treatment_cert'
  | 'certificate_of_origin'
>

export type WorkflowDocStatus =
  | 'draft'
  | 'submitted'
  | 'validating'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type ShipmentDocOwner =
  | { type: 'po'; id: string }
  | { type: 'container'; id: string }

export type ShipmentDocLink = {
  type: 'po' | 'container'
  id: string
  label: string
}

export type ValidationFlag = {
  severity: 'error' | 'warning'
  conflictingDocId: string
  conflictingDocType: WorkflowDocType
  message: string
  detectedAt: string
}

export type ShipmentDocEvent = {
  status: WorkflowDocStatus | 'comment'
  actor: 'user' | 'system'
  actorName: string
  timestamp: string
  note?: string
}

export interface ShipmentDocument {
  id: string
  name: string
  category: DocumentCategory
  type: WorkflowDocType
  status: WorkflowDocStatus
  owner: ShipmentDocOwner
  links: ShipmentDocLink[]
  flags: ValidationFlag[]
  events: ShipmentDocEvent[]
  createdAt: string
  dueDate?: string
  fileUrl?: string
  overview: Record<string, string>
}

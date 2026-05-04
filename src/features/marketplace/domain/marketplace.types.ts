export type CargoStatus = 'open' | 'bidding' | 'contracting' | 'reserved' | 'boarded' | 'delivered';
export type VesselStatus = 'available' | 'route' | 'maintenance';
export type DealStage = 'quote' | 'counteroffer' | 'contract' | 'boarding' | 'delivered';

export type Cargo = {
  id: string;
  title: string;
  origin: string;
  destination: string;
  volume: string;
  window: string;
  cargoType: string;
  status: CargoStatus;
  co2Saving: string;
  targetPrice: string;
  description?: string;
  producer?: string;
  temperature?: string;
  documents?: string[];
  productFamily?: 'bioeconomy' | 'perishable' | 'territorialSupply' | 'industrialCabotage';
  corridor?: string;
  mainRiver?: string;
  serviceType?: string;
  predictability?: 'high' | 'medium' | 'seasonal';
  etaConfidence?: string;
  connectivity?: 'online' | 'delayedSync' | 'lowSignal';
  documentReadiness?: number;
  requiredDocuments?: { name: string; status: 'required' | 'conditional' | 'nextPhase' | 'ok'; note?: string }[];
  operationalRisks?: string[];
  originContext?: string;
  ownerId?: string;
  negotiationIds?: string[];
};

export type GovernmentIndicator = {
  label: string;
  value: string;
  hint: string;
};

export type CorridorIntelligence = {
  corridor: string;
  river: string;
  service: string;
  predictability: 'high' | 'medium' | 'seasonal';
  publicValue: string;
};

export type ComplianceQueueItem = {
  title: string;
  subject: string;
  severity: 'low' | 'medium' | 'high';
  due: string;
};


export type Vessel = {
  id: string;
  name: string;
  route: string;
  capacity: string;
  eta: string;
  status: VesselStatus;
  owner: string;
  imageUrl?: string;
  vesselType?: string;
  year?: number;
  draft?: string;
  flag?: string;
  certifications?: string[];
  amenities?: string[];
  sustainabilityScore?: string;
  lastInspection?: string;
  corridor?: string;
  documentStatus?: 'verified' | 'pending' | 'review';
  lowConnectivityReady?: boolean;
  checklistReady?: boolean;
  ownerId?: string;
  availableFrom?: string;
};

export type Negotiation = {
  id: string;
  cargoTitle: string;
  vesselName: string;
  stage: DealStage;
  amount: string;
  lastUpdate: string;
  parties: string[];
  route?: string;
  paymentTerms?: string;
  insurance?: string;
  documents?: string[];
  nextStep?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  history?: { title: string; description: string; date: string }[];
  cargoId?: string;
  vesselId?: string;
  shipperId?: string;
  carrierId?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
};

/** Milestones da timeline operacional (auditável); futuras APIs/UI podem filtrar por `kind`. */
export type OperationalTrackingEventKind =
  | 'cargo_created'
  | 'proposal_sent'
  | 'negotiation_accepted'
  | 'documentation_pending'
  | 'shipment_confirmed'
  | 'in_transit'
  | 'delay_reported'
  | 'delivered'
  | 'proof_attached';

/** Quem registrou o evento no modelo auditável (mock pode omitir). */
export type TrackingActorRole = 'shipper' | 'carrier' | 'admin' | 'system';

export type TrackingEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'done' | 'current' | 'pending';
  evidence?: string;
  cargoId?: string;
  negotiationId?: string;
  /** Tipo operacional explícito; legados sem campo continuam válidos (inferência em `tracking.helpers`). */
  kind?: OperationalTrackingEventKind;
  actorId?: string;
  actorRole?: TrackingActorRole;
  /** Momento declarado da ocorrência (ISO 8601). Opcional nos mocks legados em disco. */
  occurredAt?: string;
  /** Momento em que o evento foi registrado no sistema (ISO 8601). */
  recordedAt?: string;
  /** Referência futura a documento comprobatório (sem implementação de upload nesta fase). */
  evidenceDocumentId?: string;
  metadata?: Record<string, string>;
};

import type { HydroUser } from '@/features/auth/domain/auth.types';
import { defaultUsers } from '@/features/auth/data/auth.mock';
import { cargoes, negotiations, trackingEvents, vessels } from '@/features/marketplace/data/marketplace.mock';
import type { Cargo, Negotiation, TrackingEvent, Vessel } from '@/features/marketplace/domain/marketplace.types';

export type MockScenarioId =
  | 'empty-state'
  | 'market-active'
  | 'negotiation-flow'
  | 'in-transit'
  | 'completed'
  | 'error-scenarios';

export type MockScenarioData = {
  users: HydroUser[];
  cargoes: Cargo[];
  vessels: Vessel[];
  negotiations: Negotiation[];
  trackingEvents: TrackingEvent[];
};

export const mockScenarioIds: MockScenarioId[] = [
  'empty-state',
  'market-active',
  'negotiation-flow',
  'in-transit',
  'completed',
  'error-scenarios'
];

function withRelationships(data: MockScenarioData): MockScenarioData {
  const cargoById = new Map(data.cargoes.map((cargo) => [cargo.id, cargo]));
  const firstShipper = data.users.find((user) => user.role === 'shipper');
  const firstCarrier = data.users.find((user) => user.role === 'carrier');

  const nextCargoes = data.cargoes.map((cargo) => ({
    ...cargo,
    ownerId: cargo.ownerId ?? firstShipper?.id,
    negotiationIds: data.negotiations.filter((item) => item.cargoId === cargo.id).map((item) => item.id)
  }));

  const nextNegotiations = data.negotiations.map((item, index) => {
    const cargo = item.cargoId ? cargoById.get(item.cargoId) : data.cargoes[index % Math.max(data.cargoes.length, 1)];
    const vessel = item.vesselId ? data.vessels.find((candidate) => candidate.id === item.vesselId) : data.vessels[index % Math.max(data.vessels.length, 1)];
    return {
      ...item,
      cargoId: item.cargoId ?? cargo?.id,
      vesselId: item.vesselId ?? vessel?.id,
      shipperId: item.shipperId ?? cargo?.ownerId ?? firstShipper?.id,
      carrierId: item.carrierId ?? vessel?.ownerId ?? firstCarrier?.id,
      status: item.status ?? (item.stage === 'delivered' ? 'accepted' : item.stage === 'quote' ? 'pending' : 'accepted')
    };
  });

  const acceptedNegotiation = nextNegotiations.find((item) => item.status === 'accepted');
  const trackedCargoId = acceptedNegotiation?.cargoId ?? nextCargoes.find((cargo) => cargo.status === 'boarded' || cargo.status === 'delivered')?.id;

  return {
    ...data,
    cargoes: nextCargoes,
    negotiations: nextNegotiations,
    vessels: data.vessels.map((vessel) => ({ ...vessel, ownerId: vessel.ownerId ?? firstCarrier?.id })),
    trackingEvents: data.trackingEvents.map((event) => ({
      ...event,
      cargoId: event.cargoId ?? trackedCargoId,
      negotiationId: event.negotiationId ?? acceptedNegotiation?.id
    }))
  };
}

const baseData: MockScenarioData = withRelationships({
  users: defaultUsers,
  cargoes,
  vessels,
  negotiations,
  trackingEvents
});

export const mockScenarios: Record<MockScenarioId, MockScenarioData> = {
  'empty-state': withRelationships({
    users: defaultUsers,
    cargoes: [],
    vessels: vessels.slice(0, 2),
    negotiations: [],
    trackingEvents: []
  }),

  'market-active': withRelationships({
    users: defaultUsers,
    cargoes: cargoes.map((cargo, index) => ({ ...cargo, status: index % 3 === 0 ? 'open' : index % 3 === 1 ? 'bidding' : cargo.status })),
    vessels: vessels.map((vessel, index) => ({ ...vessel, status: index % 3 === 0 ? 'available' : vessel.status })),
    negotiations: negotiations.slice(0, 2).map((item) => ({ ...item, stage: 'quote', status: 'pending' })),
    trackingEvents: []
  }),

  'negotiation-flow': withRelationships({
    users: defaultUsers,
    cargoes: cargoes.slice(0, 6).map((cargo, index) => ({ ...cargo, status: index < 3 ? 'bidding' : cargo.status })),
    vessels: vessels.slice(0, 5),
    negotiations: negotiations.slice(0, 4).map((item, index) => ({
      ...item,
      stage: index === 0 ? 'contract' : 'quote',
      status: index === 0 ? 'accepted' : 'pending'
    })),
    trackingEvents: trackingEvents.slice(0, 1)
  }),

  'in-transit': withRelationships({
    users: defaultUsers,
    cargoes: cargoes.slice(0, 5).map((cargo, index) => ({ ...cargo, status: index === 0 ? 'boarded' : cargo.status })),
    vessels: vessels.slice(0, 5).map((vessel, index) => ({ ...vessel, status: index === 0 ? 'route' : vessel.status })),
    negotiations: negotiations.slice(0, 3).map((item, index) => ({
      ...item,
      stage: index === 0 ? 'boarding' : item.stage,
      status: index === 0 ? 'accepted' : 'pending'
    })),
    trackingEvents: trackingEvents.map((event, index) => ({ ...event, status: index < 2 ? 'done' : index === 2 ? 'current' : 'pending' }))
  }),

  completed: withRelationships({
    users: defaultUsers,
    cargoes: cargoes.slice(0, 5).map((cargo, index) => ({ ...cargo, status: index === 0 ? 'delivered' : cargo.status })),
    vessels: vessels.slice(0, 5).map((vessel) => ({ ...vessel, status: 'available' })),
    negotiations: negotiations.slice(0, 3).map((item, index) => ({
      ...item,
      stage: index === 0 ? 'delivered' : item.stage,
      status: index === 0 ? 'accepted' : 'pending'
    })),
    trackingEvents: trackingEvents.map((event) => ({ ...event, status: 'done' }))
  }),

  'error-scenarios': withRelationships({
    users: defaultUsers.map((user, index) => ({ ...user, approved: index < 2 })),
    cargoes: cargoes.slice(0, 4).map((cargo, index) => ({
      ...cargo,
      status: index === 0 ? 'open' : cargo.status,
      documentReadiness: index === 0 ? 12 : cargo.documentReadiness,
      operationalRisks: [...(cargo.operationalRisks ?? []), 'Cenário mock com pendência operacional']
    })),
    vessels: vessels.slice(0, 3).map((vessel, index) => ({ ...vessel, status: index === 0 ? 'maintenance' : vessel.status })),
    negotiations: negotiations.slice(0, 2).map((item) => ({ ...item, status: 'rejected', riskLevel: 'high' })),
    trackingEvents: trackingEvents.slice(0, 2).map((event) => ({ ...event, evidence: undefined }))
  })
};

export function getMockScenario(id: string | null | undefined): MockScenarioData {
  if (id && mockScenarioIds.includes(id as MockScenarioId)) {
    return mockScenarios[id as MockScenarioId];
  }

  return baseData;
}

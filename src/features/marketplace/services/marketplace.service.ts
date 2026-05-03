import { readMock } from '@/shared/server/mock-db';

export async function listCargoes() { return readMock('cargoes'); }
export async function listVessels() { return readMock('vessels'); }
export async function listNegotiations() { return readMock('negotiations'); }
export async function getCargoById(id: string) { return readMock('cargoes').find((cargo) => cargo.id === id); }
export async function getVesselById(id: string) { return readMock('vessels').find((vessel) => vessel.id === id); }
export async function getNegotiationById(id: string) { return readMock('negotiations').find((negotiation) => negotiation.id === id); }
export async function listTrackingEvents() { return readMock('trackingEvents'); }

export async function getMarketplaceSummary() {
  const cargoes = readMock('cargoes');
  const vessels = readMock('vessels');
  const negotiations = readMock('negotiations');
  return {
    openCargoes: cargoes.length,
    availableVessels: vessels.filter((vessel) => vessel.status === 'available').length,
    activeNegotiations: negotiations.length,
    averageSaving: '38%'
  };
}

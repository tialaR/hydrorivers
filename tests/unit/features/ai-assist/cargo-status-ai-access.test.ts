import { describe, expect, it } from 'vitest';
import { explainCargoStatusAssistDenial } from '@/features/ai-assist/services/cargo-status-ai-access';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

const cargo: Cargo = {
  id: 'c1',
  title: 'T',
  origin: 'a',
  destination: 'b',
  volume: '1',
  window: 'w',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '0',
  targetPrice: 'R$ 1',
  ownerId: 'owner-1'
};

const shipperWrong: HydroUser = {
  id: 'other',
  name: 'S',
  email: 's@test.com',
  company: 'Co',
  role: 'shipper',
  approved: true
};

const carrierOk: HydroUser = {
  id: 'car-1',
  name: 'C',
  email: 'c@test.com',
  company: 'Co',
  role: 'carrier',
  approved: true
};

const carrierWrong: HydroUser = {
  ...carrierOk,
  id: 'car-2'
};

describe('explainCargoStatusAssistDenial', () => {
  it('shipper mismatch → actor is not owner', () => {
    expect(explainCargoStatusAssistDenial(shipperWrong, cargo, [])).toEqual(['actor is not owner']);
  });

  it('carrier sem negociação na carga → actor is not assigned carrier', () => {
    expect(explainCargoStatusAssistDenial(carrierWrong, cargo, [])).toEqual(['actor is not assigned carrier']);
  });

  it('carrier com negociação para outros transportadores → actor is not negotiation participant', () => {
    const negotiations: Negotiation[] = [
      {
        id: 'n1',
        cargoTitle: '',
        vesselName: '',
        stage: 'quote',
        amount: '',
        lastUpdate: '',
        parties: [],
        cargoId: 'c1',
        carrierId: 'car-1',
        shipperId: 'owner-1'
      }
    ];
    expect(explainCargoStatusAssistDenial(carrierWrong, cargo, negotiations)).toEqual([
      'actor is not negotiation participant'
    ]);
    expect(explainCargoStatusAssistDenial(carrierOk, cargo, negotiations)).toEqual([]);
  });
});

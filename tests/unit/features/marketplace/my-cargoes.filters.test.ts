import { describe, expect, it } from 'vitest';
import { filterMyCargoes, cargoMatchesCarrier, cargoMatchesShipper } from '@/features/marketplace/services/my-cargoes.filters';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';
import type { HydroUser } from '@/features/auth/domain/auth.types';

const baseCargo = (over: Partial<Cargo>): Cargo => ({
  id: 'c1',
  title: 'T',
  origin: 'A',
  destination: 'B',
  volume: '1',
  window: 'w',
  cargoType: 'Seca',
  status: 'open',
  co2Saving: '-1%',
  targetPrice: 'R$ 1',
  ...over
});

function user(role: HydroUser['role'], id: string): HydroUser {
  return {
    id,
    name: 'N',
    email: 'n@test.com',
    company: 'C',
    role,
    approved: true
  };
}

describe('my-cargoes.filters', () => {
  it('shipper vê carga por ownerId ou shipperId', () => {
    const cargoes = [baseCargo({ id: 'x', ownerId: 'u-s1' }), baseCargo({ id: 'y', shipperId: 'u-s2' })];
    expect(filterMyCargoes(user('shipper', 'u-s1'), cargoes, [])).toHaveLength(1);
    expect(filterMyCargoes(user('shipper', 'u-s2'), cargoes, [])).toHaveLength(1);
  });

  it('shipper vê carga ligada como shipper na negociação', () => {
    const cargoes = [baseCargo({ id: 'cargo-001' })];
    const negotiations: Negotiation[] = [
      {
        id: 'n1',
        cargoTitle: 't',
        vesselName: 'v',
        stage: 'quote',
        amount: '1',
        lastUpdate: 'today',
        parties: [],
        cargoId: 'cargo-001',
        shipperId: 'u-shipper-1'
      }
    ];
    const mine = filterMyCargoes(user('shipper', 'u-shipper-1'), cargoes, negotiations);
    expect(mine.map((c) => c.id)).toContain('cargo-001');
  });

  it('carrier vê apenas cargas com carrierId ou negociação', () => {
    const cargoes = [
      baseCargo({ id: 'a', carrierId: 'u-c1' }),
      baseCargo({ id: 'b' }),
      baseCargo({ id: 'c' })
    ];
    const negotiations: Negotiation[] = [
      {
        id: 'n1',
        cargoTitle: 't',
        vesselName: 'v',
        stage: 'quote',
        amount: '1',
        lastUpdate: 'today',
        parties: [],
        cargoId: 'b',
        carrierId: 'u-c1'
      }
    ];
    const mine = filterMyCargoes(user('carrier', 'u-c1'), cargoes, negotiations);
    expect(mine.map((c) => c.id).sort()).toEqual(['a', 'b']);
  });

  it('carrier não vê cargas sem vínculo', () => {
    const cargoes = [baseCargo({ id: 'z' })];
    expect(filterMyCargoes(user('carrier', 'u-other'), cargoes, [])).toHaveLength(0);
  });

  it('admin recebe lista vazia no filtro (fluxo de página redireciona)', () => {
    expect(filterMyCargoes(user('admin', 'u-a'), [baseCargo({})], []).length).toBe(0);
  });

  it('cargoMatchesShipper / cargoMatchesCarrier', () => {
    const cargo = baseCargo({ id: 'cid', ownerId: 's1' });
    expect(cargoMatchesShipper('s1', cargo, [])).toBe(true);
    expect(cargoMatchesCarrier('c1', baseCargo({ carrierId: 'c1' }), [])).toBe(true);
    expect(cargoMatchesCarrier('c1', baseCargo({ id: 'z' }), [{ id: 'n', cargoTitle: '', vesselName: '', stage: 'quote', amount: '', lastUpdate: '', parties: [], cargoId: 'z', carrierId: 'c1' }])).toBe(true);
  });
});

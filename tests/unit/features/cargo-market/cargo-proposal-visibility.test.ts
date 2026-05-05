import { describe, expect, it } from 'vitest';
import { shouldShowCargoProposalForm } from '@/features/cargo-market/utils/cargo-proposal-visibility';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

const cargo = (over: Partial<Cargo>): Cargo => ({
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

describe('cargo-proposal-visibility', () => {
  it('sem viewer mantém formulário visível (demo/anônimo)', () => {
    expect(shouldShowCargoProposalForm(null, cargo({ ownerId: 'u1' }))).toBe(true);
    expect(shouldShowCargoProposalForm(undefined, cargo({ ownerId: 'u1' }))).toBe(true);
  });

  it('embarcador dono não vê formulário de proposta', () => {
    expect(
      shouldShowCargoProposalForm({ id: 'u-shipper-1', role: 'shipper' }, cargo({ ownerId: 'u-shipper-1' }))
    ).toBe(false);
    expect(
      shouldShowCargoProposalForm({ id: 'u-shipper-1', role: 'shipper' }, cargo({ shipperId: 'u-shipper-1' }))
    ).toBe(false);
  });

  it('transportador vê formulário em carga de terceiros', () => {
    expect(
      shouldShowCargoProposalForm({ id: 'u-carrier-1', role: 'carrier' }, cargo({ ownerId: 'u-shipper-1' }))
    ).toBe(true);
  });

  it('admin vê formulário em carga de terceiros', () => {
    expect(shouldShowCargoProposalForm({ id: 'u-admin-1', role: 'admin' }, cargo({ ownerId: 'u-shipper-1' }))).toBe(true);
  });
});

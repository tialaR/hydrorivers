import { describe, expect, it } from 'vitest';
import {
  getCargoProposalVisibility,
  shouldShowCargoProposalForm
} from '@/features/cargo-market/utils/cargo-proposal-visibility';
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
  describe('getCargoProposalVisibility', () => {
    it('sem viewer: formulário visível (demo/anônimo)', () => {
      expect(getCargoProposalVisibility(null, cargo({ ownerId: 'u1' }))).toEqual({ kind: 'show_form' });
      expect(getCargoProposalVisibility(undefined, cargo({ ownerId: 'u1' }))).toEqual({ kind: 'show_form' });
    });

    it('embarcador dono: mensagem de aguardo, sem formulário', () => {
      expect(
        getCargoProposalVisibility({ id: 'u-shipper-1', role: 'shipper', approved: true }, cargo({ ownerId: 'u-shipper-1' }))
      ).toEqual({ kind: 'shipper_owner' });
      expect(
        getCargoProposalVisibility({ id: 'u-shipper-1', role: 'shipper' }, cargo({ shipperId: 'u-shipper-1' }))
      ).toEqual({ kind: 'shipper_owner' });
    });

    it('transportador aprovado em carga de terceiros: formulário', () => {
      expect(
        getCargoProposalVisibility(
          { id: 'u-carrier-1', role: 'carrier', approved: true },
          cargo({ ownerId: 'u-shipper-1' })
        )
      ).toEqual({ kind: 'show_form' });
    });

    it('transportador não aprovado: mensagem de moderação, sem formulário', () => {
      expect(
        getCargoProposalVisibility(
          { id: 'u-carrier-1', role: 'carrier', approved: false },
          cargo({ ownerId: 'u-shipper-1' })
        )
      ).toEqual({ kind: 'carrier_pending_approval' });
    });

    it('transportador sem flag approved trata como não aprovado', () => {
      expect(
        getCargoProposalVisibility({ id: 'u-carrier-1', role: 'carrier' }, cargo({ ownerId: 'u-shipper-1' }))
      ).toEqual({ kind: 'carrier_pending_approval' });
    });

    it('admin: mensagem administrativa, sem formulário', () => {
      expect(
        getCargoProposalVisibility({ id: 'u-admin-1', role: 'admin', approved: true }, cargo({ ownerId: 'u-shipper-1' }))
      ).toEqual({ kind: 'admin_no_proposal' });
    });

    it('embarcador que não é dono: formulário', () => {
      expect(
        getCargoProposalVisibility({ id: 'u-shipper-2', role: 'shipper', approved: true }, cargo({ ownerId: 'u-shipper-1' }))
      ).toEqual({ kind: 'show_form' });
    });
  });

  describe('shouldShowCargoProposalForm', () => {
    it('alinha com getCargoProposalVisibility.kind === show_form', () => {
      const c = cargo({ ownerId: 'u-shipper-1' });
      expect(shouldShowCargoProposalForm(null, c)).toBe(true);
      expect(shouldShowCargoProposalForm({ id: 'u-shipper-1', role: 'shipper' }, c)).toBe(false);
      expect(shouldShowCargoProposalForm({ id: 'u-carrier-1', role: 'carrier', approved: true }, c)).toBe(true);
      expect(shouldShowCargoProposalForm({ id: 'u-carrier-1', role: 'carrier', approved: false }, c)).toBe(false);
      expect(shouldShowCargoProposalForm({ id: 'u-admin-1', role: 'admin' }, c)).toBe(false);
    });
  });
});

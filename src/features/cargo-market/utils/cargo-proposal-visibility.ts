import type { UserRole } from '@/features/auth/domain/auth.types';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

export type CargoViewer = { id: string; role: UserRole; approved?: boolean };

export type CargoProposalVisibility =
  | { kind: 'show_form' }
  | { kind: 'shipper_owner' }
  | { kind: 'carrier_pending_approval' }
  | { kind: 'admin_no_proposal' };

function isShipperOwner(viewer: CargoViewer, cargo: Cargo) {
  return viewer.role === 'shipper' && (cargo.ownerId === viewer.id || cargo.shipperId === viewer.id);
}

/** Define se o bloco de proposta no detalhe da carga mostra o formulário ou uma mensagem contextual. */
export function getCargoProposalVisibility(
  viewer: CargoViewer | null | undefined,
  cargo: Cargo
): CargoProposalVisibility {
  if (!viewer) return { kind: 'show_form' };
  if (viewer.role === 'admin') return { kind: 'admin_no_proposal' };
  if (isShipperOwner(viewer, cargo)) return { kind: 'shipper_owner' };
  if (viewer.role === 'carrier' && !viewer.approved) return { kind: 'carrier_pending_approval' };
  return { kind: 'show_form' };
}

/** Equivalente a `getCargoProposalVisibility(...).kind === 'show_form'`. */
export function shouldShowCargoProposalForm(viewer: CargoViewer | null | undefined, cargo: Cargo): boolean {
  return getCargoProposalVisibility(viewer, cargo).kind === 'show_form';
}

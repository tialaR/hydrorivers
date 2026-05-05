import type { UserRole } from '@/features/auth/domain/auth.types';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

export type CargoViewer = { id: string; role: UserRole };

/** Embarcador dono da publicação não deve ver o formulário de proposta (fluxo transportador). */
export function shouldShowCargoProposalForm(viewer: CargoViewer | null | undefined, cargo: Cargo): boolean {
  if (!viewer) return true;
  if (viewer.role === 'shipper' && (cargo.ownerId === viewer.id || cargo.shipperId === viewer.id)) {
    return false;
  }
  return true;
}

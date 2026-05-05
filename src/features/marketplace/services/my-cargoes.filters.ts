import type { HydroUser } from '@/features/auth/domain/auth.types';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

/** Embarcador: cargas onde é dono/registrador ou participa como shipper na negociação mock. */
export function cargoMatchesShipper(userId: string, cargo: Cargo, negotiations: Negotiation[]): boolean {
  if (cargo.ownerId === userId || cargo.shipperId === userId) return true;
  return negotiations.some((n) => n.cargoId === cargo.id && n.shipperId === userId);
}

/** Transportador: cargas com vínculo direto ou negociação/proposta mock. */
export function cargoMatchesCarrier(userId: string, cargo: Cargo, negotiations: Negotiation[]): boolean {
  if (cargo.carrierId === userId) return true;
  return negotiations.some((n) => n.cargoId === cargo.id && n.carrierId === userId);
}

export function filterMyCargoes(user: HydroUser, cargoes: Cargo[], negotiations: Negotiation[]): Cargo[] {
  if (user.role === 'shipper') {
    return cargoes.filter((c) => cargoMatchesShipper(user.id, c, negotiations));
  }
  if (user.role === 'carrier') {
    return cargoes.filter((c) => cargoMatchesCarrier(user.id, c, negotiations));
  }
  return [];
}

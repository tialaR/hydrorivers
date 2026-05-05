import 'server-only';

import type { HydroUser } from '@/features/auth/domain/auth.types';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

/**
 * Escopo mínimo para assistência (somente leitura explicativa).
 * Admin: todas as cargas do mock.
 * Embarcador: apenas cargas com ownerId igual ao usuário (cargas sem ownerId não recebem assistência nesta fase).
 * Transportador: apenas se participa de alguma negociação vinculada à carga.
 */
export function canUserAccessCargoStatusAssist(user: HydroUser, cargo: Cargo, negotiations: Negotiation[]): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'shipper') {
    return Boolean(cargo.ownerId && cargo.ownerId === user.id);
  }
  if (user.role === 'carrier') {
    return negotiations.some((n) => n.cargoId === cargo.id && n.carrierId === user.id);
  }
  return false;
}

/**
 * Razões de bloqueio para QA/dev alinhadas à mesma lógica de {@link canUserAccessCargoStatusAssist}
 * (somente quando o acesso falha por escopo de papel na carga).
 */
export function explainCargoStatusAssistDenial(user: HydroUser, cargo: Cargo, negotiations: Negotiation[]): string[] {
  if (canUserAccessCargoStatusAssist(user, cargo, negotiations)) return [];
  if (user.role === 'shipper') {
    return ['actor is not owner'];
  }
  if (user.role === 'carrier') {
    const forCargo = negotiations.filter((n) => n.cargoId === cargo.id);
    if (forCargo.length === 0) {
      return ['actor is not assigned carrier'];
    }
    return ['actor is not negotiation participant'];
  }
  return ['role has no cargo status assistant scope'];
}

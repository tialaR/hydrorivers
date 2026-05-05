import 'server-only';

import type { HydroUser } from '@/features/auth/domain/auth.types';
import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { cargoCacheRevalidateProfile, cargoCacheTags } from '@/features/cargos/cache/cargo-cache-tags';
import { routing } from '@/core/i18n/routing';
import { appRoutes } from '@/shared/routing/app-routes';
import { isNonEmptyText } from '@/shared/server/auth';
import { upsertCargo } from '@/shared/server/mock-db';
import { revalidatePath, revalidateTag } from 'next/cache';

const allowedStatuses: CargoStatus[] = ['open', 'bidding', 'contracting', 'reserved', 'boarded', 'delivered'];

export type PublishCargoCommitFailure =
  | 'unauthenticated'
  | 'forbidden-role'
  | 'forbidden-unapproved'
  | 'missing-required-fields';

export type PublishCargoCommitResult =
  | { ok: true; cargo: Cargo }
  | { ok: false; reason: PublishCargoCommitFailure };

/**
 * Persistência + revalidação compartilhadas entre `POST /api/cargas` e Server Actions (ex.: publicar carga).
 */
export function commitPublishCargo(user: HydroUser | null, payload: Partial<Cargo>): PublishCargoCommitResult {
  if (!user) return { ok: false, reason: 'unauthenticated' };
  if (user.role === 'carrier') return { ok: false, reason: 'forbidden-role' };
  if (!user.approved) return { ok: false, reason: 'forbidden-unapproved' };

  if (!isNonEmptyText(payload.origin) || !isNonEmptyText(payload.destination) || !isNonEmptyText(payload.cargoType)) {
    return { ok: false, reason: 'missing-required-fields' };
  }

  const status = allowedStatuses.includes(payload.status as CargoStatus) ? (payload.status as CargoStatus) : 'open';

  const cargo: Cargo = {
    id: payload.id ?? `mock-${Date.now()}`,
    ownerId: user.id,
    shipperId: user.id,
    title: isNonEmptyText(payload.title) ? String(payload.title).trim() : String(payload.cargoType).trim(),
    origin: String(payload.origin).trim(),
    destination: String(payload.destination).trim(),
    volume: isNonEmptyText(payload.volume) ? String(payload.volume).trim() : 'A definir',
    window: isNonEmptyText(payload.window) ? String(payload.window).trim() : 'A definir',
    cargoType: String(payload.cargoType).trim(),
    status,
    co2Saving: isNonEmptyText(payload.co2Saving) ? String(payload.co2Saving).trim() : '-52% CO₂',
    targetPrice: isNonEmptyText(payload.targetPrice) ? String(payload.targetPrice).trim() : 'Sob consulta',
    description: isNonEmptyText(payload.description, 800) ? String(payload.description).trim() : undefined,
    producer: user.company,
    temperature: isNonEmptyText(payload.temperature) ? String(payload.temperature).trim() : undefined,
    documents:
      Array.isArray(payload.documents) && payload.documents.length
        ? payload.documents.map(String).filter(Boolean).slice(0, 8)
        : ['NF-e', 'Romaneio'],
    productFamily: payload.productFamily ?? 'territorialSupply',
    corridor: isNonEmptyText(payload.corridor)
      ? String(payload.corridor).trim()
      : `${String(payload.origin).trim()}–${String(payload.destination).trim()}`,
    mainRiver: isNonEmptyText(payload.mainRiver) ? String(payload.mainRiver).trim() : 'A definir',
    serviceType: isNonEmptyText(payload.serviceType) ? String(payload.serviceType).trim() : 'Navegação interior',
    predictability: payload.predictability ?? 'medium',
    connectivity: payload.connectivity ?? 'delayedSync',
    documentReadiness: typeof payload.documentReadiness === 'number' ? payload.documentReadiness : 40,
    requiredDocuments: Array.isArray(payload.requiredDocuments)
      ? payload.requiredDocuments
      : [
          { name: 'NF-e', status: 'required', note: 'Documento fiscal da mercadoria.' },
          { name: 'CT-e', status: 'nextPhase', note: 'Emitir na contratação do transporte.' },
          { name: 'Romaneio', status: 'required', note: 'Lista de volumes por lote.' }
        ]
  };

  upsertCargo(cargo);

  revalidateTag(cargoCacheTags.allCargos, cargoCacheRevalidateProfile);
  revalidateTag(cargoCacheTags.cargoMarketplace, cargoCacheRevalidateProfile);
  revalidateTag(cargoCacheTags.userCargos(user.id), cargoCacheRevalidateProfile);
  revalidateTag(cargoCacheTags.cargoDetail(cargo.id), cargoCacheRevalidateProfile);

  for (const locale of routing.locales) {
    revalidatePath(appRoutes.cargos.marketplace(locale));
    revalidatePath(appRoutes.cargos.myCargos(locale));
    revalidatePath(appRoutes.dashboard.home(locale));
  }

  return { ok: true, cargo };
}

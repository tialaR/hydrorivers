import { revalidatePath } from 'next/cache';
import { getSessionUser, isNonEmptyText } from '@/shared/server/auth';
import { forbidden, invalidPayload, unauthenticated } from '@/shared/server/api-errors';
import { upsertCargo } from '@/shared/server/mock-db';
import { getRepositories } from '@/shared/server/repositories';
import type { Cargo, CargoStatus } from '@/features/marketplace/domain/marketplace.types';
import { routing } from '@/core/i18n/routing';
import { appRoutes } from '@/shared/routing/app-routes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedStatuses: CargoStatus[] = ['open', 'bidding', 'contracting', 'reserved', 'boarded', 'delivered'];

export function GET() {
  return Response.json({ data: getRepositories().cargoes.list() });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthenticated();
  if (user.role === 'carrier') return forbidden('role-not-allowed');
  if (!user.approved) return forbidden('user-not-approved');

  const payload = await request.json().catch(() => null) as Partial<Cargo> | null;
  if (!payload) return invalidPayload('invalid-json');

  if (!isNonEmptyText(payload.origin) || !isNonEmptyText(payload.destination) || !isNonEmptyText(payload.cargoType)) {
    return invalidPayload('missing-required-fields');
  }

  const status = allowedStatuses.includes(payload.status as CargoStatus) ? payload.status as CargoStatus : 'open';

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
    documents: Array.isArray(payload.documents) && payload.documents.length
      ? payload.documents.map(String).filter(Boolean).slice(0, 8)
      : ['NF-e', 'Romaneio'],
    productFamily: payload.productFamily ?? 'territorialSupply',
    corridor: isNonEmptyText(payload.corridor) ? String(payload.corridor).trim() : `${String(payload.origin).trim()}–${String(payload.destination).trim()}`,
    mainRiver: isNonEmptyText(payload.mainRiver) ? String(payload.mainRiver).trim() : 'A definir',
    serviceType: isNonEmptyText(payload.serviceType) ? String(payload.serviceType).trim() : 'Navegação interior',
    predictability: payload.predictability ?? 'medium',
    connectivity: payload.connectivity ?? 'delayedSync',
    documentReadiness: typeof payload.documentReadiness === 'number' ? payload.documentReadiness : 40,
    requiredDocuments: Array.isArray(payload.requiredDocuments) ? payload.requiredDocuments : [
      { name: 'NF-e', status: 'required', note: 'Documento fiscal da mercadoria.' },
      { name: 'CT-e', status: 'nextPhase', note: 'Emitir na contratação do transporte.' },
      { name: 'Romaneio', status: 'required', note: 'Lista de volumes por lote.' }
    ]
  };

  upsertCargo(cargo);

  for (const locale of routing.locales) {
    revalidatePath(appRoutes.cargos.marketplace(locale));
    revalidatePath(appRoutes.cargos.myCargos(locale));
    revalidatePath(appRoutes.dashboard.home(locale));
  }

  return Response.json({ data: cargo }, { status: 201 });
}

import { getSessionUser, isNonEmptyText } from '@/shared/server/auth';
import { forbidden, invalidPayload, unauthenticated } from '@/shared/server/api-errors';
import { httpStatus } from '@/shared/http/http-status';
import { readMock, writeMock } from '@/shared/server/mock-db';
import type { Negotiation } from '@/features/marketplace/domain/marketplace.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled'] as const;

export function GET() {
  return Response.json({ data: readMock('negotiations') });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthenticated();
  if (user.role !== 'carrier') return forbidden('role-not-allowed');
  if (!user.approved) return forbidden('user-not-approved');

  const payload = await request.json().catch(() => null) as Partial<Negotiation> | null;
  if (!payload || !isNonEmptyText(payload.cargoId) || !isNonEmptyText(payload.amount)) {
    return invalidPayload('missing-required-fields');
  }

  const cargoes = readMock('cargoes');
  const cargo = cargoes.find((item) => item.id === payload.cargoId);
  if (!cargo) return Response.json({ error: 'cargo-not-found' }, { status: httpStatus.notFound });

  const vessels = readMock('vessels');
  let vessel = isNonEmptyText(payload.vesselId) ? vessels.find((item) => item.id === payload.vesselId) : undefined;
  if (!vessel) {
    vessel = vessels.find((item) => item.ownerId === user.id) ?? vessels[0];
  }
  if (!vessel) return Response.json({ error: 'vessel-not-found' }, { status: httpStatus.notFound });
  if (vessel.ownerId && vessel.ownerId !== user.id) return forbidden('vessel-not-owned');
  const estimatedTime = typeof payload.estimatedTime === 'string' && payload.estimatedTime.trim()
    ? payload.estimatedTime.trim()
    : undefined;
  const vesselCompatibility = typeof payload.vesselCompatibility === 'string' && payload.vesselCompatibility.trim()
    ? payload.vesselCompatibility.trim()
    : undefined;
  const contactChannel = typeof payload.contactChannel === 'string' && payload.contactChannel.trim()
    ? payload.contactChannel.trim()
    : undefined;
  const proposalMessage = typeof payload.proposalMessage === 'string' && payload.proposalMessage.trim()
    ? payload.proposalMessage.trim()
    : undefined;

  const negotiation: Negotiation = {
    id: payload.id ?? `neg-${Date.now()}`,
    cargoId: cargo.id,
    vesselId: vessel.id,
    shipperId: cargo.ownerId,
    carrierId: user.id,
    cargoTitle: cargo.title,
    vesselName: vessel.name,
    stage: 'quote',
    status: 'pending',
    amount: String(payload.amount).trim(),
    lastUpdate: new Date().toISOString(),
    parties: [cargo.producer ?? 'Embarcador', user.company],
    route: cargo.corridor ?? `${cargo.origin}–${cargo.destination}`,
    paymentTerms: payload.paymentTerms ?? 'A combinar',
    insurance: payload.insurance ?? 'A validar',
    documents: payload.documents ?? ['Proposta comercial'],
    estimatedTime,
    vesselCompatibility,
    contactChannel,
    proposalMessage,
    nextStep: 'Aguardar aceite do embarcador',
    riskLevel: payload.riskLevel ?? 'low',
    history: [
      {
        title: 'Proposta criada',
        description: proposalMessage
          ? `Proposta enviada por ${user.company}: ${proposalMessage}.`
          : `Proposta enviada por ${user.company}.`,
        date: new Date().toISOString()
      }
    ]
  };

  const negotiations = readMock('negotiations');
  writeMock('negotiations', [negotiation, ...negotiations]);

  writeMock('cargoes', cargoes.map((item) => item.id === cargo.id
    ? { ...item, status: 'bidding', negotiationIds: [...(item.negotiationIds ?? []), negotiation.id] }
    : item
  ));

  return Response.json({ data: negotiation }, { status: httpStatus.created });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthenticated();

  const payload = await request.json().catch(() => null) as { id?: string; status?: Negotiation['status'] } | null;
  if (!payload?.id || !validStatuses.includes(payload.status as NonNullable<Negotiation['status']>)) {
    return invalidPayload('invalid-payload');
  }

  const negotiations = readMock('negotiations');
  const target = negotiations.find((item) => item.id === payload.id);
  if (!target) return Response.json({ error: 'negotiation-not-found' }, { status: httpStatus.notFound });
  if (target.shipperId !== user.id && target.carrierId !== user.id) {
    return forbidden();
  }

  const nextNegotiations = negotiations.map((item) => item.id === payload.id
    ? {
        ...item,
        status: payload.status,
        stage: payload.status === 'accepted' ? 'contract' : item.stage,
        lastUpdate: new Date().toISOString(),
        history: [
          ...(item.history ?? []),
          {
            title: `Status atualizado para ${payload.status}`,
            description: `Alteração realizada por ${user.company}.`,
            date: new Date().toISOString()
          }
        ]
      }
    : item
  );

  writeMock('negotiations', nextNegotiations);

  if (payload.status === 'accepted' && target.cargoId) {
    const cargoes = readMock('cargoes');
    writeMock('cargoes', cargoes.map((cargo) => cargo.id === target.cargoId ? { ...cargo, status: 'reserved' } : cargo));
  }

  return Response.json({ data: nextNegotiations.find((item) => item.id === payload.id) });
}

import { getSessionUser } from '@/shared/server/auth';
import { forbidden, invalidPayload, notFound, unauthenticated } from '@/shared/server/api-errors';
import { readMock } from '@/shared/server/mock-db';
import { routing, type AppLocale } from '@/core/i18n/routing';
import { canUserAccessCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-ai-access';
import { buildCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-assistant';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';
import { logUseCaseEvent } from '@/shared/observability/use-case-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function actor(user: HydroUser) {
  return { userId: user.id, role: user.role };
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return unauthenticated();
  }

  if (!user.approved) {
    logUseCaseEvent({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'ACCESS_DENIED',
      status: 'blocked',
      actor: actor(user),
      context: { reason: 'user-not-approved' },
      error: { code: 'user-not-approved', message: 'User not approved' }
    });
    return forbidden('user-not-approved');
  }

  const payload = await request.json().catch(() => null) as { cargoId?: unknown; locale?: unknown } | null;
  if (!payload || typeof payload.cargoId !== 'string' || !payload.cargoId.trim()) {
    logUseCaseEvent({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'REQUEST_RECEIVED',
      status: 'failed',
      actor: actor(user),
      error: { code: 'missing-cargo-id', message: 'Missing or empty cargoId in JSON body' }
    });
    return invalidPayload('missing-cargo-id');
  }

  const cargoId = payload.cargoId.trim();
  const rawLocale = payload.locale;
  const locale: AppLocale = typeof rawLocale === 'string' && (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as AppLocale)
    : routing.defaultLocale;

  logUseCaseEvent({
    useCase: 'AI_CARGO_STATUS_ASSISTANT',
    step: 'REQUEST_RECEIVED',
    status: 'started',
    actor: actor(user),
    context: { cargoId, locale }
  });

  const cargoes = readMock('cargoes') as Cargo[];
  const cargo = cargoes.find((item) => item.id === cargoId);
  if (!cargo) {
    logUseCaseEvent({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'CARGO_NOT_FOUND',
      status: 'failed',
      actor: actor(user),
      context: { cargoId },
      error: { code: 'cargo-not-found', message: 'Cargo not found in mock store' }
    });
    return notFound('cargo-not-found');
  }

  const negotiations = readMock('negotiations') as Negotiation[];
  if (!canUserAccessCargoStatusAssist(user, cargo, negotiations)) {
    logUseCaseEvent({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'ACCESS_DENIED',
      status: 'blocked',
      actor: actor(user),
      context: { cargoId },
      error: { code: 'cargo-access-denied', message: 'User cannot access this cargo' }
    });
    return forbidden('cargo-access-denied');
  }

  const data = buildCargoStatusAssist(cargo, locale);
  if (data.source === 'fallback-rule') {
    logUseCaseEvent({
      useCase: 'AI_CARGO_STATUS_ASSISTANT',
      step: 'FALLBACK_USED',
      status: 'fallback',
      actor: actor(user),
      context: { cargoId, locale, source: data.source }
    });
  }

  logUseCaseEvent({
    useCase: 'AI_CARGO_STATUS_ASSISTANT',
    step: 'RESPONSE_GENERATED',
    status: 'success',
    actor: actor(user),
    context: { cargoId, locale, source: data.source, confidence: data.confidence }
  });

  return Response.json({ data });
}

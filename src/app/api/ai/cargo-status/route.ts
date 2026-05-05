import { getSessionUser } from '@/shared/server/auth';
import { forbidden, invalidPayload, notFound, unauthenticated } from '@/shared/server/api-errors';
import { readMock } from '@/shared/server/mock-db';
import { routing, type AppLocale } from '@/core/i18n/routing';
import { canUserAccessCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-ai-access';
import { buildCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-assistant';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return unauthenticated();
  }

  if (!user.approved) {
    return forbidden('user-not-approved');
  }

  const payload = await request.json().catch(() => null) as { cargoId?: unknown; locale?: unknown } | null;
  if (!payload || typeof payload.cargoId !== 'string' || !payload.cargoId.trim()) {
    return invalidPayload('missing-cargo-id');
  }

  const cargoId = payload.cargoId.trim();
  const rawLocale = payload.locale;
  const locale: AppLocale = typeof rawLocale === 'string' && (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as AppLocale)
    : routing.defaultLocale;

  const cargoes = readMock('cargoes') as Cargo[];
  const cargo = cargoes.find((item) => item.id === cargoId);
  if (!cargo) {
    return notFound('cargo-not-found');
  }

  const negotiations = readMock('negotiations') as Negotiation[];
  if (!canUserAccessCargoStatusAssist(user, cargo, negotiations)) {
    return forbidden('cargo-access-denied');
  }

  const data = buildCargoStatusAssist(cargo, locale);

  return Response.json({ data });
}

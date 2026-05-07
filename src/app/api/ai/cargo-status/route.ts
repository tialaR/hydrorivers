import { getSessionUser } from '@/shared/server/auth';
import { forbidden, invalidPayload, notFound, unauthenticated } from '@/shared/server/api-errors';
import { readMock } from '@/shared/server/mock-db';
import { routing, type AppLocale } from '@/core/i18n/routing';
import { canUserAccessCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-ai-access';
import { buildCargoStatusAssist } from '@/features/ai-assist/services/cargo-status-assistant';
import type { Cargo, Negotiation } from '@/features/marketplace/domain/marketplace.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CargoStatusPayload = {
  cargoId: string;
  locale: AppLocale;
};

function parseCargoStatusPayload(payload: unknown): CargoStatusPayload | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

  const record = payload as Record<string, unknown>;
  if (typeof record.cargoId !== 'string' || !record.cargoId.trim()) return null;

  const cargoId = record.cargoId.trim();
  const locale = typeof record.locale === 'string' && (routing.locales as readonly string[]).includes(record.locale)
    ? (record.locale as AppLocale)
    : routing.defaultLocale;

  return { cargoId, locale };
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return unauthenticated();
  }

  if (!user.approved) {
    return forbidden('user-not-approved');
  }

  const payload = parseCargoStatusPayload(await request.json().catch(() => null));
  if (!payload) {
    return invalidPayload('missing-cargo-id');
  }

  const { cargoId, locale } = payload;

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

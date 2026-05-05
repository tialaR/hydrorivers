import { getSessionUser } from '@/shared/server/auth';
import { forbidden, invalidPayload, unauthenticated } from '@/shared/server/api-errors';
import { getRepositories } from '@/shared/server/repositories';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';
import { commitPublishCargo } from '@/features/cargos/server/commit-publish-cargo';
import { httpStatus } from '@/shared/http/http-status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ data: getRepositories().cargoes.list() });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  const payload = (await request.json().catch(() => null)) as Partial<Cargo> | null;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return invalidPayload('invalid-json');
  }

  const result = commitPublishCargo(user, payload);
  if (!result.ok) {
    if (result.reason === 'unauthenticated') return unauthenticated();
    if (result.reason === 'forbidden-role') return forbidden('role-not-allowed');
    if (result.reason === 'forbidden-unapproved') return forbidden('user-not-approved');
    return invalidPayload('missing-required-fields');
  }

  return Response.json({ data: result.cargo }, { status: httpStatus.created });
}

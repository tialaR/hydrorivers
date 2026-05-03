import type { HydroUser } from '@/features/auth/domain/auth.types';
import { getSessionUser, isNonEmptyText, toPublicUser } from '@/shared/server/auth';
import { upsertUser } from '@/shared/server/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  const current = await getSessionUser();
  if (!current) return Response.json({ error: 'unauthenticated' }, { status: 401 });

  const payload = await request.json().catch(() => null);
  if (!payload) return Response.json({ error: 'invalid-json' }, { status: 400 });

  if (!isNonEmptyText(payload.name) || !isNonEmptyText(payload.email) || !isNonEmptyText(payload.company)) {
    return Response.json({ error: 'missing-required-fields' }, { status: 400 });
  }

  const user: HydroUser = {
    ...current,
    name: String(payload.name).trim(),
    email: String(payload.email).trim().toLowerCase(),
    company: String(payload.company).trim(),
    phone: typeof payload.phone === 'string' && payload.phone.trim() ? payload.phone.trim() : undefined,
    city: typeof payload.city === 'string' && payload.city.trim() ? payload.city.trim() : undefined,
    avatarUrl: typeof payload.avatarUrl === 'string' && payload.avatarUrl.trim() ? payload.avatarUrl.trim() : undefined,
    id: current.id,
    role: current.role,
    approved: current.approved,
    passwordHash: current.passwordHash
  };

  upsertUser(user);
  return Response.json({ user: toPublicUser(user) });
}

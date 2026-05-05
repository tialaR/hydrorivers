import { cookies } from 'next/headers';
import type { HydroUser, PublicUserRole } from '@/features/auth/domain/auth.types';
import { sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { cookieNames } from '@/shared/http/cookie-names';
import { httpStatus } from '@/shared/http/http-status';
import { hashPassword, isNonEmptyText, toPublicUser } from '@/shared/server/auth';
import { forbidden, invalidPayload } from '@/shared/server/api-errors';
import { readMock, upsertUser } from '@/shared/server/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedPublicRoles: PublicUserRole[] = ['shipper', 'carrier'];

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return invalidPayload('invalid-json');

  const email = String(payload.email ?? '').trim().toLowerCase();
  const password = String(payload.password ?? '');
  const role = String(payload.role ?? 'shipper') as PublicUserRole;

  if (!isNonEmptyText(payload.name) || !isNonEmptyText(payload.company) || !email || password.length < 6) {
    return invalidPayload('missing-required-fields');
  }

  if (!allowedPublicRoles.includes(role)) {
    return forbidden('invalid-role');
  }

  const users = readMock('users');
  const existing = users.find((item) => item.email.toLowerCase() === email);
  if (existing) {
    return Response.json({ error: 'email-already-registered' }, { status: httpStatus.conflict });
  }

  const user: HydroUser = {
    id: `u-${Date.now()}`,
    name: String(payload.name).trim(),
    email,
    company: String(payload.company).trim(),
    role,
    approved: role !== 'carrier',
    passwordHash: hashPassword(password)
  };

  upsertUser(user);

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

  return Response.json({ user: toPublicUser(user) }, { status: httpStatus.created });
}

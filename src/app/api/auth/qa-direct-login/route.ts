import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { isQaDirectLoginAllowed } from '@/shared/config/env';
import { cookieNames } from '@/shared/http/cookie-names';
import { httpStatus } from '@/shared/http/http-status';
import { readMock } from '@/shared/server/mock-db';
import { toPublicUser } from '@/shared/server/auth';
import { MOCK_QA_PERSONAS } from '@/shared/qa/mock-qa-personas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isQaDirectLoginAllowed()) {
    return Response.json({ error: 'forbidden', reason: 'qa-direct-login-disabled' }, { status: httpStatus.forbidden });
  }

  const payload = await request.json().catch(() => null) as { email?: unknown } | null;
  const rawEmail = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!rawEmail) {
    return Response.json({ error: 'invalid-payload', reason: 'missing-email' }, { status: httpStatus.badRequest });
  }

  const allowed = new Set(MOCK_QA_PERSONAS.map((p) => p.email.toLowerCase()));
  if (!allowed.has(rawEmail)) {
    return Response.json({ error: 'forbidden', reason: 'email-not-allowed' }, { status: httpStatus.forbidden });
  }

  const users = readMock('users') as HydroUser[];
  const user = users.find((u) => u.email.toLowerCase() === rawEmail);
  if (!user) {
    return Response.json({ error: 'not-found', reason: 'user-missing-in-mock' }, { status: httpStatus.notFound });
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

  return Response.json({ user: toPublicUser(user) });
}

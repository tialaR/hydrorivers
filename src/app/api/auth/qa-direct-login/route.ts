import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { readMock } from '@/shared/server/mock-db';
import { toPublicUser } from '@/shared/server/auth';
import { MOCK_QA_PERSONAS } from '@/shared/qa/mock-qa-personas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function allowQaDirectLogin(): boolean {
  if (process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN === 'true') return true;
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN !== 'false';
}

export async function POST(request: Request) {
  if (!allowQaDirectLogin()) {
    return Response.json({ error: 'forbidden', reason: 'qa-direct-login-disabled' }, { status: 403 });
  }

  const payload = await request.json().catch(() => null) as { email?: unknown } | null;
  const rawEmail = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!rawEmail) {
    return Response.json({ error: 'invalid-payload', reason: 'missing-email' }, { status: 400 });
  }

  const allowed = new Set(MOCK_QA_PERSONAS.map((p) => p.email.toLowerCase()));
  if (!allowed.has(rawEmail)) {
    return Response.json({ error: 'forbidden', reason: 'email-not-allowed' }, { status: 403 });
  }

  const users = readMock('users') as HydroUser[];
  const user = users.find((u) => u.email.toLowerCase() === rawEmail);
  if (!user) {
    return Response.json({ error: 'not-found', reason: 'user-missing-in-mock' }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set('hydrorivers_session', user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return Response.json({ user: toPublicUser(user) });
}

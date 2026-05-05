import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { readMock } from '@/shared/server/mock-db';
import { toPublicUser } from '@/shared/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectPathForMockUser(user: HydroUser): string {
  if (user.role === 'admin') return '/admin';
  if (user.role === 'carrier' && !user.approved) return '/perfil';
  return '/cargas';
}

function allowMockModeLoginAs(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN === 'true';
}

/** POST /api/mock-mode/login-as — dev/mock; production bloqueado salvo HYDRORIVERS_FORCE_QA_DIRECT_LOGIN (E2E). */
export async function POST(request: Request) {
  if (!allowMockModeLoginAs()) {
    return Response.json({ error: 'forbidden', reason: 'mock-login-as-production' }, { status: 403 });
  }

  const payload = await request.json().catch(() => null) as { userId?: unknown } | null;
  const userId = typeof payload?.userId === 'string' ? payload.userId.trim() : '';
  if (!userId) {
    return Response.json({ error: 'invalid-payload', reason: 'missing-user-id' }, { status: 400 });
  }

  const users = readMock('users') as HydroUser[];
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return Response.json({ error: 'not-found', reason: 'user-not-found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set('hydrorivers_session', user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return Response.json({
    user: toPublicUser(user),
    redirectTo: redirectPathForMockUser(user)
  });
}

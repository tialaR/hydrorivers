import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { isMockModeLoginAsAllowed } from '@/shared/config/env';
import { cookieNames } from '@/shared/http/cookie-names';
import { httpStatus } from '@/shared/http/http-status';
import { readMock } from '@/shared/server/mock-db';
import { toPublicUser } from '@/shared/server/auth';
import { intlAppPaths } from '@/shared/routing/app-routes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectPathForMockUser(user: HydroUser): string {
  if (user.role === 'admin') return intlAppPaths.admin.home;
  if (user.role === 'carrier' && !user.approved) return intlAppPaths.auth.profile;
  return intlAppPaths.cargos.marketplace;
}

/** POST /api/mock-mode/login-as — dev/mock; production bloqueado salvo HYDRORIVERS_FORCE_QA_DIRECT_LOGIN (E2E). */
export async function POST(request: Request) {
  if (!isMockModeLoginAsAllowed()) {
    return Response.json({ error: 'forbidden', reason: 'mock-login-as-production' }, { status: httpStatus.forbidden });
  }

  const payload = await request.json().catch(() => null) as { userId?: unknown } | null;
  const userId = typeof payload?.userId === 'string' ? payload.userId.trim() : '';
  if (!userId) {
    return Response.json({ error: 'invalid-payload', reason: 'missing-user-id' }, { status: httpStatus.badRequest });
  }

  const users = readMock('users') as HydroUser[];
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return Response.json({ error: 'not-found', reason: 'user-not-found' }, { status: httpStatus.notFound });
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

  return Response.json({
    user: toPublicUser(user),
    redirectTo: redirectPathForMockUser(user)
  });
}

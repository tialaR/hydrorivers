import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { otpExpiresInSeconds, sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { otpCodeSchema, resolveLegacyLoginPayload } from '@/features/auth/domain/auth-schemas';
import { findUserByIdentifier } from '@/features/auth/server/find-user-by-identifier';
import { createLoginChallenge, verifyLoginChallenge } from '@/features/auth/server/mock-otp-challenges';
import { isOtpCodeExposed } from '@/shared/config/env';
import { cookieNames } from '@/shared/http/cookie-names';
import { httpStatus } from '@/shared/http/http-status';
import { readMock } from '@/shared/server/mock-db';
import { invalidPayload } from '@/shared/server/api-errors';
import { toPublicUser, verifyPassword } from '@/shared/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return invalidPayload('invalid-json');

  let parsed;
  try {
    parsed = resolveLegacyLoginPayload({
      identifier: payload.identifier,
      email: payload.email,
      password: payload.password,
      otp: payload.otp,
      challenge: payload.challenge
    });
  } catch {
    return invalidPayload('invalid-login-fields');
  }

  const users = readMock('users') as HydroUser[];
  const user = findUserByIdentifier(users, parsed.identifier);

  if (!parsed.otp) {
    if (!user) {
      return Response.json({ error: 'user-not-found' }, { status: httpStatus.notFound });
    }
    if (!user.passwordHash || !verifyPassword(parsed.password, user.passwordHash)) {
      return Response.json({ error: 'invalid-login' }, { status: httpStatus.unauthorized });
    }

    const issued = createLoginChallenge(user.id);
    const exposeOtpCode = isOtpCodeExposed();

    return Response.json({
      otpRequired: true,
      challenge: issued.challenge,
      expiresAt: new Date(issued.expiresAt).toISOString(),
      expiresInSeconds: otpExpiresInSeconds,
      ...(exposeOtpCode ? { otpCode: issued.code } : {})
    });
  }

  const otpCheck = otpCodeSchema.safeParse(parsed.otp);
  const challengeId = parsed.challenge?.trim();
  if (!otpCheck.success || !challengeId) {
    return invalidPayload('invalid-otp-payload');
  }

  if (!user) {
    return Response.json({ error: 'user-not-found' }, { status: httpStatus.notFound });
  }

  if (!user.passwordHash || !verifyPassword(parsed.password, user.passwordHash)) {
    return Response.json({ error: 'invalid-login' }, { status: httpStatus.unauthorized });
  }

  const verified = verifyLoginChallenge(challengeId, otpCheck.data);

  if (verified.status !== 'ok') {
    if (verified.status === 'missing') {
      return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
    }
    if (verified.status === 'expired') {
      return Response.json({ error: 'otp-expired' }, { status: httpStatus.unauthorized });
    }
    return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
  }

  if (verified.userId !== user.id) {
    return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

  return Response.json({ user: toPublicUser(user) });
}

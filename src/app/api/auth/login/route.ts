import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { otpExpiresInSeconds, sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { normalizeEmail } from '@/features/auth/domain/auth-normalization';
import { resolveLegacyLoginPayload } from '@/features/auth/domain/auth-schemas';
import { findUserByPhone } from '@/features/auth/server/find-user-by-identifier';
import { createLoginChallenge, verifyLoginChallenge } from '@/features/auth/server/mock-otp-challenges';
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
      email: payload.email,
      countryCode: payload.countryCode,
      phone: payload.phone,
      phoneE164: payload.phoneE164,
      password: payload.password,
      otp: payload.otp,
      challenge: payload.challenge
    });
  } catch {
    return invalidPayload('invalid-login-fields');
  }

  const users = readMock('users') as HydroUser[];
  const user = findUserByPhone(users, parsed.phoneE164);
  const emailMatchesUser = !!user && normalizeEmail(user.email) === parsed.email;

  if (!parsed.otp) {
    if (!user) {
      return Response.json({ error: 'user-not-found' }, { status: httpStatus.notFound });
    }
    if (!emailMatchesUser || !user.passwordHash || !verifyPassword(parsed.password, user.passwordHash)) {
      return Response.json({ error: 'invalid-login' }, { status: httpStatus.unauthorized });
    }

    const issued = createLoginChallenge(user.id, parsed.phoneE164);
    const exposeOtpCode = process.env.NODE_ENV !== 'production' || process.env.HYDRORIVERS_EXPOSE_OTP_CODE === 'true';

    return Response.json({
      otpRequired: true,
      challenge: issued.challenge,
      expiresAt: new Date(issued.expiresAt).toISOString(),
      expiresInSeconds: otpExpiresInSeconds,
      phoneE164: parsed.phoneE164,
      ...(exposeOtpCode ? { otpCode: issued.code } : {})
    });
  }

  if (!user) {
    return Response.json({ error: 'user-not-found' }, { status: httpStatus.notFound });
  }

  if (!emailMatchesUser || !user.passwordHash || !verifyPassword(parsed.password, user.passwordHash)) {
    return Response.json({ error: 'invalid-login' }, { status: httpStatus.unauthorized });
  }

  const challengeId = parsed.challenge?.trim();
  if (!challengeId) {
    return invalidPayload('invalid-otp-payload');
  }

  const verified = verifyLoginChallenge(challengeId, parsed.otp);

  if (verified.status !== 'ok') {
    if (verified.status === 'expired') {
      return Response.json({ error: 'otp-expired' }, { status: httpStatus.unauthorized });
    }
    return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
  }

  if (verified.userId !== user.id || verified.phoneE164 !== parsed.phoneE164) {
    return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

  return Response.json({ user: toPublicUser(user) });
}

import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import type { HydroUser } from '@/features/auth/domain/auth.types';
import { otpLength, sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { isOtpCodeExposed } from '@/shared/config/env';
import { cookieNames } from '@/shared/http/cookie-names';
import { httpStatus } from '@/shared/http/http-status';
import { readMock } from '@/shared/server/mock-db';
import { invalidPayload } from '@/shared/server/api-errors';
import { toPublicUser, verifyPassword } from '@/shared/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const otpModulo = 10 ** otpLength;

function makeOtp(email: string) {
  const digest = createHash('sha256').update(`hydrorivers-otp:${email}`).digest('hex');
  const value = Number.parseInt(digest.slice(0, 8), 16) % otpModulo;
  return value.toString().padStart(otpLength, '0');
}

function makeChallenge(userId: string, email: string) {
  return Buffer.from(`${userId}:${email}:hydrorivers-otp`).toString('base64url');
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return invalidPayload('invalid-json');

  const email = String(payload.email ?? '').trim().toLowerCase();
  const password = String(payload.password ?? '');
  const otp = String(payload.otp ?? '').trim();
  const challenge = String(payload.challenge ?? '').trim();

  if (!email || !password) {
    return invalidPayload('missing-credentials');
  }

  const users = readMock('users') as HydroUser[];
  const user = users.find((item) => item.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: 'invalid-login' }, { status: httpStatus.unauthorized });
  }

  const expectedOtp = makeOtp(email);
  const expectedChallenge = makeChallenge(user.id, email);

  if (!otp) {
    const exposeOtpCode = isOtpCodeExposed();
    return Response.json({
      otpRequired: true,
      challenge: expectedChallenge,
      ...(exposeOtpCode ? { otpCode: expectedOtp } : {})
    });
  }

  if (challenge !== expectedChallenge || otp !== expectedOtp) {
    return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

  return Response.json({ user: toPublicUser(user) });
}

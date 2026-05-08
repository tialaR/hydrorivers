import { cookies } from 'next/headers';
import type { HydroUser, PublicUserRole } from '@/features/auth/domain/auth.types';
import { otpExpiresInSeconds, sessionCookieOptions } from '@/features/auth/domain/auth-constants';
import { registerOtpCompleteSchema, registerSchema } from '@/features/auth/domain/auth-schemas';
import { isPhoneE164Taken } from '@/features/auth/server/find-user-by-identifier';
import { createRegisterChallenge, verifyRegisterChallenge } from '@/features/auth/server/mock-otp-challenges';
import { cookieNames } from '@/shared/http/cookie-names';
import { httpStatus } from '@/shared/http/http-status';
import { hashPassword, toPublicUser } from '@/shared/server/auth';
import { forbidden, invalidPayload } from '@/shared/server/api-errors';
import { readMock, upsertUser } from '@/shared/server/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedPublicRoles: PublicUserRole[] = ['shipper', 'carrier'];

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return invalidPayload('invalid-json');

  const otp = String(payload.otp ?? '').trim();
  const challengeRaw = String(payload.challenge ?? '').trim();

  if ((otp && !challengeRaw) || (!otp && challengeRaw)) {
    return invalidPayload('invalid-otp-payload');
  }

  if (otp && challengeRaw) {
    let completion;
    try {
      completion = registerOtpCompleteSchema.parse({ challenge: challengeRaw, otp });
    } catch {
      return invalidPayload('invalid-otp-payload');
    }

    const verified = verifyRegisterChallenge(completion.challenge, completion.otp);
    if (verified.status !== 'ok') {
      if (verified.status === 'expired') {
        return Response.json({ error: 'otp-expired' }, { status: httpStatus.unauthorized });
      }
      return Response.json({ error: 'invalid-otp' }, { status: httpStatus.unauthorized });
    }

    const d = verified.draft;
    const now = new Date().toISOString();
    const user: HydroUser = {
      id: `u-${Date.now()}`,
      name: d.fullName,
      email: d.email,
      company: d.company,
      role: d.role,
      approved: d.role !== 'carrier',
      passwordHash: d.passwordHash,
      countryCode: d.countryCode,
      phone: d.phone,
      phoneE164: d.phoneE164,
      createdAt: now,
      updatedAt: now
    };

    upsertUser(user);

    const cookieStore = await cookies();
    cookieStore.set(cookieNames.session, user.id, sessionCookieOptions);

    return Response.json({ user: toPublicUser(user) }, { status: httpStatus.created });
  }

  const roleRaw = String(payload.role ?? 'shipper');
  if (!allowedPublicRoles.includes(roleRaw as PublicUserRole)) {
    return forbidden('invalid-role');
  }

  const fullName = String(payload.fullName ?? payload.name ?? '').trim();

  let data;
  try {
    data = registerSchema.parse({
      fullName,
      email: String(payload.email ?? ''),
      password: String(payload.password ?? ''),
      countryCode: String(payload.countryCode ?? ''),
      phone: String(payload.phone ?? ''),
      phoneE164: typeof payload.phoneE164 === 'string' ? payload.phoneE164 : undefined,
      role: roleRaw,
      company: String(payload.company ?? '')
    });
  } catch {
    return invalidPayload('invalid-register-fields');
  }

  const users = readMock('users') as HydroUser[];

  if (users.some((item) => item.email.toLowerCase() === data.email)) {
    return Response.json({ error: 'email-already-registered' }, { status: httpStatus.conflict });
  }

  if (isPhoneE164Taken(users, data.phoneE164)) {
    return Response.json({ error: 'phone-already-registered' }, { status: httpStatus.conflict });
  }

  const issued = createRegisterChallenge({
    fullName: data.fullName,
    email: data.email,
    company: data.company,
    role: data.role,
    countryCode: data.countryCode,
    phone: data.phone,
    phoneE164: data.phoneE164,
    passwordHash: hashPassword(data.password)
  });
  const exposeOtpCode = process.env.NODE_ENV !== 'production' || process.env.HYDRORIVERS_EXPOSE_OTP_CODE === 'true';

  return Response.json({
    otpRequired: true,
    challenge: issued.challenge,
    expiresAt: new Date(issued.expiresAt).toISOString(),
    expiresInSeconds: otpExpiresInSeconds,
    phoneE164: data.phoneE164,
    ...(exposeOtpCode ? { otpCode: issued.code } : {})
  });
}

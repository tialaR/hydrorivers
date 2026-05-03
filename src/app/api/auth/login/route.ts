
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { readMock } from '@/shared/server/mock-db';
import { toPublicUser, verifyPassword } from '@/shared/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function shouldExposeOtpCode() {
  return process.env.HYDRORIVERS_EXPOSE_OTP_CODE === 'true';
}

function makeOtp(email: string) {
  const digest = createHash('sha256').update(`hydrorivers-otp:${email}`).digest('hex');
  const value = Number.parseInt(digest.slice(0, 8), 16) % 1_000_000;
  return value.toString().padStart(6, '0');
}

function makeChallenge(userId: string, email: string) {
  return Buffer.from(`${userId}:${email}:hydrorivers-otp`).toString('base64url');
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) return Response.json({ error: 'invalid-json' }, { status: 400 });

  const email = String(payload.email ?? '').trim().toLowerCase();
  const password = String(payload.password ?? '');
  const otp = String(payload.otp ?? '').trim();
  const challenge = String(payload.challenge ?? '').trim();

  if (!email || !password) {
    return Response.json({ error: 'missing-credentials' }, { status: 400 });
  }

  const user = readMock('users').find((item) => item.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: 'invalid-login' }, { status: 401 });
  }

  const expectedOtp = makeOtp(email);
  const expectedChallenge = makeChallenge(user.id, email);

  if (!otp) {
    const exposeOtpCode = shouldExposeOtpCode();
    return Response.json({
      otpRequired: true,
      challenge: expectedChallenge,
      ...(exposeOtpCode ? { otpCode: expectedOtp } : {})
    });
  }

  if (challenge !== expectedChallenge || otp !== expectedOtp) {
    return Response.json({ error: 'invalid-otp' }, { status: 401 });
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

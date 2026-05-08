import { randomInt, randomUUID } from 'node:crypto';
import { otpExpiresInSeconds } from '@/features/auth/domain/auth-constants';
import type { PublicUserRole } from '@/features/auth/domain/auth.types';

export type PendingRegisterDraft = {
  fullName: string;
  email: string;
  company: string;
  role: PublicUserRole;
  countryCode: string;
  phone: string;
  phoneE164: string;
  passwordHash: string;
};

type PendingLoginChallenge = {
  userId: string;
  code: string;
  expiresAt: number;
};

type PendingRegisterChallenge = {
  draft: PendingRegisterDraft;
  code: string;
  expiresAt: number;
};

const loginChallenges = new Map<string, PendingLoginChallenge>();
const registerChallenges = new Map<string, PendingRegisterChallenge>();

function invalidateLoginChallengesForUser(userId: string) {
  for (const [id, row] of loginChallenges) {
    if (row.userId === userId) loginChallenges.delete(id);
  }
}

function invalidateRegisterChallengesForEmail(emailNormalized: string) {
  for (const [id, row] of registerChallenges) {
    if (row.draft.email === emailNormalized) registerChallenges.delete(id);
  }
}

function randomOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function createLoginChallenge(userId: string) {
  invalidateLoginChallengesForUser(userId);
  const challenge = randomUUID();
  const code = randomOtpCode();
  const expiresAt = Date.now() + otpExpiresInSeconds * 1000;
  loginChallenges.set(challenge, { userId, code, expiresAt });
  return { challenge, code, expiresAt };
}

export type LoginVerifyResult =
  | { status: 'ok'; userId: string }
  | { status: 'missing' | 'expired' | 'wrong' };

export function verifyLoginChallenge(challengeId: string, otp: string): LoginVerifyResult {
  const row = loginChallenges.get(challengeId);
  if (!row) return { status: 'missing' };
  if (Date.now() > row.expiresAt) {
    loginChallenges.delete(challengeId);
    return { status: 'expired' };
  }
  if (row.code !== otp) return { status: 'wrong' };
  loginChallenges.delete(challengeId);
  return { status: 'ok', userId: row.userId };
}

export function createRegisterChallenge(draft: PendingRegisterDraft) {
  invalidateRegisterChallengesForEmail(draft.email);
  const challenge = randomUUID();
  const code = randomOtpCode();
  const expiresAt = Date.now() + otpExpiresInSeconds * 1000;
  registerChallenges.set(challenge, { draft, code, expiresAt });
  return { challenge, code, expiresAt };
}

export type RegisterVerifyResult =
  | { status: 'ok'; draft: PendingRegisterDraft }
  | { status: 'missing' | 'expired' | 'wrong' };

export function verifyRegisterChallenge(challengeId: string, otp: string): RegisterVerifyResult {
  const row = registerChallenges.get(challengeId);
  if (!row) return { status: 'missing' };
  if (Date.now() > row.expiresAt) {
    registerChallenges.delete(challengeId);
    return { status: 'expired' };
  }
  if (row.code !== otp) return { status: 'wrong' };
  registerChallenges.delete(challengeId);
  return { status: 'ok', draft: row.draft };
}

/** Limpa desafios OTP em memória — usar só em testes de integração. */
export function resetMockOtpChallengesForTests() {
  loginChallenges.clear();
  registerChallenges.clear();
}

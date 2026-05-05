import 'server-only';

import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { HydroUser, PublicHydroUser } from '@/features/auth/domain/auth.types';
import { cookieNames } from '@/shared/http/cookie-names';
import { readMock } from './mock-db';

const HASH_PREFIX = 'pbkdf2_sha256';
const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${HASH_PREFIX}$${ITERATIONS}$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash?: string) {
  if (!storedHash) return false;

  const [prefix, iterationsRaw, salt, expectedHex] = storedHash.split('$');
  if (prefix !== HASH_PREFIX || !iterationsRaw || !salt || !expectedHex) return false;

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 10_000) return false;

  const actual = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST);
  const expected = Buffer.from(expectedHex, 'hex');

  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function toPublicUser(user: HydroUser): PublicHydroUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(cookieNames.session)?.value;
  if (!sessionId) return null;

  return readMock('users').find((user) => user.id === sessionId) ?? null;
}

export function isNonEmptyText(value: unknown, maxLength = 180) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

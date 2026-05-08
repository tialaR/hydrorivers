import type { HydroUser } from '@/features/auth/domain/auth.types';
import { looksLikeEmail, normalizeIdentifier, normalizePhoneDigits } from '@/features/auth/domain/auth-normalization';

function normalizeE164(value: string) {
  const d = normalizePhoneDigits(value);
  return d ? `+${d}` : '';
}

export function findUserByIdentifier(users: HydroUser[], rawIdentifier: string): HydroUser | undefined {
  const identifier = normalizeIdentifier(rawIdentifier);
  if (!identifier) return undefined;

  if (looksLikeEmail(identifier)) {
    return users.find((u) => u.email.toLowerCase() === identifier);
  }

  const digits = normalizePhoneDigits(identifier);
  if (!digits) return undefined;

  return users.find((u) => {
    if (!u.phoneE164) return false;
    return normalizePhoneDigits(u.phoneE164) === digits;
  });
}

export function findUserByPhone(users: HydroUser[], rawPhoneE164: string): HydroUser | undefined {
  const digits = normalizePhoneDigits(rawPhoneE164);
  if (!digits) return undefined;

  return users.find((u) => {
    if (!u.phoneE164) return false;
    return normalizePhoneDigits(u.phoneE164) === digits;
  });
}

export function isPhoneE164Taken(users: HydroUser[], phoneE164: string): boolean {
  const target = normalizeE164(phoneE164);
  if (!target) return false;
  return users.some((u) => u.phoneE164 && normalizeE164(u.phoneE164) === target);
}

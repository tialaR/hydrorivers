import type { PublicUserRole, UserRole } from './auth.types';
import { publicUserRoles } from './auth-constants';

const publicRoleSet = new Set<PublicUserRole>(publicUserRoles);

function trimToSingleSpaces(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeFullName(value: string) {
  return trimToSingleSpaces(value);
}

export function hasAtLeastTwoWords(value: string) {
  return normalizeFullName(value).split(' ').filter(Boolean).length >= 2;
}

export function normalizeCountryCode(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function buildPhoneE164(countryCode: string, phone: string) {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  const normalizedPhone = normalizePhoneDigits(phone);
  if (!normalizedCountryCode || !normalizedPhone) return '';
  return `${normalizedCountryCode}${normalizedPhone}`;
}

export function normalizePhone(value: string) {
  return normalizePhoneDigits(value);
}

export function normalizePhoneIdentifier(value: string) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return '';
  return value.trim().startsWith('+') ? `+${digits}` : digits;
}

export function isPublicUserRole(value: string): value is PublicUserRole {
  return publicRoleSet.has(value as PublicUserRole);
}

export function isAllowedPublicRegisterRole(value: string) {
  return isPublicUserRole(value);
}

export function isAdminRole(value: string): value is Extract<UserRole, 'admin'> {
  return value === 'admin';
}

export function looksLikeEmail(value: string) {
  return normalizeEmail(value).includes('@');
}

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return looksLikeEmail(trimmed) ? normalizeEmail(trimmed) : normalizePhoneIdentifier(trimmed);
}

import { normalizeCountryCode, normalizePhoneDigits } from './auth-normalization';

export const AUTH_PHONE_COUNTRIES = [
  {
    code: '+55',
    flag: '🇧🇷',
    labelKey: 'countryBrazil',
    mobileDigits: 11,
    placeholder: '11999990000'
  },
  {
    code: '+1',
    flag: '🇺🇸',
    labelKey: 'countryUnitedStates',
    mobileDigits: 10,
    placeholder: '4156723894'
  },
  {
    code: '+34',
    flag: '🇪🇸',
    labelKey: 'countrySpain',
    mobileDigits: 9,
    placeholder: '612345678'
  },
  {
    code: '+57',
    flag: '🇨🇴',
    labelKey: 'countryColombia',
    mobileDigits: 10,
    placeholder: '3001234567'
  },
  {
    code: '+51',
    flag: '🇵🇪',
    labelKey: 'countryPeru',
    mobileDigits: 9,
    placeholder: '912345678'
  },
  {
    code: '+56',
    flag: '🇨🇱',
    labelKey: 'countryChile',
    mobileDigits: 9,
    placeholder: '912345678'
  }
] as const;

export type AuthPhoneCountry = (typeof AUTH_PHONE_COUNTRIES)[number];
export type AuthDialCode = AuthPhoneCountry['code'];

export function getAuthPhoneCountry(countryCode: string) {
  const normalized = normalizeCountryCode(countryCode);
  return AUTH_PHONE_COUNTRIES.find((country) => country.code === normalized) ?? null;
}

export function hasValidMobileDigitsForCountry(countryCode: string, phone: string) {
  const country = getAuthPhoneCountry(countryCode);
  if (!country) return false;
  return normalizePhoneDigits(phone).length === country.mobileDigits;
}

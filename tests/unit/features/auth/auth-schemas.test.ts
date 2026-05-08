import { describe, expect, it } from 'vitest';
import { otpExpiresInSeconds } from '@/features/auth/domain/auth-constants';
import {
  buildPhoneE164,
  hasAtLeastTwoWords,
  normalizeCountryCode,
  normalizeEmail,
  normalizePhoneDigits
} from '@/features/auth/domain/auth-normalization';
import {
  buildOtpChallengeContract,
  loginCredentialsSchema,
  loginSchema,
  otpVerifySchema,
  registerOtpCompleteSchema,
  registerSchema
} from '@/features/auth/domain/auth-schemas';

describe('auth normalization and schemas', () => {
  it('normalizes email with trim + lowercase', () => {
    expect(normalizeEmail('  Tiala@HydroRivers.COM  ')).toBe('tiala@hydrorivers.com');
  });

  it('normalizes phone pieces into E.164-like value', () => {
    expect(normalizeCountryCode(' +55 ')).toBe('+55');
    expect(normalizePhoneDigits('(91) 99999-0000')).toBe('91999990000');
    expect(buildPhoneE164('+55', '(91) 99999-0000')).toBe('+5591999990000');
  });

  it('validates full name with at least two words', () => {
    expect(hasAtLeastTwoWords('Tiala Rocha')).toBe(true);
    expect(hasAtLeastTwoWords('Tiala')).toBe(false);
  });

  it('rejects password shorter than 8 in register schema', () => {
    const result = registerSchema.safeParse({
      fullName: 'Tiala Rocha',
      email: 'tiala@hydrorivers.com',
      password: '1234567',
      countryCode: '+55',
      phone: '91999990000',
      role: 'shipper',
      company: 'Cooperativa Açaí Norte'
    });

    expect(result.success).toBe(false);
  });

  it('rejects admin in public register schema', () => {
    const result = registerSchema.safeParse({
      fullName: 'Tiala Rocha',
      email: 'tiala@hydrorivers.com',
      password: '12345678',
      countryCode: '+55',
      phone: '91999990000',
      role: 'admin',
      company: 'Cooperativa Açaí Norte'
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid register payload and normalizes fields', () => {
    const result = registerSchema.parse({
      fullName: '  Tiala   Rocha  ',
      email: '  Tiala@HydroRivers.COM ',
      password: '12345678',
      countryCode: '55',
      phone: '(91) 99999-0000',
      role: 'shipper',
      company: 'Cooperativa Açaí Norte'
    });

    expect(result).toMatchObject({
      fullName: 'Tiala Rocha',
      email: 'tiala@hydrorivers.com',
      countryCode: '+55',
      phone: '91999990000',
      phoneE164: '+5591999990000',
      role: 'shipper',
      company: 'Cooperativa Açaí Norte'
    });
  });

  it('rejects invalid register payload', () => {
    const result = registerSchema.safeParse({
      fullName: 'Tiala',
      email: 'invalid',
      password: '123',
      countryCode: '',
      phone: '1',
      role: 'shipper',
      company: ''
    });

    expect(result.success).toBe(false);
  });

  it('accepts login schema with email identifier', () => {
    const result = loginSchema.parse({
      identifier: '  Tiala@HydroRivers.COM ',
      password: '12345678'
    });

    expect(result.identifier).toBe('tiala@hydrorivers.com');
  });

  it('accepts login schema with normalized phone identifier', () => {
    const result = loginSchema.parse({
      identifier: '+5591999990000',
      password: '12345678'
    });

    expect(result.identifier).toBe('+5591999990000');
  });

  it('accepts OTP contracts with 6-digit code', () => {
    const challenge = buildOtpChallengeContract({
      challenge: 'challenge-123',
      identifier: 'tiala@hydrorivers.com',
      otpCode: '123456'
    });
    const verify = otpVerifySchema.parse({
      challenge: 'challenge-123',
      otp: '123456'
    });

    expect(challenge.expiresInSeconds).toBe(otpExpiresInSeconds);
    expect(verify.otp).toBe('123456');
  });

  it('rejects login credentials when identifier empty', () => {
    const result = loginCredentialsSchema.safeParse({ identifier: '', password: '12345678' });
    expect(result.success).toBe(false);
  });

  it('accepts loginCredentialsSchema', () => {
    const result = loginCredentialsSchema.parse({
      identifier: '  a@b.co ',
      password: '12345678'
    });
    expect(result.identifier).toBe('a@b.co');
  });

  it('accepts registerOtpCompleteSchema', () => {
    const parsed = registerOtpCompleteSchema.parse({ challenge: 'c1', otp: '123456' });
    expect(parsed.otp).toBe('123456');
  });

  it('login schema exige challenge quando otp informado', () => {
    const result = loginSchema.safeParse({
      identifier: 'a@b.co',
      password: '12345678',
      otp: '123456'
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid OTP code', () => {
    const result = otpVerifySchema.safeParse({
      challenge: 'challenge-123',
      otp: '12345'
    });

    expect(result.success).toBe(false);
  });
});

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

  it.each([
    ['+55', '11999990000'],
    ['+1', '4156723894'],
    ['+34', '612345678'],
    ['+57', '3001234567'],
    ['+51', '912345678'],
    ['+56', '912345678']
  ])('accepts register payload with valid phone length for %s', (countryCode, phone) => {
    const result = registerSchema.safeParse({
      fullName: 'Tiala Rocha',
      email: `tiala+${countryCode.replace('+', '')}@hydrorivers.com`,
      password: '12345678',
      countryCode,
      phone,
      role: 'shipper',
      company: ''
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ['+55', '1199999000'],
    ['+1', '415672389'],
    ['+34', '61234567'],
    ['+57', '300123456'],
    ['+51', '91234567'],
    ['+56', '91234567']
  ])('rejects register payload with invalid phone length for %s', (countryCode, phone) => {
    const result = registerSchema.safeParse({
      fullName: 'Tiala Rocha',
      email: `tiala-invalid-${countryCode.replace('+', '')}@hydrorivers.com`,
      password: '12345678',
      countryCode,
      phone,
      role: 'shipper',
      company: ''
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === 'phone' && issue.message === 'invalid-phone')).toBe(true);
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

  it('accepts login schema with normalized phone payload', () => {
    const result = loginSchema.parse({
      email: ' Tiala@HydroRivers.COM ',
      countryCode: '+55',
      phone: '(91) 99999-0000',
      password: '12345678'
    });

    expect(result.email).toBe('tiala@hydrorivers.com');
    expect(result.phone).toBe('91999990000');
    expect(result.phoneE164).toBe('+5591999990000');
  });

  it('accepts US login credentials with 10 digits', () => {
    const result = loginCredentialsSchema.safeParse({
      email: 'tiala@hydrorivers.com',
      countryCode: '+1',
      phone: '4156723894',
      password: '12345678'
    });

    expect(result.success).toBe(true);
  });

  it('rejects US login credentials with invalid length', () => {
    const result = loginCredentialsSchema.safeParse({
      email: 'tiala@hydrorivers.com',
      countryCode: '+1',
      phone: '415672389',
      password: '12345678'
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === 'phone' && issue.message === 'invalid-phone')).toBe(true);
  });

  it('rejects BR login credentials with invalid length', () => {
    const result = loginCredentialsSchema.safeParse({
      email: 'tiala@hydrorivers.com',
      countryCode: '+55',
      phone: '1199999000',
      password: '12345678'
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === 'phone' && issue.message === 'invalid-phone')).toBe(true);
  });

  it('accepts OTP contracts with 6-digit code', () => {
    const challenge = buildOtpChallengeContract({
      challenge: 'challenge-123',
      phoneE164: '+5591999990000',
      otpCode: '123456'
    });
    const verify = otpVerifySchema.parse({
      challenge: 'challenge-123',
      otp: '123456'
    });

    expect(challenge.expiresInSeconds).toBe(otpExpiresInSeconds);
    expect(verify.otp).toBe('123456');
  });

  it('rejects login credentials when phone empty', () => {
    const result = loginCredentialsSchema.safeParse({ email: 'tiala@hydrorivers.com', countryCode: '+55', phone: '', password: '12345678' });
    expect(result.success).toBe(false);
  });

  it('accepts loginCredentialsSchema', () => {
    const result = loginCredentialsSchema.parse({
      email: 'Tiala@HydroRivers.COM',
      countryCode: '+55',
      phone: '(91) 99999-0000',
      password: '12345678'
    });
    expect(result.email).toBe('tiala@hydrorivers.com');
    expect(result.phoneE164).toBe('+5591999990000');
  });

  it('keeps public roles restricted to shipper and carrier', () => {
    const shipperResult = registerSchema.safeParse({
      fullName: 'Tiala Rocha',
      email: 'role-shipper@hydrorivers.com',
      password: '12345678',
      countryCode: '+55',
      phone: '11999990000',
      role: 'shipper',
      company: ''
    });

    const carrierResult = registerSchema.safeParse({
      fullName: 'Tiala Rocha',
      email: 'role-carrier@hydrorivers.com',
      password: '12345678',
      countryCode: '+55',
      phone: '11999990000',
      role: 'carrier',
      company: ''
    });

    expect(shipperResult.success).toBe(true);
    expect(carrierResult.success).toBe(true);
  });

  it('accepts registerOtpCompleteSchema', () => {
    const parsed = registerOtpCompleteSchema.parse({ challenge: 'c1', otp: '123456' });
    expect(parsed.otp).toBe('123456');
  });

  it('login schema exige challenge quando otp informado', () => {
    const result = loginSchema.safeParse({
      email: 'tiala@hydrorivers.com',
      countryCode: '+55',
      phone: '91999990000',
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

  it('rejects login credentials with invalid email', () => {
    const result = loginCredentialsSchema.safeParse({
      email: 'invalid',
      countryCode: '+55',
      phone: '11999990000',
      password: '12345678'
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === 'email' && issue.message === 'invalid-email')).toBe(true);
  });
});

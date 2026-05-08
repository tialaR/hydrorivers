import { z } from 'zod';
import { minimumPasswordLength, otpExpiresInSeconds, otpLength, publicUserRoles } from './auth-constants';
import { hasValidMobileDigitsForCountry } from './auth-phone-countries';
import {
  buildPhoneE164,
  hasAtLeastTwoWords,
  normalizeCountryCode,
  normalizeEmail,
  normalizeFullName,
  normalizePhone,
  normalizePhoneDigits
} from './auth-normalization';

const otpCodePattern = new RegExp(`^\\d{${otpLength}}$`);
const phoneDigitsMinLength = 8;

export const publicUserRoleSchema = z.enum(publicUserRoles);

export const fullNameSchema = z
  .string()
  .transform(normalizeFullName)
  .pipe(z.string().min(1, 'full-name-required'))
  .refine(hasAtLeastTwoWords, 'full-name-must-have-two-words');

export const normalizedEmailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.email('invalid-email'));

export const countryCodeSchema = z
  .string()
  .transform(normalizeCountryCode)
  .pipe(z.string().regex(/^\+\d{1,4}$/, 'invalid-country-code'));

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().min(phoneDigitsMinLength, 'invalid-phone'));

export const phoneE164Schema = z.string().regex(/^\+\d{8,18}$/, 'invalid-phone-e164');
export const normalizedPhoneIdentifierSchema = z.string().regex(/^\+?\d{8,18}$/, 'invalid-phone-identifier');

export const passwordSchema = z.string().min(minimumPasswordLength, 'password-too-short');

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: normalizedEmailSchema,
    password: passwordSchema,
    countryCode: countryCodeSchema,
    phone: phoneSchema,
    phoneE164: z.string().optional(),
    role: publicUserRoleSchema,
    company: z.string().trim().default('')
  })
  .transform((value) => {
    const phoneE164 = value.phoneE164 && value.phoneE164.trim()
      ? value.phoneE164.trim()
      : buildPhoneE164(value.countryCode, value.phone);

    return {
      ...value,
      phoneE164
    };
  })
  .superRefine((value, ctx) => {
    if (!hasValidMobileDigitsForCountry(value.countryCode, value.phone)) {
      ctx.addIssue({ code: 'custom', message: 'invalid-phone', path: ['phone'] });
    }

    if (!phoneE164Schema.safeParse(value.phoneE164).success) {
      ctx.addIssue({ code: 'custom', message: 'invalid-phone-e164', path: ['phoneE164'] });
    }
  });

export const loginPhoneSchema = z
  .object({
    countryCode: countryCodeSchema,
    phone: phoneSchema,
    phoneE164: z.string().optional()
  })
  .transform((value) => ({
    ...value,
    phoneE164: value.phoneE164 && value.phoneE164.trim()
      ? value.phoneE164.trim()
      : buildPhoneE164(value.countryCode, value.phone)
  }))
  .superRefine((value, ctx) => {
    if (!hasValidMobileDigitsForCountry(value.countryCode, value.phone)) {
      ctx.addIssue({ code: 'custom', message: 'invalid-phone', path: ['phone'] });
    }

    if (!phoneE164Schema.safeParse(value.phoneE164).success) {
      ctx.addIssue({ code: 'custom', message: 'invalid-phone-e164', path: ['phoneE164'] });
    }
  });

export const loginCredentialsSchema = z
  .object({
    email: normalizedEmailSchema,
    countryCode: countryCodeSchema,
    phone: phoneSchema,
    phoneE164: z.string().optional(),
    password: passwordSchema
  })
  .transform((value) => ({
    ...value,
    phoneE164: value.phoneE164 && value.phoneE164.trim()
      ? value.phoneE164.trim()
      : buildPhoneE164(value.countryCode, value.phone)
  }))
  .superRefine((value, ctx) => {
    if (!hasValidMobileDigitsForCountry(value.countryCode, value.phone)) {
      ctx.addIssue({ code: 'custom', message: 'invalid-phone', path: ['phone'] });
    }

    if (!phoneE164Schema.safeParse(value.phoneE164).success) {
      ctx.addIssue({ code: 'custom', message: 'invalid-phone-e164', path: ['phoneE164'] });
    }
  });

export const loginSchema = z
  .object({
    email: z.string(),
    countryCode: z.string(),
    phone: z.string(),
    phoneE164: z.string().optional(),
    password: passwordSchema,
    otp: z.string().optional(),
    challenge: z.string().optional()
  })
  .transform((value) => ({
    ...value,
    email: normalizedEmailSchema.parse(value.email),
    ...loginPhoneSchema.parse({
      countryCode: value.countryCode,
      phone: value.phone,
      phoneE164: value.phoneE164
    })
  }))
  .superRefine((value, ctx) => {
    if (value.otp !== undefined && value.otp.trim() !== '') {
      const trimmed = value.otp.trim();
      if (!otpCodePattern.test(trimmed)) {
        ctx.addIssue({ code: 'custom', message: 'invalid-otp', path: ['otp'] });
      }
      if (!value.challenge?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'challenge-required', path: ['challenge'] });
      }
    }
  });

export const otpCodeSchema = z.string().regex(otpCodePattern, 'invalid-otp');

export const otpChallengeSchema = z.object({
  challenge: z.string().trim().min(1, 'challenge-required'),
  phoneE164: phoneE164Schema,
  otpCode: otpCodeSchema.optional(),
  expiresAt: z.iso.datetime().optional(),
  expiresInSeconds: z.int().positive().default(otpExpiresInSeconds)
});

export const otpVerifySchema = z.object({
  challenge: z.string().trim().min(1, 'challenge-required'),
  otp: otpCodeSchema
});

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterData = z.output<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type LoginData = z.output<typeof loginSchema>;
export type OtpChallengeData = z.output<typeof otpChallengeSchema>;
export type OtpVerifyData = z.output<typeof otpVerifySchema>;

export function resolveLegacyLoginPayload(payload: {
  email?: string;
  countryCode?: string;
  phone?: string;
  phoneE164?: string;
  password: string;
  otp?: string;
  challenge?: string;
}) {
  const otp = payload.otp?.trim() ? payload.otp.trim() : undefined;
  const challenge = payload.challenge?.trim() ? payload.challenge.trim() : undefined;
  return loginSchema.parse({
    email: payload.email ?? '',
    countryCode: payload.countryCode ?? '',
    phone: payload.phone ?? '',
    phoneE164: payload.phoneE164,
    password: payload.password,
    otp,
    challenge
  });
}

export const registerOtpCompleteSchema = z.object({
  challenge: z.string().trim().min(1, 'challenge-required'),
  otp: otpCodeSchema
});

export function buildNormalizedPhoneE164(countryCode: string, phone: string) {
  return phoneE164Schema.parse(buildPhoneE164(countryCode, phone));
}

export function normalizeRegisterDraft(payload: {
  fullName: string;
  email: string;
  password: string;
  countryCode: string;
  phone: string;
  phoneE164?: string;
  role: string;
  company: string;
}) {
  return registerSchema.parse(payload);
}

export function normalizeLoginDraft(payload: {
  email: string;
  countryCode: string;
  phone: string;
  phoneE164?: string;
  password: string;
  otp?: string;
  challenge?: string;
}) {
  return loginSchema.parse(payload);
}

export function buildOtpChallengeContract(payload: {
  challenge: string;
  phoneE164: string;
  otpCode?: string;
  expiresAt?: string;
  expiresInSeconds?: number;
}) {
  return otpChallengeSchema.parse(payload);
}

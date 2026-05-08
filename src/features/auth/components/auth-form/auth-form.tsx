'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent } from 'react';
import {
  Anchor,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  ShipWheel,
  UserRound
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/ui/button/button';
import { QA_LOGIN_PREFILL_STORAGE_KEY } from '@/shared/qa/login-prefill';
import { routeSearchParams } from '@/shared/routing/route-search-params';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { defaultUsers } from '../../data/auth.mock';
import { login, register } from '../../services/auth.client';
import type { OtpChallengeResponse, PublicUserRole, RegisterOtpChallengeResponse } from '../../domain/auth.types';
import { getAuthPhoneCountry } from '../../domain/auth-phone-countries';
import type { AuthDialCode } from './auth-dial-options';
import { loginCredentialsSchema, otpCodeSchema, registerSchema } from '../../domain/auth-schemas';
import { buildPhoneE164, looksLikeEmail, normalizePhoneDigits } from '../../domain/auth-normalization';
import { PhoneInput } from './phone-input';
import styles from './auth-form.module.scss';

function resolvePostLoginHref(nextParam: string | null, locale: string): string {
  const fallback = intlAppPaths.dashboard.home;
  if (!nextParam) return fallback;
  let decoded = nextParam;
  try {
    decoded = decodeURIComponent(nextParam);
  } catch {
    return fallback;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;
  const prefix = `/${locale}`;
  if (decoded !== prefix && !decoded.startsWith(`${prefix}/`)) return fallback;
  if (decoded === prefix) return intlAppPaths.home;
  return decoded.slice(prefix.length) || fallback;
}

type Mode = 'login' | 'register';

type AuthFormProps = {
  mode: Mode;
  registerPrefill?: string;
};

function isOtpChallengeResult(value: unknown): value is OtpChallengeResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OtpChallengeResponse>;
  return candidate.otpRequired === true && typeof candidate.challenge === 'string' && typeof candidate.expiresAt === 'string';
}

function resolveMockOtpCode(value: OtpChallengeResponse | RegisterOtpChallengeResponse): string {
  const root = value as unknown as Record<string, unknown>;
  const challengeValue = root.challenge;
  const challengeObject = typeof challengeValue === 'object' && challengeValue !== null
    ? challengeValue as Record<string, unknown>
    : null;

  const candidates = [
    root.otpCode,
    root.mockOtpCode,
    root.code,
    challengeObject?.otpCode,
    challengeObject?.mockOtpCode,
    challengeObject?.code
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const digits = candidate.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) return digits;
  }

  return '';
}

type RoleOption = PublicUserRole | '';

function initialRegisterContact(prefill?: string) {
  if (!prefill || typeof prefill !== 'string') return { email: '', phone: '' };
  if (looksLikeEmail(prefill)) return { email: prefill, phone: '' };
  return { email: '', phone: prefill.replace(/\D/g, '') };
}

function translateZodIssue(message: string, t: ReturnType<typeof useTranslations<'auth'>>, field?: string): string {
  if (field === 'role') return t('errorRoleRequired');

  const map: Record<string, string> = {
    'invalid-email': 'errorEmailInvalid',
    'password-too-short': 'errorPasswordMin',
    'full-name-required': 'errorFullNameRequired',
    'full-name-must-have-two-words': 'errorFullNameTwoWords',
    'invalid-country-code': 'errorCountryCode',
    'invalid-phone': 'errorPhone',
    'invalid-phone-e164': 'errorPhone',
    'company-required': 'errorCompanyRequired',
    'identifier-required': 'errorPhoneRequired',
    'invalid-identifier': 'errorPhone',
    'invalid-otp': 'otpInvalid',
    'challenge-required': 'otpInvalid'
  };
  const key = map[message];
  return key ? t(key) : t('errorValidation');
}

function findSeedPhoneByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const found = defaultUsers.find((user) => user.email.toLowerCase() === normalized);
  if (!found?.phone) return null;
  return {
    countryCode: (found.countryCode as AuthDialCode | undefined) ?? '+55',
    phone: found.phone
  };
}

function formatPhoneLabel(countryCode: string, phone: string) {
  const national = normalizePhoneDigits(phone);
  return `${countryCode} ${national}`.trim();
}

export function AuthForm({ mode, registerPrefill }: AuthFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);

  const [otpStage, setOtpStage] = useState(false);
  const [completedMode, setCompletedMode] = useState<Mode | null>(null);
  const [challenge, setChallenge] = useState('');
  const [otpCodeHint, setOtpCodeHint] = useState('');
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<RoleOption>('');
  const [email, setEmail] = useState(() => (mode === 'register' ? initialRegisterContact(registerPrefill).email : ''));
  const [countryCode, setCountryCode] = useState<AuthDialCode>('+55');
  const [phone, setPhone] = useState(() => (mode === 'register' ? initialRegisterContact(registerPrefill).phone : ''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const registerRedirectRef = useRef(false);
  const completionTimeoutRef = useRef<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const otpSlotsBox = useMemo(
    () => ({
      slots: Array.from({ length: 6 }, (): HTMLInputElement | null => null)
    }),
    []
  );

  const otpInputRefCallbacks = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map(
        (index) => (el: HTMLInputElement | null) => {
          otpSlotsBox.slots[index] = el;
        }
      ),
    [otpSlotsBox]
  );

  const phoneNormalized = useMemo(() => normalizePhoneDigits(phone), [phone]);
  const phoneE164 = useMemo(() => buildPhoneE164(countryCode, phoneNormalized), [countryCode, phoneNormalized]);

  const registerDraft = useMemo(
    () => ({
      fullName,
      email,
      password,
      countryCode,
      phone: phoneNormalized,
      phoneE164,
      role,
      company
    }),
    [fullName, email, password, countryCode, phoneNormalized, phoneE164, role, company]
  );

  const loginDraft = useMemo(
    () => ({
      email,
      countryCode,
      phone: phoneNormalized,
      phoneE164,
      password
    }),
    [email, countryCode, phoneNormalized, phoneE164, password]
  );

  const selectedCountry = useMemo(() => getAuthPhoneCountry(countryCode), [countryCode]);
  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);
  const isFullNameValid = useMemo(() => fullName.trim().split(/\s+/).filter(Boolean).length >= 2, [fullName]);
  const isPhoneValid = useMemo(() => {
    if (!selectedCountry) return false;
    return phoneNormalized.length === selectedCountry.mobileDigits;
  }, [selectedCountry, phoneNormalized]);
  const isLoginReady = isEmailValid && isPasswordValid && isPhoneValid;
  const isRegisterReady = isFullNameValid && Boolean(role) && isEmailValid && isPasswordValid && isPhoneValid;
  const isOtpReady = useMemo(() => otpCodeSchema.safeParse(otp.replace(/\D/g, '')).success, [otp]);
  const phoneLabel = formatPhoneLabel(countryCode, phone);
  useEffect(() => {
    if (mode !== 'login' || typeof window === 'undefined') return;
    const handle = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        if (!raw) return;
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        const parsed = JSON.parse(raw) as { email?: string; identifier?: string; password?: string };
        const emailOrIdentifier = parsed.email ?? parsed.identifier ?? '';
        if (looksLikeEmail(emailOrIdentifier)) {
          const seedPhone = findSeedPhoneByEmail(emailOrIdentifier);
          if (seedPhone) {
            setEmail(emailOrIdentifier.trim().toLowerCase());
            setCountryCode(seedPhone.countryCode);
            setPhone(seedPhone.phone);
          }
        }
        if (typeof parsed.password === 'string') setPassword(parsed.password);
      } catch {
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [mode]);

  useEffect(() => {
    if (!roleMenuOpen) return undefined;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!roleMenuRef.current?.contains(target)) setRoleMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [roleMenuOpen]);

  useEffect(() => {
    if (!otpStage || !expiresAtMs) return undefined;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [otpStage, expiresAtMs]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const eyebrow = otpStage
    ? t('otpEyebrow')
    : mode === 'login'
      ? t('loginEyebrow')
      : t('registerEyebrow');

  const title = completedMode
    ? completedMode === 'login'
      ? t('successLoginTitle')
      : t('successRegisterTitle')
    : otpStage
      ? t('otpTitle')
      : mode === 'login'
        ? t('loginTitle')
        : t('registerTitle');

  const description = completedMode
    ? completedMode === 'login'
      ? t('successLoginDescription')
      : t('successRegisterDescription')
    : otpStage
      ? mode === 'login'
        ? t('otpDescription')
        : t('otpDescriptionRegister')
      : mode === 'login'
        ? t('loginDescription')
        : t('registerDescription');

  function clearInlineMessages() {
    setError('');
    setSuccess('');
  }

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function resetOtpStage() {
    setOtpStage(false);
    setChallenge('');
    setOtpCodeHint('');
    setOtp('');
    setExpiresAtMs(null);
    setSecondsLeft(0);
    setCopied(false);
    clearInlineMessages();
  }

  function completeFlow(nextMode: Mode) {
    setCompletedMode(nextMode);
    setOtpStage(false);
    setChallenge('');
    setOtp('');
    setCopied(false);
    setSuccess(nextMode === 'login' ? t('loginSuccess') : t('registerSuccess'));

    const destination =
      nextMode === 'login'
        ? resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale)
        : intlAppPaths.dashboard.home;

    completionTimeoutRef.current = window.setTimeout(() => {
      router.push(destination);
    }, 1600);
  }

  function applyRegisterValidation() {
    const result = registerSchema.safeParse(registerDraft);
    if (result.success && role) {
      setFieldErrors({});
      return true;
    }

    const next: Record<string, string> = {};
    if (!role) next.role = t('errorRoleRequired');
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !next[key]) {
          next[key] = translateZodIssue(issue.message, t, key);
        }
      }
    }
    setFieldErrors(next);
    return false;
  }

  function applyLoginValidation() {
    const result = loginCredentialsSchema.safeParse(loginDraft);
    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !next[key]) {
        next[key] = translateZodIssue(issue.message, t, key);
      }
    }
    setFieldErrors(next);
    return false;
  }

  function applyOtpChallenge(result: OtpChallengeResponse | RegisterOtpChallengeResponse) {
    setOtpStage(true);
    setCompletedMode(null);
    setChallenge(result.challenge ?? '');
    setOtpCodeHint(resolveMockOtpCode(result));
    setOtp('');
    setExpiresAtMs(result.expiresAt ? Date.parse(result.expiresAt) : null);
    clearInlineMessages();
    window.setTimeout(() => otpSlotsBox.slots[0]?.focus(), 0);
  }

  async function requestRegisterOtp() {
    if (!applyRegisterValidation()) {
      setError(t('errorFixFields'));
      return;
    }

    setPending(true);
    clearInlineMessages();
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        role: role as PublicUserRole,
        countryCode,
        phone: phoneNormalized,
        phoneE164
      });

      if (isOtpChallengeResult(result)) {
        applyOtpChallenge(result);
        return;
      }

      throw new Error('request-failed');
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'email-already-registered') setError(t('emailAlreadyRegistered'));
      else if (code === 'phone-already-registered') setError(t('phoneAlreadyRegistered'));
      else if (code === 'forbidden') setError(t('roleInvalidPublic'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  async function requestLoginOtp() {
    if (!applyLoginValidation()) {
      setError(t('errorFixFields'));
      return;
    }

    registerRedirectRef.current = false;
    setPending(true);
    clearInlineMessages();
    try {
      const result = await login({
        email: email.trim(),
        countryCode,
        phone: phoneNormalized,
        phoneE164,
        password
      });
      if (isOtpChallengeResult(result)) {
        applyOtpChallenge(result);
        return;
      }

      throw new Error('request-failed');
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'user-not-found') {
        setError(t('userNotFound'));
        if (phone && !registerRedirectRef.current) {
          registerRedirectRef.current = true;
          window.setTimeout(() => {
            router.replace(`${intlAppPaths.auth.register}?prefill=${encodeURIComponent(phone)}`);
          }, 900);
        }
      } else if (code === 'invalid-login') {
        setError(t('invalidCredentials'));
      } else {
        setError(t('error'));
      }
    } finally {
      setPending(false);
    }
  }

  async function resendOtp() {
    setSuccess('');
    setError('');
    try {
      if (mode === 'login') await requestLoginOtp();
      else await requestRegisterOtp();
      setSuccess(t('otpResent'));
    } catch {
      setError(t('error'));
    }
  }

  async function submitOtp() {
    if (!isOtpReady) {
      setError(t('otpInvalid'));
      return;
    }

    setPending(true);
    clearInlineMessages();
    try {
      if (mode === 'login') {
        const result = await login({
          email: email.trim(),
          countryCode,
          phone: phoneNormalized,
          phoneE164,
          password,
          otp,
          challenge
        });

        if (!result.user) throw new Error('invalid-otp');
        completeFlow('login');
        return;
      }

      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        role: role as PublicUserRole,
        countryCode,
        phone: phoneNormalized,
        phoneE164,
        otp,
        challenge
      });

      if ('otpRequired' in result && result.otpRequired) throw new Error('invalid-otp');
      completeFlow('register');
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'invalid-otp') setError(t('otpInvalid'));
      else if (code === 'otp-expired') setError(t('otpExpired'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess('');

    if (completedMode) {
      const destination =
        completedMode === 'login'
          ? resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale)
          : intlAppPaths.dashboard.home;
      router.push(destination);
      return;
    }

    if (otpStage) {
      await submitOtp();
      return;
    }

    if (mode === 'login') {
      await requestLoginOtp();
      return;
    }

    await requestRegisterOtp();
  }

  function onOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const raw = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(raw);
    const focusIndex = raw.length > 0 ? Math.min(raw.length - 1, 5) : 0;
    otpSlotsBox.slots[focusIndex]?.focus();
  }

  async function copyOtpCode() {
    if (!otpCodeHint) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(otpCodeHint);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = otpCodeHint;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const primaryDisabled = completedMode !== null
    ? false
    : otpStage
      ? pending || !isOtpReady
      : mode === 'login'
        ? pending || !isLoginReady
        : pending || !isRegisterReady;

  return (
    <section className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.brandIcon}>
          <Anchor />
          <ShipWheel />
        </div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {completedMode ? (
            <div className={styles.successStage}>
              <span className={styles.successIcon}>
                <CheckCircle2 size={28} aria-hidden />
              </span>
              <div className={styles.successCopy}>
                <strong>{completedMode === 'login' ? t('successLoginBadge') : t('successRegisterBadge')}</strong>
                <p>{completedMode === 'login' ? t('successLoginHint') : t('successRegisterHint')}</p>
              </div>
            </div>
          ) : null}

          {!otpStage && !completedMode && mode === 'register' ? (
            <>
              <label className={styles.field}>
                <span>{t('name')}</span>
                <div>
                  <UserRound size={18} aria-hidden />
                  <input
                    name="fullName"
                    autoComplete="name"
                    placeholder={t('namePlaceholder')}
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      clearFieldError('fullName');
                    }}
                  />
                </div>
                {fieldErrors.fullName ? <p className={styles.fieldIssue}>{fieldErrors.fullName}</p> : <p className={styles.fieldHint}>{t('nameHint')}</p>}
              </label>

              <label className={styles.field}>
                <span>{t('email')}</span>
                <div>
                  <Mail size={18} aria-hidden />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearFieldError('email');
                    }}
                  />
                </div>
                {fieldErrors.email ? <p className={styles.fieldIssue}>{fieldErrors.email}</p> : <p className={styles.fieldHint}>{t('emailHint')}</p>}
              </label>

              <label className={styles.field}>
                <span>{t('password')}</span>
                <div>
                  <LockKeyhole size={18} aria-hidden />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError('password');
                    }}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                    <span className={styles.srOnly}>{showPassword ? t('hidePassword') : t('showPassword')}</span>
                  </button>
                </div>
                {fieldErrors.password ? <p className={styles.fieldIssue}>{fieldErrors.password}</p> : <p className={styles.fieldHint}>{t('passwordHint')}</p>}
              </label>

              <label className={styles.field}>
                <span>{t('company')}</span>
                <div>
                  <Anchor size={18} aria-hidden />
                  <input
                    name="company"
                    autoComplete="organization"
                    placeholder={t('companyPlaceholder')}
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                  />
                </div>
                <p className={styles.fieldHint}>{t('companyOptionalHint')}</p>
              </label>

              <div className={styles.field}>
                <span id="role-label">{t('role')}</span>
                <div className={styles.menuWrap} ref={roleMenuRef}>
                  <button
                    type="button"
                    className={styles.menuTrigger}
                    aria-expanded={roleMenuOpen}
                    aria-haspopup="listbox"
                    aria-labelledby="role-label"
                    onClick={() => setRoleMenuOpen((open) => !open)}
                  >
                    <ShipWheel size={18} aria-hidden />
                    <span className={styles.menuTriggerText}>
                      {role ? (role === 'shipper' ? t('shipperChoice') : t('carrierChoice')) : t('rolePlaceholder')}
                    </span>
                  </button>
                  {roleMenuOpen ? (
                    <div className={styles.menuPanel} role="listbox" aria-labelledby="role-label">
                      <button
                        type="button"
                        role="option"
                        aria-selected={role === 'shipper'}
                        className={role === 'shipper' ? styles.menuOptionActive : styles.menuOption}
                        onClick={() => {
                          setRole('shipper');
                          setRoleMenuOpen(false);
                          clearFieldError('role');
                        }}
                      >
                        <strong>{t('shipperChoice')}</strong>
                        <span className={styles.menuHint}>{t('shipperHint')}</span>
                      </button>
                      <button
                        type="button"
                        role="option"
                        aria-selected={role === 'carrier'}
                        className={role === 'carrier' ? styles.menuOptionActive : styles.menuOption}
                        onClick={() => {
                          setRole('carrier');
                          setRoleMenuOpen(false);
                          clearFieldError('role');
                        }}
                      >
                        <strong>{t('carrierChoice')}</strong>
                        <span className={styles.menuHint}>{t('carrierHint')}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
                {fieldErrors.role ? <p className={styles.fieldIssue}>{fieldErrors.role}</p> : <p className={styles.fieldHint}>{t('roleHint')}</p>}
              </div>
            </>
          ) : null}

          {!otpStage && !completedMode ? (
            <>
              {mode === 'login' ? (
                <p className={styles.phoneLead}>{t('loginPhoneLead')}</p>
              ) : null}

              {mode === 'login' ? (
                <label className={styles.field}>
                  <span>{t('email')}</span>
                  <div>
                    <Mail size={18} aria-hidden />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        clearFieldError('email');
                      }}
                    />
                  </div>
                  {fieldErrors.email ? <p className={styles.fieldIssue}>{fieldErrors.email}</p> : <p className={styles.fieldHint}>{t('emailHint')}</p>}
                </label>
              ) : null}

              {mode === 'login' ? (
                <label className={styles.field}>
                  <span>{t('password')}</span>
                  <div>
                    <LockKeyhole size={18} aria-hidden />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        clearFieldError('password');
                      }}
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                      <span className={styles.srOnly}>{showPassword ? t('hidePassword') : t('showPassword')}</span>
                    </button>
                  </div>
                  {fieldErrors.password ? <p className={styles.fieldIssue}>{fieldErrors.password}</p> : <p className={styles.fieldHint}>{t('passwordHint')}</p>}
                </label>
              ) : null}

              <div className={`${styles.field} ${styles.phoneFieldContainer}`}>
                <span id="phone-label">{mode === 'login' ? t('loginPhoneLabel') : t('phoneWithPrefix')}</span>
                <PhoneInput
                  countryCode={countryCode}
                  phone={phone}
                  mode={mode}
                  invalid={Boolean(fieldErrors.phone || fieldErrors.phoneE164 || fieldErrors.countryCode)}
                  onCountryChange={(nextCountryCode) => {
                    setCountryCode(nextCountryCode);
                    setPhone('');
                    clearFieldError('countryCode');
                    clearFieldError('phone');
                    clearFieldError('phoneE164');
                  }}
                  onPhoneChange={(nextPhone) => {
                    setPhone(nextPhone);
                    clearFieldError('phone');
                    clearFieldError('phoneE164');
                  }}
                />
                {(fieldErrors.phone || fieldErrors.phoneE164 || fieldErrors.countryCode) ? (
                  <p className={styles.fieldIssue}>{fieldErrors.phone ?? fieldErrors.phoneE164 ?? fieldErrors.countryCode}</p>
                ) : (
                  <p className={styles.fieldHint}>{t('phoneHint')}</p>
                )}
              </div>
            </>
          ) : null}

          {otpStage && !completedMode ? (
            <div className={styles.otpStage}>
              <div className={styles.otpStageHeader}>
                <div>
                  <strong>{t('otpPhoneBadge')}</strong>
                  <p>{phoneLabel}</p>
                </div>
                <button type="button" className={styles.secondaryAction} onClick={resetOtpStage}>
                  <ArrowLeft size={16} aria-hidden /> {t('changeCredentials')}
                </button>
              </div>

              <div className={styles.otpHero}>
                <div className={styles.otpHeroIcon}>
                  <ShieldCheck size={22} aria-hidden />
                </div>
                <div className={styles.otpHeroCopy}>
                  <strong>{mode === 'login' ? t('otpSentLoginTitle') : t('otpSentRegisterTitle')}</strong>
                  <p>{mode === 'login' ? t('otpSentLoginBody') : t('otpSentRegisterBody')}</p>
                </div>
              </div>

              <div className={styles.otpBox}>
                <div className={styles.otpHeader}>
                  <strong>{t('mockCodeLabel')}</strong>
                  <button type="button" className={styles.copyButton} onClick={copyOtpCode} aria-live="polite">
                    {copied ? t('copied') : t('copyOtp')} <Copy size={15} aria-hidden />
                  </button>
                </div>
                <div className={styles.otpCode} aria-live="polite">
                  {otpCodeHint || t('otpCodeUnavailable')}
                </div>
                {copied ? <p className={styles.success}>{t('otpCodeCopied')}</p> : null}
                <p>{t('otpCodeHelp')}</p>
              </div>

              <div className={styles.otpStageCard}>
                <div className={styles.otpMeta}>
                  <strong>{t('otpInputLabel')}</strong>
                  <span>{secondsLeft > 0 ? t('otpExpiresIn', { seconds: secondsLeft }) : t('otpTimerExpired')}</span>
                </div>
                <p className={styles.fieldHint}>{t('otpHint')}</p>

                <div className={styles.otpRow} role="group" aria-label={t('otpInputLabel')}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <input
                      key={`otp-slot-${index}`}
                      ref={otpInputRefCallbacks[index]}
                      className={styles.otpCell}
                      inputMode="numeric"
                      maxLength={1}
                      pattern="\d*"
                      aria-label={`${t('otpDigitAria')} ${index + 1}`}
                      value={otp[index] ?? ''}
                      onPaste={onOtpPaste}
                      onChange={(event) => {
                        const digit = event.target.value.replace(/\D/g, '').slice(-1);
                        const chars = otp.padEnd(6, ' ').split('');
                        chars[index] = digit || '';
                        const merged = chars.join('').trimEnd();
                        setOtp(merged);
                        if (digit && index < 5) otpSlotsBox.slots[index + 1]?.focus();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Backspace' && !otp[index] && index > 0) {
                          otpSlotsBox.slots[index - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <div className={styles.otpFooter}>
                  <p>{t('otpResendHint')}</p>
                  <button type="button" className={styles.secondaryAction} onClick={resendOtp} disabled={pending}>
                    {t('resendOtp')}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <Button className={styles.submit} disabled={primaryDisabled} loading={pending} loadingLabel={t('loading')}>
            {completedMode
              ? t('successContinue')
              : otpStage
                ? t('otpSubmit')
                : mode === 'login'
                  ? t('continueToOtp')
                  : t('signup')}
          </Button>
        </form>
      </div>

      <aside className={styles.story}>
        <p>{t('sideEyebrow')}</p>
        <h2>{t('sideTitle')}</h2>
        <ul>
          <li>{t('sideOne')}</li>
          <li>{t('sideTwo')}</li>
          <li>{t('sideThree')}</li>
        </ul>
      </aside>
    </section>
  );
}

'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent } from 'react';
import { Anchor, ArrowLeft, Copy, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, ShipWheel, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/ui/button/button';
import { QA_LOGIN_PREFILL_STORAGE_KEY } from '@/shared/qa/login-prefill';
import { routeSearchParams } from '@/shared/routing/route-search-params';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { login, register } from '../../services/auth.client';
import type { PublicUserRole, RegisterOtpChallengeResponse } from '../../domain/auth.types';
import { AUTH_DIAL_OPTIONS, type AuthDialCode } from './auth-dial-options';
import { loginCredentialsSchema, registerSchema } from '../../domain/auth-schemas';
import { looksLikeEmail } from '../../domain/auth-normalization';
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
  /** Pré-preenche e-mail ou telefone ao vir do fluxo de login (query `prefill`). */
  registerPrefill?: string;
};

function initialRegisterContact(prefill?: string) {
  if (!prefill || typeof prefill !== 'string') return { email: '', phone: '' };
  if (looksLikeEmail(prefill)) return { email: prefill, phone: '' };
  return { email: '', phone: prefill.replace(/\D/g, '') };
}

function translateZodIssue(message: string, t: ReturnType<typeof useTranslations<'auth'>>): string {
  const map: Record<string, string> = {
    'invalid-email': 'errorEmailInvalid',
    'password-too-short': 'errorPasswordMin',
    'full-name-required': 'errorFullNameRequired',
    'full-name-must-have-two-words': 'errorFullNameTwoWords',
    'invalid-country-code': 'errorCountryCode',
    'invalid-phone': 'errorPhone',
    'invalid-phone-e164': 'errorPhone',
    'company-required': 'errorCompanyRequired',
    'identifier-required': 'errorIdentifierRequired',
    'invalid-identifier': 'errorIdentifierInvalid'
  };
  const key = map[message];
  return key ? t(key) : t('errorValidation');
}

export function AuthForm({ mode, registerPrefill }: AuthFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  const [otpStage, setOtpStage] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [otpCodeHint, setOtpCodeHint] = useState('');
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<PublicUserRole>('shipper');
  const [email, setEmail] = useState(() => (mode === 'register' ? initialRegisterContact(registerPrefill).email : ''));
  const [countryCode, setCountryCode] = useState<AuthDialCode>('+55');
  const [phone, setPhone] = useState(() => (mode === 'register' ? initialRegisterContact(registerPrefill).phone : ''));
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [dialMenuOpen, setDialMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const dialMenuRef = useRef<HTMLDivElement>(null);

  const [otp, setOtp] = useState('');
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode !== 'login' || typeof window === 'undefined') return;
    const handle = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        if (!raw) return;
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        const parsed = JSON.parse(raw) as { email?: string; identifier?: string; password?: string };
        const id = parsed.identifier ?? parsed.email;
        if (typeof id === 'string') setIdentifier(id);
        if (typeof parsed.password === 'string') setPassword(parsed.password);
      } catch {
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [mode]);

  useEffect(() => {
    if (!roleMenuOpen && !dialMenuOpen) return undefined;
    const close = (event: PointerEvent) => {
      const t = event.target as Node;
      if (!roleMenuRef.current?.contains(t)) setRoleMenuOpen(false);
      if (!dialMenuRef.current?.contains(t)) setDialMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [roleMenuOpen, dialMenuOpen]);

  useEffect(() => {
    if (!expiresAtMs || !otpStage) return undefined;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)));
    const timeoutId = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [expiresAtMs, otpStage]);

  const registerDraft = useMemo(
    () => ({
      fullName,
      email,
      password,
      countryCode,
      phone,
      role,
      company
    }),
    [fullName, email, password, countryCode, phone, role, company]
  );

  const registerStepValid = useMemo(() => registerSchema.safeParse(registerDraft).success, [registerDraft]);

  const loginStepValid = useMemo(() => {
    return loginCredentialsSchema.safeParse({ identifier, password }).success;
  }, [identifier, password]);

  const otpComplete = otp.length === 6;

  const title = useMemo(() => {
    if (mode !== 'login') return otpStage ? t('otpTitle') : t('registerTitle');
    return otpStage ? t('otpTitle') : t('loginTitle');
  }, [mode, otpStage, t]);

  const description = useMemo(() => {
    if (mode !== 'login') return otpStage ? t('otpDescriptionRegister') : t('registerDescription');
    return otpStage ? t('otpDescription') : t('loginDescription');
  }, [mode, otpStage, t]);

  const eyebrow = useMemo(() => {
    if (mode !== 'login') return otpStage ? t('otpEyebrow') : t('registerEyebrow');
    return otpStage ? t('otpEyebrow') : t('loginEyebrow');
  }, [mode, otpStage, t]);

  async function copyOtpCode() {
    if (!otpCodeHint) return;
    try {
      await navigator.clipboard.writeText(otpCodeHint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetOtpStage() {
    setOtpStage(false);
    setOtp('');
    setChallenge('');
    setOtpCodeHint('');
    setExpiresAtMs(null);
    setSecondsLeft(0);
    setCopied(false);
    setError('');
    setSuccess('');
  }

  function applyRegisterValidation() {
    const result = registerSchema.safeParse(registerDraft);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !next[key]) next[key] = translateZodIssue(issue.message, t);
    }
    setFieldErrors(next);
    return false;
  }

  function onOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const raw = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(raw);
    const focusIdx = Math.min(raw.length, 5);
    otpInputsRef.current[focusIdx]?.focus();
  }

  async function requestRegisterOtp() {
    if (!applyRegisterValidation()) {
      setError(t('errorFixFields'));
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        role,
        countryCode,
        phone
      });
      if ('otpRequired' in result && result.otpRequired) {
        const r = result as RegisterOtpChallengeResponse;
        setOtpStage(true);
        setChallenge(r.challenge);
        setOtpCodeHint(r.otpCode ?? '');
        setExpiresAtMs(Date.parse(r.expiresAt));
        setOtp('');
        return;
      }
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
    const parsed = loginCredentialsSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      setFieldErrors({
        identifier: translateZodIssue(parsed.error.issues[0]?.message ?? '', t),
        password: translateZodIssue(parsed.error.issues.find((i) => i.path[0] === 'password')?.message ?? '', t)
      });
      setError(t('errorFixFields'));
      return;
    }
    setPending(true);
    setError('');
    setFieldErrors({});
    try {
      const result = await login({ identifier: identifier.trim(), password });
      if (result.otpRequired) {
        setOtpStage(true);
        setChallenge(result.challenge ?? '');
        setOtpCodeHint(result.otpCode ?? '');
        setExpiresAtMs(result.expiresAt ? Date.parse(result.expiresAt) : null);
        setOtp('');
        return;
      }
      if (result.user) {
        setSuccess(t('loginSuccess'));
        router.push(resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale));
      }
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'user-not-found') {
        setError(t('userNotFound'));
        router.push(`${intlAppPaths.auth.register}?prefill=${encodeURIComponent(identifier.trim())}` as never);
      } else if (code === 'invalid-login') setError(t('invalidCredentials'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  async function resendOtp() {
    setOtp('');
    setError('');
    setOtpCodeHint('');
    if (mode === 'login') await requestLoginOtp();
    else await requestRegisterOtp();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess('');
    if (mode === 'login') {
      if (!otpStage) {
        await requestLoginOtp();
        return;
      }
      if (!otpComplete) {
        setError(t('otpInvalid'));
        return;
      }
      setPending(true);
      setError('');
      try {
        const result = await login({
          identifier: identifier.trim(),
          password,
          otp,
          challenge
        });
        if (!result.user) throw new Error('invalid-otp');
        setSuccess(t('loginSuccess'));
        router.push(resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale));
      } catch (nextError) {
        const code = nextError instanceof Error ? nextError.message : 'request-failed';
        if (code === 'invalid-otp') setError(t('otpInvalid'));
        else if (code === 'otp-expired') setError(t('otpExpired'));
        else if (code === 'invalid-login') setError(t('invalidCredentials'));
        else if (code === 'user-not-found') {
          setError(t('userNotFound'));
          router.push(`${intlAppPaths.auth.register}?prefill=${encodeURIComponent(identifier.trim())}` as never);
        } else setError(t('error'));
      } finally {
        setPending(false);
      }
      return;
    }

    if (!otpStage) {
      await requestRegisterOtp();
      return;
    }

    if (!otpComplete) {
      setError(t('otpInvalid'));
      return;
    }

    setPending(true);
    setError('');
    try {
      const created = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
        role,
        countryCode,
        phone,
        otp,
        challenge
      });
      if (created && typeof created === 'object' && 'otpRequired' in created) {
        throw new Error('register-incomplete');
      }
      setSuccess(t('registerSuccess'));
      router.push(intlAppPaths.dashboard.home);
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'invalid-otp') setError(t('otpInvalid'));
      else if (code === 'otp-expired') setError(t('otpExpired'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  const primaryDisabled =
    pending ||
    (mode === 'login'
      ? otpStage
        ? !otpComplete
        : !loginStepValid
      : otpStage
        ? !otpComplete
        : !registerStepValid);

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
          {mode === 'register' && !otpStage ? (
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
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.fullName;
                        return next;
                      });
                    }}
                  />
                </div>
                {fieldErrors.fullName ? <p className={styles.fieldIssue}>{fieldErrors.fullName}</p> : null}
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
                    onChange={(event) => {
                      setCompany(event.target.value);
                      setFieldErrors((p) => {
                        const n = { ...p };
                        delete n.company;
                        return n;
                      });
                    }}
                  />
                </div>
                {fieldErrors.company ? <p className={styles.fieldIssue}>{fieldErrors.company}</p> : null}
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
                    onClick={() => setRoleMenuOpen((o) => !o)}
                  >
                    <ShipWheel size={18} aria-hidden />
                    <span className={styles.menuTriggerText}>
                      {role === 'shipper' ? t('shipperLabel') : t('carrierLabel')}
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
                        }}
                      >
                        <strong>{t('shipperLabel')}</strong>
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
                        }}
                      >
                        <strong>{t('carrierLabel')}</strong>
                        <span className={styles.menuHint}>{t('carrierHint')}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
                {fieldErrors.role ? <p className={styles.fieldIssue}>{fieldErrors.role}</p> : null}
              </div>

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
                      setFieldErrors((p) => {
                        const n = { ...p };
                        delete n.email;
                        return n;
                      });
                    }}
                  />
                </div>
                {fieldErrors.email ? <p className={styles.fieldIssue}>{fieldErrors.email}</p> : null}
              </label>

              <label className={styles.field}>
                <span>{t('password')}</span>
                <div>
                  <LockKeyhole size={18} aria-hidden />
                  <input
                    name="password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((p) => {
                        const n = { ...p };
                        delete n.password;
                        return n;
                      });
                    }}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    aria-pressed={showRegisterPassword}
                    onClick={() => setShowRegisterPassword((v) => !v)}
                  >
                    {showRegisterPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                    <span className={styles.srOnly}>{showRegisterPassword ? t('hidePassword') : t('showPassword')}</span>
                  </button>
                </div>
                {fieldErrors.password ? <p className={styles.fieldIssue}>{fieldErrors.password}</p> : null}
              </label>

              <div className={styles.field}>
                <span id="phone-label">{t('phoneWithPrefix')}</span>
                <div className={styles.fieldRowSplit}>
                  <div className={styles.menuWrap} ref={dialMenuRef}>
                    <button
                      type="button"
                      className={styles.menuTriggerDial}
                      aria-expanded={dialMenuOpen}
                      aria-haspopup="listbox"
                      aria-label={t('countryPrefix')}
                      onClick={() => setDialMenuOpen((o) => !o)}
                    >
                      {countryCode}
                    </button>
                    {dialMenuOpen ? (
                      <div className={styles.menuPanelDial} role="listbox" aria-labelledby="phone-label">
                        {AUTH_DIAL_OPTIONS.map((dial) => (
                          <button
                            key={dial}
                            type="button"
                            role="option"
                            aria-selected={countryCode === dial}
                            className={countryCode === dial ? styles.menuOptionActive : styles.menuOption}
                            onClick={() => {
                              setCountryCode(dial);
                              setDialMenuOpen(false);
                            }}
                          >
                            {dial}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <label className={styles.fieldGrow}>
                    <span className={styles.srOnly}>{t('phoneNational')}</span>
                    <div>
                      <Phone size={18} aria-hidden />
                      <input
                        name="phone"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder={t('phonePlaceholder')}
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value.replace(/\D/g, ''));
                          setFieldErrors((p) => {
                            const n = { ...p };
                            delete n.phone;
                            delete n.phoneE164;
                            return n;
                          });
                        }}
                      />
                    </div>
                  </label>
                </div>
                {(fieldErrors.phone || fieldErrors.phoneE164) ? (
                  <p className={styles.fieldIssue}>{fieldErrors.phone ?? fieldErrors.phoneE164}</p>
                ) : (
                  <p className={styles.fieldHint}>{t('phoneHint')}</p>
                )}
              </div>
            </>
          ) : null}

          {mode === 'login' ? (
            <>
              {!otpStage ? (
                <>
                  <label className={styles.field}>
                    <span>{t('identifierLabel')}</span>
                    <div>
                      <Mail size={18} aria-hidden />
                      <input
                        name="identifier"
                        autoComplete="username"
                        placeholder={t('identifierPlaceholder')}
                        value={identifier}
                        onChange={(event) => {
                          setIdentifier(event.target.value);
                          setFieldErrors({});
                          if (otpStage) resetOtpStage();
                        }}
                      />
                    </div>
                    {fieldErrors.identifier ? <p className={styles.fieldIssue}>{fieldErrors.identifier}</p> : null}
                  </label>
                  <label className={styles.field}>
                    <span>{t('password')}</span>
                    <div>
                      <LockKeyhole size={18} aria-hidden />
                      <input
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder={t('passwordPlaceholder')}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setFieldErrors({});
                          if (otpStage) resetOtpStage();
                        }}
                      />
                      <button
                        type="button"
                        className={styles.togglePassword}
                        aria-pressed={showLoginPassword}
                        onClick={() => setShowLoginPassword((v) => !v)}
                      >
                        {showLoginPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                        <span className={styles.srOnly}>{showLoginPassword ? t('hidePassword') : t('showPassword')}</span>
                      </button>
                    </div>
                    {fieldErrors.password ? <p className={styles.fieldIssue}>{fieldErrors.password}</p> : null}
                  </label>
                </>
              ) : null}
            </>
          ) : null}

          {otpStage ? (
            <>
              {otpCodeHint ? (
                <div className={styles.otpBox}>
                  <div className={styles.otpHeader}>
                    <strong>
                      <ShieldCheck size={18} aria-hidden /> {t('mockCodeLabel')}
                    </strong>
                    <button type="button" className={styles.copyButton} onClick={copyOtpCode}>
                      {copied ? t('copied') : t('copyOtp')} <Copy size={15} aria-hidden />
                    </button>
                  </div>
                  <div className={styles.otpCode} aria-live="polite">
                    {otpCodeHint}
                  </div>
                  <p>{t('otpCodeHelp')}</p>
                </div>
              ) : (
                <p className={styles.fieldHint}>{t('mockCodeHiddenHint')}</p>
              )}

              <div className={styles.field}>
                <span id="otp-label">{t('otpInputLabel')}</span>
                <div className={styles.otpRow} role="group" aria-labelledby="otp-label">
                  {Array.from({ length: 6 }, (_, index) => (
                    <input
                      key={`otp-slot-${index}`}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      className={styles.otpCell}
                      inputMode="numeric"
                      maxLength={1}
                      pattern="\d*"
                      aria-label={`${t('otpDigitAria')} ${index + 1}`}
                      value={otp[index] ?? ''}
                      onPaste={index === 0 ? onOtpPaste : undefined}
                      onChange={(event) => {
                        const d = event.target.value.replace(/\D/g, '').slice(-1);
                        const prefix = otp.slice(0, index);
                        const suffix = otp.slice(index + 1);
                        const merged = `${prefix}${d}${suffix}`.slice(0, 6);
                        setOtp(merged);
                        if (d && index < 5) otpInputsRef.current[index + 1]?.focus();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Backspace') {
                          if (otp[index]) {
                            event.preventDefault();
                            const prefix = otp.slice(0, index);
                            const suffix = otp.slice(index + 1);
                            setOtp(`${prefix}${suffix}`);
                          } else if (index > 0) {
                            otpInputsRef.current[index - 1]?.focus();
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className={styles.otpTimer}>
                {secondsLeft > 0 ? t('otpExpiresIn', { seconds: secondsLeft }) : t('otpTimerExpired')}
              </p>

              <button type="button" className={styles.secondaryAction} onClick={resendOtp} disabled={pending}>
                {t('resendOtp')}
              </button>
              <button type="button" className={styles.secondaryAction} onClick={resetOtpStage}>
                <ArrowLeft size={16} aria-hidden /> {t('changeCredentials')}
              </button>
            </>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <Button className={styles.submit} disabled={primaryDisabled} loading={pending} loadingLabel={t('loading')}>
            {mode === 'login'
              ? otpStage
                ? t('otpSubmit')
                : t('login')
              : otpStage
                ? t('otpSubmit')
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

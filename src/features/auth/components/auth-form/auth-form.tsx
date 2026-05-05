
'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Anchor, ArrowLeft, Copy, LockKeyhole, Mail, ShieldCheck, ShipWheel, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/ui/button/button';
import { QA_LOGIN_PREFILL_STORAGE_KEY } from '@/shared/qa/login-prefill';
import { routeSearchParams } from '@/shared/routing/route-search-params';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { login, register } from '../../services/auth.client';
import type { PublicUserRole } from '../../domain/auth.types';
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

export function AuthForm({ mode }: { mode: Mode }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [challenge, setChallenge] = useState('');

  useEffect(() => {
    if (mode !== 'login' || typeof window === 'undefined') return;
    const handle = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        if (!raw) return;
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
        const parsed = JSON.parse(raw) as { email?: string; password?: string };
        if (typeof parsed.email === 'string') setEmail(parsed.email);
        if (typeof parsed.password === 'string') setPassword(parsed.password);
      } catch {
        sessionStorage.removeItem(QA_LOGIN_PREFILL_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [mode]);

  const title = useMemo(() => {
    if (mode !== 'login') return t('registerTitle');
    return otpStage ? t('otpTitle') : t('loginTitle');
  }, [mode, otpStage, t]);

  const description = useMemo(() => {
    if (mode !== 'login') return t('registerDescription');
    return otpStage ? t('otpDescription') : t('loginDescription');
  }, [mode, otpStage, t]);

  const eyebrow = useMemo(() => {
    if (mode !== 'login') return t('registerEyebrow');
    return otpStage ? t('otpEyebrow') : t('loginEyebrow');
  }, [mode, otpStage, t]);

  async function copyOtpCode() {
    if (!otpCode) return;
    try {
      await navigator.clipboard.writeText(otpCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetOtpStage() {
    setOtpStage(false);
    setOtp('');
    setOtpCode('');
    setChallenge('');
    setCopied(false);
    setError('');
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const form = new FormData(event.currentTarget);

    try {
      if (mode === 'login') {
        if (!otpStage) {
          const result = await login({ email, password });
          if (result.otpRequired) {
            setOtpStage(true);
            setOtpCode(result.otpCode ?? '');
            setChallenge(result.challenge ?? '');
            setOtp('');
            setPending(false);
            return;
          }
          if (result.user) router.push(resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale));
        } else {
          const result = await login({ email, password, otp, challenge });
          if (!result.user) throw new Error('invalid-otp');
          router.push(resolvePostLoginHref(searchParams.get(routeSearchParams.next), locale));
        }
      } else {
        await register({
          name: String(form.get('name')),
          company: String(form.get('company')),
          role: String(form.get('role')) as PublicUserRole,
          email: String(form.get('email')),
          password: String(form.get('password'))
        });
        router.push(intlAppPaths.dashboard.home);
      }
    } catch (nextError) {
      const code = nextError instanceof Error ? nextError.message : 'request-failed';
      if (code === 'invalid-otp') setError(t('otpInvalid'));
      else setError(t('error'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.brandIcon}><Anchor /><ShipWheel /></div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>

        <form className={styles.form} onSubmit={onSubmit}>
          {mode === 'register' && (
            <>
              <label className={styles.field}>
                <span>{t('name')}</span>
                <div><UserRound size={18} /><input name="name" required placeholder={t('namePlaceholder')} /></div>
              </label>
              <label className={styles.field}>
                <span>{t('company')}</span>
                <div><Anchor size={18} /><input name="company" required placeholder={t('companyPlaceholder')} /></div>
              </label>
              <label className={styles.field}>
                <span>{t('role')}</span>
                <div><ShipWheel size={18} /><select name="role" defaultValue="shipper"><option value="shipper">{t('shipper')}</option><option value="carrier">{t('carrier')}</option></select></div>
              </label>
            </>
          )}

          {mode === 'login' ? (
            <>
              <label className={styles.field}>
                <span>{t('email')}</span>
                <div><Mail size={18} /><input name="email" type="email" required placeholder={t('emailPlaceholder')} value={email} onChange={(event) => { setEmail(event.target.value); if (otpStage) resetOtpStage(); }} disabled={otpStage} /></div>
              </label>
              <label className={styles.field}>
                <span>{t('password')}</span>
                <div><LockKeyhole size={18} /><input name="password" type="password" required placeholder="••••••••" minLength={6} value={password} onChange={(event) => { setPassword(event.target.value); if (otpStage) resetOtpStage(); }} disabled={otpStage} /></div>
              </label>

              {otpStage ? (
                <>
                  {otpCode ? (
                    <div className={styles.otpBox}>
                      <div className={styles.otpHeader}>
                        <strong><ShieldCheck size={18} /> {t('otpCodeLabel')}</strong>
                        <button type="button" className={styles.copyButton} onClick={copyOtpCode}>{copied ? t('copied') : t('copyOtp')} <Copy size={15} /></button>
                      </div>
                      <div className={styles.otpCode}>{otpCode}</div>
                      <p>{t('otpCodeHelp')}</p>
                    </div>
                  ) : null}
                  <label className={styles.field}>
                    <span>{t('otpTitle')}</span>
                    <div><ShieldCheck size={18} /><input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder={t('otpPlaceholder')} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} /></div>
                  </label>
                  <button type="button" className={styles.secondaryAction} onClick={resetOtpStage}><ArrowLeft size={16} /> {t('changeCredentials')}</button>
                </>
              ) : null}
            </>
          ) : (
            <>
              <label className={styles.field}>
                <span>{t('email')}</span>
                <div><Mail size={18} /><input name="email" type="email" required placeholder={t('emailPlaceholder')} /></div>
              </label>
              <label className={styles.field}>
                <span>{t('password')}</span>
                <div><LockKeyhole size={18} /><input name="password" type="password" required placeholder="••••••••" minLength={6} /></div>
              </label>
            </>
          )}

          {error ? <p className={styles.error}>{error}</p> : null}
          <Button className={styles.submit} loading={pending} loadingLabel={t('loading')}>{mode === 'login' ? (otpStage ? t('otpSubmit') : t('login')) : t('signup')}</Button>
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

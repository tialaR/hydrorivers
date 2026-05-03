'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './locale-switcher.module.scss';

const locales = [
  { value: 'pt-BR', label: 'BR', name: 'Português' },
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'es', label: 'ES', name: 'Español' }
] as const;

type LocaleValue = (typeof locales)[number]['value'];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('nav');

  const changeLocale = (nextLocale: LocaleValue) => {
    if (nextLocale === locale) return;
    const query = searchParams.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    try {
      window.localStorage.setItem('hydrorivers.locale', nextLocale);
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    } catch {}

    router.replace(`${pathname}${query ? `?${query}` : ''}${hash}` as never, { locale: nextLocale });
  };

  return (
    <label className={styles.switcher} aria-label={t('language')} title={t('language')}>
      <HydroIcon name="globe" size={17} />
      <span className={styles.current}>{locales.find((item) => item.value === locale)?.label ?? 'BR'}</span>
      <select value={locale} onChange={(event) => changeLocale(event.target.value as LocaleValue)} aria-label={t('language')}>
        {locales.map((item) => <option key={item.value} value={item.value}>{item.name}</option>)}
      </select>
    </label>
  );
}

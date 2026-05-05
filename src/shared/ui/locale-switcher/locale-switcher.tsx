'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import type { AppLocale } from '@/core/i18n/routing';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './locale-switcher.module.scss';

const SUPPORTED_LOCALES: AppLocale[] = ['pt-BR', 'en', 'es'];

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('nav');

  const changeLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;
    const query = searchParams.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    try {
      window.localStorage.setItem('hydrorivers.locale', nextLocale);
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    } catch {}

    router.replace(`${pathname}${query ? `?${query}` : ''}${hash}` as never, { locale: nextLocale });
  };

  const optionLabel = (value: AppLocale) => t(`localeOption.${value}`);

  return (
    <label className={styles.switcher} aria-label={t('language')} title={t('language')}>
      <HydroIcon name="globe" size={17} />
      <span className={styles.current}>{optionLabel(locale)}</span>
      <select value={locale} onChange={(event) => changeLocale(event.target.value as AppLocale)} aria-label={t('language')}>
        {SUPPORTED_LOCALES.map((value) => (
          <option key={value} value={value}>
            {optionLabel(value)}
          </option>
        ))}
      </select>
    </label>
  );
}

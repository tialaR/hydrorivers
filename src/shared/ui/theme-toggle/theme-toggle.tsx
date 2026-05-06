'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { cookieNames } from '@/shared/http/cookie-names';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './theme-toggle.module.scss';

type Theme = 'light' | 'dark';

function resolveTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === 'light' || fromDom === 'dark') return fromDom;
  const stored = window.localStorage.getItem(cookieNames.theme);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeToggle() {
  const t = useTranslations('common');
  const [theme, setTheme] = useState<Theme>(() => resolveTheme());
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setTheme(nextTheme);
      }
    };
    window.addEventListener('hydrorivers:theme-change', onThemeChange);
    return () => window.removeEventListener('hydrorivers:theme-change', onThemeChange);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    window.dispatchEvent(new CustomEvent('hydrorivers:theme-change', { detail: nextTheme }));
    setTheme(nextTheme);
  }

  return (
    <button className={styles.button} onClick={toggleTheme} aria-label={t('toggleTheme')} type="button">
      <HydroIcon name={mounted && theme === 'light' ? 'moon' : 'sun'} size={19} />
    </button>
  );
}

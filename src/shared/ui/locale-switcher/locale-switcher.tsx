'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import type { AppLocale } from '@/core/i18n/routing';
import styles from './locale-switcher.module.scss';

const SUPPORTED_LOCALES: AppLocale[] = ['pt-BR', 'en', 'es'];

/** BCP-47-style codes shown in UI; routing keys stay pt-BR / en / es. */
const LOCALE_VISUAL: Record<AppLocale, { flag: string; code: string }> = {
  'pt-BR': { flag: '🇧🇷', code: 'pt-BR' },
  en: { flag: '🇺🇸', code: 'en-US' },
  es: { flag: '🇪🇸', code: 'es' }
};

function persistLocalePreference(nextLocale: AppLocale) {
  try {
    window.localStorage.setItem('hydrorivers.locale', nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* ignore storage / cookie failures */
  }
}

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const changeLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    const query = searchParams.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    persistLocalePreference(nextLocale);

    router.replace(`${pathname}${query ? `?${query}` : ''}${hash}` as never, { locale: nextLocale });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const visual = LOCALE_VISUAL[locale];
  const currentIndex = SUPPORTED_LOCALES.indexOf(locale);

  function focusMenuItem(index: number) {
    const menu = rootRef.current?.querySelector('[role="menu"]');
    const items = menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    if (!items?.length) return;
    const next = (index + items.length) % items.length;
    items[next]?.focus();
  }

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusMenuItem(currentIndex >= 0 ? currentIndex + 1 : 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusMenuItem(currentIndex >= 0 ? currentIndex - 1 : SUPPORTED_LOCALES.length - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusMenuItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusMenuItem(SUPPORTED_LOCALES.length - 1);
    }
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={open ? styles.triggerActive : styles.trigger}
        aria-label={t('language')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) setOpen(true);
            requestAnimationFrame(() => {
              if (event.key === 'ArrowDown') focusMenuItem(0);
              else focusMenuItem(SUPPORTED_LOCALES.length - 1);
            });
          }
        }}
      >
        <span className={styles.triggerFlag} aria-hidden>
          {visual.flag}
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          className={styles.panel}
          role="menu"
          aria-label={t('language')}
          onKeyDown={onMenuKeyDown}
        >
          {SUPPORTED_LOCALES.map((value) => {
            const item = LOCALE_VISUAL[value];
            const selected = value === locale;
            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                className={selected ? styles.menuItemActive : styles.menuItem}
                aria-current={selected ? 'true' : undefined}
                onClick={() => changeLocale(value)}
              >
                <span className={styles.menuFlag} aria-hidden>
                  {item.flag}
                </span>
                <span>{item.code}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

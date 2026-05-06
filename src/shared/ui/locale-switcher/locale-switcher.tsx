'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import type { AppLocale } from '@/core/i18n/routing';
import { cookieNames } from '@/shared/http/cookie-names';
import styles from './locale-switcher.module.scss';

const SUPPORTED_LOCALES: AppLocale[] = ['pt-BR', 'en-US', 'es'];

/** Labels exibidos no menu (BCP-47). */
const LOCALE_VISUAL: Record<AppLocale, { flag: string; code: string }> = {
  'pt-BR': { flag: '🇧🇷', code: 'pt-BR' },
  'en-US': { flag: '🇺🇸', code: 'en-US' },
  es: { flag: '🇪🇸', code: 'es' }
};

function persistLocalePreference(nextLocale: AppLocale) {
  try {
    window.localStorage.setItem('hydrorivers.locale', nextLocale);
    document.cookie = `${cookieNames.locale}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore storage / cookie failures */
  }
}

type LocaleSwitcherProps = {
  /**
   * Render the menu in `document.body` with `position: fixed` so it is not clipped
   * by overflow/stacking (e.g. mobile header + bottom sheet).
   */
  dropdownPortal?: boolean;
};

function useSyncPortalMenuPosition(
  open: boolean,
  enabled: boolean,
  triggerRef: RefObject<HTMLButtonElement | null>
) {
  const [style, setStyle] = useState<{ top: number; right: number }>({ top: 0, right: 12 });

  useLayoutEffect(() => {
    if (!open || !enabled || typeof window === 'undefined') return undefined;

    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const right = Math.max(12, window.innerWidth - r.right);
      setStyle({ top: r.bottom + 8, right });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, enabled, triggerRef]);

  return style;
}

export function LocaleSwitcher({ dropdownPortal = false }: LocaleSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const portalPos = useSyncPortalMenuPosition(open, dropdownPortal, triggerRef);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

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
      const target = event.target as Node;
      const insideTriggerOrRoot = rootRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTriggerOrRoot && !insidePanel) setOpen(false);
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
    const menu = panelRef.current;
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

  const menuPanel = open ? (
    <div
      ref={panelRef}
      id={menuId}
      className={`${styles.panel} ${dropdownPortal ? styles.panelPortal : ''}`}
      style={
        dropdownPortal
          ? { top: portalPos.top, right: portalPos.right }
          : undefined
      }
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
  ) : null;

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
      {open && dropdownPortal && mounted
        ? createPortal(menuPanel, document.body)
        : open && !dropdownPortal
          ? menuPanel
          : null}
    </div>
  );
}

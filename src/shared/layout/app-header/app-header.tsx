'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';
import { Link, usePathname } from '@/core/i18n/navigation';
import { mainNavigation } from '@/shared/config/navigation';
import { ThemeToggle } from '@/shared/ui/theme-toggle/theme-toggle';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher/locale-switcher';
import { AuthActions } from '@/features/auth/components/auth-actions/auth-actions';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './app-header.module.scss';

const MENU_SHEET_CLOSE_MS = 260;
const MENU_SHEET_CLOSE_THRESHOLD = 170;
const MENU_SHEET_HALF_THRESHOLD = 76;
const MENU_SHEET_FULL_THRESHOLD = 72;

type MenuSheetState = 'closed' | 'open' | 'closing';
type MenuSheetSnap = 'half' | 'full';

function initials(name?: string) {
  return (name ?? 'HR')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'HR';
}

function normalizeCurrentPath(pathname: string) {
  const withoutLocale = pathname.replace(/^\/(pt-BR|en|es)(?=\/|$)/, '') || '/';
  const normalized = withoutLocale.replace(/\/$/, '') || '/';
  return normalized;
}

function resolveActiveHref(pathname: string) {
  const current = normalizeCurrentPath(pathname);
  const candidates = mainNavigation
    .filter((item) => item.href !== '/')
    .filter((item) => current === item.href || current.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length);

  return candidates[0]?.href ?? (current === '/' ? '/' : '');
}

export function AppHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [sheetState, setSheetState] = useState<MenuSheetState>('closed');
  const [sheetSnap, setSheetSnap] = useState<MenuSheetSnap>('full');
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dragDeltaRef = useRef(0);
  const dragPointerRef = useRef<number | null>(null);
  const lockedScrollYRef = useRef(0);
  const desktopNavigation = useMemo(() => mainNavigation.filter((item) => item.href !== '/admin'), []);
  const primary = useMemo(() => desktopNavigation.slice(0, 4), [desktopNavigation]);
  const overflow = useMemo(() => desktopNavigation.slice(4), [desktopNavigation]);
  const activeHref = useMemo(() => resolveActiveHref(pathname), [pathname]);
  const activeItem = useMemo(() => mainNavigation.find((item) => item.href === activeHref), [activeHref]);
  const overflowActive = useMemo(() => overflow.some((item) => item.href === activeHref), [overflow, activeHref]);
  const { user } = useAuthSession();
  const sheetVisible = sheetState !== 'closed';
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!sheetVisible) return undefined;

    lockedScrollYRef.current = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollYRef.current}px`;
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.touchAction = previousBodyTouchAction;
      window.scrollTo(0, lockedScrollYRef.current);
    };
  }, [sheetVisible]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!sheetVisible) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestCloseSheet();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheetVisible]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  function openSheet(event?: { preventDefault: () => void; stopPropagation: () => void }) {
    event?.preventDefault();
    event?.stopPropagation();

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setMoreOpen(false);
    setDragOffset(0);
    setDragging(false);
    setSheetSnap('full');
    setSheetState('open');
  }

  function requestCloseSheet() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setDragOffset(0);
    setDragging(false);
    setSheetState('closing');

    closeTimerRef.current = setTimeout(() => {
      setSheetSnap('full');
      setSheetState('closed');
      closeTimerRef.current = null;
    }, MENU_SHEET_CLOSE_MS);
  }

  function handleSheetDragStart(event: ReactPointerEvent<HTMLElement>) {
    dragStartYRef.current = event.clientY;
    dragDeltaRef.current = 0;
    dragPointerRef.current = event.pointerId;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleSheetDragMove(event: ReactPointerEvent<HTMLElement>) {
    if (dragStartYRef.current === null) return;

    const delta = event.clientY - dragStartYRef.current;
    dragDeltaRef.current = delta;

    if (delta > 0) {
      setDragOffset(delta);
    } else {
      setDragOffset(0);
    }
  }

  function handleSheetDragEnd(event: ReactPointerEvent<HTMLElement>) {
    if (dragStartYRef.current === null) return;

    const delta = dragDeltaRef.current;
    dragStartYRef.current = null;
    dragDeltaRef.current = 0;
    setDragging(false);

    if (dragPointerRef.current !== null) {
      event.currentTarget.releasePointerCapture?.(dragPointerRef.current);
      dragPointerRef.current = null;
    }

    if (delta > MENU_SHEET_CLOSE_THRESHOLD) {
      requestCloseSheet();
      return;
    }

    if (delta > MENU_SHEET_HALF_THRESHOLD) {
      setSheetSnap('half');
    } else if (delta < -MENU_SHEET_FULL_THRESHOLD) {
      setSheetSnap('full');
    } else if (sheetSnap === 'half') {
      setSheetSnap('half');
    } else {
      setSheetSnap('full');
    }

    setDragOffset(0);
  }

  const closeMenus = () => {
    setMoreOpen(false);
    if (sheetVisible) requestCloseSheet();
  };

  const sheetInlineStyle = {
    '--sheet-drag-offset': `${dragOffset}px`
  } as CSSProperties;

  const mobileMenuSheet = sheetVisible ? (
    <div
      className={styles.sheetOverlay}
      data-state={sheetState}
      role="presentation"
    >
      <aside
        className={styles.sheet}
        aria-hidden={!sheetVisible}
        role="dialog"
        aria-modal="true"
        aria-label={t('mobileMenu')}
        data-state={sheetState}
        data-snap={sheetSnap}
        data-dragging={dragging}
        style={sheetInlineStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={styles.sheetDragZone}
          onPointerDown={handleSheetDragStart}
          onPointerMove={handleSheetDragMove}
          onPointerUp={handleSheetDragEnd}
          onPointerCancel={handleSheetDragEnd}
        >
          <div className={styles.sheetHandle} aria-hidden="true" />
          <div className={styles.sheetHeader}>
            <div className={styles.sheetBrand}>
              <span className={styles.sheetBrandMark}><HydroIcon name="river" size={22} /></span>
              <div><strong>HydroRivers</strong><small>{t('mobileMenu')}</small></div>
            </div>
            <button type="button" onClick={() => requestCloseSheet()} aria-label={t('closeMenu')}><HydroIcon name="close" /></button>
          </div>
        </div>

        <div className={styles.sheetScroll}>
          <div className={styles.sheetAccount}>
            {user ? (
              <Link href="/perfil" onClick={() => requestCloseSheet()} className={styles.accountCard}>
                <span className={styles.accountAvatar}>{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}</span>
                <span><strong>{user.name}</strong><small>{user.company}</small></span>
              </Link>
            ) : <AuthActions />}
          </div>

          <div className={styles.sheetTools}>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <nav className={styles.sheetNav}>
            {mainNavigation.filter((item) => item.href !== '/admin' || user?.role === 'admin').map((item) => (
              <Link onClick={() => requestCloseSheet()} key={item.href} href={item.href} className={item.href === activeHref ? styles.sheetActive : undefined}>
                <span>{t(item.labelKey)}</span><HydroIcon name={item.href === '/cargas' ? 'cargo' : item.href === '/embarcacoes' ? 'ship' : item.href === '/rastreio' ? 'map' : 'route'} size={16} />
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sheetActions}>
          <Link href="/cargas/nova" onClick={() => requestCloseSheet()} className={styles.sheetCta}>{t('cta')}</Link>
          <Link href={user ? '/perfil' : '/cadastro'} onClick={() => requestCloseSheet()} className={styles.sheetGhost}>{user ? t('profile') : t('signup')}</Link>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <header className={`${styles.headerShell} ${pathname !== '/' ? styles.subPage : ''}`}>
      <div className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="HydroRivers" onClick={closeMenus}>
          <span className={styles.brandMark}><HydroIcon name="river" size={24} /></span>
          <span className={styles.brandText}>HydroRivers</span>
        </Link>

        <nav className={styles.nav} aria-label={t('primaryNavigation')}>
          {primary.map((item) => (
            <Link onClick={closeMenus} className={item.href === activeHref ? styles.active : undefined} key={item.href} href={item.href}>
              {t(item.labelKey)}
            </Link>
          ))}
          {overflow.length ? (
            <div className={styles.more} ref={moreRef}>
              <button
                type="button"
                className={moreOpen || overflowActive ? styles.moreButtonActive : styles.moreButton}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((value) => !value)}
              >
                {t('more')} <HydroIcon name="chevronDown" size={16} />
              </button>
              {moreOpen ? (
                <div className={styles.morePanel} role="menu">
                  {overflow.map((item) => (
                    <Link role="menuitem" className={item.href === activeHref ? styles.activePanel : undefined} onClick={() => setMoreOpen(false)} key={item.href} href={item.href}>{t(item.labelKey)}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopTool}><LocaleSwitcher /></div>
          <div className={styles.desktopTool}><ThemeToggle /></div>
          <div className={styles.headerSession}><AuthActions /></div>
          {user ? (
            <Link href="/perfil" className={styles.mobileAvatar} aria-label={t('profile')}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <span>{initials(user.name)}</span>}
            </Link>
          ) : null}
          <Link href="/cargas/nova" className={styles.cta}>{t('cta')}</Link>
          <button
            className={styles.menuButton}
            onClick={openSheet}
            aria-label={t('openMenu')}
            aria-haspopup="dialog"
            aria-expanded={sheetVisible}
          >
            <HydroIcon name="menu" />
          </button>
        </div>
      </div>

      {activeItem && pathname !== '/' ? (
        <div className={styles.contextBar} aria-label={t('currentRoute')}>
          <span><HydroIcon name="route" size={14} /> {t(activeItem.labelKey)}</span>
          <small>{t('subpageContext')}</small>
        </div>
      ) : null}

      {mounted && mobileMenuSheet ? createPortal(mobileMenuSheet, document.body) : null}
    </header>
  );
}

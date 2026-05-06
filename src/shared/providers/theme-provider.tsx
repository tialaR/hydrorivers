'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cookieNames } from '@/shared/http/cookie-names';

export type Theme = 'light' | 'dark';

function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark';
}

function readClientThemeFallback(defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme;
  const stored = window.localStorage.getItem(cookieNames.theme);
  if (isTheme(stored)) return stored;
  return defaultTheme;
}

function syncTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(cookieNames.theme, theme);
    document.cookie = `${cookieNames.theme}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // ignore storage/cookie write failures
  }
}

export function ThemeProvider({
  children,
  initialTheme
}: {
  children: ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(() => readClientThemeFallback(initialTheme));

  useEffect(() => {
    syncTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (!isTheme(nextTheme)) return;
      setTheme(nextTheme);
    };
    window.addEventListener('hydrorivers:theme-change', onThemeChange);
    return () => window.removeEventListener('hydrorivers:theme-change', onThemeChange);
  }, []);

  return <div data-hydro-theme={theme}>{children}</div>;
}

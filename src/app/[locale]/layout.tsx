import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { cookies } from 'next/headers';
import { Analytics } from '@vercel/analytics/next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import '../globals.scss';
import { AppHeader } from '@/shared/layout/app-header/app-header';
import { AppFooter } from '@/shared/layout/app-footer';
import { type Theme, ThemeProvider } from '@/shared/providers/theme-provider';
import { cookieNames } from '@/shared/http/cookie-names';
import { ToastProvider } from '@/shared/ui/toast/toast-provider';
import { MockMode } from '@/shared/ui/mock-mode/mock-mode';
import { isMockQaUiEnabled } from '@/shared/qa/mock-qa-ui-env';

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

function resolveServerTheme(themeCookieValue: string | undefined): Theme {
  return themeCookieValue === 'light' || themeCookieValue === 'dark' ? themeCookieValue : 'dark';
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });
  const cookieStore = await cookies();
  const initialTheme = resolveServerTheme(cookieStore.get(cookieNames.theme)?.value);
  const htmlClassName = `${geist.variable}${initialTheme === 'dark' ? ' dark' : ''}`;

  return (
    <html
      lang={locale}
      className={htmlClassName}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-theme={initialTheme}
      style={{ colorScheme: initialTheme }}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider initialTheme={initialTheme}>
            <ToastProvider>
              <AppHeader />
              {children}
              <AppFooter locale={locale} />
              {isMockQaUiEnabled() ? <MockMode /> : null}
              <Analytics />
            </ToastProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

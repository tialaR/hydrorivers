import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import { AppHeader } from '@/shared/layout/app-header/app-header';
import { AppFooter } from '@/shared/layout/app-footer';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { ToastProvider } from '@/shared/ui/toast/toast-provider';
import { MockMode } from '@/shared/ui/mock-mode/mock-mode';
import { isMockQaUiEnabled } from '@/shared/qa/mock-qa-ui-env';

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

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <ToastProvider>
          <AppHeader />
          {children}
          <AppFooter />
          {isMockQaUiEnabled() ? <MockMode /> : null}
          <Analytics />
        </ToastProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

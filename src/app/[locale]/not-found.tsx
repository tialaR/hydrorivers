import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { intlAppPaths } from '@/shared/routing/app-routes';

/** 404 dentro do segmento `[locale]` — mensagens via next-intl. */
export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors.notFound' });

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <nav aria-label={t('title')}>
        <p>
          <Link locale={locale} href={intlAppPaths.home}>
            {t('linkHome')}
          </Link>
          {' · '}
          <Link locale={locale} href={intlAppPaths.cargos.marketplace}>
            {t('linkCargoes')}
          </Link>
        </p>
      </nav>
    </PageShell>
  );
}

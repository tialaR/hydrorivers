import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { PageShell } from '@/shared/ui/page-shell/page-shell';

/** 404 dentro do segmento `[locale]` — mensagens via next-intl. */
export default async function LocaleNotFound() {
  const t = await getTranslations('errors.notFound');

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <nav aria-label={t('title')}>
        <p>
          <Link href="/">{t('linkHome')}</Link>
          {' · '}
          <Link href="/cargas">{t('linkCargoes')}</Link>
        </p>
      </nav>
    </PageShell>
  );
}

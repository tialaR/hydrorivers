import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';

/** Suspense fallback ao navegar para `/cargas` enquanto `listCargoes()` resolve no servidor. */
export default async function CargoesLoading() {
  const t = await getTranslations('pages.cargoes');

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('loadingList')}>
      <div aria-busy="true" aria-live="polite" />
    </PageShell>
  );
}

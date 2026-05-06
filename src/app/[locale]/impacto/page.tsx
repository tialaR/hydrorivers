import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { ImpactStory } from '@/features/impact/components/impact-story/impact-story';

export default async function ImpactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.impact' });
  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <ImpactStory locale={locale} />
    </PageShell>
  );
}

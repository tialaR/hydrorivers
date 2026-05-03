import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { ImpactStory } from '@/features/impact/components/impact-story/impact-story';

export default async function ImpactPage() {
  const t = await getTranslations('pages.impact');
  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <ImpactStory />
    </PageShell>
  );
}

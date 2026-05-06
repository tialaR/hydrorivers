import { getTranslations } from 'next-intl/server';
import { TrackingTimeline } from '@/features/tracking/components/tracking-timeline/tracking-timeline';
import { PageShell } from '@/shared/ui/page-shell/page-shell';

export default async function TrackingPage() {
  const t = await getTranslations('pages.tracking');
  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <TrackingTimeline />
    </PageShell>
  );
}

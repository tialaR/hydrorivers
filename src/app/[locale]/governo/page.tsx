import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { GovernmentDashboard } from '@/features/government/components/government-dashboard/government-dashboard';

export default async function GovernmentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.governmentPage' });

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <GovernmentDashboard locale={locale} />
    </PageShell>
  );
}

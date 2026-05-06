import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { VesselList } from '@/features/vessels/components/vessel-list/vessel-list';
import { listVessels } from '@/features/marketplace/services/marketplace.service';

export default async function VesselsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.vessels' });
  const vessels = await listVessels();

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <VesselList vessels={vessels} locale={locale} />
    </PageShell>
  );
}

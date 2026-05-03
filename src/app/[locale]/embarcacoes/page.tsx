import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { VesselList } from '@/features/vessels/components/vessel-list/vessel-list';
import { listVessels } from '@/features/marketplace/services/marketplace.service';

export default async function VesselsPage() {
  const t = await getTranslations('pages.vessels');
  const vessels = await listVessels();

  return (
    <PageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
      <VesselList vessels={vessels} />
    </PageShell>
  );
}

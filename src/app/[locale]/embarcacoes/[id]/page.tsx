import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { VesselDetail } from '@/features/vessels/components/vessel-detail/vessel-detail';
import { getVesselById } from '@/features/marketplace/services/marketplace.service';

export default async function VesselDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vessel = await getVesselById(id);
  if (!vessel) notFound();

  const t = await getTranslations('pages.vesselDetail');

  return (
    <PageShell eyebrow={t('eyebrow')} title={vessel.name} description={vessel.route}>
      <Breadcrumb items={[{ label: t('breadcrumb'), href: '/embarcacoes' }, { label: vessel.name }]} />
      <VesselDetail vessel={vessel} />
    </PageShell>
  );
}

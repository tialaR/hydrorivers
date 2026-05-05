import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { NegotiationDetail } from '@/features/negotiations/components/negotiation-detail/negotiation-detail';
import { getNegotiationById } from '@/features/marketplace/services/marketplace.service';
import { intlAppPaths } from '@/shared/routing/app-routes';

export default async function NegotiationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const negotiation = await getNegotiationById(id);
  if (!negotiation) notFound();

  const t = await getTranslations('pages.negotiationDetail');
  const nav = await getTranslations('nav');

  return (
    <PageShell eyebrow={t('eyebrow')} title={negotiation.cargoTitle} description={negotiation.vesselName}>
      <Breadcrumb items={[{ label: nav('negotiations'), href: intlAppPaths.negotiations.home }, { label: negotiation.cargoTitle }]} />
      <NegotiationDetail negotiation={negotiation} />
    </PageShell>
  );
}

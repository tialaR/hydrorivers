import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageShell } from '@/shared/ui/page-shell/page-shell';
import { Breadcrumb } from '@/shared/ui/breadcrumb/breadcrumb';
import { NegotiationDetail } from '@/features/negotiations/components/negotiation-detail/negotiation-detail';
import { getNegotiationById } from '@/features/marketplace/services/marketplace.service';
import { intlAppPaths } from '@/shared/routing/app-routes';
import { translateMock } from '@/shared/i18n/mock-content';

export default async function NegotiationDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const negotiation = await getNegotiationById(id);
  if (!negotiation) notFound();

  const t = await getTranslations({ locale, namespace: 'pages.negotiationDetail' });
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const title = translateMock(locale, negotiation.cargoTitle);

  return (
    <PageShell eyebrow={t('eyebrow')} title={title} description={negotiation.vesselName}>
      <Breadcrumb locale={locale} items={[{ label: nav('negotiations'), href: intlAppPaths.negotiations.home }, { label: title }]} />
      <NegotiationDetail negotiation={negotiation} locale={locale} />
    </PageShell>
  );
}
